import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as deployment from "aws-cdk-lib/aws-s3-deployment";
import * as cf from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";

const app = new cdk.App();

const stack = new cdk.Stack(app, "HKReactShopStack", {
  env: { region: "us-east-1" },
});

const bucket = new s3.Bucket(stack, "HKReactShopBucket", {
  bucketName: "hk-react-shop",
});

const originAccessIdentity = new cf.OriginAccessIdentity(
  stack,
  "HKReactShopBucketOAI",
  {
    comment: bucket.bucketName,
  }
);

bucket.grantRead(originAccessIdentity);

const cloudFront = new cf.Distribution(stack, "HKReactShopDistribution", {
  defaultBehavior: {
    origin: new origins.S3Origin(bucket, {
      originAccessIdentity,
    }),
    viewerProtocolPolicy: cf.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
  },
  defaultRootObject: "index.html",
  errorResponses: [
    {
      httpStatus: 404,
      responseHttpStatus: 200,
      responsePagePath: "/index.html",
    },
  ],
});

new deployment.BucketDeployment(stack, "HKReactShopDeployment", {
  destinationBucket: bucket,
  sources: [deployment.Source.asset("./dist")],
  distribution: cloudFront,
  distributionPaths: ["/*"],
});

new cdk.CfnOutput(stack, "Domain URL", {
  value: cloudFront.distributionDomainName,
});
