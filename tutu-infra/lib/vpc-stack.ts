import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface VpcStackProps extends cdk.StackProps {
  vpc_cidr: string
  availability_zones: number
}

export class VpcStack extends cdk.Stack {
  readonly vpc: ec2.IVpc;
  constructor(scope: Construct, id: string, props: VpcStackProps) {
    super(scope, id, props);


  this.vpc = new ec2.Vpc(this, 'VPC', {
    ipAddresses: ec2.IpAddresses.cidr(props.vpc_cidr),
    natGateways: props.availability_zones,
    maxAzs: props.availability_zones,
    subnetConfiguration: [
      {
        cidrMask: 22,
        name: 'public',
        subnetType: ec2.SubnetType.PUBLIC,
      },
      {
        cidrMask: 22,
        name: 'private',
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      {
        cidrMask: 22,
        name: 'isolated',
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
    ],
  });

// Add CDK outputs for the VPC ID and subnet IDs
//   new cdk.CfnOutput(this, 'VpcId', { value: vpc.vpcId });
//   new cdk.CfnOutput(this, 'PublicSubnetIds', { value: vpc.publicSubnets.map(subnet => subnet.subnetId).join(',') });
//   new cdk.CfnOutput(this, 'PrivateSubnetIds', { value: vpc.privateSubnets.map(subnet => subnet.subnetId).join(', ') });
//   new cdk.CfnOutput(this, 'IsolatedSubnetIds', { value: vpc.isolatedSubnets.map(subnet => subnet.subnetId).join(', ') });

   }
}
