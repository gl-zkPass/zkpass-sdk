/*
 * zkPassProofVerifier.ts
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

import {
  ExpiredZkPassProof,
  MismatchedDvrDigest,
  MismatchedDvrVerifyingKey,
  MismatchedUserDataVerifyingKey,
} from "../errors";
import { PublicKeyWrapped, QueryEngineVersionInfo } from "../types";
import { VerifyZkPassProofResult } from "../types/verifyZkPassProofResult";
import { ZkPassProofMetadataValidator } from "./zkPassProofMetadataValidator";

export abstract class ZkPassProofVerifier {
  async verifyZkPassProof(
    zkPassProofToken: string,
    validator: ZkPassProofMetadataValidator
  ): Promise<VerifyZkPassProofResult> {
    const verificationResult = await this.verifyZkPassProofInternal(
      zkPassProofToken
    );

    const { expectedDvr, expectedTtl, expectedVerifyingDvrKey } =
      await validator.validate(verificationResult.zkPassProof.dvrId);

    if (
      verificationResult.zkPassProof.dvrDigest !== expectedDvr.getSha256Digest()
    )
      throw new MismatchedDvrDigest();

    if ((expectedDvr.userDataVerifyingKey as PublicKeyWrapped).PublicKey) {
      const key = (expectedDvr.userDataVerifyingKey as PublicKeyWrapped)
        .PublicKey;

      const proofUserDataKey =
        verificationResult.zkPassProof.userDataVerifyingKey;
      if (key.x !== proofUserDataKey.x || key.y !== proofUserDataKey.y)
        throw new MismatchedUserDataVerifyingKey();
    } else {
      // TODO: get the pubkey from endpoint
    }

    const proofDvrKey = verificationResult.zkPassProof.dvrVerifyingKey;
    if (
      proofDvrKey.x !== expectedVerifyingDvrKey.x ||
      proofDvrKey.y !== expectedVerifyingDvrKey.y
    )
      throw new MismatchedDvrVerifyingKey();

    const proofTimestamp = verificationResult.zkPassProof.timestamp;
    const now = Date.now() / 1000;
    if (
      expectedTtl > 0 &&
      now > proofTimestamp &&
      now - proofTimestamp > expectedTtl
    )
      throw new ExpiredZkPassProof();

    return verificationResult;
  }

  abstract verifyZkPassProofInternal(
    zkPassProofToken: string
  ): Promise<VerifyZkPassProofResult>;

  abstract getQueryEngineVersionInfo(): Promise<QueryEngineVersionInfo>;
}
