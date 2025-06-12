import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';


interface FrontendBucketStackProps extends StackProps {
    //    domain: string
    environment: string,
    cloudFrontDistribution: cloudfront.Distribution,
    projectName: string,
}

export class FrontendBucketStack extends Stack {
    readonly bucket: s3.Bucket;
    constructor(scope: Construct, id: string, props: FrontendBucketStackProps) {
        super(scope, id, props);

        // FrontEnd S3 bucket - OAI does not support KMS - encryption
        this.bucket = new s3.Bucket(this, 'FrontEndBucket', {
            bucketName: `${props.projectName}-static-content-${props.environment}`,
            enforceSSL: true,
            // encryption: s3.BucketEncryption.KMS,
            // encryptionKey: props.s3KmsKey,
        });

        // CloudFront OAI, Origin & behaviour
        const s3oai = new cloudfront.OriginAccessIdentity(this, 'OAI');
        const s3origin = new origins.S3Origin(this.bucket, { originAccessIdentity: s3oai });

        props.cloudFrontDistribution.addBehavior('/static/*', s3origin, {
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
        });
    }
}