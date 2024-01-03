/*
 * proofValidator.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * Created at: November 2nd 2023
 * -----
 * Last Modified: December 15th 2023
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

import {
  MetadataValidatorResult,
  PublicKeyWrapped,
  ZkPassProofMetadataValidator,
} from "@didpass/zkpass-client-ts/";
import { dvrLookup } from "../dvrs/dvrHelper";
import { KeysetEndpointWrapped, PublicKey } from "@didpass/zkpass-client-ts";

export class MyValidator implements ZkPassProofMetadataValidator {
  EXPECTED_DVR_TTL: number = 600;

  /**
   * Validate provided proof.
   *
   * @param   {string}      dvrTitle              DVR title in the proof
   * @param   {string}      dvrId                 DVR ID in the proof
   * @param   {string}      dvrDigest             SHA256 digest of the DVR in the proof
   * @param   {string}      userDataVerifyingKey  Public key used for signing user data in the proof (issuer public key)
   * @param   {string}      dvrVerifyingKey       Public key used for signing dvr in the proof (verifier public key)
   * @param   {string}      zkpassProofTtl        TTL of the proof in seconds
   */
  async validate(dvrId: string): Promise<MetadataValidatorResult> {
    /**
     * This validate method will be called first inside verifyZkpassProof
     * you can modify the logic here to suit your needs
     */
    const dvr = dvrLookup.value.getDVR(dvrId);
    console.log("=== MyValidator.validate ===");
    console.log({ dvr });
    if (!dvr) {
      throw new Error("DVR not found");
    }

    let expectedVerifyingDvrKey: PublicKey = (
      dvr.dvrVerifyingKey as PublicKeyWrapped
    ).PublicKey;
    if (!expectedVerifyingDvrKey) {
      const { jku, kid } = (dvr.dvrVerifyingKey as KeysetEndpointWrapped)
        .KeysetEndpoint;

      const verifyingKey: PublicKey | undefined = await fetch(jku)
        .then((res) => res.json())
        .then((json: { keys: (PublicKey & { kid: string })[] }) =>
          json.keys.find((k) => k.kid === kid)
        )
        .catch(() => undefined);

      if (!verifyingKey) {
        throw new Error("DVR verifying key not found");
      }

      expectedVerifyingDvrKey = verifyingKey;
    }
    const result: MetadataValidatorResult = {
      expectedDvr: dvr,
      expectedTtl: this.EXPECTED_DVR_TTL,
      expectedVerifyingDvrKey,
    };
    return result;
  }
}
