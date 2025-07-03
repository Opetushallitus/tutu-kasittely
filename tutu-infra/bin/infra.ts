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
import { EcrStack } from '../lib/ecr-stack'
import { CpuArchitecture } from 'aws-cdk-lib/aws-ecs'
import { BastionStack } from '../lib/bastion-stack'
import { SecretManagerStack } from '../lib/secrets-manager-stack'
import { HostedZoneStack } from '../lib/hosted-zone-stack'
import { NamespaceStack } from '../lib/namespaceStack'
import { GithubActionsStack } from '../lib/githubActionsStack'
import { UtilityStack } from '../lib/utility-stack'
import { MonitorStack } from '../lib/monitor-stack'
import { FrontendNextjsStack } from '../lib/front-end-nextjs-stack'
import { FrontendBuildBucketStack } from '../lib/frontend-build-bucket-stack'

const app = new cdk.App()

// Load up configuration for the environment
const environmentName: string = app.node.tryGetContext('environment')
const utilityAccountId: string = app.node.tryGetContext('utility')
const envEU = { region: 'eu-west-1' }
const envEUAccount = { account: process.env.CDK_DEFAULT_ACCOUNT, region: 'eu-west-1' }
const envUS = { region: 'us-east-1' }

// Allow any in this case, since we don't want to explicitely type json data
/* eslint-disable  @typescript-eslint/no-explicit-any */
let environmentConfig: any

const utilityConfig = utility

if (environmentName === 'dev') {
  environmentConfig = dev
} else if (environmentName === 'qa') {
  environmentConfig = qa
} else if (environmentName === 'prod') {
  environmentConfig = prod
} else if (environmentName !== 'utility') {
  console.error(
    'You must define a valid environment name in CDK context! Valid environment names are dev, qa, prod and utility'
  )
  process.exit(1)
}

// dev, qa & prod account resources..
if (environmentName === 'dev' || environmentName === 'qa' || environmentName === 'prod') {
  const revision = app.node.tryGetContext('revision')

  if (utility === undefined) {
    console.error(
      'You must define utility account id in CDK context!'
    )
    process.exit(1)
  }

  if (revision === undefined) {
    console.error(
      'You must define a valid revision in CDK context!'
    )
    process.exit(1)
  }

  const domain = environmentConfig.aws.domain

  new GithubActionsStack(app, 'GithubActionsStack', {
    env: envEU,
    environment: environmentName,
    repositoryRegex: utilityConfig.repository_regex,
    oidcThumbprint1: '6938fd4d98bab03faadb97b34396831e3780aea1',
    oidcThumbprint2: '1c58a3a8518e8759bf075b76b750d4f2df264fcd'
  })

  const Monitor = new MonitorStack(app, 'MonitorStack', {
    env: envEUAccount,
    slackChannelName: `valvonta-tutu-${environmentName}`,
    environment: environmentName
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
    alarmSnsTopic: Monitor.topic
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
    alarmSnsTopic: Monitor.topic,
    projectName: utilityConfig.repository_regex
  })

  // CloudFront certificates must be deployed to us-east-1
  const CloudfrontCertificate = new CloudFrontCertificateStack(app, 'CloudFrontCertificateStack', {
    env: envUS,
    stackName: `${environmentName}-cloudfront-certificate`,
    domain: domain,
    hostedZone: HostedZones.publicHostedZone,
    crossRegionReferences: true
  })

  new CloudfrontStack(app, 'CloudFrontStack', {
    env: envEU,
    stackName: `${environmentName}-cloudfront`,
    alb: Alb.alb,
    domain: domain,
    publicHostedZone: HostedZones.publicHostedZone,
    certificate: CloudfrontCertificate.certificate,
    crossRegionReferences: true,
    requireTestAuth: environmentConfig.cloudfront.require_test_authentication
  })

  const namespace = new NamespaceStack(app, 'NameSpaceStack', Network.vpc, {
    env: envEU,
    environment: environmentName,
    projectName: utilityConfig.repository_regex
  })

  const FargateCluster = new FargateClusterStack(app, 'FargateClusterStack', {
    env: envEU,
    stackName: `${environmentName}-fargate-cluster`,
    environment: environmentName,
    vpc: Network.vpc,
    logGroupKmsKey: Kms.cloudwatchLogsKmsKey
  })

  new EcsServiceStack(app, 'TutuBackendEcsService', {
    env: envEU,
    stackName: `${environmentName}-tutu-backend-service`,
    serviceName: utilityConfig.backend_service_name,
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
        POSTGRESQL_HOST: WebBackendAurora.endPoint.hostname,
        POSTGRESQL_PORT: WebBackendAurora.endPoint.port
      }
    },
    parameter_store_secrets: ['ESITTELIJA_KAYTTOOIKEUSRYHMA_IDS', 'CAS_PASS'],
    secrets_manager_secrets: [
      Secrets.secrets.PG_PASS,
      Secrets.secrets.SESSION_SECRET,
    ],
    utilityAccountId: utilityAccountId,
    listener: Alb.albListener,
    listenerPathPatterns: ['/tutu-backend/*'],
    healthCheckPath: '/tutu-backend/api/healthcheck',
    healthCheckGracePeriod: 180,
    healthCheckInterval: 5,
    healthCheckTimeout: 2,
    albPriority: 120,
    privateDnsNamespace: namespace.privateDnsNamespace,
    alarmSnsTopic: Monitor.topic
  })

  new FrontendNextjsStack(app, 'TutuFrontendNextjsStack', {
    basePath: '/tutu-frontend',
    domainName: `frontend.${domain}`,
    hostedZone: HostedZones.publicHostedZone,
    environment: environmentName,
    envVars: environmentConfig.services.web_frontend.env_vars,
    nextjsPath: '../tutu-frontend',
    certificate: CloudfrontCertificate.certificate,
    env: envEU,
    crossRegionReferences: true,
    serviceName: utilityConfig.frontend_service_name,
    skipBuild: Boolean(app.node.tryGetContext('skipfrontend'))
  })
} else if (environmentName === 'utility') {
  const Utility = new UtilityStack(app, 'UtilityStack', {
    env: envEU,
    stackName: `utility`,
    repositoryRegex: utilityConfig.repository_regex,
    oidcThumbprint1: '6938fd4d98bab03faadb97b34396831e3780aea1',
    oidcThumbprint2: '1c58a3a8518e8759bf075b76b750d4f2df264fcd'
  })

  // ECR stacks use AWS Organizations Organizational Unit for sharing the ECR
  // repositories between stacks. Ask the OU ID from Infratiimi.
  new EcrStack(app, 'BackendEcrStack', {
    env: envEU,
    stackName: 'tutu-backend-ecr',
    serviceName: utilityConfig.backend_service_name,
    projectAwsOrgOrganizationalUnit: utilityConfig.aws.project_organizational_unit,
    githubActionsDeploymentRole: Utility.githubActionsDeploymentRole
  })

  new FrontendBuildBucketStack(app, 'FrontendBuildBucketStack', {
    env: envEU,
    githubActionsDeploymentRole: Utility.githubActionsDeploymentRole,
    serviceName: utilityConfig.frontend_service_name,
    projectAwsOrgOrganizationalUnit: utilityConfig.aws.project_organizational_unit
  })
}
