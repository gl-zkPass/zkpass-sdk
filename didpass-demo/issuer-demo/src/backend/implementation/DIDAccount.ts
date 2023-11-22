import { SignerAccount } from "./SignerAccount";
import didkit from "@spruceid/didkit-wasm-node";

/**
 * An enumeration of supported DID methods.
 */
export enum DIDMethod {
  ethr = "ethr",
  "pkh:eip155:1" = "pkh:eip155:1",
}

/**
 * Represents a DID Account that extends SignerAccount.
 * @extends SignerAccount
 */
export class DIDAccount extends SignerAccount {
  /** The DID of the account. */
  readonly did: string;

  /**
   * Creates a new instance of DIDAccount.
   * @param privateKey - The private key of the account.
   * @param didMethod - The DID method to use. Default is "pkh:eip155:1".
   */
  constructor(
    readonly privateKey: string,
    readonly didMethod: DIDMethod = DIDMethod["pkh:eip155:1"]
  ) {
    super(privateKey);
    this.did = didkit.keyToDID(this.didMethod, JSON.stringify(this.rawJwk));
  }

  /**
   * Gets the verification method of the account.
   * @returns The verification method of the account.
   */
  async getVerificationMethod() {
    return await didkit.keyToVerificationMethod(
      this.didMethod,
      JSON.stringify(this.rawJwk)
    );
  }
}
