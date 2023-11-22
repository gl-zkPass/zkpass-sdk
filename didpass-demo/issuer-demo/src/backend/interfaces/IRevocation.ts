/**
 * Interface for revoking a credential.
 */
export interface IRevocation {
  /**
   * Revokes a credential for a given DID and credential ID.
   * @param did The DID of the credential owner.
   * @param credentialId The ID of the credential to revoke.
   * @returns A Promise that resolves when the credential is successfully revoked.
   */
  revokeCredential(did: string, credentialId: string): Promise<any>;
}
