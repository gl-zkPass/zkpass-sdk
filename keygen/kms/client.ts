/*
 * kms/client.ts
 *
 * Authors:
 *   Winner Pranata (winner.pranata@gdplabs.id)
 * Created at: February 20th 2024
 * -----
 * Modified at: February 28th 2024
 * Modified By: Winner Pranata (winner.pranata@gdplabs.id)
 * -----
 * Reviewers:
 *   khandar-william
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { KMSClient as KmsClient } from "@aws-sdk/client-kms";
import { S3Client } from "@aws-sdk/client-s3";
import * as env from "../common/env";

export class AwsClient {
  static getKmsClient() {
    return new KmsClient({
      credentials: {
        accessKeyId: env.get("AWS_KMS_ACCESS_KEY_ID"),
        secretAccessKey: env.get("AWS_KMS_SECRET_ACCESS_KEY"),
      },
      region: env.get("AWS_KMS_REGION"),
    });
  }

  static getS3Client() {
    return new S3Client({
      credentials: {
        accessKeyId: env.get("AWS_S3_ACCESS_KEY_ID"),
        secretAccessKey: env.get("AWS_S3_SECRET_ACCESS_KEY"),
      },
      region: env.get("AWS_S3_REGION"),
    });
  }
}
