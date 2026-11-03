import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CfnOutput, Duration, RemovalPolicy, Stack, type StackProps } from 'aws-cdk-lib';
import { HttpApi } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { LoggingFormat, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import type { Construct } from 'constructs';

const srcDir = fileURLToPath(new URL('../src', import.meta.url));
const entry = join(srcDir, 'index.ts');
const templatesDir = join(srcDir, 'templates');

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const table = new Table(this, 'TodoTable', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const siteLogGroup = new LogGroup(this, 'SiteLogGroup', {
      logGroupName: `/aws/lambda/${this.stackName}-site`,
      retention: RetentionDays.ONE_DAY,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const siteFn = new NodejsFunction(this, 'SiteFn', {
      functionName: `${this.stackName}-site`,
      entry,
      handler: 'handler',
      runtime: Runtime.NODEJS_24_X,
      memorySize: 512,
      timeout: Duration.seconds(10),
      loggingFormat: LoggingFormat.JSON,
      logGroup: siteLogGroup,
      environment: {
        TABLE_NAME: table.tableName,
      },
      bundling: {
        format: OutputFormat.ESM,
        target: 'node24',
        minify: true,
        sourceMap: true,
        mainFields: ['module', 'main'],
        // Nunjucks loads chokidar only when it watches templates, which a Lambda never does
        externalModules: ['chokidar'],
        esbuildArgs: { '--conditions': 'module' },
        banner: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
        commandHooks: {
          beforeBundling: () => [],
          beforeInstall: () => [],
          // esbuild bundles only code, so the Nunjucks templates are copied next to index.mjs
          afterBundling: (_inputDir, outputDir) => [`cp -r "${templatesDir}" "${outputDir}/templates"`],
        },
      },
    });
    table.grantReadWriteData(siteFn);

    // The $default route sends every path to siteFn, so the matcher answers unknown paths with its 404 page
    const httpApi = new HttpApi(this, 'HttpApi', {
      defaultIntegration: new HttpLambdaIntegration('SiteIntegration', siteFn),
    });

    new CfnOutput(this, 'SiteUrl', { value: httpApi.apiEndpoint });
    new CfnOutput(this, 'TableName', { value: table.tableName });
  }
}
