import { DataVerificationRequest } from "@didpass/zkpass-client-ts/types/dvr";

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
    this.table[dvr.dvr_id] = dvr;
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
