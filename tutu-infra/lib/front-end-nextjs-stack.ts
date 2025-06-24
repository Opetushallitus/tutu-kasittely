import { Stack, StackProps } from 'aws-cdk-lib'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import { Construct } from 'constructs'
import { Nextjs } from 'cdk-nextjs-standalone'
import { IHostedZone } from 'aws-cdk-lib/aws-route53'
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager'
import * as s3 from 'aws-cdk-lib/aws-s3'

interface FrontendNextjsStackProps extends StackProps {
  nextjsPath: string
  domainName: string
  basePath: string
  hostedZone: IHostedZone
  cloudFrontDistribution: cloudfront.Distribution
  certificate: ICertificate
  environment: Record<string, string>
  revision: string
  serviceName: string
}

export class FrontendNextjsStack extends Stack {
  constructor(scope: Construct, id: string, props: FrontendNextjsStackProps) {
    super(scope, id, props);

    new Nextjs(this, 'FrontendNextjsStack', {
      nextjsPath: props.nextjsPath,
      basePath: props.basePath,
      environment: props.environment,
      domainProps: {
        domainName: props.domainName,
        certificate: props.certificate,
        hostedZone: props.hostedZone,
      },
      distribution: props.cloudFrontDistribution,
      skipBuild: true
    })
  }
}
