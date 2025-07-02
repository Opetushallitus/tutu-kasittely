// Create a new cdk stack for cloudfront
import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as targets from 'aws-cdk-lib/aws-route53-targets'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'

interface CloudfrontStackProps extends StackProps {
  domain: string
  publicHostedZone: route53.IHostedZone
  //    environment: string,
  alb: elbv2.ILoadBalancerV2
  certificate: acm.ICertificate
  // bucket: s3.Bucket,
  requireTestAuth: boolean
}

export class CloudfrontStack extends Stack {
  readonly distribution: cloudfront.Distribution
  constructor(scope: Construct, id: string, props: CloudfrontStackProps) {
    super(scope, id, props)

    const distributionBaseConfiguration = {
      domainNames: [props.domain],
      certificate: props.certificate
    }

    // Configure default behaviour
    const defaultBehavior = {
      origin: new origins.LoadBalancerV2Origin(props.alb, {
        protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY
      }),
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
      originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
    }

    if (props.requireTestAuth) {
      const kvStore = new cloudfront.KeyValueStore(this, 'KeyValueStore', {
        keyValueStoreName: 'authStore'
      })

      // create a cloudFront function from the basic-auth.js file
      const basicAuthFunction = new cloudfront.Function(this, 'RequestFunction', {
        functionName: 'BasicAuth',
        runtime: cloudfront.FunctionRuntime.JS_2_0,
        code: cloudfront.FunctionCode.fromFile({
          filePath: './resources/functions/basic-auth.js'
        }),
        keyValueStore: kvStore
      })

      const basicAuthResponseFunction = new cloudfront.Function(this, 'ResponseFunction', {
        functionName: 'BasicAuthCookie',
        runtime: cloudfront.FunctionRuntime.JS_2_0,
        code: cloudfront.FunctionCode.fromFile({
          filePath: './resources/functions/cookie-response.js'
        }),
        keyValueStore: kvStore
      })

      // Connect basic authentication function to defaultBehaviour
      this.distribution = new cloudfront.Distribution(this, 'Distribution', {
        ...distributionBaseConfiguration,
        defaultBehavior: {
          ...defaultBehavior,
          functionAssociations: [
            {
              function: basicAuthFunction,
              eventType: cloudfront.FunctionEventType.VIEWER_REQUEST
            },
            {
              function: basicAuthResponseFunction,
              eventType: cloudfront.FunctionEventType.VIEWER_RESPONSE
            }
          ]
        }
      })
    } else {
      // No test authentication required
      this.distribution = new cloudfront.Distribution(this, 'Distribution', {
        ...distributionBaseConfiguration,
        defaultBehavior
      })
    }

    // route53 alias record for cloudfront
    new route53.ARecord(this, 'AliasRecord', {
      zone: props.publicHostedZone,
      recordName: props.domain,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(this.distribution))
    })
  }
}
