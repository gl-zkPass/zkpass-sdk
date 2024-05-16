/*
 * mockDvrValidator.ts
 * Mock ZkPassProofMetadataValidator class to be used when verifyProof.
 *
 * Authors:
 *   handrianalandi (handrian.alandi@gdplabs.id)
 * Created at: November 29th 2023
 * -----
 * Last Modified: April 23rd 2024
 * Modified By: NaufalFakhri (naufal.f.muhammad@gdplabs.id)
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
  ZkPassProofMetadataValidator,
} from "../../../src";
import { queryEngineResult } from "./variables/mockResult";

export default class MockDvrValidator implements ZkPassProofMetadataValidator {
  async validate(dvrId: string): Promise<MetadataValidatorResult> {
    const {
      query_engine_version: queryEngineVersion,
      query_method_version: queryMethodVersion,
    } = JSON.parse(queryEngineResult).Result;
    const expectedDvr = DataVerificationRequest.fromJSON({
      zkvm: "sp1",
      dvr_title: "My DVR",
      dvr_id: "12345678",
      query_engine_ver: queryEngineVersion,
      query_method_ver: queryMethodVersion,
      query:
        '[{"assign":{"query_result":{"and":[{"==":[{"dvar":"country"},"Indonesia"]},{"==":[{"dvar":"city"},"Jakarta"]},{"or":[{"~==":[{"dvar":"skills[0]"},"Rust"]},{"~==":[{"dvar":"skills[1]"},"Rust"]},{"~==":[{"dvar":"skills[2]"},"Rust"]}]}]}}},{"output":{"title":"Job Qualification"}},{"output":{"name":{"dvar":"name"}}},{"output":{"is_qualified":{"lvar":"query_result"}}},{"output":{"result":{"lvar":"query_result"}}}]',
      user_data_url: "https://hostname/api/user_data/",
      user_data_verifying_key: {
        PublicKey: {
          x: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7f0QoVUsccB9yMwHAR7oVk/L+ZkX",
          y: "8ZqC1Z0XTaj3BMcMnqh+VzdHZX3yGKa3+uhNAhKWWyfB/r+3E8rPSHtXXQ==",
        },
      },
      dvr_verifying_key: {
        PublicKey: {
          x: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU",
          y: "IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==",
        },
      },
    });
    function dummyGetDvrById(id: string): DataVerificationRequest {
      return expectedDvr;
    }

    const expectedTtl = 6000000000;
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
