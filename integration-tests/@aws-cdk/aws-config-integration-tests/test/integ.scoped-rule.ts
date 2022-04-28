import * as config from '@aws-cdk/aws-config';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';

const app = new cdk.App();

const stack = new cdk.Stack(app, 'aws-cdk-config-rule-scoped-integ');

const fn = new lambda.Function(stack, 'CustomFunction', {
  code: lambda.AssetCode.fromInline('exports.handler = (event) => console.log(event);'),
  handler: 'index.handler',
  runtime: lambda.Runtime.NODEJS_14_X,
});

new config.CustomRule(stack, 'Custom', {
  lambdaFunction: fn,
  periodic: true,
  ruleScope: config.RuleScope.fromResources([config.ResourceType.EC2_INSTANCE]),
});

app.synth();
