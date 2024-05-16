/*
 * mod.rs
 * this file contains common structs that is used on zkpass-host and zkpass-ws
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * Created Date: November 30th 2023
 * -----
 * Last Modified: April 22nd 2024
 * Modified By: William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * -----
 * Reviewers:
 *   Antony Halim (antony.halim@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
pub mod cache;
pub mod errors;
pub mod signal;
pub mod socket;

use serde::{ Deserialize, Serialize };
use tracing::info;
use zkpass_core::interface::{ KeysetEndpoint, PublicKey, PublicKeyOption };

use self::errors::ZkPassUtilError;

pub const OPERATION_FETCHING_KEYS: &str = "request_fetching_keys_by_host";
pub const OPERATION_PRINTING_LOGS: &str = "request_printing_logs_by_host";
pub const OPERATION_GENERATE_PROOF: &str = "request_generate_proof";
pub const OPERATION_FETCHING_PRIVATE_KEYS: &str = "request_fetching_private_keys_by_host";
pub const OPERATION_SEPARATOR: &str = "|";

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RequestGenerateProof {
    pub dvr_token: String,
    pub user_data_token: String,
}

impl Into<(String, String)> for RequestGenerateProof {
    fn into(self) -> (String, String) {
        (self.dvr_token, self.user_data_token)
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VerificationPublicKeyOption {
    pub dvr_public_key_option: Option<PublicKeyOption>,
    pub user_data_public_key_option: Option<PublicKeyOption>,
}

impl Into<(Option<PublicKeyOption>, Option<PublicKeyOption>)> for VerificationPublicKeyOption {
    fn into(self) -> (Option<PublicKeyOption>, Option<PublicKeyOption>) {
        (self.dvr_public_key_option, self.user_data_public_key_option)
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RequestGenerateProofResult {
    pub request_generate_proof: RequestGenerateProof,
    pub verification_public_keys_option: VerificationPublicKeyOption,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VerificationPublicKeys {
    pub dvr_key: PublicKey,
    pub user_data_key: PublicKey,
}

impl VerificationPublicKeys {
    pub fn new() -> VerificationPublicKeys {
        VerificationPublicKeys {
            dvr_key: PublicKey {
                x: "".to_string(),
                y: "".to_string(),
            },
            user_data_key: PublicKey {
                x: "".to_string(),
                y: "".to_string(),
            },
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum KeyService {
    NATIVE,
    KMS,
}

impl KeyService {
    pub fn to_string(&self) -> String {
        match self {
            KeyService::NATIVE => "NATIVE".to_string(),
            KeyService::KMS => "KMS".to_string(),
        }
    }
    pub fn from_string(key_service: &str) -> KeyService {
        match key_service {
            "NATIVE" => KeyService::NATIVE,
            "KMS" => KeyService::KMS,
            _ => {
                info!("Invalid Key Service, using default Key Service: NATIVE");
                KeyService::NATIVE
            }
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct KeyPair {
    pub private_key: String, //encrypted private key
    pub public_key: PublicKey,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HostKeyPairs {
    pub encryption_key: KeyPair,
    pub signing_key: KeyPair,
    pub decryption_request_option: Option<DecryptionRequest>,
    pub key_service: KeyService,
    pub signing_keyset_endpoint: KeysetEndpoint,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HostPrivateKeys {
    pub encryption_key: String,
    pub signing_key: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DecryptionRequest {
    pub access_key_id: String,
    pub secret_access_key: String,
    pub session_token: String,
    pub region: String,
    pub key_id: String,
    pub encryption_algorithm: String,
    pub proxy_port: String,
}

pub fn retrieve_env_var(env_var: &str) -> Result<String, ZkPassUtilError> {
    match std::env::var(env_var) {
        Ok(result) => Ok(result),
        Err(_) => Err(ZkPassUtilError::MissingEnvError(env_var.to_string())),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_retrieve_env_var_existing() {
        let env_var = "SOME_ENV_VAR";
        std::env::set_var(env_var, "some_value");

        let result = retrieve_env_var(env_var).unwrap();
        assert_eq!(result, "some_value".to_string());
    }

    #[test]
    fn test_retrieve_env_var_missing() {
        let env_var = "NON_EXISTING_ENV_VAR";
        std::env::remove_var(env_var);

        let result = retrieve_env_var(env_var);
        assert!(result.is_err());
    }
}
