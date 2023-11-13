export interface ISessionStorage {
  set(key: string, value: any): Promise<void>;
  setWithTimeout(key: string, value: any, expiredAt: number): Promise<void>;
  get(key: string): Promise<any>;
  delete(key: string): Promise<any>;
}
