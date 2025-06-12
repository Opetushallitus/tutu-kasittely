import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ses from 'aws-cdk-lib/aws-ses'
import { HostedZone } from 'aws-cdk-lib/aws-route53';
import * as cdk from 'aws-cdk-lib';
import { EmailIdentity } from "aws-cdk-lib/aws-ses";
import * as iam from 'aws-cdk-lib/aws-iam';

interface sesProps extends StackProps {
  hostedZone: HostedZone
}

export class SesStack extends Stack {
  public emailIdentity: EmailIdentity;
  public readonly sesIamPolicy: iam.PolicyStatement;

  constructor(scope: Construct, id: string, props: sesProps) {
    super(scope, id, props);
    this.emailIdentity = new ses.EmailIdentity(this, 'EmailIdentity', {
      identity: ses.Identity.publicHostedZone(props.hostedZone)
    })

    this.sesIamPolicy = new iam.PolicyStatement({
      actions: [ 'ses:SendEmail' ],
      resources: [
        this.emailIdentity.emailIdentityArn
      ]
    });

    new cdk.CfnOutput(this, 'EmailIdentityArn', {
      value: this.emailIdentity.emailIdentityArn,
      description: 'The ARN of the SES Email Identity',
    });
  }
}