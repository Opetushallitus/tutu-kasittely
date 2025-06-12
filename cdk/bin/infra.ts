#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import * as utility from '../environments/utility.json'
import * as dev from '../environments/dev.json'
import * as qa from '../environments/qa.json'
import * as prod from '../environments/prod.json'
import { VpcStack } from '../lib/vpc-stack'
import { SecurityGroupStack } from '../lib/security-groups'
import { AuroraCommonStack } from '../lib/aurora-serverless-common'
import { AuroraDatabaseStack } from '../lib/aurora-serverless-database'
import { AlbStack } from '../lib/alb-stack'
import { CloudFrontCertificateStack } from '../lib/cloudfront-certificate-stack'
import { CloudfrontStack } from '../lib/cloudfront-stack'
import { KmsStack } from '../lib/kms-stack'
import { FargateClusterStack } from '../lib/fargate-cluster-stack'
import { EcsServiceStack } from '../lib/ecs-service'
import { FrontendBucketStack } from '../lib/front-end-bucket-stack'
import { FrontendStaticContentDeploymentStack } from '../lib/front-end-content-deployment-stack'
import { EcrStack } from '../lib/ecr-stack'
import { ElasticacheServerlessStack } from '../lib/redis-stack'
import { CpuArchitecture } from 'aws-cdk-lib/aws-ecs'
import { BastionStack } from '../lib/bastion-stack'
import { SecretManagerStack } from '../lib/secrets-manager-stack'
import { OpenSearchServerlessStack } from '../lib/opensearch-stack'
import { HostedZoneStack } from '../lib/hosted-zone-stack'
import { S3Stack } from '../lib/S3Stack'
import { PolicyStatement } from 'aws-cdk-lib/aws-iam'
import * as iam from 'aws-cdk-lib/aws-iam'
import { NamespaceStack } from '../lib/namespaceStack'
import { EfsStack } from '../lib/efs-stack'
import { DocumentdbStack } from '../lib/documentdb-stack'
import { MskStack } from '../lib/msk-stack'
import { GithubActionsStack } from '../lib/githubActionsStack'
import { UtilityStack } from '../lib/utility-stack'
import { SesStack } from "../lib/ses-stack";
import { MonitorStack } from '../lib/monitor-stack'
import { GuardDutyS3Stack } from "../lib/quard-duty-stack";

const app = new cdk.App()

// Load up configuration for the environment
const environmentName: string = app.node.tryGetContext('environment')
const utilityAccountId: string = "xxxxxxxxxxx"
const envEU = { region: 'eu-west-1' }
const envEUAccount = { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'eu-west-1' }
const envUS = { region: 'us-east-1' }

function getRevisionFromEnv() {
  if (app.node.tryGetContext('revision')) {
    return app.node.tryGetContext('revision')
  }
  throw new Error('Missing revision env variable')
}


// Allow any in this case, since we don't want to explicitely type json data
/* eslint-disable  @typescript-eslint/no-explicit-any */
let environmentConfig: any

if (environmentName === 'utility') {
  environmentConfig = utility
} else if (environmentName === 'dev') {
  environmentConfig = dev
} else if (environmentName === 'qa') {
  environmentConfig = qa
} else if (environmentName === 'prod') {
  environmentConfig = prod
} else {
  console.error(
    'You must define a valid environment name in CDK context! Valid environment names are dev, qa, prod and utility'
  )
  process.exit(1)
}

// dev, qa & prod account resources..
if (environmentName === 'dev' || environmentName === 'qa' || environmentName === 'prod') {

  const revision = getRevisionFromEnv()

  const domain = environmentConfig.aws.domain

  const GithubAction = new GithubActionsStack(app, 'GithubActionsStack', {
    env: envEU,
    environment: environmentName,
    repositoryRegex: "example-*",
    oidcThumbprint1: "xxxxxxxxxxxxxxx",
    oidcThumbprint2: "yyyyyyyyyyyyyyy"
  })

  const Monitor = new MonitorStack(app, 'MonitorStack', {
    env: envEUAccount,

    slackChannelName: `valvonta-example-${environmentName}`,
    environment: environmentName,
  })

  // Remember to update KMS key removal policy
  const Kms = new KmsStack(app, 'KmsStack', {
    env: envEU,
    stackName: `${environmentName}-kms`,
    environment: environmentName
  })

  const Secrets = new SecretManagerStack(app, 'SecretManagerStack', {
    env: envEU,
    stackName: `${environmentName}-secrets`,
    kmsKey: Kms.secretsManagerKey
  })

  const Network = new VpcStack(app, 'VpcStack', {
    env: envEU,
    stackName: `${environmentName}-vpc`,
    vpc_cidr: environmentConfig.aws.vpc_cidr,
    availability_zones: environmentConfig.aws.availability_zones
  })

  const HostedZones = new HostedZoneStack(app, 'HostedZoneStack', {
    env: envEU,
    stackName: `${environmentName}-hosted-zone`,
    domain: environmentConfig.aws.domain,
    vpc: Network.vpc
  })

  const SES = new SesStack(app, 'SesStack', {
    env: envEU,
    hostedZone: HostedZones.publicHostedZone
  });

  const SecurityGroups = new SecurityGroupStack(app, 'SecurityGroupStack', {
    env: envEU,
    stackName: `${environmentName}-security-groups`,
    vpc: Network.vpc
  })

  new BastionStack(app, 'BastionStack', {
    env: envEU,
    stackName: `${environmentName}-bastion`,
    vpc: Network.vpc,
    securityGroup: SecurityGroups.bastionSecurityGroup,
    kmsKey: Kms.ebsKmsKey,
    environment: environmentName
  })

  const AuroraCommons = new AuroraCommonStack(app, 'AuroraCommonStack', {
    env: envEU,
    stackName: `${environmentName}-aurora-common`,
    vpc: Network.vpc
  })

  const WebBackendAurora = new AuroraDatabaseStack(app, 'WebBackendAuroraStack', {
    env: envEU,
    stackName: `${environmentName}-web-backend-aurora`,
    auroraVersion: environmentConfig.aurora_databases.web_backend.version,
    environment: environmentName,
    clusterName: 'web-backend',
    vpc: Network.vpc,
    securityGroup: SecurityGroups.webBackendAuroraSecurityGroup,
    performanceInsights: environmentConfig.aurora_databases.web_backend.performance_insights,
    minSizeAcu: environmentConfig.aurora_databases.web_backend.min_size_acu,
    maxSizeAcu: environmentConfig.aurora_databases.web_backend.max_size_acu,
    kmsKey: Kms.rdsKmsKey,
    auroraDbPassword: Secrets.webBackendAuroraPassword,
    subnetGroup: AuroraCommons.auroraSubnetGroup,
    alarmSnsTopic: Monitor.topic,
  })

  const OpenSearch = new OpenSearchServerlessStack(app, 'OpenSearchStack', {
    env: envEU,
    stackName: `${environmentName}-open-search`,
    collectionName: environmentConfig.open_search.collectionName,
    description: environmentConfig.open_search.collectionDescription,
    securityGroupIds: [SecurityGroups.openSearchSecurityGroup.securityGroupId],
    vpc: Network.vpc,
    kmsKey: Kms.openSearchKmsKey,
    environment: environmentName,
    standbyReplicas: environmentConfig.open_search.standbyReplicas
  })

  const SemanticApisRedis = new ElasticacheServerlessStack(app, 'SemanticApisRedis', {
    env: envEU,
    stackName: `${environmentName}-semantic-apis-redis`,
    elasticacheName: 'semantic-apis',
    consumingServiceName: 'semantic-apis',
    secret: Secrets.semanticApisPassword,
    vpc: Network.vpc,
    securityGroupId: SecurityGroups.semanticApisRedisSecurityGroup.securityGroupId,
    redisKmsKeyId: Kms.redisKmsKey.keyId,
    secretsManagerKmsKeyId: Kms.secretsManagerKey,
    redisMajorVersion: environmentConfig.redis_serverless.semantic_apis.redis_major_version,
    storageMin: environmentConfig.redis_serverless.semantic_apis.storage_min,
    storageMax: environmentConfig.redis_serverless.semantic_apis.storage_max,
    minEcpuPerSecond: environmentConfig.redis_serverless.semantic_apis.min_ecpu_per_second,
    maxEcpuPerSecond: environmentConfig.redis_serverless.semantic_apis.max_ecpu_per_second
  })

  const Alb = new AlbStack(app, 'AlbStack', {
    env: envEU,
    environment: environmentName,
    crossRegionReferences: true,
    stackName: `${environmentName}-alb`,
    vpc: Network.vpc,
    securityGroupId: SecurityGroups.albSecurityGroup.securityGroupId,
    domain: domain,
    publicHostedZone: HostedZones.publicHostedZone,
    alarmSnsTopic: Monitor.topic
  })

// CloudFront certificates must be deployed to us-east-1
  const CloudfrontCertificate = new CloudFrontCertificateStack(app, 'CloudFrontCertificateStack', {
    env: envUS,
    stackName: `${environmentName}-cloudfront-certificate`,
    domain: domain,
    hostedZone: HostedZones.publicHostedZone,
    crossRegionReferences: true
  })

  const Cloudfront = new CloudfrontStack(app, 'CloudFrontStack', {
    env: envEU,
    stackName: `${environmentName}-cloudfront`,
    alb: Alb.alb,
    domain: domain,
    publicHostedZone: HostedZones.publicHostedZone,
    certificate: CloudfrontCertificate.certificate,
    crossRegionReferences: true,
    requireTestAuth: environmentConfig.cloudfront.require_test_authentication
  })

// Bucket names need to be globally unique, so project name and environment name are used for constructing bucket names.
// This bucket is meant for hosting static content under /static request path.
// If this is not something you want to leverage, remove the FrontEndBucket - stack, FrontendStaticContentDeploymentStack and 
// Modify CloudFrontStack accordingly.

  const FrontEndBucket = new FrontendBucketStack(app, 'FrontEndBucketStack', {
    env: envEU,
    stackName: `${environmentName}-frontend-bucket`,
    projectName: "example",
    environment: environmentName,
    cloudFrontDistribution: Cloudfront.distribution
  })

  const s3BucketStack = new S3Stack(app, 'S3BucketStack', {
    env: envEU,
    environment: environmentName,
    exampleBucketName: environmentConfig.S3.exampleBucketName,
    examplePdfBucketName: environmentConfig.S3.examplePdfBucketName,
    exampleThumbnailBucketName: environmentConfig.S3.exampleThumbnailBucketName
  })

  const namespace = new NamespaceStack(app, 'NameSpaceStack', Network.vpc, {
    env: envEU,
    environment: environmentName,
    projectName: "example",
  })

// deploys stuff from frontend/dist - folder to static content S3 bucket
  new FrontendStaticContentDeploymentStack(app, 'FrontEndContentDeploymentStack', {
    env: envEU,
    crossRegionReferences: true,
    stackName: `${environmentName}-frontend-deployment`,
    environment: environmentName,
    bucket: FrontEndBucket.bucket,
    cloudFrontDistribution: Cloudfront.distribution
  })

  const FargateCluster = new FargateClusterStack(app, 'FargateClusterStack', {
    env: envEU,
    stackName: `${environmentName}-fargate-cluster`,
    environment: environmentName,
    vpc: Network.vpc,
    logGroupKmsKey: Kms.cloudwatchLogsKmsKey
  })

  const buckets = s3BucketStack.allBuckets()

  new GuardDutyS3Stack(app, 'GuardDutyStack', {
    env: envEUAccount,
    buckets: buckets,
    alarmSnsTopic: Monitor.topic
  })

  const s3PolicyStatement = new PolicyStatement({
    actions: ['s3:ListBucket', 's3:PutObject', 's3:DeleteObject'],
    resources: buckets.flatMap((bucket) => [bucket.bucketArn, `${bucket.bucketArn}/*`])
  })

  const s3GetObjectPolicyStatement = new PolicyStatement({
    actions: [ 's3:GetObject', 's3:GetObjectVersion' ],
    resources: buckets.flatMap((bucket) => [ `${bucket.bucketArn}/*` ]),
    conditions: {
      StringNotEqualsIfExists: {
        "s3:ExistingObjectTag/GuardDutyMalwareScanStatus": "THREATS_FOUND"
      }
    }
  });

  const efs = new EfsStack(app, 'EfsStack', {
    env: envEU,
    vpc: Network.vpc,
    securityGroup: SecurityGroups.efsSecurityGroup,
    accessPointPath: '/data',
    throughputMode: environmentConfig.EFS.throughputMode
  })

  const docDb = new DocumentdbStack(app, 'DocumentDB', {
    environment : environmentName,
    instances: environmentConfig.document_db.instances,
    instanceType: environmentConfig.document_db.instanceType,
    env: envEU,
    vpc: Network.vpc,
    securityGroup: SecurityGroups.documentDbSecurityGroup,
    engineVersion: environmentConfig.document_db.engineVersion,
    user: Secrets.documentDbPassword,
    kmsKey: Kms.documentDbKmsKey
  })

  const mskKafka = new MskStack(app, 'MskKafka', {
    env: envEU,
    clusterName: environmentConfig.msk.clusterName,
    instanceType: environmentConfig.msk.instanceType,
    kmsKey: Kms.mskKmsKey,
    numberOfBrokerNodes: environmentConfig.msk.numberOfBrokerNodes,
    securityGroup: SecurityGroups.mskSecurityGroup,
    version: environmentConfig.msk.version,
    volumeSize: environmentConfig.msk.volumeSize,
    vpc: Network.vpc,
    alarmSnsTopic: Monitor.topic
  })


  new EcsServiceStack(app, 'DataAnalyticsEcsService', {
    env: envEU,
    stackName: `${environmentName}-data-analytics-service`,
    serviceName: 'data-analytics',
    environment: environmentName,
    cluster: FargateCluster.fargateCluster,
    vpc: Network.vpc,
    securityGroup: SecurityGroups.dataAnalyticsServiceSecurityGroup,
    revision,
    allowEcsExec: environmentConfig.services.data_analytics.allow_ecs_exec,
    taskCpu: environmentConfig.services.data_analytics.cpu_limit,
    taskMemory: environmentConfig.services.data_analytics.memory_limit,
    minimumCount: environmentConfig.services.data_analytics.min_count,
    maximumCount: environmentConfig.services.data_analytics.max_count,
    cpuArchitecture: CpuArchitecture.X86_64,
    env_vars: {
      ...environmentConfig.services.data_analytics.env_vars,
      ...{
        MONGODB_PRIMARY_HOST: docDb.clusterEndpoint.hostname,
        MONGODB_PRIMARY_PORT: docDb.clusterEndpoint.port,
        SPRING_DATASOURCE_PRIMARY_URL: `jdbc:postgresql://${WebBackendAurora.endPoint.hostname}:${WebBackendAurora.endPoint.port}/example`,
        SPRING_KAFKA_CONSUMER_BOOTSTRAPSERVERS: mskKafka.bootstrapBrokers,
        SPRING_KAFKA_PRODUCER_BOOTSTRAPSERVERS: mskKafka.bootstrapBrokers
      }
    },
    parameter_store_secrets: [],
    secrets_manager_secrets: [
      Secrets.secrets.ANALYTICS_PG_PASS,
      Secrets.secrets.ANALYTICS_DOCDB_PASSWORD,
      Secrets.secrets.ANALYTICS_TRUST_STORE_PASSWORD
    ],
    utilityAccountId: utilityAccountId,
    listener: Alb.albListener,
    listenerPathPatterns: ['/analytics/api/status'],
    healthCheckPath: '/analytics/api/status',
    healthCheckGracePeriod: 180,
    healthCheckInterval: 5,
    healthCheckTimeout: 2,
    albPriority: 140,
    privateDnsNamespace: namespace.privateDnsNamespace,
    iAmPolicyStatements: [mskKafka.kafkaClusterIamPolicy, mskKafka.kafkaTopicIamPolicy, mskKafka.kafkaGroupIamPolicy],
    alarmSnsTopic: Monitor.topic
  })

  new EcsServiceStack(app, 'StreamingEcsService', {
    env: envEU,
    stackName: `${environmentName}-streaming-app-service`,
    serviceName: 'streaming-app',
    environment: environmentName,
    cluster: FargateCluster.fargateCluster,
    vpc: Network.vpc,
    securityGroup: SecurityGroups.streamingServiceSecurityGroup,
    revision,
    allowEcsExec: environmentConfig.services.streaming.allow_ecs_exec,
    taskCpu: environmentConfig.services.streaming.cpu_limit,
    taskMemory: environmentConfig.services.streaming.memory_limit,
    minimumCount: environmentConfig.services.streaming.min_count,
    maximumCount: environmentConfig.services.streaming.max_count,
    cpuArchitecture: CpuArchitecture.X86_64,
    env_vars: environmentConfig.services.streaming.env_vars,
    parameter_store_secrets: [],
    secrets_manager_secrets: [],
    utilityAccountId: utilityAccountId,
    listener: Alb.albListener,
    listenerPathPatterns: ['/stream/api/v1*'],
    healthCheckPath: '/',
    healthCheckGracePeriod: 180,
    healthCheckInterval: 5,
    healthCheckTimeout: 2,
    albPriority: 110,
    iAmPolicyStatements: [s3PolicyStatement, s3GetObjectPolicyStatement],
    privateDnsNamespace: namespace.privateDnsNamespace,
    alarmSnsTopic: Monitor.topic,
  })

  new EcsServiceStack(app, 'DataServicesEcsService', {
    env: envEU,
    stackName: `${environmentName}-data-services`,
    serviceName: 'data-services',
    environment: environmentName,
    cluster: FargateCluster.fargateCluster,
    vpc: Network.vpc,
    securityGroup: SecurityGroups.dataServicesSecurityGroup,
    revision,
    allowEcsExec: environmentConfig.services.data_services.allow_ecs_exec,
    taskCpu: environmentConfig.services.data_services.cpu_limit,
    taskMemory: environmentConfig.services.data_services.memory_limit,
    minimumCount: environmentConfig.services.data_services.min_count,
    maximumCount: environmentConfig.services.data_services.max_count,
    cpuArchitecture: CpuArchitecture.X86_64,
    env_vars: {
      ...environmentConfig.services.data_services.env_vars,
      ...{
        example_IDENTIFY_BASEURL: `https://${domain}/meta/oaipmh`,
        example_IDENTIFY_V2_BASEURL: `https://${domain}/meta/v2/oaipmh`
      }
    },
    parameter_store_secrets: [],
    secrets_manager_secrets: [],
    utilityAccountId: utilityAccountId,
    listener: Alb.albListener,
    listenerPathPatterns: ['/meta/oaipmh*', '/meta/v2/oaipmh*'],
    healthCheckPath: '/meta/health',
    healthCheckGracePeriod: 180,
    healthCheckInterval: 5,
    healthCheckTimeout: 2,
    albPriority: 130,
    privateDnsNamespace: namespace.privateDnsNamespace,
    alarmSnsTopic: Monitor.topic
  })


  new EcsServiceStack(app, 'WebBackendEcsService', {
    env: envEU,
    stackName: `${environmentName}-web-backend-service`,
    serviceName: 'web-backend',
    environment: environmentName,
    cluster: FargateCluster.fargateCluster,
    vpc: Network.vpc,
    securityGroup: SecurityGroups.webBackendsServiceSecurityGroup,
    revision,
    allowEcsExec: environmentConfig.services.web_backend.allow_ecs_exec,
    taskCpu: environmentConfig.services.web_backend.cpu_limit,
    taskMemory: environmentConfig.services.web_backend.memory_limit,
    minimumCount: environmentConfig.services.web_backend.min_count,
    maximumCount: environmentConfig.services.web_backend.max_count,
    cpuArchitecture: CpuArchitecture.X86_64,
    env_vars: {
      ...environmentConfig.services.web_backend.env_vars,
      ...{
        REDIS_HOST: SemanticApisRedis.endpointAddress,
        REDIS_PORT: SemanticApisRedis.endpointPort,
        ES_NODE: OpenSearch.collectionEndpoint,
        POSTGRESQL_HOST: WebBackendAurora.endPoint.hostname,
        POSTGRESQL_PORT: WebBackendAurora.endPoint.port,
        KAFKA_BROKER_SERVERS: mskKafka.bootstrapBrokers
      }
    },
    parameter_store_secrets: [],
    secrets_manager_secrets: [
      Secrets.secrets.REDIS_PASS,
      Secrets.secrets.PG_PASS,
      Secrets.secrets.SESSION_SECRET,
      Secrets.secrets.CLIENT_SECRET,
      Secrets.secrets.JWT_SECRET,
      Secrets.secrets.PROXY_URI,
      Secrets.secrets.CLIENT_ID,
      Secrets.secrets.ADMIN_EMAIL
    ],
    utilityAccountId: utilityAccountId,
    listener: Alb.albListener,
    listenerPathPatterns: ['/api/*', '/h5p/*', '/embed/*', '/content/*'],
    healthCheckPath: '/health',
    healthCheckGracePeriod: 180,
    healthCheckInterval: 5,
    healthCheckTimeout: 2,
    albPriority: 120,
    iAmPolicyStatements: [
      OpenSearch.aossPolicyStatement,
      s3PolicyStatement,
      s3GetObjectPolicyStatement,
      efs.efsPolicyStatement,
      mskKafka.kafkaClusterIamPolicy,
      mskKafka.kafkaTopicIamPolicy,
      SES.sesIamPolicy,
    ],
    privateDnsNamespace: namespace.privateDnsNamespace,
    alarmSnsTopic: Monitor.topic,
    efs: {
      volume: {
        name: 'data',
        efsVolumeConfiguration: {
          fileSystemId: efs.fileSystemId,
          transitEncryption: 'ENABLED',
          authorizationConfig: {
            accessPointId: efs.accessPoint.accessPointId,
            iam: 'ENABLED'
          }
        }
      },
      mountPoint: {
        sourceVolume: 'data',
        containerPath: '/mnt/data', // how to mount from bastion: sudo mount -t efs -o tls,iam fs-02c2d5a3ca0064690:/ /mnt/
        readOnly: false
      }
    }
  })

  new EcsServiceStack(app, 'WebFrontendEcsService', {
    env: envEU,
    stackName: `${environmentName}-web-frontend-service`,
    serviceName: 'web-frontend',
    environment: environmentName,
    cluster: FargateCluster.fargateCluster,
    vpc: Network.vpc,
    securityGroup: SecurityGroups.webFrontendServiceSecurityGroup,
    revision: revision + "-" + environmentName,
    allowEcsExec: environmentConfig.services.web_frontend.allow_ecs_exec,
    taskCpu: environmentConfig.services.web_frontend.cpu_limit,
    taskMemory: environmentConfig.services.web_frontend.memory_limit,
    minimumCount: environmentConfig.services.web_frontend.min_count,
    maximumCount: environmentConfig.services.web_frontend.max_count,
    cpuArchitecture: CpuArchitecture.X86_64,
    env_vars: {},
    parameter_store_secrets: [],
    secrets_manager_secrets: [],
    utilityAccountId: utilityAccountId,
    listener: Alb.albListener,
    listenerPathPatterns: ['/*'],
    healthCheckPath: '/health',
    healthCheckGracePeriod: 180,
    healthCheckInterval: 5,
    healthCheckTimeout: 2,
    albPriority: 49000,
    iAmPolicyStatements: [],
    privateDnsNamespace: namespace.privateDnsNamespace,
    alarmSnsTopic: Monitor.topic
  })

  new EcsServiceStack(app, 'SemanticApisEcsService', {
    env: envEU,
    stackName: `${environmentName}-semantic-apis-service`,
    serviceName: 'semantic-apis',
    environment: environmentName,
    cluster: FargateCluster.fargateCluster,
    vpc: Network.vpc,
    securityGroup: SecurityGroups.semanticApisServiceSecurityGroup,
    revision,
    allowEcsExec: environmentConfig.services.semantic_apis.allow_ecs_exec,
    taskCpu: environmentConfig.services.semantic_apis.cpu_limit,
    taskMemory: environmentConfig.services.semantic_apis.memory_limit,
    minimumCount: environmentConfig.services.semantic_apis.min_count,
    maximumCount: environmentConfig.services.semantic_apis.max_count,
    cpuArchitecture: CpuArchitecture.X86_64,
    env_vars: {
      ...environmentConfig.services.semantic_apis.env_vars,
      ...{ REDIS_HOST: SemanticApisRedis.endpointAddress },
      REDIS_PORT: SemanticApisRedis.endpointPort
    },
    parameter_store_secrets: [],
    secrets_manager_secrets: [Secrets.secrets.REDIS_PASS],
    utilityAccountId: utilityAccountId,
    listener: Alb.albListener,
    listenerPathPatterns: ['/ref/api/v1*'],
    healthCheckPath: '/health',
    healthCheckGracePeriod: 180,
    healthCheckInterval: 5,
    healthCheckTimeout: 2,
    albPriority: 100,
    privateDnsNamespace: namespace.privateDnsNamespace,
    alarmSnsTopic: Monitor.topic
  })
} else if (environmentName === 'utility') {
  const Utility = new UtilityStack(app, 'UtilityStack', {
    env: envEU,
    stackName: `${environmentName}-utility`,
    repositoryRegex: "example-*",
    oidcThumbprint1: "xxxxxxxxxxxxxxx",
    oidcThumbprint2: "yyyyyyyyyyyyyyy"
  })

// ECR stacks use AWS Organizations Organizational Unit for sharing the ECR
// repositories between stacks. Ask the OU ID from Infratiimi.
  new EcrStack(app, 'FrontendEcrStack', {
    env: envEU,
    stackName: 'example-web-frontend-ecr',
    serviceName: 'example-web-frontend',
    projectAwsOrgOrganizationalUnit: 'aws-org-id/*/project-ou-id/*',
    githubActionsDeploymentRole: Utility.githubActionsDeploymentRole
  })
  new EcrStack(app, 'BackendEcrStack', {
    env: envEU,
    stackName: 'example-web-backend-ecr',
    serviceName: 'example-web-backend',
    projectAwsOrgOrganizationalUnit: 'aws-org-id/*/project-ou-id/*',
    githubActionsDeploymentRole: Utility.githubActionsDeploymentRole
  })
  new EcrStack(app, 'SemanticApisEcrStack', {
    env: envEU,
    stackName: 'example-semantic-apis-ecr',
    serviceName: 'example-semantic-apis',
    projectAwsOrgOrganizationalUnit: 'aws-org-id/*/project-ou-id/*',
    githubActionsDeploymentRole: Utility.githubActionsDeploymentRole
  })
  new EcrStack(app, 'StreamingAppEcrStack', {
    env: envEU,
    stackName: 'example-streaming-app-ecr',
    serviceName: 'example-streaming-app',
    projectAwsOrgOrganizationalUnit: 'aws-org-id/*/project-ou-id/*',
    githubActionsDeploymentRole: Utility.githubActionsDeploymentRole
  })
  new EcrStack(app, 'DataServicesEcrStack', {
    env: envEU,
    stackName: 'example-data-services-ecr',
    serviceName: 'example-data-services',
    projectAwsOrgOrganizationalUnit: 'aws-org-id/*/project-ou-id/*',
    githubActionsDeploymentRole: Utility.githubActionsDeploymentRole
  })
  new EcrStack(app, 'DataAnalyticsEcrStack', {
    env: envEU,
    stackName: 'example-data-analytics-ecr',
    serviceName: 'example-data-analytics',
    projectAwsOrgOrganizationalUnit: 'aws-org-id/*/project-ou-id/*',
    githubActionsDeploymentRole: Utility.githubActionsDeploymentRole
  })
}
