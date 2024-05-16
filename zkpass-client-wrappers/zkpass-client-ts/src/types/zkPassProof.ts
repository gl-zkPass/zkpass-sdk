/*
 * zkPassProof.ts
 *
 * Authors:
 *   GDPWinnerPranata (winner.pranata@gdplabs.id)
 * Created at: November 14th 2023
 * -----
 * Last Modified: February 28th 2024
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

import { PublicKey } from "./publicKey";

export type ZkPassProof = {
  zkProof: string;
  dvrTitle: string;
  dvrId: string;
  dvrDigest: string;
  userDataVerifyingKey: PublicKey;
  dvrVerifyingKey: PublicKey;
  timestamp: number;
};
