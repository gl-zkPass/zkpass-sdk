use serde_json::Value;
use async_trait::async_trait;
use zkpass_core::interface::*;

#[async_trait]
pub trait ZkPassProofGenerator {
    async fn generate_zkpass_proof(
        &self,
        zkpass_service_url: &str,
        user_data_token:    &str,
        dvr_token:          &str,
    ) -> Result<String, ZkPassError>;
}

//#[async_trait]
pub trait ZkPassUtility {
    fn sign_data_to_jws_token(&self, signing_key: &str, data: Value, verifying_key_jwks: Option<KeysetEndpoint>) -> Result<String, ZkPassError>; 
    fn verify_jws_token(&self, key: &str, jws_token: &str) -> Result<(Value, String), ZkPassError>;

    fn encrypt_data_to_jwe_token(&self, key: &str, data: Value) -> Result<String, ZkPassError>;
    fn decrypt_jwe_token(&self, key: &str, jwe_token: &str) -> Result<(String, String), ZkPassError>;
}
pub trait ZkPassProofMetadataValidator {
    fn validate(
        &self,
        dvr_title:                 &str,
        dvr_id:                    &str,
        dvr_digest:                &str,
        user_data_verifying_key:   &PublicKey,
        dvr_verifying_key:         &PublicKey,
        zkpass_proof_ttl:          u64
    ) -> Result<(), ZkPassError>;
}
pub trait ZkPassProofVerifier {
    fn verify_zkpass_proof(
        &self,
        zkpass_proof_token:             &str,
        validator:                      &Box<dyn ZkPassProofMetadataValidator>,
    ) -> Result<(bool, ZkPassProof), ZkPassError> {
        //
        //  zkp verification
        //
        let (result, zkpass_proof) = self.verify_zkpass_proof_internal(zkpass_proof_token)?;

        // 
        //  zkpass proof metadata validations
        //  done using validator callback 
        //
        validator.validate(
            zkpass_proof.dvr_title.as_str(),
            zkpass_proof.dvr_id.as_str(),
            zkpass_proof.dvr_digest.as_str(),
            &zkpass_proof.user_data_verifying_key,
            &zkpass_proof.dvr_verifying_key,
            zkpass_proof.time_stamp
            )?;

        Ok((result, zkpass_proof))
    }

    fn verify_zkpass_proof_internal(
        &self,
        zkpass_proof_token:                 &str
    ) -> Result<(bool, ZkPassProof), ZkPassError>; 

    fn get_query_engine_version_info(&self) -> (String, String);
}

pub struct ZkPassClient;
