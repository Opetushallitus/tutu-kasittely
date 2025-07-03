import * as cdk from 'aws-cdk-lib/core'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'

/*
Security Groups for resources are defined here.
Security Groups defined in a centralized manner like this won't generate
an "order of creation" - dependency between the services / databases, 
but adds a little operational complexity (when creating a new 
service / database, Security Groups and  SG rules must first be defined here)
*/

interface SecurityGroupStackProps extends StackProps {
  vpc: ec2.IVpc
}

export class SecurityGroupStack extends cdk.Stack {
  public readonly semanticApisServiceSecurityGroup: ec2.SecurityGroup
  public readonly albSecurityGroup: ec2.SecurityGroup
  public readonly webBackendAuroraSecurityGroup: ec2.SecurityGroup
  public readonly semanticApisRedisSecurityGroup: ec2.SecurityGroup
  public readonly bastionSecurityGroup: ec2.SecurityGroup
  public readonly openSearchSecurityGroup: ec2.SecurityGroup
  public readonly dataAnalyticsServiceSecurityGroup: ec2.SecurityGroup
  public readonly streamingServiceSecurityGroup: ec2.SecurityGroup
  public readonly dataServicesSecurityGroup: ec2.SecurityGroup
  public readonly webBackendsServiceSecurityGroup: ec2.SecurityGroup
  public readonly efsSecurityGroup: ec2.SecurityGroup
  public readonly documentDbSecurityGroup: ec2.SecurityGroup
  public readonly mskSecurityGroup: ec2.SecurityGroup
  public readonly webFrontendServiceSecurityGroup: ec2.SecurityGroup

  constructor(scope: Construct, id: string, props: SecurityGroupStackProps) {
    super(scope, id, props)

    // Security Groups
    this.documentDbSecurityGroup = new ec2.SecurityGroup(this, 'DocumentDbSecurityGroup', {
      vpc: props.vpc,
      description: 'Allow access to DocumentDB cluster',
      allowAllOutbound: true
    })

    this.mskSecurityGroup = new ec2.SecurityGroup(this, 'MskSecurityGroup', {
      vpc: props.vpc,
      description: 'Allow access to MSK kafka',
      allowAllOutbound: true
    })

    this.efsSecurityGroup = new ec2.SecurityGroup(this, 'EfsSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true
    })

    this.bastionSecurityGroup = new ec2.SecurityGroup(this, 'BastionSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true
    })

    this.albSecurityGroup = new ec2.SecurityGroup(this, 'AlbSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true
    })

    this.dataAnalyticsServiceSecurityGroup = new ec2.SecurityGroup(
      this,
      'DataAnalyticsServiceSecurityGroupSecurityGroup',
      {
        vpc: props.vpc,
        allowAllOutbound: true
      }
    )

    this.webBackendsServiceSecurityGroup = new ec2.SecurityGroup(this, 'WebBackendServiceSecurityGroupSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true
    })

    this.webFrontendServiceSecurityGroup = new ec2.SecurityGroup(this, 'WebFrontendServiceSecurityGroupSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true
    })

    this.semanticApisServiceSecurityGroup = new ec2.SecurityGroup(this, 'SemanticApisServiceSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true
    })

    this.webBackendAuroraSecurityGroup = new ec2.SecurityGroup(this, 'WebBackendAuroraSecurityGroupSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true
    })

    this.semanticApisRedisSecurityGroup = new ec2.SecurityGroup(this, 'SemanticApisRedisSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true
    })

    this.openSearchSecurityGroup = new ec2.SecurityGroup(this, 'openSearchSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true
    })

    this.streamingServiceSecurityGroup = new ec2.SecurityGroup(this, 'StreamingServiceSecurityGroupSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true
    })

    this.dataServicesSecurityGroup = new ec2.SecurityGroup(this, 'DataServicesSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true
    })

    // Security Group rules
    this.mskSecurityGroup.addIngressRule(this.dataAnalyticsServiceSecurityGroup, ec2.Port.tcp(9098))

    this.mskSecurityGroup.addIngressRule(this.webBackendsServiceSecurityGroup, ec2.Port.tcp(9098))

    this.mskSecurityGroup.addIngressRule(this.bastionSecurityGroup, ec2.Port.tcp(9098))

    this.documentDbSecurityGroup.addIngressRule(this.dataAnalyticsServiceSecurityGroup, ec2.Port.tcp(27017))

    this.documentDbSecurityGroup.addIngressRule(this.bastionSecurityGroup, ec2.Port.tcp(27017))

    this.efsSecurityGroup.addIngressRule(this.webBackendsServiceSecurityGroup, ec2.Port.tcp(2049))

    this.efsSecurityGroup.addIngressRule(this.bastionSecurityGroup, ec2.Port.tcp(2049))

    this.openSearchSecurityGroup.addIngressRule(this.bastionSecurityGroup, ec2.Port.tcp(443))

    this.openSearchSecurityGroup.addIngressRule(this.webBackendsServiceSecurityGroup, ec2.Port.tcp(443))

    this.semanticApisRedisSecurityGroup.addIngressRule(this.semanticApisServiceSecurityGroup, ec2.Port.tcp(6379))

    this.semanticApisRedisSecurityGroup.addIngressRule(this.bastionSecurityGroup, ec2.Port.tcp(6379))

    this.dataAnalyticsServiceSecurityGroup.addIngressRule(this.albSecurityGroup, ec2.Port.tcp(8080))

    this.dataAnalyticsServiceSecurityGroup.addIngressRule(this.bastionSecurityGroup, ec2.Port.tcp(8080))

    this.semanticApisRedisSecurityGroup.addIngressRule(this.webBackendsServiceSecurityGroup, ec2.Port.tcp(6379))

    this.semanticApisServiceSecurityGroup.addIngressRule(this.albSecurityGroup, ec2.Port.tcp(8080))

    this.semanticApisServiceSecurityGroup.addIngressRule(this.bastionSecurityGroup, ec2.Port.tcp(8080))

    this.dataServicesSecurityGroup.addIngressRule(this.albSecurityGroup, ec2.Port.tcp(8080))

    this.dataServicesSecurityGroup.addIngressRule(this.bastionSecurityGroup, ec2.Port.tcp(8080))

    this.webBackendsServiceSecurityGroup.addIngressRule(this.albSecurityGroup, ec2.Port.tcp(8080))

    this.webBackendsServiceSecurityGroup.addIngressRule(this.bastionSecurityGroup, ec2.Port.tcp(8080))

    this.webBackendsServiceSecurityGroup.addIngressRule(this.dataServicesSecurityGroup, ec2.Port.tcp(8080))

    this.streamingServiceSecurityGroup.addIngressRule(this.albSecurityGroup, ec2.Port.tcp(8080))

    this.streamingServiceSecurityGroup.addIngressRule(this.bastionSecurityGroup, ec2.Port.tcp(8080))

    this.streamingServiceSecurityGroup.addIngressRule(this.webBackendsServiceSecurityGroup, ec2.Port.tcp(8080))

    this.dataAnalyticsServiceSecurityGroup.addIngressRule(this.webBackendsServiceSecurityGroup, ec2.Port.tcp(8080))

    // allow port 80 to alb albSecuritygroup from Internet
    this.albSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443))

    this.webBackendAuroraSecurityGroup.addIngressRule(this.webBackendsServiceSecurityGroup, ec2.Port.tcp(5432))

    this.webBackendAuroraSecurityGroup.addIngressRule(this.dataAnalyticsServiceSecurityGroup, ec2.Port.tcp(5432))

    this.webBackendAuroraSecurityGroup.addIngressRule(this.bastionSecurityGroup, ec2.Port.tcp(5432))

    this.webBackendsServiceSecurityGroup.addIngressRule(this.bastionSecurityGroup, ec2.Port.tcp(8080))

    this.webFrontendServiceSecurityGroup.addIngressRule(this.albSecurityGroup, ec2.Port.tcp(8080))

    this.webFrontendServiceSecurityGroup.addIngressRule(this.bastionSecurityGroup, ec2.Port.tcp(8080))

    this.webBackendAuroraSecurityGroup.addIngressRule(this.bastionSecurityGroup, ec2.Port.tcp(5432))
  }
}
