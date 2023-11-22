/**
 * Interface for a credential provider.
 * @interface
 */
export interface ICredentialProvider {
  /**
   * Get a list of credentials for a given DID.
   * @param {string} did - The DID to get credentials for.
   * @returns {Promise<string[]>} - A promise that resolves to an array of credential IDs.
   */
  getCredentialList(did: string): Promise<string[]>;

  /**
   * Get a specific credential for a given DID and VC ID.
   * @param {string} did - The DID to get the credential for.
   * @param {string} vcId - The ID of the credential to get.
   * @returns {Promise<any>} - A promise that resolves to the requested credential.
   */
  getCredential(did: string, vcId: string): Promise<any>;

  /**
   * Get an updated version of a specific credential for a given DID and VC ID.
   * @param {string} did - The DID to get the credential for.
   * @param {string} vcId - The ID of the credential to get.
   * @returns {Promise<any>} - A promise that resolves to the updated credential.
   */
  getUpdatedCredential(did: string, vcId: string): Promise<any>;

  /**
   * Get the status of a specific credential for a given DID and VC ID.
   * @param {string} did - The DID to get the credential status for.
   * @param {string} vcId - The ID of the credential to get the status for.
   * @returns {Promise<any>} - A promise that resolves to the status of the requested credential.
   */
  getCredentialStatus(did: string, vcId: string): Promise<any>;
}
