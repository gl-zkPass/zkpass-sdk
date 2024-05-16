/*
 * generator.ts
 *
 * Authors:
 *   Winner Pranata (winner.pranata@gdplabs.id)
 * Created at: February 20th 2024
 * -----
 * Modified at: March 5th 2024
 * Modified By: Winner Pranata (winner.pranata@gdplabs.id)
 * -----
 * Reviewers:
 *   khandar-william
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import * as env from "./common/env";
import { OPERATION_BUNDLE } from "./bundle";
import * as crypto from "crypto";

export type GenerationResult = {
  jwt: string;
  payloadPublicKey: {
    jwt: string;
    payload: {
      x: string;
      y: string;
    };
  };
  encryptionSecret?: string;
  signingPrivateKey?: string;
  signingPublicKey: string;
};

export async function generate(
  args: {
    privateKey?: string;
    encryptionSecret?: string;
    signingPrivateKey?: string;
  } = {}
): Promise<GenerationResult> {
  const keyService = env.get("KEY_SERVICE");
  const keypair = args.privateKey
    ? derive(args.privateKey)
    : await OPERATION_BUNDLE[keyService].generate();

  const { cipherText: encryptedPrivateKey, secret } = await OPERATION_BUNDLE[
    keyService
  ].encrypt(keypair.privateKey, args.encryptionSecret);

  const encryptedKeypair = {
    privateKey: encryptedPrivateKey,
    publicKey: keypair.publicKey,
  };
  const { jwt, privateKey, publicKey } = await OPERATION_BUNDLE[
    keyService
  ].sign(encryptedKeypair, args.signingPrivateKey);

  // Public Key JWT
  const { jwt: publicKeyJwt } = await OPERATION_BUNDLE[keyService].sign(
    keypair.publicKey,
    args.signingPrivateKey ?? privateKey
  );

  return {
    jwt,
    payloadPublicKey: {
      jwt: publicKeyJwt,
      payload: keypair.publicKey,
    },
    encryptionSecret: secret,
    signingPrivateKey: privateKey,
    signingPublicKey: publicKey,
  };
}

export async function verify<T = {}>(jwt: string, publicKey?: string) {
  const keyService = env.get("KEY_SERVICE");
  return await OPERATION_BUNDLE[keyService].verify<T>(jwt, publicKey);
}

export async function postAction(data: any) {
  const keyService = env.get("KEY_SERVICE");
  await OPERATION_BUNDLE[keyService].postAction(data);
}

export function derive(privateKey: string) {
  const publicKeyPem = crypto
    .createPublicKey(Buffer.from(privateKey))
    .export({ type: "spki", format: "pem" })
    .toString();
  console.log(publicKeyPem);
  const [_, x, y] = publicKeyPem.split("\n");

  const publicKey = { x, y };

  return { privateKey, publicKey };
}
