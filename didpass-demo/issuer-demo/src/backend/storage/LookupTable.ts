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

interface Table {
  [key: string]: any;
}

class LookupTable {
  private table: Table = {};

  public addValue(key: string, value: any): void {
    this.table[key] = value;
  }

  public getValue(key: string): any {
    const item = this.table[key];
    if (item) {
      return item;
    } else {
      return undefined;
    }
  }

  public deleteValue(key: string): void {
    delete this.table[key];
  }

  public clearTable(): void {
    this.table = {};
  }
}

const lookupTable = new GlobalRef<LookupTable>("didpass.issuer_demo");
if (!lookupTable.value) {
  lookupTable.value = new LookupTable();
}

export { lookupTable };
