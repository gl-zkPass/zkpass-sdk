use serde_json::Value;
use async_trait::async_trait;
use crate::core::*;

#[async_trait]
///
/// <span style="font-size: 1.1em; color: #996515;"> ***The `ZkPassProofGenerator` trait defines a function for generating ZkPass Proof.*** </span>
/// 
/// `ZkPassProofGenerator` provides an asynchronous abstraction for generating
/// ZkPass Proofs Implement this trait to define custom proof generation logic
/// for the ZkPass service.
///
/// Implementors of this trait should handle communication with a zkPass service
/// and perform necessary computations to generate a proof token, which can be
/// used for secure, private authentication.
/// 
pub trait ZkPassProofGenerator {
    /// # **Description**
    /// <span style="font-size: 1.2em; color: #996515;"> ***Generates a ZkPass proof.*** </span>
    /// 
    /// This function calls the corresponding RESTful API provided by the zkPass Service, 
    /// where the query in the DVR is processed and the proof is generated.
    /// It encrypts both the signed user data token and the signed DVR token prior to sending it to the zkPass Service.
    /// 
    /// This function is asynchronous and must be awaited.
    /// It's designed to be used in asynchronous contexts, for example within
    /// async functions or blocks.
    /// 
    /// # **Parameters**
    /// 
    /// | Argument                                                       | Description                               |
    /// |----------------------------------------------------------------|-------------------------------------------|
    /// | <span style="color: blue;"> **`zkpass_service_url`** </span>   | The url for connecting to the zkPass Service |
    /// | <span style="color: blue;"> **`user_data_token`** </span>      | The signed user data JWS token | 
    /// | <span style="color: blue;"> **`dvr_token`** </span>            | The signed DVR JWS token
    /// 
    /// | Return Value                                                   | Description                                |
    /// |----------------------------------------------------------------|--------------------------------------------|
    /// |<span style="color: green;"> **`Result<String, ZkPassError>`** </span> | On Ok, the signed `ZkPassProof` token is returned as a String <br> On Err, the ZkPassError is returned |
    async fn generate_zkpass_proof(
        &self,
        zkpass_service_url: &str,
        user_data_token:    &str,
        dvr_token:          &str,
    ) -> Result<String, ZkPassError>;
}

///
/// <span style="font-size: 1.1em; color: #996515;"> ***The `ZkPassUtility` trait defines functions for digital signature and encryptions.*** </span>
/// 
/// Speficially it has functions for:
/// - signing/verifying the signature of JWT (JSON Web Signature) tokens 
/// - encrypting/decrypting the JWE (JSON Web Encryption) tokens
pub trait ZkPassUtility {
    /// # Description
    /// <span style="font-size: 1.2em; color: #996515;"> ***Signs data into a JWS token.*** </span>
    /// 
    /// # Parameters
    /// 
    /// | Argument                                                       | Description                               |
    /// |----------------------------------------------------------------|-------------------------------------------|
    /// | <span style="color: blue;"> **`signing_key`** </span>          | The public key used to sign the data      |
    /// | <span style="color: blue;"> **`data`** </span>                 | The JSON value to be signed               | 
    /// | <span style="color: blue;"> **`verifying_key_jwks`** </span>   | The optional JWKS endpoint of the public key to be set in the header of the JWS token |
    /// 
    /// | Return Value                                                   | Description                                |
    /// |----------------------------------------------------------------|--------------------------------------------|
    /// |<span style="color: green;"> **`Result<String, ZkPassError>`** </span> | On Ok, the signed JWS token is returned as a String <br> On Err, the ZkPassError is returned |
    fn sign_data_to_jws_token(&self, signing_key: &str, data: Value, verifying_key_jwks: Option<KeysetEndpoint>) -> Result<String, ZkPassError>; 

    /// # Description
    /// <span style="font-size: 1.2em; color: #996515;"> ***Verifies the signature of a JWS token.*** </span>
    /// 
    /// # Parameters
    /// 
    /// | Argument                                                       | Description                                                  |
    /// |----------------------------------------------------------------|--------------------------------------------------------------|
    /// | <span style="color: blue;"> **`key`** </span>                  | The public key used to verify the signature of the JWS token |
    /// | <span style="color: blue;"> **`jws_token`** </span>            | The JWS token to be verified                                 | 
    /// 
    /// | Return Value                                                   | Description                                |
    /// |----------------------------------------------------------------|--------------------------------------------|
    /// |<span style="color: green;"> **`Result<(Value, String), ZkPassError>`** </span> | On Ok, the verified value is returned as a Value, and the JWT header is also returned as a String<br> On Err, the ZkPassError is returned |
    fn verify_jws_token(&self, key: &str, jws_token: &str) -> Result<(Value, String), ZkPassError>;

    /// # Description
    /// <span style="font-size: 1.2em; color: #996515;"> ***Encrypts data into a JWE token.*** </span>
    /// 
    /// The encryption is based on ECDH-ES with GCM/AES256 encryption. The key pair used for encryption/decryption is an ECDH key pair.
    /// 
    /// # Parameters
    /// 
    /// | Argument                                                       | Description                               |
    /// |----------------------------------------------------------------|-------------------------------------------|
    /// | <span style="color: blue;"> **`key`** </span>                  | The public ECDH key used for the encryption purpose |
    /// | <span style="color: blue;"> **`data`** </span>                 | The JSON value to be encrypted            |
    /// 
    /// | Return Value                                                   | Description                               |
    /// |----------------------------------------------------------------|-------------------------------------------|
    /// |<span style="color: green;"> **`Result<String, ZkPassError>`** </span> | On Ok, the encrypted JWE token is returned as a String <br> On Err, the ZkPassError is returned |
    fn encrypt_data_to_jwe_token(&self, key: &str, data: Value) -> Result<String, ZkPassError>;

    /// # Description
    /// <span style="font-size: 1.2em; color: #996515;"> ***Decrypts a JWT token.*** </span>
    /// 
    /// # Parameters
    /// 
    /// | Argument                                                       | Description                               |
    /// |----------------------------------------------------------------|-------------------------------------------|
    /// | <span style="color: blue;"> **`key`** </span>                  | The private ECDH key used to the decryption purpose|
    /// | <span style="color: blue;"> **`jwe_token`** </span>            | The JWE token to be decrypted             |
    /// 
    /// | Return Value                                                   | Description                               |
    /// |----------------------------------------------------------------|-------------------------------------------|
    /// |<span style="color: green;"> **`Result<(String, String), ZkPassError>`** </span> | On Ok, the decrypted value is returned as a String, and the JWT header is also returned as a String <br> On Err, the ZkPassError is returned |
    fn decrypt_jwe_token(&self, key: &str, jwe_token: &str) -> Result<(String, String), ZkPassError>;

}

/// <span style="font-size: 1.1em; color: #996515;"> ***The `ZkPassProofMetadataValidator` trait defines a function for DVR metadata validation.*** </span>
/// 
pub trait ZkPassProofMetadataValidator {
    /// # **Description**
    /// <span style="font-size: 1.2em; color: #996515;"> ***Validates the metadata of a DVR.*** </span>
    /// 
    /// # **Parameters**
    /// The parameters are passed here by the zkpass-client library as part of the verify_zkpass_proof function call.
    /// All parameters are various metadata values which were used by zkPass when processing the DVR query, and the Proof Verifier needs
    /// to verify the metadata to ensure the integrity of the data processing.
    /// The struct that implements this trait is a callback function which needs to validate the DVR metadata that zkPass uses.
    /// 
    /// | Argument                                                       | Description                               |
    /// |----------------------------------------------------------------|-------------------------------------------|
    /// | <span style="color: blue;"> **`dvr_title`** </span>            | The title of the DVR|
    /// | <span style="color: blue;"> **`dvr_id`** </span>               | The unique id of the DVR |
    /// | <span style="color: blue;"> **`dvr_digest`** </span>            | The hash digest of the DVR |
    /// | <span style="color: blue;"> **`user_data_verifying_key`** </span>| The public key used by zkPass Service to verify the user data |
    /// | <span style="color: blue;"> **`zkpass_proof_ttl`** </span>       | The timestamp of the proof |
    /// 
    /// | Return Value                                                   | Description                               |
    /// |----------------------------------------------------------------|-------------------------------------------|
    /// |<span style="color: green;"> **`Result<(), ZkPassError>`** </span> | On Ok, nothing is returned  <br> On Err, the ZkPassError is returned |
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

/// <span style="font-size: 1.1em; color: #996515;"> ***The `ZkPassProofVerifier` trait consists of functions proof verification.*** </span>
/// 
pub trait ZkPassProofVerifier {
    /// # **Description**
    /// <span style="font-size: 1.2em; color: #996515;"> ***Verifies a ZkPass Proof.*** </span>
    /// 
    /// # **Parameters**
    /// 
    /// | Argument                                                       | Description                               |
    /// |----------------------------------------------------------------|-------------------------------------------|
    /// | <span style="color: blue;"> **`zkpass_proof_token`** </span>   | The signed ZkPass Proof JWS token to be verified|
    /// | <span style="color: blue;"> **`validator`** </span>            | The validator callback that implements `ZkPassProofMetadataValidator`` trait |
    /// 
    /// | Return Value                                                   | Description                               |
    /// |----------------------------------------------------------------|-------------------------------------------|
    /// |<span style="color: green;"> **`Result<(bool, ZkPassProof), ZkPassError>`** </span> | On Ok, the query result returned as a bool, and the ZkPassProof value is also returned<br> On Err, the ZkPassError is returned |
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

    /// # **Description**
    /// <span style="font-size: 1.2em; color: #996515;"> ***Verifies a ZkPass Proof internally.*** </span>
    /// 
    /// # **Parameters**
    /// 
    /// | Argument                                                       | Description                               |
    /// |----------------------------------------------------------------|-------------------------------------------|
    /// | <span style="color: blue;"> **`zkpass_proof_token`** </span>   | The signed ZkPass Proof JWS token to be verified|
    /// | <span style="color: blue;"> **`validator`** </span>            | The callback that implements `ZkPassProofMetadataValidator`` trait |
    /// 
    /// | Return Value                                                   | Description                               |
    /// |----------------------------------------------------------------|-------------------------------------------|
    /// |<span style="color: green;"> **`Result<(bool, ZkPassProof), ZkPassError>`** </span> | On Ok, the query result returned as a bool, and the ZkPassProof value is also returned<br> On Err, the ZkPassError is returned |
    fn verify_zkpass_proof_internal(
        &self,
        zkpass_proof_token:                 &str
    ) -> Result<(bool, ZkPassProof), ZkPassError>; 

    /// # **Description**
    /// <span style="font-size: 1.2em; color: #996515;"> ***Returns the version information about the query engine.*** </span>
    /// 
    /// # **Parameters**
    /// 
    /// | Return Value                                                   | Description                               |
    /// |----------------------------------------------------------------|-------------------------------------------|
    /// |<span style="color: green;"> **`(String, String)`** </span> | The query engine version and the query method version are returned as Strings |
    fn get_query_engine_version_info(&self) -> (String, String);
}

pub struct ZkPassClient;
