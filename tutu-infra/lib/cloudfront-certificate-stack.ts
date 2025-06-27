import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as cdk from 'aws-cdk-lib'
import * as route53 from 'aws-cdk-lib/aws-route53'
import { Construct } from 'constructs'

interface CloudFrontCertificateStackProps extends cdk.StackProps {
  domain: string
  hostedZone: route53.IHostedZone
}

export class CloudFrontCertificateStack extends cdk.Stack {
  readonly certificate: acm.ICertificate
  constructor(scope: Construct, id: string, props: CloudFrontCertificateStackProps) {
    super(scope, id, props)

    this.certificate = new acm.Certificate(this, 'CloudfrontCertificate', {
      domainName: props.domain,
      validation: acm.CertificateValidation.fromDns(props.hostedZone),
      subjectAlternativeNames: [`backend.${props.domain}`, `frontend.${props.domain}`],
    })
  }
}
