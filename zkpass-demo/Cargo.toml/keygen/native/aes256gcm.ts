/*
 * native/aes256gcm.ts
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

import * as crypto from "crypto";

export function encrypt(key: crypto.BinaryLike, plaintext: string | Buffer) {
  const keyHash = crypto.createHash("sha256").update(key).digest();
  const iv = crypto.randomBytes(16);

  const buffer = Buffer.isBuffer(plaintext)
    ? plaintext
    : Buffer.from(plaintext);

  const cipher = crypto.createCipheriv("aes-256-gcm", keyHash, iv);
  const ciphertext = cipher.update(buffer);

  const encrypted = Buffer.concat([iv, ciphertext, cipher.final()]);
  return encrypted;
}

export function decrypt(key: crypto.BinaryLike, ciphertext: string | Buffer) {
  const buffer = Buffer.isBuffer(ciphertext)
    ? ciphertext
    : Buffer.from(ciphertext, "base64");

  const keyHash = crypto.createHash("sha256").update(key).digest();
  const iv = buffer.subarray(0, 16);
  const cipher = buffer.subarray(16);

  const output = crypto
    .createDecipheriv("aes-256-gcm", keyHash, iv)
    .update(cipher);
  return output;
}
