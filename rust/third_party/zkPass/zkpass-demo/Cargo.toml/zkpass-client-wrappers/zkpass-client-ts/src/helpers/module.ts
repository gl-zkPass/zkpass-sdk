/*
 * module.ts
 *
 * Authors:
 *   GDPWinnerPranata (winner.pranata@gdplabs.id)
 * Created at: February 27th 2024
 * -----
 * Last Modified: February 29th 2024
 * Modified By: GDPWinnerPranata (winner.pranata@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * ---
 * References:
 *   ffi-Napi. npm. (n.d.). https://www.npmjs.com/package/ffi-napi?activeTab=readme
 *   ref-Napi. npm. (n.d.). https://www.npmjs.com/package/ref-napi
 *   ref-struct-Napi. npm. (n.d.). https://www.npmjs.com/package/ref-struct-napi
 *   nodebeat.js. github. (n.d.). https://github.com/QXIP/nDPIex/blob/dc48aff6cba5187cb2e4d92b276d15fc5b3b38af/nodebeat/nodebeat.js#L108
 *   libc. crates. (n.d.). https://crates.io/crates/libc
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { dirname } from "path";

export function resolveModulePath(binaryFile: string) {
  if (process.env.FFI_BINARY_PATH)
    return `${process.env.FFI_BINARY_PATH}/${binaryFile}`;
  let path: string;
  try {
    path = `${dirname(
      require.resolve("@didpass/zkpass-client-ts")
    )}/../${binaryFile}`;
  } catch (_) {
    path = `${__dirname}/../../lib/${binaryFile}`;
  }
  if (path.startsWith("(rsc)/")) path = path.split("(rsc)/")[1]; // Fixing nextjs dev mode issue
  return path;
}
