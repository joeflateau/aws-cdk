#!/usr/bin/env node
import * as codebuild from '@aws-cdk/aws-codebuild';
import * as sns from '@aws-cdk/aws-sns';
import * as cdk from '@aws-cdk/core';

const app = new cdk.App();

const stack = new cdk.Stack(app, 'aws-cdk-codebuild-project-vpc');

const project = new codebuild.Project(stack, 'MyProject', {
  buildSpec: codebuild.BuildSpec.fromObject({
    version: '0.2',
    phases: {
      build: {
        commands: ['echo "Nothing to do!"'],
      },
    },
  }),
});

const target = new sns.Topic(stack, 'MyTopic');

project.notifyOnBuildSucceeded('NotifyOnBuildSucceeded', target);

app.synth();
