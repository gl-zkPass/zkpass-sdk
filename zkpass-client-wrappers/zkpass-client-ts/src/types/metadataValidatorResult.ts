/*
* metadataValidatorResult.ts
*
* Authors:
*   GDPWinnerPranata (winner.pranata@gdplabs.id)
* Created at: November 14th 2023
* -----
* Last Modified: November 30th 2023
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

import { DataVerificationRequest } from "../classes";
import { PublicKey } from "./publicKey";

export type MetadataValidatorResult = {
  expectedDvr: DataVerificationRequest;
  expectedVerifyingDvrKey: PublicKey;
  expectedTtl: number;
};
