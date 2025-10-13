import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'
import { IKey } from 'aws-cdk-lib/aws-kms'

interface SecretManagerStackProps extends cdk.StackProps {
  kmsKey: IKey
}

export type SecretEntry = {
  secretKey: string
  envVarName: string
  path: string
}

export type Secrets = {
  [key: string]: SecretEntry
}

// Stack for secrets generated on the fly (mostly resources that don't support Parameter Store)
export class SecretManagerStack extends cdk.Stack {
  public readonly semanticApisPassword: secretsmanager.Secret
  public readonly webBackendAuroraPassword: secretsmanager.Secret
  public readonly webBackendPassportSessionSecret: secretsmanager.Secret
  public readonly documentDbPassword: secretsmanager.Secret

  public readonly secrets: Secrets = {
    CLIENT_ID: { envVarName: 'CLIENT_ID', path: '/service/web-backend/CLIENT_ID', secretKey: 'secretkey' },
    PROXY_URI: { envVarName: 'PROXY_URI', path: '/service/web-backend/PROXY_URI', secretKey: 'secretkey' },
    REDIS_PASS: { envVarName: 'REDIS_PASS', path: '/service/semantic-apis/REDIS_PASS', secretKey: 'secretkey' },
    PG_PASS: { envVarName: 'PG_PASS', path: '/service/web-backend/PG_PASS', secretKey: 'secretkey' },
    SESSION_SECRET: {
      envVarName: 'SESSION_SECRET',
      path: '/service/web-backend/SESSION_SECRET',
      secretKey: 'secretkey'
    },
    CLIENT_SECRET: { envVarName: 'CLIENT_SECRET', path: '/service/web-backend/CLIENT_SECRET', secretKey: 'secretkey' },
    JWT_SECRET: { envVarName: 'JWT_SECRET', path: '/service/web-backend/JWT_SECRET', secretKey: 'secretkey' },
    ANALYTICS_PG_PASS: {
      envVarName: 'SPRING_DATASOURCE_PRIMARY_PASSWORD',
      path: '/auroradbs/web-backend/dev/reporter',
      secretKey: 'password'
    },
    ANALYTICS_DOCDB_PASSWORD: {
      envVarName: 'MONGODB_PRIMARY_PASSWORD',
      path: '/service/data-analytics/DOCDB_PASS',
      secretKey: 'secretkey'
    },
    ANALYTICS_TRUST_STORE_PASSWORD: {
      envVarName: 'TRUST_STORE_PASS',
      path: '/service/data-analytics/TRUST_STORE_PASS',
      secretKey: 'secretkey'
    },
    ADMIN_EMAIL: { envVarName: 'ADMIN_EMAIL', path: '/service/web-backend/ADMIN_EMAIL', secretKey: 'secretkey' }
  }

  constructor(scope: Construct, id: string, props: SecretManagerStackProps) {
    super(scope, id, props)

    this.semanticApisPassword = new secretsmanager.Secret(this, 'secret', {
      secretName: '/service/semantic-apis/REDIS_PASS',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: 'secretkey',
        passwordLength: 16,
        excludeCharacters: '@%*()_+=`~{}|[]\\:";\'?,./'
      }
    })

    this.webBackendPassportSessionSecret = new secretsmanager.Secret(this, 'PassportSessionSecret', {
      secretName: '/service/web-backend/SESSION_SECRET',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({}),
        passwordLength: 32,
        generateStringKey: 'secretkey',
        excludeCharacters: '@%*()_+=`~{}|[]\\:";\'?,./'
      }
    })

    this.webBackendAuroraPassword = new secretsmanager.Secret(this, 'WebBackendAuroraPassword', {
      secretName: '/auroradbs/web-backend/master-user-password',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'db_admin' }),
        generateStringKey: 'password',
        passwordLength: 24,
        excludeCharacters: '@%*()_+=`~{}|[]\\:";\'?,./'
      }
    })

    this.documentDbPassword = new secretsmanager.Secret(this, 'DocumentDbSecret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'docdbuser' }),
        generateStringKey: 'password',
        excludeCharacters: '/@" '
      }
    })
  }
}
