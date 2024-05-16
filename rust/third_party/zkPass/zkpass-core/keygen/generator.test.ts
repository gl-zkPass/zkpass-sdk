/*
 * generator.test.ts
 * This file is NOT A UNIT TEST. This file serves to verify the JWT outputs.
 *
 * Authors:
 *   Winner Pranata (winner.pranata@gdplabs.id)
 * Created at: February 20th 2024
 * -----
 * Modified at: February 23rd 2024
 * Modified By: Winner Pranata (winner.pranata@gdplabs.id)
 * -----
 * Reviewers:
 *   khandar-william
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { generate, verify } from "./generator";
import * as env from "./common/env";
import { OPERATION_BUNDLE } from "./bundle";

const keyService = env.get("KEY_SERVICE");

generate().then(async (data) => {
  const result = await verify<{ privateKey: string }>(
    data.jwt,
    data.signingPublicKey
  );

  console.log("========================================================");
  console.log("|  Verification Result");
  console.log("========================================================");
  console.log(JSON.stringify({ result }, null, 2));
  console.log("\n\n");
  console.log("========================================================");
  console.log("|  Decrypted Private Key");
  console.log("========================================================");
  console.log(
    await OPERATION_BUNDLE[keyService].decrypt(
      result.payload.privateKey,
      data.encryptionSecret
    )
  );
  console.log("\n\n");
});
