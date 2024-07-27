/*
 * Verifier.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: December 19th 2023
 * -----
 * Last Modified: July 27th 2024
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   Nugraha Tejapermana (nugraha.tejapermana@gdplabs.id)
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
import {
  ZkPassClient,
  DataVerificationRequest,
  KeysetEndpoint,
  PublicKeyOption,
} from "@didpass/zkpass-client-ts";
import { ZKPASS_SERVICE_URL, ZKPASS_ZKVM } from "../utils/constants";

export type DvrData = {
  dvr_title: string;
  dvr_id: string;
  query: string;
  user_data_requests: {
    [key: string]: {
      user_data_url: string;
      user_data_verifying_key: PublicKeyOption;
    };
  };
  dvr_verifying_key: PublicKeyOption;
  zkvm: string;
};

export abstract class Verifier {
  zkPassClient: ZkPassClient;
  dvr: DataVerificationRequest | null;
  constructor() {
    this.zkPassClient = new ZkPassClient({
      zkPassServiceUrl: ZKPASS_SERVICE_URL,
      zkVm: ZKPASS_ZKVM,
    });
    this.dvr = null;
  }

  protected async createDvr(
    signingKey: string,
    dvrData: DvrData,
    verifyingKeyJws: KeysetEndpoint
  ): Promise<string> {
    // Step 1: Instantiate the ZkPassClient object.
    // In this example, we have instantiated the zkPassClient object in the constructor.

    // Step 2: Call zkPassClient.getQueryEngineVersionInfo.
    // The version info is needed for DVR object creation.
    const { queryEngineVersion, queryMethodVersion } =
      await this.zkPassClient.getQueryEngineVersionInfo();

    // Step 3: Create the DVR object.
    this.dvr = DataVerificationRequest.fromJSON({
      ...dvrData,
      query_engine_ver: queryEngineVersion,
      query_method_ver: queryMethodVersion,
    });

    // Step 4: Call zkPassClient.signToJwsToken.
    // to digitally-sign the dvr data.
    const dvrToken = await this.dvr.signToJwsToken(signingKey, verifyingKeyJws);
    return dvrToken;
  }

  protected getDvr(): DataVerificationRequest | null {
    return this.dvr;
  }

  abstract getDvrToken(dvrFile: string): Promise<string>;
}
