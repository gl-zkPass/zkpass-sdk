/*
 * Filename: typescript/node-js/issuer-verifier/src/app/keys/route.ts
 * Path: typescript/node-js/issuer-verifier
 * Created Date: Monday, November 27th 2023, 4:42:11 pm
 * Author: Naufal Fakhri Muhammad
 *
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
import crypto from "crypto";

export async function POST() {
  interface PublicKeyJWK {
    x: string;
    y: string;
    kid: string;
  }

  const keypair = crypto.generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  const lines: string[] = keypair.publicKey.trim().split("\n");

  const x = lines[1];
  const y = lines[2];

  const kid = crypto.createHash("sha256").update(x).digest("base64");

  const publicKey: PublicKeyJWK = {
    x,
    y,
    kid,
  };

  const privateKey: string = keypair.privateKey;
  console.log({ publicKey, privateKey });

  return Response.json({
    status: "ok",
    message: "Key pair generated, check your console log.",
  });
}

export async function GET() {
  return Response.json({ data: "get api keys" });
}
