/*
 * zkPassFfi.ts
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

import { GenericResponse } from "../helpers/genericResponse";
import { ZkPassOutput } from "../types/zkPassOutput";

export abstract class ZkPassFfi {
  abstract verifyZkProof(receipt: string): ZkPassOutput;

  abstract getQueryEngineVersion(): string;

  abstract getQueryMethodVersion(): string;

  catchError<T>({ data, error }: GenericResponse<T>): T {
    if (error) throw new Error(error);
    return data;
  }
}
