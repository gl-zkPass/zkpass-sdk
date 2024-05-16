/*
 * verifyZkPassProofResult.ts
 *
 * Authors:
 *   GDPWinnerPranata (winner.pranata@gdplabs.id)
 * Created at: November 14th 2023
 * -----
 * Last Modified: April 16th 2024
 * Modified By: NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { ZkPassOutput } from "./zkPassOutput";
import { ZkPassProof } from "./zkPassProof";

export type VerifyZkPassProofResult = {
  output: ZkPassOutput;
  zkPassProof: ZkPassProof;
};
