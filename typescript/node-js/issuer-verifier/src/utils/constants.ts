/*
 * constants.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created at: December 15th 2023
 * -----
 * Last Modified: April 3rd 2024
 * Modified By: handrianalandi (handrian.alandi@gdplabs.id)
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

export const API_KEY = "e7fd7ec9-33b2-4f33-a383-c2f1d151a7c2";
export const API_SECRET = "6a79ffa2-5fe8-4764-8edf-0ebc5dbcccf9";
export const ZKPASS_SERVICE_URL = "https://staging-zkpass.ssi.id";

export const ZKPASS_ZKVM = "r0";