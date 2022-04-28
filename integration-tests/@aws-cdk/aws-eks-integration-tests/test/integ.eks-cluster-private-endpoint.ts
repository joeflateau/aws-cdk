/// !cdk-integ pragma:ignore-assets pragma:disable-update-workflow
import * as ec2 from '@aws-cdk/aws-ec2';
import * as eks from '@aws-cdk/aws-eks';
import * as iam from '@aws-cdk/aws-iam';
import { App, Stack } from '@aws-cdk/core';

const CLUSTER_VERSION = eks.KubernetesVersion.V1_21;


class EksClusterStack extends Stack {
  constructor(scope: App, id: string) {
    super(scope, id);

    // allow all account users to assume this role in order to admin the cluster
    const mastersRole = new iam.Role(this, 'AdminRole', {
      assumedBy: new iam.AccountRootPrincipal(),
    });

    // just need one nat gateway to simplify the test
    const vpc = new ec2.Vpc(this, 'Vpc', { maxAzs: 3, natGateways: 1 });

    const cluster = new eks.Cluster(this, 'Cluster', {
      vpc,
      mastersRole,
      defaultCapacity: 2,
      version: CLUSTER_VERSION,
      endpointAccess: eks.EndpointAccess.PRIVATE,
      prune: false,
    });

    // this is the valdiation. it won't work if the private access is not setup properly.
    cluster.addManifest('config-map', {
      kind: 'ConfigMap',
      apiVersion: 'v1',
      data: {
        hello: 'world',
      },
      metadata: {
        name: 'config-map',
      },
    });

  }
}


const app = new App();

new EksClusterStack(app, 'aws-cdk-eks-cluster-private-endpoint-test');

app.synth();
