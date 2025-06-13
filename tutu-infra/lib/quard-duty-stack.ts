import * as cdk from 'aws-cdk-lib';
import * as guardduty from 'aws-cdk-lib/aws-guardduty';
import { Construct } from 'constructs';
import { StackProps } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import * as iam from 'aws-cdk-lib/aws-iam';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';

interface GuardDutyProps extends StackProps {
  buckets: Bucket[],
  alarmSnsTopic?: cdk.aws_sns.Topic,
}

export class GuardDutyS3Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: GuardDutyProps) {
    super(scope, id, props);

    const guardDutyRole = new iam.Role(
      this,
      "GuardDutyMalwareProtectionPassRole",
      {
        roleName: `GuardDutyMalwareProtectionPassRole-${this.account}`,
        assumedBy: new iam.ServicePrincipal(
          "malware-protection-plan.guardduty.amazonaws.com"
        ),
        description:
          "An iam pass role for guardduty malware protection service to assume",
      }
    );

    guardDutyRole.addToPolicy(new iam.PolicyStatement({
      sid: "AllowManagedRuleToSendS3EventsToGuardDuty",
      effect: iam.Effect.ALLOW,
      actions: [
        "events:PutRule"
      ],
      resources: [
        `arn:aws:events:${this.region}:${this.account}:rule/DO-NOT-DELETE-AmazonGuardDutyMalwareProtectionS3*`
      ],
      conditions: {
        StringLike: {
          "events:ManagedBy": "malware-protection-plan.guardduty.amazonaws.com"
        }
      }
    }));

    guardDutyRole.addToPolicy(new iam.PolicyStatement({
      sid: "AllowUpdateTargetAndDeleteManagedRule",
      effect: iam.Effect.ALLOW,
      actions: [
        "events:DeleteRule",
        "events:PutTargets",
        "events:RemoveTargets"
      ],
      resources: [
        `arn:aws:events:${this.region}:${this.account}:rule/DO-NOT-DELETE-AmazonGuardDutyMalwareProtectionS3*`
      ],
      conditions: {
        StringEquals: {
          "events:ManagedBy": "malware-protection-plan.guardduty.amazonaws.com"
        }
      }
    }));

    guardDutyRole.addToPolicy(new iam.PolicyStatement({
      sid: "AllowGuardDutyToMonitorEventBridgeManagedRule",
      effect: iam.Effect.ALLOW,
      actions: [
        "events:DescribeRule",
        "events:ListTargetsByRule"
      ],
      resources: [
        `arn:aws:events:${this.region}:${this.account}:rule/DO-NOT-DELETE-AmazonGuardDutyMalwareProtectionS3*`
      ],
    }));

    guardDutyRole.addToPolicy(new iam.PolicyStatement({
      sid: "AllowEnableS3EventBridgeEvents",
      effect: iam.Effect.ALLOW,
      actions: [
        "s3:PutBucketNotification",
        "s3:GetBucketNotification"
      ],
      resources: props.buckets.map(bucket => bucket.bucketArn)
    }));

    guardDutyRole.addToPolicy(new iam.PolicyStatement({
      sid: "AllowPostScanTag",
      effect: iam.Effect.ALLOW,
      actions: [
        "s3:PutObjectTagging",
        "s3:GetObjectTagging",
        "s3:PutObjectVersionTagging",
        "s3:GetObjectVersionTagging"
      ],
      resources: props.buckets.map(bucket => `${bucket.bucketArn}/*`)
    }));

    guardDutyRole.addToPolicy(new iam.PolicyStatement({
      sid: "AllowPutValidationObject",
      effect: iam.Effect.ALLOW,
      actions: [ "s3:PutObject" ],
      resources: props.buckets.map(bucket => `${bucket.bucketArn}/malware-protection-resource-validation-object`)
    }));

    guardDutyRole.addToPolicy(new iam.PolicyStatement({
      sid: "AllowCheckBucketOwnership",
      effect: iam.Effect.ALLOW,
      actions: [
        "s3:ListBucket", "s3:GetBucketLocation" ],
      resources: props.buckets.map(bucket => bucket.bucketArn)
    }));

    guardDutyRole.addToPolicy(new iam.PolicyStatement({
      sid: "AllowMalwareScan",
      effect: iam.Effect.ALLOW,
      actions: [ "s3:GetObject", "s3:GetObjectVersion" ],
      resources: props.buckets.map(bucket => `${bucket.bucketArn}/*`)
    }));


    props.buckets.forEach((bucket, index) => {
      const malwareProtectionPlan = new guardduty.CfnMalwareProtectionPlan(this, `GuardDutyS3MalwarePlan-${index}`, {
        role: guardDutyRole.roleArn,
        protectedResource: {
          s3Bucket: {
            bucketName: bucket.bucketName
          }
        },
        actions: {
          tagging: {
            status: 'ENABLED'
          }
        }
      });

      malwareProtectionPlan.node.addDependency(guardDutyRole);
    });

    if (props.alarmSnsTopic) {
      const malwareEventRule = new events.Rule(this, 'GuardDutyMalwareEventRule', {
        eventPattern: {
          source: [ 'aws.guardduty' ],
          detailType: [ 'GuardDuty Malware Protection Object Scan Result' ],
          detail: {
            scanStatus: [ "COMPLETED" ],
            resourceType: [ "S3_OBJECT" ],
            scanResultDetails: {
              scanResultStatus: [ "THREATS_FOUND" ]
            }
          }
        }
      });

      malwareEventRule.addTarget(new targets.SnsTopic(props.alarmSnsTopic, {
          message: events.RuleTargetInput.fromMultilineText(
            [
              "🚨 GuardDuty Malware Alert! 🚨",
              `Scan Status: ${events.EventField.fromPath("$.detail.scanStatus")}`,
              `Threat Detected: ${events.EventField.fromPath("$.detail.scanResultDetails.threats[0].name")}`,
              `S3 Bucket: ${events.EventField.fromPath("$.detail.s3ObjectDetails.bucketName")}`,
              `S3 Object: ${events.EventField.fromPath("$.detail.s3ObjectDetails.objectKey")}`,
              `Region: ${events.EventField.fromPath("$.region")}`
            ].join("\n")
          )
          }
        )
      );
    }
  }
}