/*
 * dataVerificationRequest.ts
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
  KeysetEndpoint,
  KeysetEndpointWrapped,
  PublicKeyOption,
  PublicKeyWrapped,
  ZkPassQuery,
} from "../types";
import crypto from "crypto";
import { ZkPassClient } from "./zkPassClient";

export class DataVerificationRequest {
  constructor(
    public zkVm: String,
    public dvrTitle: string,
    public dvrId: string,
    public queryEngineVer: string,
    public queryMethodVer: string,
    public query: ZkPassQuery,
    public userDataVerifyingKey: PublicKeyOption,
    public userDataUrl?: string,
    public dvrVerifyingKey?: PublicKeyOption
  ) {}

  static fromJSON({
    zkvm,
    dvr_title,
    dvr_id,
    query_engine_ver,
    query_method_ver,
    query,
    user_data_url,
    user_data_verifying_key,
    dvr_verifying_key,
  }: any): DataVerificationRequest {
    return new DataVerificationRequest(
      zkvm,
      dvr_title,
      dvr_id,
      query_engine_ver,
      query_method_ver,
      (query = JSON.parse(query)),
      user_data_verifying_key,
      user_data_url,
      dvr_verifying_key
    );
  }

  static deserialize(json: string): DataVerificationRequest {
    return DataVerificationRequest.fromJSON(JSON.parse(json));
  }

  serialize(): string {
    return JSON.stringify(this.serializeJson());
  }

  serializeJson(): Object {
    const stringifyQuery =
      typeof this.query === "string" ? this.query : JSON.stringify(this.query);

    const userDataVerifyingKey = (this.userDataVerifyingKey as PublicKeyWrapped)
      .PublicKey
      ? {
          PublicKey: {
            x: (this.userDataVerifyingKey as PublicKeyWrapped).PublicKey.x,
            y: (this.userDataVerifyingKey as PublicKeyWrapped).PublicKey.y,
          },
        }
      : {
          KeysetEndpoint: {
            jku: (this.userDataVerifyingKey as KeysetEndpointWrapped)
              .KeysetEndpoint.jku,
            kid: (this.userDataVerifyingKey as KeysetEndpointWrapped)
              .KeysetEndpoint.kid,
          },
        };

    const dvrVerifyingKey = !this.dvrVerifyingKey
      ? undefined
      : (this.dvrVerifyingKey as PublicKeyWrapped).PublicKey
      ? {
          PublicKey: {
            x: (this.dvrVerifyingKey as PublicKeyWrapped).PublicKey.x,
            y: (this.dvrVerifyingKey as PublicKeyWrapped).PublicKey.y,
          },
        }
      : {
          KeysetEndpoint: {
            jku: (this.dvrVerifyingKey as KeysetEndpointWrapped).KeysetEndpoint
              .jku,
            kid: (this.dvrVerifyingKey as KeysetEndpointWrapped).KeysetEndpoint
              .kid,
          },
        };

    const serialized = {
      zkvm: this.zkVm,
      dvr_title: this.dvrTitle,
      dvr_id: this.dvrId,
      query_engine_ver: this.queryEngineVer,
      query_method_ver: this.queryMethodVer,
      query: stringifyQuery,
      user_data_url: this.userDataUrl,
      user_data_verifying_key: userDataVerifyingKey,
      dvr_verifying_key: dvrVerifyingKey,
    };

    return serialized;
  }

  getSha256Digest(): string {
    return crypto.createHash("sha256").update(this.serialize()).digest("hex");
  }

  async signToJwsToken(pem: string, verifyingKeyJwks?: KeysetEndpoint) {
    const zkPassClient = new ZkPassClient({
      zkPassServiceUrl: "",
      zkVm: "",
    });
    return await zkPassClient.signDataToJwsToken(
      pem,
      this.serializeJson(),
      verifyingKeyJwks
    );
  }
}
