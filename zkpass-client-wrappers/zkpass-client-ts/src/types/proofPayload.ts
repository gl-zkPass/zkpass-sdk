/*
 * proofPayload.ts
 *
 * Authors:
 *   GDPWinnerPranata (winner.pranata@gdplabs.id)
 * Created at: December 11th 2023
 * -----
 * Last Modified: December 11th 2023
 * Modified By: GDPWinnerPranata (winner.pranata@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { KeysetEndpoint } from "./keysetEndpoint";
import { PublicKey } from "./publicKey";

export type ProofPayload = {
  data: {
    zkproof: string;
    dvr_title: string;
    dvr_id: string;
    dvr_digest: string;
    user_data_verifying_key: PublicKey | KeysetEndpoint;
    dvr_verifying_key: PublicKey | KeysetEndpoint;
    time_stamp: number;
  };
};
