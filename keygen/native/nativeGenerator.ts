/*
 * native/nativeGenerator.ts
 *
 * Authors:
 *   Winner Pranata (winner.pranata@gdplabs.id)
 * Created at: February 21st 2024
 * -----
 * Modified at: February 23rd 2024
 * Modified By: Winner Pranata (winner.pranata@gdplabs.id)
 * -----
 * Reviewers:
 *   khandar-william
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { Generator, Cryptor, Signer, PostActionable } from "../interfaces";
import * as crypto from "crypto";
import { encrypt, decrypt } from "./aes256gcm";
import { signatureToBase64, verifyWithJose } from "../common/signer";
import { FilePayload, postActionSaveKeys } from "../common/postAction";

export class NativeGenerator
  implements Generator, Cryptor, Signer, PostActionable<FilePayload, void>
{
  async generate() {
    return this.generateSync();
  }

  async encrypt(plaintext: string | Buffer, secret: string) {
    return this.encryptSync(plaintext, secret);
  }

  async decrypt(ciphertext: string, secret: string) {
    return this.decryptSync(ciphertext, secret);
  }

  async sign(payload: string | Record<string, unknown>, privateKey: string) {
    return this.signSync(payload, privateKey);
  }

  verify = verifyWithJose;

  postAction(data: FilePayload) {
    postActionSaveKeys(data);
  }

  private generateSync() {
    const keypair = crypto.generateKeyPairSync("ec", {
      namedCurve: "prime256v1",
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });

    const [_, x, y] = keypair.publicKey.split("\n");

    const publicKey = { x, y };
    const privateKey = keypair.privateKey;

    return { privateKey, publicKey };
  }

  private encryptSync(plaintext: string | Buffer, secret: string) {
    let buffer = plaintext;
    if (typeof plaintext === "string") buffer = Buffer.from(plaintext);

    let key = secret;
    if (!secret) key = this.generateSecret();
    const cipherText = encrypt(key, buffer).toString("base64");
    return { cipherText, secret: key };
  }

  private decryptSync(ciphertext: string, secret: string) {
    const buffer = Buffer.from(ciphertext, "base64");

    const plaintext = decrypt(secret, buffer).toString();
    return { plaintext };
  }

  private generateSecret() {
    return crypto.randomBytes(32).toString("base64");
  }

  private signSync(
    payload: string | Record<string, unknown>,
    privateKey: string
  ) {
    const { privateKey: signerKey, publicKey } = privateKey
      ? {
          privateKey,
          publicKey: crypto
            .createPublicKey(privateKey)
            .export({ type: "spki", format: "pem" }),
        }
      : this.generateSignerKeypair();

    const jwtHeader = { alg: "ES256" };
    const signedString = `${Buffer.from(JSON.stringify(jwtHeader)).toString(
      "base64url"
    )}.${Buffer.from(JSON.stringify(payload)).toString("base64url")}`;
    const signature = crypto
      .createSign("sha256")
      .update(Buffer.from(signedString))
      .sign(signerKey);

    const jwt = `${signedString}.${signatureToBase64(signature)}`;

    return {
      jwt,
      privateKey: signerKey,
      publicKey:
        typeof publicKey === "string" ? publicKey : publicKey.toString(),
    };
  }

  private generateSignerKeypair() {
    return crypto.generateKeyPairSync("ec", {
      namedCurve: "prime256v1",
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
  }
}
