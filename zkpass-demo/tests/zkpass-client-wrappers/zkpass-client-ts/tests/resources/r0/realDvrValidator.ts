/*
 * realDvrValidator.ts
 * Mock ZkPassProofMetadataValidator class to be used when verifyProof.
 *
 * Authors:
 *   handrianalandi (handrian.alandi@gdplabs.id)
 * Created at: November 29th 2023
 * -----
 * Last Modified: February 28th 2024
 * Modified By: GDPWinnerPranata (winner.pranata@gdplabs.id)
 * -----
 * Reviewers:
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 *   zulamdat (zulchaidir@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
import {
  DataVerificationRequest,
  MetadataValidatorResult,
  PublicKey,
  ZkPassProofMetadataValidator,
} from "../../../src";

export default class RealDvrValidator implements ZkPassProofMetadataValidator {
  constructor(readonly dummyDvr: DataVerificationRequest) {}

  async validate(dvrId: string): Promise<MetadataValidatorResult> {
    const dummyDvr = this.dummyDvr;
    function dummyGetDvrById(id: string): DataVerificationRequest {
      return dummyDvr;
    }

    const expectedTtl = 600;
    const expectedVerifyingDvrKey = {
      x: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU",
      y: "IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==",
    };

    return {
      expectedDvr: dummyGetDvrById(dvrId),
      expectedVerifyingDvrKey,
      expectedTtl,
    };
  }
}
