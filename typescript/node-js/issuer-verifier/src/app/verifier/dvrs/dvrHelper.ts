/*
 * dvrHelper.ts
 * DEFAULT DESCRIPTION. EDIT OR DELETE THIS.
 * 
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * Created at: November 2nd 2023
 * -----
 * Last Modified: November 28th 2023
 * Modified By: LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * -----
 * Reviewers:
 *   
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 GDP LABS. All rights reserved.
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

const dvrLookup = new GlobalRef<DVRLookupTable>("zkpass.dvr_table");
if (!dvrLookup.value) {
  dvrLookup.value = new DVRLookupTable();
}

export { dvrLookup };
