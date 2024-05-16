/*
 * common/signer.ts
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

import { importSPKI, jwtVerify } from "jose";

export function signatureToBase64(bytes: Buffer) {
  const rLength = bytes[3];
  const r = bytes.subarray(4, 4 + rLength);
  const s = bytes.subarray(6 + rLength);

  return Buffer.concat([
    Buffer.from(r[0] === 0 ? r.subarray(1) : r),
    Buffer.from(s[0] === 0 ? s.subarray(1) : s),
  ]).toString("base64url");
}

export async function verifyWithJose<T = {}>(jwt: string, publicKey: string) {
  const key = await importSPKI(publicKey, "ES256");
  return await jwtVerify<T>(jwt, key);
}
