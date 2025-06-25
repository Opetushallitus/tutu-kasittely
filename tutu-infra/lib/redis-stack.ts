import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { aws_elasticache as ElastiCache } from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'
import { IKey } from 'aws-cdk-lib/aws-kms'

interface ElastiCacheServerlessStackProps extends cdk.StackProps {
  vpc: ec2.IVpc
  elasticacheName: string
  secret: secretsmanager.Secret
  consumingServiceName: string
  redisKmsKeyId: string
  secretsManagerKmsKeyId: IKey
  securityGroupId: string
  redisMajorVersion: string
  storageMin: number
  storageMax: number
  minEcpuPerSecond: number
  maxEcpuPerSecond: number
}

export class ElasticacheServerlessStack extends cdk.Stack {
  public readonly endpointAddress: string
  public readonly endpointPort: string
  constructor(scope: Construct, id: string, props: ElastiCacheServerlessStackProps) {
    super(scope, id, props)

    const redisUserName = 'app'

    const cfnUser = new ElastiCache.CfnUser(this, 'MyCfnUser', {
      engine: 'redis',
      userId: redisUserName,
      userName: redisUserName,
      noPasswordRequired: false,
      passwords: [props.secret.secretValueFromJson('secretkey').unsafeUnwrap()],
      accessString: 'on ~* +@all'
    })

    const cfnUserGroup = new ElastiCache.CfnUserGroup(this, 'MyCfnUserGroup', {
      engine: 'redis',
      userGroupId: `${props.elasticacheName}-userGroupId`.toLowerCase(),
      userIds: [cfnUser.userId, 'default']
    })

    cfnUserGroup.node.addDependency(cfnUser)

    const elastiCacheSubnetIds: string[] = []
    for (const subnet of props.vpc.isolatedSubnets) {
      elastiCacheSubnetIds.push(subnet.subnetId)
    }

    const elastiCacheServlerless = new ElastiCache.CfnServerlessCache(this, 'ServerlessCache', {
      engine: 'redis',
      serverlessCacheName: props.elasticacheName.toLowerCase(),
      cacheUsageLimits: {
        dataStorage: {
          unit: 'GB',

          maximum: props.storageMax,
          minimum: props.storageMin
        },
        ecpuPerSecond: {
          maximum: props.maxEcpuPerSecond,
          minimum: props.minEcpuPerSecond
        }
      },
      kmsKeyId: props.redisKmsKeyId,
      majorEngineVersion: props.redisMajorVersion,
      securityGroupIds: [props.securityGroupId],
      subnetIds: elastiCacheSubnetIds,
      userGroupId: `${props.elasticacheName}-userGroupId`.toLowerCase()
    })

    elastiCacheServlerless.node.addDependency(cfnUserGroup)

    this.endpointAddress = elastiCacheServlerless.attrEndpointAddress
    this.endpointPort = elastiCacheServlerless.attrEndpointPort
  }
}
