import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as path from 'path';


interface FrontendStaticContentDeploymentStackProps extends StackProps {
    environment: string,
    cloudFrontDistribution: cloudfront.Distribution,
    bucket: s3.Bucket,
}

export class FrontendStaticContentDeploymentStack extends Stack {
    constructor(scope: Construct, id: string, props: FrontendStaticContentDeploymentStackProps) {
        super(scope, id, props);

        new s3deploy.BucketDeployment(this, 'BucketDeployment', {
            sources: [s3deploy.Source.asset(path.join(__dirname, '../frontend/dist'))],
            destinationBucket: props.bucket,
            destinationKeyPrefix: 'static',
            distribution: props.cloudFrontDistribution,
            distributionPaths: ['/static/*'],
        });
    }
} 
