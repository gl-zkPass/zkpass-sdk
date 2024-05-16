/*
 * common/env.ts
 *
 * Authors:
 *   Winner Pranata (winner.pranata@gdplabs.id)
 * Created at: February 20th 2024
 * -----
 * Modified at: February 23rd 2024
 * Modified By: Winner Pranata (winner.pranata@gdplabs.id)
 * -----
 * Reviewers:
 *   khandar-william
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import * as dotenv from "dotenv";
dotenv.config();

interface IEnv {
  KEY_SERVICE: "KMS" | "NATIVE";
  JWT_OUTPUT: string;
  PUBLIC_KEY_OUTPUT: string;
  AWS_KMS_ACCESS_KEY_ID: string;
  AWS_KMS_SECRET_ACCESS_KEY: string;
  AWS_KMS_ENCRYPT_KEY_ID: string;
  AWS_KMS_SIGN_KEY_ID: string;
  AWS_KMS_REGION: string;
  AWS_S3_ACCESS_KEY_ID: string;
  AWS_S3_SECRET_ACCESS_KEY: string;
  AWS_S3_REGION: string;
  AWS_S3_BUCKET: string;
}

export function get(key: keyof IEnv): IEnv[keyof IEnv] {
  const value = process.env[key];
  if (!value) throw new Error(`Environment with key '${key}' not found`);
  return value;
}
