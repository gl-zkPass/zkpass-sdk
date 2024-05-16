/*
 * interfaces/signer.interface.ts
 *
 * Authors:
 *   Winner Pranata (winner.pranata@gdplabs.id)
 * Created at: February 20th 2024
 * -----
 * Modified at: February 23rd 2024
 * Modified By: Winner Pranata (winner.pranata@gdplabs.id)
 * -----
 * Reviewers:
 *   khandar-william
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { JWTVerifyResult } from "jose";

export interface Signer {
  sign(
    payload: string | Record<string, unknown>,
    privateKey?: string
  ): Promise<{ jwt: string; privateKey?: string; publicKey: string }>;
  verify<T = {}>(jwt: string, publicKey?: string): Promise<JWTVerifyResult<T>>;
}
