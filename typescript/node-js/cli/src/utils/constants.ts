/*
 * constants.ts
 *
 * Values within constants.ts are strictly used for testing purposes only
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: November 29th 2023
 * -----
 * Last Modified: April 3rd 2024
 * Modified By: handrianalandi (handrian.alandi@gdplabs.id)
 * -----
 * Reviewers:
 *   Nugraha Tejapermana (nugraha.tejapermana@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { ZkPassApiKey } from "@didpass/zkpass-client-ts";

// Holder constants
export const ZKPASS_SERVICE_URL: string = "https://staging-zkpass.ssi.id";

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
export const KEY = "e7fd7ec9-33b2-4f33-a383-c2f1d151a7c2";
export const SECRET = "6a79ffa2-5fe8-4764-8edf-0ebc5dbcccf9";
export const API_KEY: ZkPassApiKey = new ZkPassApiKey(KEY, SECRET);
export const ZKPASS_ZKVM = "r0";