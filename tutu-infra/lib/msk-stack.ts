import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { IVpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2'
import * as msk from 'aws-cdk-lib/aws-msk'
import { Key } from 'aws-cdk-lib/aws-kms'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as cr from 'aws-cdk-lib/custom-resources'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import { aws_cloudwatch_actions, Duration } from 'aws-cdk-lib'
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch'

interface MskStackProps extends cdk.StackProps {
  volumeSize: number
  instanceType: string
  numberOfBrokerNodes: number
  vpc: IVpc
  securityGroup: SecurityGroup
  env: { region: string }
  kmsKey: Key
  clusterName: string
  version: string
  alarmSnsTopic: cdk.aws_sns.Topic
}

export class MskStack extends cdk.Stack {
  public readonly kafkaCluster: msk.CfnCluster
  public readonly bootstrapBrokers: string
  public readonly kafkaClusterIamPolicy: iam.PolicyStatement
  public readonly kafkaTopicIamPolicy: iam.PolicyStatement
  public readonly kafkaGroupIamPolicy: iam.PolicyStatement

  constructor(scope: Construct, id: string, props: MskStackProps) {
    super(scope, id, props)

    this.kafkaCluster = new msk.CfnCluster(this, 'KafkaCluster', {
      brokerNodeGroupInfo: {
        securityGroups: [props.securityGroup.securityGroupId],
        clientSubnets: props.vpc.privateSubnets.map((subnet) => subnet.subnetId),
        instanceType: props.instanceType,
        storageInfo: {
          ebsStorageInfo: {
            volumeSize: props.volumeSize
          }
        }
      },
      clusterName: props.clusterName,
      kafkaVersion: props.version,
      numberOfBrokerNodes: props.numberOfBrokerNodes,
      clientAuthentication: {
        sasl: {
          iam: {
            enabled: true
          }
        }
      },
      encryptionInfo: {
        encryptionInTransit: {
          inCluster: true,
          clientBroker: 'TLS'
        },
        encryptionAtRest: {
          dataVolumeKmsKeyId: props.kmsKey.keyId
        }
      }
    })

    const getBootstrapBrokersLambda = new lambda.Function(this, 'GetBootstrapBrokersLambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromInline(`
        exports.handler = async (event) => {
          const { KafkaClient, GetBootstrapBrokersCommand } = require("@aws-sdk/client-kafka"); // CommonJS import
          const client = new KafkaClient();
          const clusterArn = event.ResourceProperties.ClusterArn;
        
          if (event.RequestType === 'Delete') {
            return { PhysicalResourceId: clusterArn };
          }
        
          try {
            const command = new GetBootstrapBrokersCommand({ ClusterArn: clusterArn });
            const response = await client.send(command);
     
            return {
              PhysicalResourceId: clusterArn,
              Data: {
                BootstrapBrokerStringSaslIam: response.BootstrapBrokerStringSaslIam,
              },
            };
          } catch (error) {
            console.error(error);
            throw new Error('Failed to retrieve bootstrap brokers: ' + error.message);
          }
        };
      `),
      timeout: Duration.minutes(2),
      initialPolicy: [
        new iam.PolicyStatement({
          actions: ['kafka:GetBootstrapBrokers'],
          resources: [this.kafkaCluster.attrArn]
        })
      ]
    })

    const customResourceProvider = new cr.Provider(this, 'CustomResourceProvider', {
      onEventHandler: getBootstrapBrokersLambda
    })

    const bootstrapBrokersResource = new cdk.CustomResource(this, 'BootstrapBrokersResource', {
      serviceToken: customResourceProvider.serviceToken,
      properties: {
        ClusterArn: this.kafkaCluster.attrArn
      }
    })

    this.bootstrapBrokers = bootstrapBrokersResource.getAttString('BootstrapBrokerStringSaslIam')

    this.kafkaClusterIamPolicy = new iam.PolicyStatement({
      actions: [
        'kafka-cluster:Connect',
        'kafka-cluster:DescribeCluster',
        'kafka-cluster:GetBootstrapBrokers',
        'kafka-cluster:ListTopics',
        'kafka-cluster:AlterCluster'
      ],
      resources: [this.kafkaCluster.attrArn]
    })

    this.kafkaTopicIamPolicy = new iam.PolicyStatement({
      actions: ['kafka-cluster:*Topic*', 'kafka-cluster:WriteData', 'kafka-cluster:ReadData'],
      resources: [
        `arn:aws:kafka:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:topic/${this.kafkaCluster.clusterName}/${cdk.Fn.select(2, cdk.Fn.split('/', this.kafkaCluster.attrArn))}/prod_material_activity`,
        `arn:aws:kafka:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:topic/${this.kafkaCluster.clusterName}/${cdk.Fn.select(2, cdk.Fn.split('/', this.kafkaCluster.attrArn))}/prod_search_requests`
      ]
    })

    this.kafkaGroupIamPolicy = new iam.PolicyStatement({
      actions: ['kafka-cluster:AlterGroup', 'kafka-cluster:DescribeGroup'],
      resources: [
        `arn:aws:kafka:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:group/${this.kafkaCluster.clusterName}/${cdk.Fn.select(2, cdk.Fn.split('/', this.kafkaCluster.attrArn))}/group-prod-material-activity`,
        `arn:aws:kafka:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:group/${this.kafkaCluster.clusterName}/${cdk.Fn.select(2, cdk.Fn.split('/', this.kafkaCluster.attrArn))}/group-prod-search-requests`
      ]
    })

    new cdk.CfnOutput(this, 'BootstrapServers', {
      value: this.bootstrapBrokers
    })

    const alarmSnsAction = new aws_cloudwatch_actions.SnsAction(props.alarmSnsTopic)

    const topics = ['prod_material_activity', 'prod_search_requests']

    topics.forEach((t) => {
      const lagAlarm = new cloudwatch.Alarm(this, `KafkaConsumerLagAlarm-${t}`, {
        alarmName: `KafkaConsumerLag-${t}`,
        metric: new cloudwatch.Metric({
          namespace: 'AWS/Kafka',
          metricName: 'SumOffsetLag',
          dimensionsMap: {
            'Consumer Group': `group-${t.replace(/_/g, '-')}`,
            'Cluster Name': this.kafkaCluster.clusterName,
            Topic: t
          },
          statistic: 'Average',
          period: cdk.Duration.minutes(5)
        }),
        threshold: 10,
        evaluationPeriods: 2,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        alarmDescription: `Topic ${t} consumer lag is too high, messages are not being processed quickly enough!`,
        actionsEnabled: true
      })

      lagAlarm.addAlarmAction(alarmSnsAction)
      lagAlarm.addOkAction(alarmSnsAction)
    })
  }
}
