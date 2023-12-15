use std::time::{Instant, Duration};
use serde_json::{json, Value};
use async_trait::async_trait;
use crate::core::*;
use zkpass_core::interface::get_current_timestamp;

#[async_trait]
///
/// <span style="font-size: 1.1em; color: #996515;"> ***Defines a function for generating zkPass Proof.*** </span>
/// 
/// `ZkPassProofGenerator` provides an asynchronous abstraction for generating
/// zkPass Proofs Implement this trait to define custom proof generation logic
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
/// <span style="font-size: 1.1em; color: #996515;"> ***Defines functions for digital signature and encryption.*** </span>
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

//
/// <span style="font-size: 1.1em; color: #996515;"> ***Defines a callback function for post-ZKP metadata validation on the DVR.*** </span>
/// 
pub trait ZkPassProofMetadataValidator {
    /// # **Description**
    /// <span style="font-size: 1.2em; color: #996515;"> ***Validates the metadata of a DVR.*** </span>
    /// 
    /// # **Parameters**
    /// 
    /// | Argument                                                       | Description                               |
    /// |----------------------------------------------------------------|-------------------------------------------|
    /// | <span style="color: blue;"> **`dvr_id`** </span>               | The unique id of the DVR that needs to be validated. The validator needs to find the DVR and return it. |
    /// 
    /// | Return Value                                                   | Description                               |
    /// |----------------------------------------------------------------|-------------------------------------------|
    /// |<span style="color: green;"> **`Result<(DataVerificationRequest, PublicKey, u64), ZkPassError>`** </span> | On Ok, the (expected DVR, expected verifying DVR key, expected ttl) are returned  <br> On Err, the ZkPassError is returned |
    fn validate(
        &self,
        dvr_id:                    &str
    ) -> Result<(DataVerificationRequest, PublicKey, u64), ZkPassError>;
}

/// <span style="font-size: 1.1em; color: #996515;"> ***Defines functions for proof verification.*** </span>
/// 
pub trait ZkPassProofVerifier {
    /// # **Description**
    /// <span style="font-size: 1.2em; color: #996515;"> ***Verifies a zkPass Proof.*** </span>
    /// 
    /// # **Parameters**
    /// 
    /// | Argument                                                       | Description                               |
    /// |----------------------------------------------------------------|-------------------------------------------|
    /// | <span style="color: blue;"> **`zkpass_proof_token`** </span>   | The signed zkPass Proof JWS token to be verified|
    /// | <span style="color: blue;"> **`validator`** </span>            | The validator callback that implements `ZkPassProofMetadataValidator` trait. The validator is used to validate the DVR metadata used by the zkPass Service.|
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
        //  post-zkp metadata validations
        //  call the metadata validator callback, passing the dvr_id
        //    the callback returns the expected: (dvr, dvr_verifying_key, ttl)
        //
        let (expected_dvr, expected_dvr_verifying_key, expected_ttl) = validator.validate(zkpass_proof.dvr_id.as_str())?;

        //
        //  checking for valid dvr
        //
        if zkpass_proof.dvr_digest != expected_dvr.get_sha256_digest() {
            return Err(ZkPassError::MistmatchedDvrDigest);
        }

        //
        //  checking for valid keys used to verify user data & dvr
        //
        match expected_dvr.user_data_verifying_key {
            PublicKeyOption::PublicKey(key) => {
                if key != zkpass_proof.user_data_verifying_key {
                    return Err(ZkPassError::MistmatchedUserDataVerifyingKey);
                }
            }
            _ => {} // get the pubkey from endpoint
        }
        if zkpass_proof.dvr_verifying_key != expected_dvr_verifying_key {
            return Err(ZkPassError::MistmatchedDvrVerifyingKey);
        }

        //
        // checking for proof token timeout
        //
        let now = get_current_timestamp();
        if (expected_ttl > 0) && (now > zkpass_proof.time_stamp) {
            if (now - zkpass_proof.time_stamp) > expected_ttl {
                return Err(ZkPassError::ExpiredZkPassProof);
            }
        }

        Ok((result, zkpass_proof))
    }

    /// # **Description**
    /// <span style="font-size: 1.2em; color: #996515;"> ***Verifies a zkPass Proof internally.*** </span>
    /// 
    /// # **Parameters**
    /// 
    /// | Argument                                                       | Description                               |
    /// |----------------------------------------------------------------|-------------------------------------------|
    /// | <span style="color: blue;"> **`zkpass_proof_token`** </span>   | The signed zkPass Proof JWS token to be verified|
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

//
/// <span style="font-size: 1.1em; color: #996515;"> ***The main struct which implements the ZkPassProofGenerator, ZkPassProofVerifier, and ZkPassUtility traits defined in this module.*** </span>
/// 
pub struct ZkPassClient;

#[async_trait]
///
/// <span style="font-size: 1.1em; color: #996515;"> ***Trait built on the ZkPassClient to support higher-level abstrations for implementing a data holder.
/// This trait is provided as a helper type alternative to using the ZkPassClient direclty.
/// This is primarily for developers who prefer a more object-oriented approach in designing the data holder.*** </span>
/// 
pub trait DataHolder {
    async fn create_zkpass_proof(&self, zkpass_service_url: &str, user_data_token: &str, dvr_token: &str) -> Result<(String, Duration), ZkPassError> {
        //let zkpass_service_url = String::from("https://playground-zkpass.ssi.id/proof");
        //let zkpass_service_url = String::from("http://localhost:10888/proof");

        //println!("\n#### starting zkpass proof generation...");
        let start = Instant::now();

        //
        // Step 1: Instantiate the zkpass_client object.
        //
        let zkpass_client = ZkPassClient;

        //
        // Step 2: Call the zkpass_client.generate_zk_pass_proof
        //         to get the zkpass_proof_token.
        //
        let zkpass_proof_token = zkpass_client
            .generate_zkpass_proof(
                &zkpass_service_url,
                &user_data_token,
                &dvr_token)
            .await?;

        let duration = start.elapsed();
        //println!("#### generation completed [time={:?}]", duration);

        Ok((zkpass_proof_token, duration))
    }
}

///
/// <span style="font-size: 1.1em; color: #996515;"> ***Trait built on the ZkPassClient to support higher-level abstrations for implementing a data issuer.
/// This trait is provided as a helper type alternative to using the ZkPassClient directly.
/// This is primarily for developers who prefer a more object-oriented approach in designing the data issuer.*** </span>
/// 
pub trait DataIssuer {
    fn sign_user_data(&self, signing_key: &str, data: Value, verifying_key_jwks: Option<KeysetEndpoint>,) -> Result<String, ZkPassError> {
        //
        // Step 1: Instantiate the zkpass_client object
        //
        let zkpass_client = ZkPassClient;

        //
        // Step 2: Call the zkpass_client.sign_data_to_jws_token.
        //         This is to digitally-sign the user data.
        //
        let data_token = zkpass_client
            .sign_data_to_jws_token(
                signing_key,
                json!(data),
                verifying_key_jwks
            )?;

        Ok(data_token)
    }
}

///
/// <span style="font-size: 1.1em; color: #996515;"> ***Trait built on the ZkPassClient to support higher-level abstrations for implementing a proof verifier.
/// This trait is provided as a helper type alternative to using the ZkPassClient directly.
/// This is primarily for developers who prefer a more object-oriented approach in designing the proof verifier.*** </span>
/// 
pub trait ProofVerifier {
    fn sign_dvr(&self, signing_key: &str, dvr: DataVerificationRequest, verifying_key_jwks: Option<KeysetEndpoint>,) -> Result<String, ZkPassError> {
        //
        // Step 1: Instantiate the zkpass_client object
        //
        let zkpass_client = ZkPassClient;

        //
        // Step 2: Call the zkpass_client.sign_data_to_jws_token.
        //         This is to digitally-sign the user data.
        //
        let dvr_token = zkpass_client
            .sign_data_to_jws_token(
                signing_key,
                json!(dvr),
                verifying_key_jwks
            )?;

        Ok(dvr_token)
    }

    fn get_query_engine_version_info(&self) -> (String, String) {
        //
        //  Step 1: Instantiate the zkpass_client object.
        //
        let zkpass_client = ZkPassClient;

        //
        //  Step 2: Call zkpass_client.get_query_engine_version_info.
        //          The version info is needed for DVR object creation.
        //
        zkpass_client.get_query_engine_version_info()
    }
}