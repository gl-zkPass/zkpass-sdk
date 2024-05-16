/*
 * zkPassUtility.ts
 *
 * Authors:
 *   GDPWinnerPranata (winner.pranata@gdplabs.id)
 * Created at: March 13th 2024
 * -----
 * Last Modified: March 13th 2024
 * Modified By: GDPWinnerPranata (winner.pranata@gdplabs.id)
 * -----
 * Reviewers:
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { KeysetEndpoint, Primitive } from '../types';

export interface ZkPassUtility {
  signDataToJwsToken(
    signingKey: string,
    data: Primitive,
    verifyingKeyJwks?: KeysetEndpoint
  ): Promise<string>;
  verifyJwsToken(
    key: string,
    jwsToken: string
    // ): Promise<{ [propName: string]: unknown }>;
  ): Promise<string>;
  encryptDataToJweToken(key: string, data: Primitive): Promise<string>;
  decryptJweToken(
    key: string,
    jweToken: string
    // ): Promise<{ [propName: string]: unknown }>;
  ): Promise<string>;
  getEncryptionKey(): Promise<string>;
  getVerifyingKey(): Promise<string>;
}
