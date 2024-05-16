/*
 * common/postAction.ts
 *
 * Authors:
 *   Winner Pranata (winner.pranata@gdplabs.id)
 * Created at: February 23rd 2024
 * -----
 * Modified at: February 23rd 2024
 * Modified By: Winner Pranata (winner.pranata@gdplabs.id)
 * -----
 * Reviewers:
 *   khandar-william
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { GenerationResult } from "../generator";
import * as env from "./env";
import * as fs from "fs";

export type FilePayload = {
  signingKey: GenerationResult;
  encryptionKey: GenerationResult;
};

export type FileData = { file: string; content: string };

export function postActionSaveKeys(data: {
  signingKey: GenerationResult;
  encryptionKey: GenerationResult;
}): FileData[] {
  // Writing JWTs
  const jwts = {
    signerKeyPair: data.signingKey.jwt,
    encryptKeyPair: data.encryptionKey.jwt,
  };
  const jwtOutput = env.get("JWT_OUTPUT");
  const jwtContent = JSON.stringify(jwts, null, 2);
  fs.writeFileSync(jwtOutput, jwtContent);
  console.log(`[!] JWT successfully saved to ${jwtOutput}`);

  // Writing Public Keys
  const signingPublicKey = data.signingKey.signingPublicKey
    .split("\n")
    .slice(1, 3);
  const publicKeys = [
    {
      kty: "EC",
      crv: "P-256",
      x: data.signingKey.payloadPublicKey.payload.x,
      y: data.signingKey.payloadPublicKey.payload.y,
      kid: "ServiceSigningPubK",
      jwt: data.signingKey.payloadPublicKey.jwt,
    },
    {
      kty: "EC",
      crv: "P-256",
      x: data.encryptionKey.payloadPublicKey.payload.x,
      y: data.encryptionKey.payloadPublicKey.payload.y,
      kid: "ServiceEncryptionPubK",
      jwt: data.encryptionKey.payloadPublicKey.jwt,
    },
    {
      kty: "EC",
      crv: "P-256",
      x: signingPublicKey[0],
      y: signingPublicKey[1],
      kid: "VerifyingPubK",
    },
  ];
  const pubKOutput = env.get("PUBLIC_KEY_OUTPUT");
  const pubKContent = JSON.stringify(publicKeys, null, 2);
  fs.writeFileSync(pubKOutput, pubKContent);
  console.log(`[!] JWT successfully saved to ${pubKOutput}`);

  return [
    {
      file: jwtOutput,
      content: jwtContent,
    },
    {
      file: pubKOutput,
      content: pubKContent,
    },
  ];
}
