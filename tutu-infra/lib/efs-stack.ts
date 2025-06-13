import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import * as efs from 'aws-cdk-lib/aws-efs';
import { Construct } from "constructs";
import { ISecurityGroup, IVpc } from "aws-cdk-lib/aws-ec2";
import { AccessPoint, ThroughputMode } from "aws-cdk-lib/aws-efs";
import * as iam from "aws-cdk-lib/aws-iam"

interface EfsStackProps extends StackProps {
    securityGroup: ISecurityGroup;
    vpc: IVpc
    accessPointPath: string,
    throughputMode: ThroughputMode
}

export class EfsStack extends Stack {
    public readonly fileSystem: efs.FileSystem;
    public readonly fileSystemId: string;
    public readonly accessPoint: AccessPoint;
    public readonly efsPolicyStatement: iam.PolicyStatement;

    constructor(scope: Construct, id: string, props: EfsStackProps) {
        super(scope, id, props);

        this.fileSystem = new efs.FileSystem(this, 'AOEEfs', {
            vpc: props.vpc,
            lifecyclePolicy: efs.LifecyclePolicy.AFTER_30_DAYS,
            performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
            throughputMode: props.throughputMode,
            securityGroup: props.securityGroup,
        });

        this.accessPoint = new AccessPoint(this, 'AccessPoint', {
            fileSystem: this.fileSystem,
            path: props.accessPointPath,
            createAcl: {
                ownerGid: "1000",
                ownerUid: "1000",
                permissions: "755"
            },
            posixUser: {
                uid: "1000",
                gid: "1000"
            }
        });

        this.fileSystemId = this.fileSystem.fileSystemId

        this.efsPolicyStatement = new iam.PolicyStatement({
            actions: [
              'elasticfilesystem:DescribeFileSystems',
              'elasticfilesystem:ClientWrite',
              'elasticfilesystem:ClientMount',
              'elasticfilesystem:DescribeMountTargets'
            ],
            resources: [this.fileSystem.fileSystemArn]
          })

        new CfnOutput(this, 'FileSystemId', {
            value: this.fileSystem.fileSystemId,
        });
    }
}