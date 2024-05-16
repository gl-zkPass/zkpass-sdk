/*
 * index.ts
 *
 * Authors:
 *   Winner Pranata (winner.pranata@gdplabs.id)
 * Created at: February 20th 2024
 * -----
 * Modified at: February 27th 2024
 * Modified By: Winner Pranata (winner.pranata@gdplabs.id)
 * -----
 * Reviewers:
 *   khandar-william
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { generate, postAction } from "./generator";

async function main() {
  console.log("[!] Generating Encryption JWT...");
  const encryptionKey = await generate();

  console.log("[!] Generating Signing JWT...");
  const signingKey = await generate({
    encryptionSecret: encryptionKey.encryptionSecret,
    signingPrivateKey: encryptionKey.signingPrivateKey,
  });

  await postAction({
    signingKey,
    encryptionKey,
  });

  printKey(encryptionKey, "ENCRYPTION");
  printKey(signingKey, "SIGNING");
}

function printKey(key: any, name: string) {
  console.log("\n\n\n");
  console.log(
    "================================================================"
  );
  console.log(`${name.toUpperCase()} KEYS`);
  console.log(
    "================================================================"
  );
  console.log("");

  console.log("JWT:");
  console.log(key.jwt);
  console.log("");

  console.log("ENCRYPTION SECRET:");
  console.log(key.encryptionSecret);
  console.log("");

  console.log("SIGNING PRIVATE KEY:");
  console.log(key.signingPrivateKey);
  console.log("");

  console.log("SIGNING PUBLIC KEY:");
  console.log(key.signingPublicKey);
}

main().catch(console.error);
