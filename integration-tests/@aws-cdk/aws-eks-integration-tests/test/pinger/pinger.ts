import * as ec2 from '@aws-cdk/aws-ec2';
import * as lambda from '@aws-cdk/aws-lambda';
import { CustomResource, Duration, Token } from '@aws-cdk/core';
import * as cr from '@aws-cdk/custom-resources';
import { Construct } from 'constructs';

// keep this import separate from other imports to reduce chance for merge conflicts with v2-main
// eslint-disable-next-line no-duplicate-imports, import/order
import { Construct as CoreConstruct } from '@aws-cdk/core';


export interface PingerProps {
  readonly url: string;
  readonly securityGroup?: ec2.SecurityGroup;
  readonly vpc?: ec2.IVpc;
  readonly subnets?: ec2.ISubnet[];
}
export class Pinger extends CoreConstruct {

  private _resource: CustomResource;

  constructor(scope: Construct, id: string, props: PingerProps) {
    super(scope, id);

    const func = new lambda.Function(this, 'Function', {
      code: lambda.Code.fromAsset(`${__dirname}/function`),
      handler: 'index.handler',
      runtime: lambda.Runtime.PYTHON_3_6,
      vpc: props.vpc,
      vpcSubnets: props.subnets ? { subnets: props.subnets } : undefined,
      securityGroups: props.securityGroup ? [props.securityGroup] : undefined,
      timeout: Duration.minutes(10),
    });

    const provider = new cr.Provider(this, 'Provider', {
      onEventHandler: func,
    });

    this._resource = new CustomResource(this, 'Resource', {
      serviceToken: provider.serviceToken,
      properties: {
        Url: props.url,
      },
    });
  }

  public get response() {
    return Token.asString(this._resource.getAtt('Value'));
  }

}
