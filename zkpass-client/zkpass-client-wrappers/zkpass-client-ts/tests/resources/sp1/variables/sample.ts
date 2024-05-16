/*
 * sample.ts
 *
 * Authors:
 *   GDPWinnerPranata (winner.pranata@gdplabs.id)
 * Created at: November 14th 2023
 * -----
 * Last Modified: March 13th 2024
 * Modified By: Zulchaidir (zulchaidir@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { queryEngineResult } from "./mockResult";

export const dvr = {
  dvr_title: "My DVR",
  dvr_id: "12345678",
  query_engine_ver: JSON.parse(queryEngineResult).Result.query_engine_version,
  query_method_ver: JSON.parse(queryEngineResult).Result.query_method_version,
  query:
    '{"and":[{"==":["bcaDocID","DOC897923CP"]},{"~==":["personalInfo.firstName","Dewi"]},{"~==":["personalInfo.lastName","Putri"]},{"~==":["personalInfo.driverLicenseNumber","DL123456789"]},{">=":["financialInfo.creditRatings.pefindo",650]},{">=":["financialInfo.accounts.savings.balance",30000000]}]}',
  user_data_url: "https://xyz.com",
  user_data_verifying_key: {
    KeysetEndpoint: {
      jku: "https://raw.githubusercontent.com/gl-zkPass/zkpass-sdk/main/docs/zkpass/sample-jwks/issuer-key.json",
      kid: "k-1",
    },
  },
  dvr_verifying_key: {
    KeysetEndpoint: {
      jku: "https://raw.githubusercontent.com/gl-zkPass/zkpass-sdk/main/docs/zkpass/sample-jwks/verifier-key.json",
      kid: "k-1",
    },
  },
};
