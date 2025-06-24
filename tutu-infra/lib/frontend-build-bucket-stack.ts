import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Role } from 'aws-cdk-lib/aws-iam'
import * as s3 from 'aws-cdk-lib/aws-s3'

interface FrontendBuildBucketStackProps extends StackProps {
  githubActionsDeploymentRole: Role
  serviceName: string
  projectAwsOrgOrganizationalUnit: string
}

export class FrontendBuildBucketStack extends Stack {
  public readonly bucket: s3.Bucket

  constructor(scope: Construct, id: string, props: FrontendBuildBucketStackProps) {
    super(scope, id, props);

    this.bucket = new s3.Bucket(this, 'BuildArtifactBucket', {bucketName: `${props.serviceName}-builds`})

    this.bucket.grantReadWrite(props.githubActionsDeploymentRole)
  }
}
