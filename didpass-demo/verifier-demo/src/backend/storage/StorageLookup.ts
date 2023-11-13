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

interface storageLookupTable {
  [key: string]: any;
}

class StorageLookupTable {
  public table: storageLookupTable = {};

  public set(key: string, value: any): void {
    this.table[key] = value;
  }

  public get(key: string): any {
    const item = this.table[key];

    if (item) {
      return item;
    } else {
      return undefined;
    }
  }

  public delete(key: string): void {
    delete this.table[key];
  }
}

const storageLookup = new GlobalRef<StorageLookupTable>("lookup_table");
if (!storageLookup.value) {
  storageLookup.value = new StorageLookupTable();
}

export { storageLookup };