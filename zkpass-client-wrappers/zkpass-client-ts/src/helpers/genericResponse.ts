/*
 * genericResponse.ts
 *
 * Authors:
 *   GDPWinnerPranata (winner.pranata@gdplabs.id)
 * Created at: February 27th 2024
 * -----
 * Last Modified: February 27th 2024
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

import StructType from "ref-struct-napi";
import ref from "ref-napi";

export type GenericResponse<T> = {
  data: T;
  error: string;
};

export function buildGenericResponseStructType(dataType: any) {
  return StructType({
    data: dataType,
    error: ref.types.CString,
  });
}
