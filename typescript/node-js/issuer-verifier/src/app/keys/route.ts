/*
 * route.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST() {
  const KEYPAIR_TYPE = "ec";
  const KEYPAIR_CURVE = "prime256v1";
  const PUBLIC_KEY_ENCODING_TYPE = "spki";
  const PRIVATE_KEY_ENCODING_TYPE = "pkcs8";
  const KEYPAIR_FORMAT = "pem";

  interface PublicKeyJWK {
    x: string;
    y: string;
    kid: string;
  }

  const keypair = crypto.generateKeyPairSync(KEYPAIR_TYPE, {
    namedCurve: KEYPAIR_CURVE,
    publicKeyEncoding: {
      type: PUBLIC_KEY_ENCODING_TYPE,
      format: KEYPAIR_FORMAT,
    },
    privateKeyEncoding: {
      type: PRIVATE_KEY_ENCODING_TYPE,
      format: KEYPAIR_FORMAT,
    },
  });
  const lines: string[] = keypair.publicKey.trim().split("\n");

  const x = lines[1];
  const y = lines[2];

  // You can use your own format for the kid
  const kid = crypto.createHash("sha256").update(x).digest("base64");

  const publicKey: PublicKeyJWK = {
    x,
    y,
    kid,
  };

  const privateKey: string = keypair.privateKey;
  console.log({ publicKey, privateKey });

  return NextResponse.json({
    status: "ok",
    message: "Key pair generated, check your console log.",
  });
}

export async function GET() {
  return NextResponse.json({ data: "get api keys" });
}
