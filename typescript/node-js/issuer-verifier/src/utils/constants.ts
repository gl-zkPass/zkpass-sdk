/*
 * constants.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created at: December 15th 2023
 * -----
 * Last Modified: April 16th 2024
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   NONE
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

// Verifier
export const VERIFIER_PRIVATE_KEY_PEM =
  "-----BEGIN PRIVATE KEY-----\n" +
  "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLxxbcd7aVcNEdE/C\n" +
  "EGPwLzM6lkLuDYzhd3FqALuuHCahRANCAASnpYmXAC2V39TiEOaa64x1kJW0x5Qh\n" +
  "PfGQN1TAs6+xVUD6KJLB9pfgeoqVE8MYb4XpYaOfHKz1Pka017ee97A4\n" +
  "-----END PRIVATE KEY-----\n";
export const VERIFIER_JWKS_URL =
  "https://raw.githubusercontent.com/gl-zkPass/zkpass-sdk/main/docs/zkpass/sample-jwks/verifier-key.json";
export const VERIFIER_JWKS_KID = "k-1";

// Issuer
export const ISSUER_PRIVATE_KEY_PEM =
  "-----BEGIN PRIVATE KEY-----\n" +
  "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg3J/wAlzSD8ZyAU8f\n" +
  "bPkuCY/BSlq2Y2S5hym8sRccpZehRANCAATt/RChVSxxwH3IzAcBHuhWT8v5mRfx\n" +
  "moLVnRdNqPcExwyeqH5XN0dlffIYprf66E0CEpZbJ8H+v7cTys9Ie1dd\n" +
  "-----END PRIVATE KEY-----\n";
export const ISSUER_JWKS_URL =
  "https://raw.githubusercontent.com/gl-zkPass/zkpass-sdk/main/docs/zkpass/sample-jwks/issuer-key.json";
export const ISSUER_JWKS_KID = "k-1";

// export const API_KEY = "5ecb2229-ddee-460e-b598-a0001c10fff1";
// export const API_SECRET = "074a53a8-a252-45de-a9d5-0961a6362df6";
// export const ZKPASS_SERVICE_URL = "https://playground-zkpass.ssi.id";
export const API_KEY = "api_1";
export const API_SECRET = "secret_api_1";
export const ZKPASS_SERVICE_URL = "http://localhost:10888";

export const ZKPASS_ZKVM = "r0";