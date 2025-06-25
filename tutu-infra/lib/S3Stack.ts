import * as cdk from 'aws-cdk-lib/core'
import { RemovalPolicy } from 'aws-cdk-lib/core'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { BucketAccessControl, ObjectOwnership } from 'aws-cdk-lib/aws-s3'
import { Construct } from 'constructs'
import { StackProps } from 'aws-cdk-lib'

interface S3StackProps extends StackProps {
  exampleBucketName: string
  examplePdfBucketName: string
  exampleThumbnailBucketName: string
  environment: string
}

export class S3Stack extends cdk.Stack {
  public readonly exampleBucket: s3.Bucket
  public readonly examplePdfBucket: s3.Bucket
  public readonly exampleThumbnailBucket: s3.Bucket

  constructor(scope: Construct, id: string, props: S3StackProps) {
    super(scope, id, props)

    this.exampleBucket = this.newBucket(props.exampleBucketName, props)
    this.examplePdfBucket = this.newBucket(props.examplePdfBucketName, props)
    this.exampleThumbnailBucket = this.newBucket(props.exampleThumbnailBucketName, props)
  }

  newBucket(bucketName: string, props: S3StackProps): s3.Bucket {
    return new s3.Bucket(this, `${bucketName}Bucket`, {
      bucketName: `${bucketName}-${props.environment}`,
      accessControl: BucketAccessControl.PRIVATE,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true, // Required for taking backups
      objectOwnership: ObjectOwnership.BUCKET_OWNER_PREFERRED, // Required for restoring backups
      lifecycleRules: [
        {
          id: 'ExpireOldVersions',
          noncurrentVersionExpiration: cdk.Duration.days(30) // Retain old versions for 30 days
        }
      ],
      removalPolicy: RemovalPolicy.RETAIN
    })
  }

  allBuckets(): s3.Bucket[] {
    return Object.values(this).flatMap((v) => (v instanceof s3.Bucket ? v : []))
  }
}
