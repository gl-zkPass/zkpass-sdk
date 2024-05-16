/*
 * zkPassUtility.ts
 *
 * Authors:
 *   GDPWinnerPranata (winner.pranata@gdplabs.id)
 * Created at: November 14th 2023
 * -----
 * Last Modified: March 4th 2024
 * Modified By: GDPWinnerPranata (winner.pranata@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import {
  JWTDecryptResult as JwtDecryptResult,
  JWTVerifyResult as JwtVerifyResult,
} from "jose";
import { KeysetEndpoint, Primitive } from "../types";

export interface ZkPassUtility {
  signDataToJwsToken(
    signingKey: string,
    data: Primitive,
    verifyingKeyJwks?: KeysetEndpoint
  ): Promise<string>;
  verifyJwsToken(key: string, jwsToken: string): Promise<JwtVerifyResult>;
  encryptDataToJweToken(key: string, data: Primitive): Promise<string>;
  decryptJweToken(key: string, jweToken: string): Promise<JwtDecryptResult>;
  getEncryptionKey(): Promise<string>;
  getVerifyingKey(): Promise<string>;
}
