import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { InstanceType, IVpc, SecurityGroup } from 'aws-cdk-lib/aws-ec2'
import { DatabaseCluster, Endpoint } from 'aws-cdk-lib/aws-docdb'
import { Secret } from 'aws-cdk-lib/aws-secretsmanager'
import { Key } from 'aws-cdk-lib/aws-kms'

interface DocumentDbStackProps extends cdk.StackProps {
  environment: string
  instances: number
  engineVersion: string
  vpc: IVpc
  securityGroup: SecurityGroup
  env: { region: string }
  user: Secret
  kmsKey: Key
  instanceType: InstanceType
}
export class DocumentdbStack extends cdk.Stack {
  private docdbcluster: DatabaseCluster
  public readonly clusterEndpoint: Endpoint

  constructor(scope: Construct, id: string, props: DocumentDbStackProps) {
    super(scope, id, props)
    this.docdbcluster = new DatabaseCluster(this, 'AoeDocumentDB', {
      masterUser: {
        username: 'docdbuser',
        password: props.user.secretValueFromJson('password')
      },
      engineVersion: props.engineVersion,
      instances: props.instances,
      instanceType: props.instanceType,
      vpc: props.vpc,
      vpcSubnets: { subnets: props.vpc.isolatedSubnets },
      securityGroup: props.securityGroup,
      deletionProtection: true,
      kmsKey: props.kmsKey,
      backup: {
        retention: props.environment === 'prod' ? cdk.Duration.days(30) : cdk.Duration.days(7)
      }
    })

    this.clusterEndpoint = this.docdbcluster.clusterEndpoint
  }
}
