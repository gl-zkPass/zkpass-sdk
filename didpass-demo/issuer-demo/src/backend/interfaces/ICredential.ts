import { ICredentialProvider } from "./ICredentialProvider";

/**
 * Interface for a credential.
 * @interface
 */
export interface ICredential {
  /**
   * Processes a credential request.
   * @param {string} WalletDID - The wallet DID.
   * @param {string} signedChallenge - The signed challenge.
   * @param {string} vcId - The VC ID.
   * @param {ICredentialProvider} vcProvider - The VC provider.
   * @returns {Promise<any>} - A promise that resolves with the result of the credential request.
   */
  processCredentialRequest(
    WalletDID: string,
    signedChallenge: string,
    vcId: string,
    vcProvider: ICredentialProvider
  ): Promise<any>;

  /**
   * Processes an update credential request.
   * @param {string} walletDID - The wallet DID.
   * @param {string} signedRequest - The signed request.
   * @param {string} vcId - The VC ID.
   * @param {ICredentialProvider} vcProvider - The VC provider.
   * @returns {Promise<any>} - A promise that resolves with the result of the update credential request.
   */
  processUpdateCredentialRequest(
    walletDID: string,
    signedRequest: string,
    vcId: string,
    vcProvider: ICredentialProvider
  ): Promise<any>;

  /**
   * Processes a status check request.
   * @param {string} did - The DID.
   * @param {string} vcId - The VC ID.
   * @param {ICredentialProvider} vcProvider - The VC provider.
   * @returns {Promise<string>} - A promise that resolves with the result of the status check request.
   */
  processStatusCheckRequest(
    did: string,
    vcId: string,
    vcProvider: ICredentialProvider
  ): Promise<string>;
}
