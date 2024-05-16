/*
 * zkPassFfiR0.ts
 *
 * Authors:
 *   GDPWinnerPranata (winner.pranata@gdplabs.id)
 * Created at: February 27th 2024
 * -----
 * Last Modified: April 16th 2024
 * Modified By: NaufalFakhri (naufal.f.muhammad@gdplabs.id)
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

import { buildGenericResponseStructType } from "../helpers/genericResponse";
import ffi from "ffi-napi";
import ref from "ref-napi";
import { ZkPassFfi } from "../interfaces/zkPassFfi";
import { resolveModulePath } from "../helpers/module";
import { ZkPassOutput } from "../types/zkPassOutput";

export class ZkPassFfiR0 extends ZkPassFfi {
  private zkPassQueryFfiR0 = ffi.Library(
    resolveModulePath("libr0_zkpass_query.so"),
    {
      r0_get_query_method_version_wrapper: [
        buildGenericResponseStructType(ref.types.CString),
        [],
      ],
      r0_get_query_engine_version_wrapper: [
        buildGenericResponseStructType(ref.types.CString),
        [],
      ],
      r0_verify_zkproof_wrapper: [
        buildGenericResponseStructType(ref.types.CString),
        ["string"],
      ],
    }
  );

  verifyZkProof(receipt: string): ZkPassOutput {
    const output: string = this.catchError(
      this.zkPassQueryFfiR0.r0_verify_zkproof_wrapper(receipt)
    );
    return JSON.parse(JSON.parse(output));
  }

  getQueryEngineVersion(): string {
    return this.catchError(
      this.zkPassQueryFfiR0.r0_get_query_engine_version_wrapper()
    )!;
  }

  getQueryMethodVersion(): string {
    return this.catchError(
      this.zkPassQueryFfiR0.r0_get_query_method_version_wrapper()!
    );
  }
}
