// create CDK stack that creates a Linux bastion host
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { IKey } from 'aws-cdk-lib/aws-kms'
import { Construct } from 'constructs'
import { Stack, StackProps } from 'aws-cdk-lib'
import * as iam from 'aws-cdk-lib/aws-iam'
import { readFileSync } from 'fs'

interface BastionStackProps extends StackProps {
  vpc: ec2.IVpc
  kmsKey: IKey
  securityGroup: ec2.ISecurityGroup
  environment: string
}

export class BastionStack extends Stack {
  constructor(scope: Construct, id: string, props: BastionStackProps) {
    super(scope, id, props)

    const allowSessionManager = new iam.PolicyStatement({
      actions: [
        'ssm:UpdateInstanceInformation',
        'ssmmessages:CreateControlChannel',
        'ssmmessages:CreateDataChannel',
        'ssmmessages:OpenControlChannel',
        'ssmmessages:OpenDataChannel',
        'ec2messages:GetMessages',
        'ssm:ListInstanceAssociations',
        'ssm:ListAssociations',
        'ssm:GetDeployablePatchSnapshotForInstance',
        'ssm:GetDocument',
        'ssm:UpdateInstanceAssociationStatus',
        'ssm:PutInventory',
        'aoss:DescribeCollectionItems',
        'aoss:ListCollections',
        'aoss:CreateIndex',
        'aoss:DeleteIndex',
        'aoss:UpdateIndex',
        'aoss:DescribeIndex',
        'aoss:ReadDocument',
        'aoss:WriteDocument',
        'kafka:GetBootstrapBrokers',
        'elasticfilesystem:DescribeFileSystems',
        'elasticfilesystem:ClientWrite',
        'elasticfilesystem:ClientMount',
        'elasticfilesystem:DescribeMountTargets',
        's3:GetObject'
      ],
      resources: ['*']
    })

    const allowKmsDecrypt = (keyArn: string) => {
      return new iam.PolicyStatement({
        actions: ['kms:Decrypt'],
        resources: [keyArn]
      })
    }

    const bastionHost = new ec2.BastionHostLinux(this, 'BastionHost', {
      vpc: props.vpc,
      instanceName: `${props.environment}-bastion-host`,
      securityGroup: props.securityGroup,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.NANO),
      blockDevices: [
        {
          deviceName: '/dev/sdh',
          volume: ec2.BlockDeviceVolume.ebs(10, {
            encrypted: true,
            kmsKey: props.kmsKey
          })
        }
      ],
      subnetSelection: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS }
    })

    const userDataScript = readFileSync('./scripts/bastion_userdata.sh', 'utf8')

    bastionHost.instance.addUserData(userDataScript)
    bastionHost.role.addToPrincipalPolicy(allowSessionManager)
    bastionHost.role.addToPrincipalPolicy(allowKmsDecrypt(props.kmsKey.keyArn))
  }
}
