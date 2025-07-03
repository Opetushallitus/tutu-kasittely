import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Nextjs, NextjsOverrides, OptionalFunctionProps } from 'cdk-nextjs-standalone'
import { IHostedZone } from 'aws-cdk-lib/aws-route53'
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager'
import { CachePolicy, PriceClass } from 'aws-cdk-lib/aws-cloudfront'
import * as logs from 'aws-cdk-lib/aws-logs'

interface FrontendNextjsStackProps extends StackProps {
  nextjsPath: string
  domainName: string
  basePath: string
  hostedZone: IHostedZone
  certificate: ICertificate
  environment: string
  envVars: Record<string, string>
  serviceName: string
  skipBuild: boolean
}

const nameFunctionProps = (
  scope: Construct,
  environmentName: string,
  appName: string,
  lambdaName: string,
  logGroupOptions?: logs.LogGroupProps
): OptionalFunctionProps => {
  const id = `${environmentName}-${appName}-${lambdaName}`
  return {
    functionName: id,
    logGroup: new logs.LogGroup(scope, id, {
      logGroupName: `/aws/lambda/${id}`,
      retention: logs.RetentionDays.INFINITE,
      ...logGroupOptions
    })
  }
}

const nameOverrides = (scope: Construct, environmentName: string, appName: string): NextjsOverrides => {
  return {
    nextjsServer: {
      functionProps: nameFunctionProps(scope, environmentName, appName, 'nextjs-server')
    }
  }
}

export class FrontendNextjsStack extends Stack {
  constructor(scope: Construct, id: string, props: FrontendNextjsStackProps) {
    super(scope, id, props)

    if (!props.skipBuild) {
      new Nextjs(this, 'FrontendNextjsStack', {
        nextjsPath: props.nextjsPath,
        basePath: props.basePath,
        environment: { STANDALONE: 'true', ...props.envVars },
        domainProps: {
          domainName: props.domainName,
          certificate: props.certificate,
          hostedZone: props.hostedZone
        },
        overrides: {
          nextjsDistribution: {
            imageBehaviorOptions: {
              // We don't need image optimization, so doesn't matter what cache policy we use
              // Using a managed policy so we don't add useless cache policies.
              cachePolicy: CachePolicy.CACHING_DISABLED
            },
            distributionProps: {
              priceClass: PriceClass.PRICE_CLASS_100,
              enableIpv6: false
            }
          },
          ...nameOverrides(this, props.environment, props.serviceName)
        }
      })
    }
  }
}
