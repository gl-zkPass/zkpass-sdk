export interface ICredentialDatabase {
  id: number;
  user_did: string;
  credential_id: string;
  credential_type: string;
  user_data: string;
  signed_vc: string;
  jws_credential: string;
  is_revoked: boolean;
}
