import * as _ from 'lodash'
import * as cdk from 'aws-cdk-lib'
import { aws_cloudwatch_actions, CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { LogGroup } from 'aws-cdk-lib/aws-logs'
import {
  AwsLogDriver,
  Compatibility,
  ContainerImage,
  CpuArchitecture,
  FargatePlatformVersion,
  FargateService,
  ICluster,
  OperatingSystemFamily,
  Secret,
  TaskDefinition,
  UlimitName
} from 'aws-cdk-lib/aws-ecs'
import { ISecurityGroup, IVpc } from 'aws-cdk-lib/aws-ec2'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import {
  ApplicationListenerRule,
  ApplicationProtocol,
  ApplicationTargetGroup,
  IApplicationListener,
  ListenerCondition,
  TargetGroupLoadBalancingAlgorithmType
} from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import { Repository } from 'aws-cdk-lib/aws-ecr'
import { AdjustmentType } from 'aws-cdk-lib/aws-autoscaling'
import * as ssm from 'aws-cdk-lib/aws-ssm'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as servicediscovery from 'aws-cdk-lib/aws-servicediscovery'
import { PrivateDnsNamespace } from 'aws-cdk-lib/aws-servicediscovery'
import * as sns from 'aws-cdk-lib/aws-sns'
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch'
import { Unit } from 'aws-cdk-lib/aws-cloudwatch'
import { Volume } from 'aws-cdk-lib/aws-ecs/lib/base/task-definition'
import { MountPoint } from 'aws-cdk-lib/aws-ecs/lib/container-definition'
import { SecretEntry } from './secrets-manager-stack'

interface EcsServiceStackProps extends StackProps {
  environment: string
  // Allow any in this case, since we don't want to explicitely type json data
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  env_vars: any
  cluster: ICluster
  vpc: IVpc
  taskCpu: string
  taskMemory: string
  utilityAccountId: string
  serviceName: string
  listener: IApplicationListener
  listenerPathPatterns: string[]
  albPriority: number
  healthCheckPath: string
  revision: string
  allowEcsExec: boolean
  parameter_store_secrets: string[]
  secrets_manager_secrets: SecretEntry[]
  cpuArchitecture: CpuArchitecture
  minimumCount: number
  maximumCount: number
  healthCheckGracePeriod: number
  healthCheckInterval: number
  healthCheckTimeout: number
  securityGroup: ISecurityGroup
  iAmPolicyStatements?: iam.PolicyStatement[]
  privateDnsNamespace: PrivateDnsNamespace
  efs?: {
    mountPoint: MountPoint
    volume: Volume
  }
  alarmSnsTopic: sns.Topic
}

export class EcsServiceStack extends Stack {
  constructor(scope: Construct, id: string, props: EcsServiceStackProps) {
    super(scope, id, props)

    const ImageRepository = Repository.fromRepositoryAttributes(this, 'EcrRepository', {
      repositoryName: `${props.serviceName}`,
      repositoryArn: `arn:aws:ecr:${Stack.of(this).region}:${props.utilityAccountId}:repository/${props.serviceName}`
    })

    const ServiceLogGroup = new LogGroup(this, 'LogGroup', {
      logGroupName: `/service/${props.serviceName}`,
      removalPolicy: RemovalPolicy.DESTROY
    })

    const secrets = {
      // SSM Parameter Store secure strings
      ...props.parameter_store_secrets.reduce((secretsAcc, secretName) => {
        const ssmParameter = ssm.StringParameter.fromSecureStringParameterAttributes(
          this,
          `${_.upperFirst(_.camelCase(secretName))}Parameter`,
          {
            version: 0,
            parameterName: `/service/${props.serviceName}/${secretName}`
          }
        )
        return Object.assign(secretsAcc, {
          [secretName]: Secret.fromSsmParameter(ssmParameter)
        })
      }, {}),
      ...(props.secrets_manager_secrets || []).reduce((secretsAcc, se) => {
        const secret = secretsmanager.Secret.fromSecretNameV2(
          this,
          `${_.upperFirst(_.camelCase(se.path))}Secret`,
          se.path
        )

        return Object.assign(secretsAcc, {
          [se.envVarName]: Secret.fromSecretsManager(secret, se.secretKey)
        })
      }, {})
    }

    const taskDefinition = new TaskDefinition(this, `${props.serviceName}`, {
      cpu: props.taskCpu,
      memoryMiB: props.taskMemory,
      compatibility: Compatibility.FARGATE,
      runtimePlatform: {
        cpuArchitecture: props.cpuArchitecture,
        operatingSystemFamily: OperatingSystemFamily.LINUX
      }
    })

    taskDefinition.addVolume({ name: 'logs' })

    if (props.iAmPolicyStatements && Array.isArray(props.iAmPolicyStatements)) {
      props.iAmPolicyStatements.forEach((statement) => {
        taskDefinition.addToTaskRolePolicy(statement)
      })
    }

    const container = taskDefinition.addContainer(`${props.serviceName}`, {
      image: ContainerImage.fromEcrRepository(ImageRepository, props.revision),
      logging: new AwsLogDriver({
        logGroup: ServiceLogGroup,
        streamPrefix: `${props.serviceName}`
      }),
      portMappings: [{ containerPort: 8080 }],
      containerName: `${props.serviceName}`,
      secrets: secrets,
      environment: props.env_vars,
      ulimits: [
        {
          name: UlimitName.NOFILE,
          softLimit: 63536,
          hardLimit: 63536
        }
      ]
    })

    container.addMountPoints({
      sourceVolume: 'logs',
      containerPath: '/var/log/tutu',
      readOnly: false
    })

    // https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Agent-Configuration-File-Details.html
    const cwConfig = {
      agent: { debug: true },
      logs: {
        logs_collected: {
          files: {
            collect_list: [
              {
                file_path: `/logs/${props.serviceName}.log`,
                log_group_name: `${props.serviceName}-app`,
                log_stream_name: `{hostname}-${props.serviceName}.log`,
                multi_line_start_pattern: '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}'
              },
              {
                file_path: `/logs/auditlog_${props.serviceName}.log`,
                log_group_name: `${props.serviceName}-audit`,
                log_stream_name: `{hostname}-auditlog_${props.serviceName}.log`
              },
              {
                file_path: '/logs/*_gc.log*',
                log_group_name: `${props.serviceName}-debug`,
                log_stream_name: '{hostname}-gc'
              }
            ]
          }
        }
      }
    }

    const AppLogGroup = new LogGroup(this, 'LogGroup', {
      logGroupName: `${props.serviceName}-app`,
      removalPolicy: RemovalPolicy.DESTROY
    })

    const AuditLogGroup = new LogGroup(this, 'LogGroup', {
      logGroupName: `${props.serviceName}-audit`,
      removalPolicy: RemovalPolicy.DESTROY
    })

    const DebugLogGroup = new LogGroup(this, 'LogGroup', {
      logGroupName: `${props.serviceName}-debug`,
      removalPolicy: RemovalPolicy.DESTROY
    })

    const cwAgent = taskDefinition.addContainer('ecs-cwagent', {
      image: ContainerImage.fromRegistry('public.ecr.aws/cloudwatch-agent/cloudwatch-agent:latest'),
      environment: {
        CW_CONFIG_CONTENT: JSON.stringify(cwConfig)
      },
      logging: new AwsLogDriver({
        streamPrefix: 'cwagent',
        logGroup: ServiceLogGroup
      })
    })

    AppLogGroup.grantWrite(taskDefinition.taskRole)
    AuditLogGroup.grantWrite(taskDefinition.taskRole)
    DebugLogGroup.grantWrite(taskDefinition.taskRole)

    cwAgent.addMountPoints({
      sourceVolume: 'logs',
      containerPath: '/logs/',
      readOnly: false
    })

    const ecsService = new FargateService(this, 'EcsFargateService', {
      cluster: props.cluster,
      minHealthyPercent: 100,
      taskDefinition,
      platformVersion: FargatePlatformVersion.LATEST,
      healthCheckGracePeriod: Duration.seconds(props.healthCheckGracePeriod),
      enableExecuteCommand: props.allowEcsExec,
      circuitBreaker: { rollback: true },
      securityGroups: [props.securityGroup],
      cloudMapOptions: {
        name: props.serviceName,
        cloudMapNamespace: props.privateDnsNamespace,
        dnsRecordType: servicediscovery.DnsRecordType.A,
        dnsTtl: Duration.seconds(15)
      }
    })

    const targetGroup = new ApplicationTargetGroup(this, `${props.serviceName}TargetGroup`, {
      targets: [ecsService],
      vpc: props.vpc,
      healthCheck: {
        path: `${props.healthCheckPath}`,
        interval: Duration.seconds(props.healthCheckInterval),
        healthyThresholdCount: 2,
        timeout: Duration.seconds(props.healthCheckTimeout)
      },
      port: 8080,
      protocol: ApplicationProtocol.HTTP,
      deregistrationDelay: Duration.seconds(5),
      loadBalancingAlgorithmType: TargetGroupLoadBalancingAlgorithmType.LEAST_OUTSTANDING_REQUESTS
    })

    new ApplicationListenerRule(this, 'serviceDefaultRule', {
      listener: props.listener,
      priority: props.albPriority,
      conditions: [ListenerCondition.pathPatterns(props.listenerPathPatterns)],
      targetGroups: [targetGroup]
    })

    const scalingTarget = ecsService.autoScaleTaskCount({
      minCapacity: props.minimumCount,
      maxCapacity: props.maximumCount
    })

    scalingTarget.scaleOnMetric('CpuStepAutoscaling', {
      metric: ecsService.metricCpuUtilization(),
      scalingSteps: [
        { upper: 5, change: -2 },
        { upper: 15, change: -1 },
        { lower: 45, change: +1 },
        { lower: 85, change: +2 }
      ],
      adjustmentType: AdjustmentType.CHANGE_IN_CAPACITY,
      cooldown: Duration.minutes(3)
    })

    // Cloudwatch alarms for ECS services
    const alarmSnsAction = new aws_cloudwatch_actions.SnsAction(props.alarmSnsTopic)

    const unhealthyTasksAlarm = new cloudwatch.Alarm(this, 'UnhealthyTasksAlarm', {
      alarmName: `${props.serviceName}-UnhealthyTasksAlarm`,
      metric: targetGroup.metrics.unhealthyHostCount({
        statistic: 'Average',
        period: Duration.seconds(30)
      }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    })
    unhealthyTasksAlarm.addAlarmAction(alarmSnsAction)
    unhealthyTasksAlarm.addOkAction(alarmSnsAction)

    const cpuUtilizationAlarm = new cloudwatch.Alarm(this, 'CpuUtilizationAlarm', {
      alarmName: `${props.serviceName}-CpuUtilizationAlarm`,
      metric: ecsService.metricCpuUtilization({
        statistic: 'Maximum',
        period: Duration.minutes(5)
      }),
      threshold: 85,
      evaluationPeriods: 3,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    })
    cpuUtilizationAlarm.addAlarmAction(alarmSnsAction)
    cpuUtilizationAlarm.addOkAction(alarmSnsAction)

    const memoryUtilizationAlarm = new cloudwatch.Alarm(this, 'MemoryUtilizationAlarm', {
      alarmName: `${props.serviceName}-MemoryUtilizationAlarm`,
      metric: ecsService.metricMemoryUtilization({
        statistic: 'Maximum',
        period: Duration.minutes(5)
      }),
      threshold: 85,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING
    })
    memoryUtilizationAlarm.addAlarmAction(alarmSnsAction)
    memoryUtilizationAlarm.addOkAction(alarmSnsAction)

    const dashboard = new cloudwatch.Dashboard(this, `EcsDashboard-${props.serviceName}`, {
      dashboardName: `ECS-${props.serviceName}-Monitoring`
    })

    const totalRequestsWidget = new cloudwatch.GraphWidget({
      title: `Total API Requests - ${props.serviceName}`,
      left: [
        targetGroup.metrics.requestCountPerTarget({
          unit: Unit.COUNT
        })
      ]
    })

    const okWidget = new cloudwatch.GraphWidget({
      title: `2XX Count - ${props.serviceName}`,
      left: [targetGroup.metrics.httpCodeTarget(elbv2.HttpCodeTarget.TARGET_2XX_COUNT)]
    })

    const ok3xxWidget = new cloudwatch.GraphWidget({
      title: `3XX Count - ${props.serviceName}`,
      left: [targetGroup.metrics.httpCodeTarget(elbv2.HttpCodeTarget.TARGET_3XX_COUNT)]
    })

    const error4xxWidget = new cloudwatch.GraphWidget({
      title: `4XX Errors - ${props.serviceName}`,
      left: [targetGroup.metrics.httpCodeTarget(elbv2.HttpCodeTarget.TARGET_4XX_COUNT)]
    })

    const error5xxWidget = new cloudwatch.GraphWidget({
      title: `5XX Errors - ${props.serviceName}`,
      left: [targetGroup.metrics.httpCodeTarget(elbv2.HttpCodeTarget.TARGET_5XX_COUNT)]
    })

    const targetResponseTimeMetric = targetGroup.metrics.targetResponseTime({
      statistic: 'Average',
      period: cdk.Duration.minutes(5)
    })

    const responseTimeInMs = new cloudwatch.MathExpression({
      expression: 'm1 * 1000',
      usingMetrics: { m1: targetResponseTimeMetric }
    })

    const responseTimeWidget = new cloudwatch.GraphWidget({
      title: `ResponseTime AVG- ${props.serviceName}`,
      left: [responseTimeInMs]
    })

    // Add widgets to the dashboard
    dashboard.addWidgets(totalRequestsWidget, okWidget, ok3xxWidget, error4xxWidget, error5xxWidget, responseTimeWidget)

    new CfnOutput(this, 'ServiceDiscoveryName', {
      value: `${props.serviceName}.${props.privateDnsNamespace.namespaceName}`
    })
  }
}
