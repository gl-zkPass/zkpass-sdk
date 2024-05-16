/*
 * interfaces/cryptor.interface.ts
 *
 * Authors:
 *   Winner Pranata (winner.pranata@gdplabs.id)
 * Created at: February 20th 2024
 * -----
 * Modified at: February 20th 2024
 * Modified By: Winner Pranata (winner.pranata@gdplabs.id)
 * -----
 * Reviewers:
 *   khandar-william
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

export interface Cryptor {
  encrypt(
    plaintext: string | Buffer,
    secret?: string
  ): Promise<{ cipherText: string; secret?: string }>;
  decrypt(ciphertext: string, secret?: string): Promise<{ plaintext: string }>;
}
