/*
 * dvrHelper.ts
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

import { DataVerificationRequest } from "@didpass/zkpass-client-ts";

/**
 * You can use database or any other storage to store DVRs.
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

const dvrLookup = new GlobalRef<DvrLookupTable>("zkpass.dvr_table");
if (!dvrLookup.value) {
  dvrLookup.value = new DvrLookupTable();
}

export { dvrLookup };
