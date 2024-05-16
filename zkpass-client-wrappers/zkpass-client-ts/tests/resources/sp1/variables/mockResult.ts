/*
 * mockResult.ts
 * Mock result for functions and commands.
 *
 * Authors:
 *   handrianalandi (handrian.alandi@gdplabs.id)
 * Created at: November 30th 2023
 * -----
 * Last Modified: April 22nd 2024
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
export const queryEngineResult = JSON.stringify({
  Result: {
    query_engine_version: "0.3.0-rc.1",
    query_method_version:
      "a6c99fa8664c07e975f6c6a9f31878300e97468c78fa16bd6485b690bcc07f95",
  },
});

export const errorResult = JSON.stringify({
  Error: "error",
});

export const invalidResult = JSON.stringify({
  test: "this result is invalid",
});

export const verifyTrueResult = JSON.stringify({
  Result: {
    result: true,
  },
});

export const verifyFalseResult = JSON.stringify({
  Result: {
    result: false,
  },
});
