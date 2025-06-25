# AWS infrastructure

Infrastructure template for new OPH projects

## Getting started

Ask infra - team for VPC CIDR - blocks so that the networks will not overlap with existing OPH - private network ranges.

The folder structure is designed so that the repo should be easy to fork (or just copy the infra folder) and start building your propect's monorepo using the template. The moment you fork/copy it you own it - no further updates to the infra will be autoamtically provided by the infra team. This is to keep the operational complexity at minimum.

## Infra code structure

The the bin/infra.ts contains all the stacks and controls "what gets deployed where". Avoid defining AWS resources in the bin/infra.ts directly. Don't need a stack? Remove it from bin/infra.ts and check if there are other stacks dependent of that stack. The goal of this project has been to make it very easy to determine dependencies between stacks and all the dependencies should be clearly visible from the stack directly when observing any specific stack from bin/infra.ts. Each stack in the bin/infra.ts translates to a corresponding CloudFormation stack (and you should be able to find the stack from AWS Console under "CloudFormation" - service. Handy for debugging stacks.). The CDK best practise is a bit different and practically states that a bunch of resources should be defined in a L3 construct, but when providing infra this way the constructs tend to be difficult to provide in an "easy-to-edit" format.

The lib/ - folder contains the infra code for that specific CDK stack. It is OK to modify these stacks for your needs. You can create many stack instances in bin/infra.ts out of a single CDK stack. This will help with making updates to many stacks of the same type (i.e. ECS service, RDS etc.) and you can leverage conditions if you need to have only 1 out X stacks to have some piece of infra.

The environments/ - folder provides the mechanism to define values "per environment" - basis. These values should not contain any sensitive information.

## AWS vault

First make sure the accounts you are working with have been configured to your `~/.aws/config` - file.

When deploying to the target environment from your local machine, use `aws-vault exec <target-aws-profile>` and then proceed with cdk - commands. AWS vault targets the destination account explicitly.

Alternatively, you can use aws cli v2:

`aws sso login --sso-session oph-org-sso` where `oph-org-sso` profile must match the profile configured in your `~/.aws/config`

With aws sso login spell above, you must define `--profile <target-account-aws-profile>`

Example: `npx cdk deploy -c environment=dev DataAnalyticsAuroraStack --profile example-dev`

## cdk command examples for deploying the project stacks

If you wish to run the CDK - commands from your local machine, install the global depencencies: `nodejs 20, npm, npx` and install the project dependencies with `npm install` in the `/infra` - directory.

- `npx cdk deploy -c environment=<dev/qa/prod/utility> --all` deploy all stacks to the target environment
- `npx cdk destroy -c environment=<dev/qa/prod/utility> --all` destroy all stacks to the target environment (note: you need to empty S3 - buckets etc. manually)
- `npx npx cdk deploy -c environment=dev WebBackendAuroraStack` deploy only WebBackendAuroraStack (and any change in it's dependencies)
- `npx npx cdk deploy -c environment=dev *AuroraStack` deploy all AuroraStacks (and any change in their dependencies)
- `npx npx cdk destroy -c environment=dev WebBackendAuroraStack` destroy only WebBackendAuroraStack (and any change in it's dependencies)

## Generic cdk commands

- `npx cdk diff` compare deployed stack with current state
- `npx npm run build` compile typescript to js
- `npx npm run watch` watch for changes and compile
- `npx npm run test` perform the jest unit tests
- `npx cdk synth` emits the synthesized CloudFormation template

## Environment variables

Environment variables have been split into two places;

- `environments/<environment>.json` contains environment specific non-sensitive configuration
- AWS Parameter Store contains variables with sensitive information. Parameters in the parameter store are expected to be prefixed with `/<environment>/<serviceName>/`

## Subnetting

Project uses a /16 network which has been split into /18 per VPC (=per environment), which in turn is designed to be split into 16x /22 networks with 1022 IP - addresses available per subnet.

## Adding a new service

First, add a new Security Group and Security Group rules to the `security-groups.ts`, add the service/environment specific configuration into `environments/<environment>.json` then create a new stack instance of `ecs-service.ts` in the `/bin/infra.ts`

## Adding a new database

- add a new Security Group and Security Group rules to the `security-groups.ts`,
- add a new secret in the `secrets-manager-stack.ts`
- add the service/environment specific database configuration into `environments/<environment>.json`
- create a new stack instance of `aurora-serverless-database.ts` in the `/bin/infra.ts`

Aurora stack creation only creates database master user with a password stored in the AWS Secrets Manager (`/auroradbs/<DBNAME>/master-user-password`). Application user must be created (and granted) separately.

### Configuring Monitoring

Sending Alerts is done with an SNS Topic, AWS ChatBot and Slack. To get started with sending alerts to Slack:

- Create plain text parameters `/monitor/slack_channel_id` and `/monitor/slack_workspace_id` into your AWS System's Manager Parameter Store that contain Slack Workspace ID and Channel ID
- Invite AWS ChatBot to the Slack channel
- Head to the AWS account's ChatBot - service, hit "Configure New Client", Select "Slack" from the drop down menu and proceed to authorize the AWS account to the AWS ChatBot - Slack app.
- Create the Monitor - Stack with the Slack channel name of your choise.
- You can now use the exported SNS topic for sending alerts.
