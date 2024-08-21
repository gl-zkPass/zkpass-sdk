/*
 * dvrTable.ts
 *
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

interface DvrTable {
  [key: string]: DataVerificationRequest;
}

class DvrLookupTable {
  private table: DvrTable = {};

  public addDvr(dvr: DataVerificationRequest): void {
    this.table[dvr.dvrId] = dvr;
  }

  public getDvr(key: string): DataVerificationRequest | undefined {
    const item = this.table[key];

    if (item) {
      delete this.table[key];
      return item;
    } else {
      return undefined;
    }
  }
}
const DVR_TABLE_NAME = "zkpass.dvr_table";
const dvrTable = new GlobalRef<DvrLookupTable>(DVR_TABLE_NAME);
if (!dvrTable.value) {
  dvrTable.value = new DvrLookupTable();
}

export { dvrTable };
