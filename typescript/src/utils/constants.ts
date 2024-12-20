/*
 * constants.ts
 *
 * Values within constants.ts are strictly used for testing purposes only
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { config } from "dotenv";

config();

// Holder constants
export const ZKPASS_SERVICE_URL: string =
  process.env.ZKPASS_SERVICE_URL || "https://playground-zkpass.ssi.id";

// Issuer constants
export const ISSUER_PRIVKEY: string =
  "-----BEGIN PRIVATE KEY-----\n" +
  "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg3J/wAlzSD8ZyAU8f\n" +
  "bPkuCY/BSlq2Y2S5hym8sRccpZehRANCAATt/RChVSxxwH3IzAcBHuhWT8v5mRfx\n" +
  "moLVnRdNqPcExwyeqH5XN0dlffIYprf66E0CEpZbJ8H+v7cTys9Ie1dd\n" +
  "-----END PRIVATE KEY-----\n";
export const ISSUER_KID: string = "k-1";
export const ISSUER_JKU: string =
  "https://raw.githubusercontent.com/gl-zkPass/zkpass-sdk/main/docs/zkpass/sample-jwks/issuer-key.json";

// Verifier constants
export const VERIFIER_PRIVKEY: string = `-----BEGIN PRIVATE KEY-----
    MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLxxbcd7aVcNEdE/C
    EGPwLzM6lkLuDYzhd3FqALuuHCahRANCAASnpYmXAC2V39TiEOaa64x1kJW0x5Qh
    PfGQN1TAs6+xVUD6KJLB9pfgeoqVE8MYb4XpYaOfHKz1Pka017ee97A4
    -----END PRIVATE KEY-----`;
export const VERIFIER_KID: string = "k-1";
export const VERIFIER_JKU: string =
  "https://raw.githubusercontent.com/gl-zkPass/zkpass-sdk/main/docs/zkpass/sample-jwks/verifier-key.json";
export const EXPECTED_DVR_TTL: number = 600;

// API Keys
export const KEY = process.env.KEY || "5ecb2229-ddee-460e-b598-a0001c10fff1";
export const SECRET =
  process.env.SECRET || "074a53a8-a252-45de-a9d5-0961a6362df6";
export const ZKPASS_ZKVM = process.env.ZKPASS_ZKVM || "r0";
