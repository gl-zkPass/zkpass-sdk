export interface Claim {
  id: number;
  user_did: string;
  credential_id: string;
  credential_type: string;
  user_data: string;
  source: string;
  is_revoked: boolean;
}
