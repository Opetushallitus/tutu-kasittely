import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ops from 'aws-cdk-lib/aws-opensearchserverless';
import * as iam from 'aws-cdk-lib/aws-iam'
import {Key} from "aws-cdk-lib/aws-kms";

interface OpenSearchServerlessStackProps extends cdk.StackProps {
    collectionName: string;
    description: string;
    vpc: ec2.IVpc;
    securityGroupIds: string[];
    kmsKey: Key;
    standbyReplicas: 'DISABLED' | 'ENABLED',
    environment: string;
}

export class OpenSearchServerlessStack extends cdk.Stack {
    public readonly collectionArn: string
    public readonly collectionEndpoint: string;
    public readonly aossPolicyStatement: iam.PolicyStatement;
    constructor(scope: cdk.App, id: string, props: OpenSearchServerlessStackProps) {
        super(scope, id, props);

        const vpce = new ops.CfnVpcEndpoint(this, 'VpcEndPoint,', {
            name: `${props.environment}-opensearch-endpoint`,
            subnetIds: props.vpc.isolatedSubnets.map(x => x.subnetId),
            vpcId: props.vpc.vpcId,
            securityGroupIds: props.securityGroupIds,
        });

        const collection = new ops.CfnCollection(this, 'Collection', {
            name: props.collectionName,
            description: props.description,
            type: 'SEARCH',
            standbyReplicas: props.standbyReplicas
        });

        const encryptionPolicy = new ops.CfnSecurityPolicy(this, 'EncryptionPolicy', {
            name: `${props.environment}-serverless-encryption-policy`,
            type: 'encryption',
            policy: JSON.stringify({
                Rules: [
                    {
                        ResourceType: 'collection',
                        Resource: [`collection/${props.collectionName}`],
                    },
                ],
                AWSOwnedKey:false,
                KmsARN: props.kmsKey.keyArn,

            }),
        });

        const networkPolicy = new ops.CfnSecurityPolicy(this, 'NetworkPolicy', {
            name: `${props.environment}-serverless-network-policy`,
            type: 'network',
            policy: JSON.stringify([{
                Rules: [
                    {
                        ResourceType: 'collection',
                        Resource: [`collection/${props.collectionName}`],
                    }
                ],
                SourceVPCEs: [vpce.ref],

            }]),
        });

        const dataAccessPolicy = new ops.CfnAccessPolicy(this, 'DataAccessPolicy', {
            name: `${props.collectionName}-dap`,
            description: `Data access policy for: ${props.collectionName}`,
            type: "data",

            policy: JSON.stringify([{
                Principal: [`arn:aws:iam::${this.account}:root`],
                Rules: [

                    {
                        ResourceType: 'collection',
                        Resource: [`collection/${props.collectionName}`],
                        Permission: [
                            "aoss:*"
                        ]
                    },
                    {
                        ResourceType: 'index',
                        Resource: [
                            `index/${props.collectionName}/*`,
                        ],
                        Permission: [
                            'aoss:*'
                        ]
                    }
                ]
            }])

        })

        this.aossPolicyStatement = new iam.PolicyStatement({
            actions: [
              'aoss:CreateIndex',
              'aoss:DeleteIndex',
              'aoss:UpdateIndex',
              'aoss:DescribeIndex',
              'aoss:ReadDocument',
              'aoss:WriteDocument',
              'aoss:DescribeCollectionItems',
              'aoss:UpdateCollectionItems',
              'aoss:DeleteCollectionItems',
              'aoss:CreateCollectionItems',
              'aoss:APIAccessAll'
            ],
            resources: [collection.attrArn]
          })

        collection.addDependency(encryptionPolicy);
        collection.addDependency(networkPolicy);
        collection.addDependency(dataAccessPolicy);

        this.collectionArn = collection.attrArn
        this.collectionEndpoint = collection.attrCollectionEndpoint

        new cdk.CfnOutput(this, 'CollectionArn', {
            value: collection.attrArn,
        });
        new cdk.CfnOutput(this, 'CollectionEndpoint', {
            value: collection.attrCollectionEndpoint,
        });
    }
}
