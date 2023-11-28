/*
 * dvrTable.ts
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: November 27th 2023
 * -----
 * Last Modified: November 28th 2023
 * Modified By: NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * -----
 * Reviewers:
 *   NONE
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
import { DataVerificationRequest } from "@didpass/zkpass-client-ts";

/**
 * Simulating DVR storage.
 * Use any storage based on your requirements.
 */
class GlobalRef<T> {
  private readonly sym: symbol;

  constructor(uniqueName: string) {
    this.sym = Symbol.for(uniqueName);
  }

  get value() {
    return (global as any)[this.sym] as T;
  }

  set value(value: T) {
    (global as any)[this.sym] = value;
  }
}

interface DVRTable {
  [key: string]: DataVerificationRequest;
}

class DVRLookupTable {
  private table: DVRTable = {};

  public addDVR(dvr: DataVerificationRequest): void {
    this.table[dvr.dvrId] = dvr;
  }

  public getDVR(key: string): DataVerificationRequest | undefined {
    const item = this.table[key];

    if (item) {
      delete this.table[key];
      return item;
    } else {
      return undefined;
    }
  }
}

const dvrTable = new GlobalRef<DVRLookupTable>("zkpass.dvr_table");
if (!dvrTable.value) {
  dvrTable.value = new DVRLookupTable();
}

export { dvrTable };
