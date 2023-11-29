/*
 * constants.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: November 29th 2023
 * -----
 * Last Modified: November 29th 2023
 * Modified By: NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * -----
 * Reviewers:
 *   Nugraha Tejapermana (nugraha.tejapermana@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

// Holder constants
export const ZKPASS_SERVICE_URL: string =
  "https://playground-zkpass.ssi.id/proof";

// Issuer constants
export const ISSUER_PRIVKEY: string =
  "-----BEGIN PRIVATE KEY-----\n" +
  "MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg3J/wAlzSD8ZyAU8f\n" +
  "bPkuCY/BSlq2Y2S5hym8sRccpZehRANCAATt/RChVSxxwH3IzAcBHuhWT8v5mRfx\n" +
  "moLVnRdNqPcExwyeqH5XN0dlffIYprf66E0CEpZbJ8H+v7cTys9Ie1dd\n" +
  "-----END PRIVATE KEY-----\n";
export const ISSUER_KID: string = "k-1";
export const ISSUER_JKU: string =
  "https://gdp-admin.github.io/zkpass-sdk/zkpass/sample-jwks/issuer-key.json";

// Verifier constants
export const VERIFIER_PRIVKEY: string = `-----BEGIN PRIVATE KEY-----
    MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLxxbcd7aVcNEdE/C
    EGPwLzM6lkLuDYzhd3FqALuuHCahRANCAASnpYmXAC2V39TiEOaa64x1kJW0x5Qh
    PfGQN1TAs6+xVUD6KJLB9pfgeoqVE8MYb4XpYaOfHKz1Pka017ee97A4
    -----END PRIVATE KEY-----`;
export const VERIFIER_KID: string = "k-1";
export const VERIFIER_JKU: string =
  "https://gdp-admin.github.io/zkpass-sdk/zkpass/sample-jwks/verifier-key.json";
