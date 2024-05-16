/*
 * kms/kmsGenerator.ts
 *
 * Authors:
 *   Winner Pranata (winner.pranata@gdplabs.id)
 * Created at: February 21st 2024
 * -----
 * Modified at: February 28th 2024
 * Modified By: Winner Pranata (winner.pranata@gdplabs.id)
 * -----
 * Reviewers:
 *   khandar-william
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { Generator, Cryptor, Signer, PostActionable } from "../interfaces";
import { GenerateDataKeyPairCommand } from "@aws-sdk/client-kms";
import { AwsClient } from "./client";
import * as env from "../common/env";
import { EncryptCommand, DecryptCommand } from "@aws-sdk/client-kms";
import { GetPublicKeyCommand, SignCommand } from "@aws-sdk/client-kms";
import { signatureToBase64, verifyWithJose } from "../common/signer";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { FilePayload, postActionSaveKeys } from "../common/postAction";

export class KmsGenerator
  implements Generator, Cryptor, Signer, PostActionable<FilePayload, void>
{
  async generate() {
    const kmsClient = AwsClient.getKmsClient();
    const command = new GenerateDataKeyPairCommand({
      KeyId: env.get("AWS_KMS_ENCRYPT_KEY_ID"),
      KeyPairSpec: "ECC_NIST_P256",
    });
    const output = await kmsClient.send(command);
    if (!output.PublicKey || !output.PrivateKeyPlaintext)
      throw new Error("Key generation failed");

    const [x, y] = Buffer.from(output.PublicKey)
      .toString("base64")
      .match(/.{0,64}/g)!;

    const publicKey = { x, y };
    const privateKey =
      "-----BEGIN PRIVATE KEY-----\n" +
      Buffer.from(output.PrivateKeyPlaintext)
        .toString("base64")
        .match(/.{0,64}/g)!
        .join("\n") +
      "-----END PRIVATE KEY-----\n";

    return { privateKey, publicKey };
  }

  async encrypt(plaintext: string | Buffer) {
    let buffer =
      typeof plaintext === "string" ? Buffer.from(plaintext) : plaintext;

    const kmsClient = AwsClient.getKmsClient();

    const command = new EncryptCommand({
      KeyId: env.get("AWS_KMS_ENCRYPT_KEY_ID"),
      Plaintext: buffer,
    });
    const output = await kmsClient.send(command);
    if (!output.CiphertextBlob) throw new Error("CiphertextBlob is empty");

    const cipherText = Buffer.from(output.CiphertextBlob).toString("base64");
    return { cipherText };
  }

  async decrypt(ciphertext: string) {
    const buffer = Buffer.from(ciphertext, "base64");

    const kmsClient = AwsClient.getKmsClient();

    const command = new DecryptCommand({
      KeyId: env.get("AWS_KMS_ENCRYPT_KEY_ID"),
      CiphertextBlob: buffer,
    });
    const output = await kmsClient.send(command);
    if (!output.Plaintext) throw new Error("Plaintext is empty");

    const plaintext = Buffer.from(output.Plaintext).toString();
    return { plaintext };
  }

  async sign(payload: string | Record<string, unknown>) {
    const jwtHeader = {
      alg: "ES256",
    };
    const signedString = `${Buffer.from(JSON.stringify(jwtHeader)).toString(
      "base64url"
    )}.${Buffer.from(JSON.stringify(payload)).toString("base64url")}`;

    const kmsClient = AwsClient.getKmsClient();
    const signCommand = new SignCommand({
      Message: new Uint8Array(Buffer.from(signedString)),
      KeyId: env.get("AWS_KMS_SIGN_KEY_ID"),
      SigningAlgorithm: "ECDSA_SHA_256",
    });

    const generateOutput = await kmsClient.send(signCommand);
    if (!generateOutput.Signature) throw new Error("Signature is empty");

    const signature = signatureToBase64(Buffer.from(generateOutput.Signature));

    const jwt = `${signedString}.${signature}`;
    return { jwt, publicKey: await this.getSignerPublicKey() };
  }

  async verify<T = {}>(jwt: string) {
    const signerPublicKey = await this.getSignerPublicKey();
    return await verifyWithJose<T>(jwt, signerPublicKey);
  }

  async postAction(data: any) {
    // Output to .json
    const files = postActionSaveKeys(data);

    // Save to s3
    const client = AwsClient.getS3Client();
    files.forEach(async ({ file, content }) => {
      const command = new PutObjectCommand({
        Bucket: env.get("AWS_S3_BUCKET"),
        Key: file,
        Body: content,
      });

      await client.send(command);

      console.log(
        `[!] '${file}' successfully saved to '${env.get("AWS_S3_BUCKET")}'`
      );
    });
  }

  private async getSignerPublicKey() {
    const client = AwsClient.getKmsClient();
    const command = new GetPublicKeyCommand({
      KeyId: env.get("AWS_KMS_SIGN_KEY_ID"),
    });

    const output = await client.send(command);
    if (!output.PublicKey) throw new Error("PublicKey is empty");

    const publicKey = Buffer.from(output.PublicKey).toString("base64");
    return `-----BEGIN PUBLIC KEY-----\n${publicKey
      .match(/.{0,64}/g)!
      .join("\n")}-----END PUBLIC KEY-----`;
  }
}
