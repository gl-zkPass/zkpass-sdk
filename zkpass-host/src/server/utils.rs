/*
 * utils.rs
 * this file contains all the utility functions needed to generate-proof
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * Created Date: November 30th 2023
 * -----
 * Last Modified: May 3rd 2024
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
use std::cell::RefCell;
use std::sync::Arc;
use tokio::sync::Mutex;
use tracing::info;
use zkpass_core::interface::{ decrypt_jwe_token, get_public_key_options, ZkPassError };
use zkpass_svc_common::interface::errors::{ ZkPassHostError, ZkPassSocketError };
use zkpass_svc_common::interface::socket::SocketConnection;
use zkpass_svc_common::interface::{ RequestGenerateProof, VerificationPublicKeyOption };

use crate::keys::{ get_zkpass_key, request_private_keys_to_ws, HOST_KEY_PAIRS };

pub struct DecryptedTokens {
    pub dvr_token: String,
    pub user_data_token: String,
}

async fn decrypt_token(token_encrypted: &String) -> Result<(String, String), ZkPassError> {
    let binding = HOST_KEY_PAIRS.lock().await;
    let encryption_key = &binding.encryption_key.private_key.as_str();
    decrypt_jwe_token(encryption_key, &token_encrypted)
}

pub async fn decrypt_tokens(
    request_generate_proof_object: RequestGenerateProof
) -> Result<DecryptedTokens, ZkPassError> {
    info!("Decrypting tokens");
    let (dvr_token, _) = decrypt_token(&request_generate_proof_object.dvr_token).await?;
    let dvr_token = serde_json::from_str(&dvr_token).unwrap();
    let (user_data_token, _) = decrypt_token(&request_generate_proof_object.user_data_token).await?;
    let user_data_token = serde_json::from_str(&user_data_token).unwrap();

    Ok(DecryptedTokens {
        dvr_token,
        user_data_token,
    })
}

pub fn request_verification_keyset(
    dvr_token: &String
) -> Result<VerificationPublicKeyOption, ZkPassHostError> {
    info!("Requesting verification keyset");
    let dvr_public_key_option = get_public_key_options(dvr_token, false).map_err(
        ZkPassHostError::ZkPassError
    )?;
    let user_data_public_key_option = get_public_key_options(dvr_token, true).map_err(
        ZkPassHostError::ZkPassError
    )?;

    Ok(VerificationPublicKeyOption {
        dvr_public_key_option: dvr_public_key_option,
        user_data_public_key_option: user_data_public_key_option,
    })
}

pub fn json_to_object<T>(json: String) -> Result<T, ZkPassHostError>
    where T: serde::de::DeserializeOwned
{
    if json.is_empty() || json == "\"\"" {
        return Err(ZkPassHostError::ZkPassSocketError(ZkPassSocketError::EmptyParameterError));
    }
    let data: T = serde_json
        ::from_str(&json)
        .map_err(|_| {
            ZkPassHostError::ZkPassSocketError(ZkPassSocketError::DeserializeError("".to_string()))
        })?;
    Ok(data)
}

pub async fn check_or_retrieve_private_keys(
    arc_util_socket: Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>
) -> Result<(), ZkPassHostError> {
    let (encryption_key, signing_key, _) = get_zkpass_key().await;
    if
        encryption_key == "EMPTY_ZKPASS_PRIVKEY".to_string() ||
        signing_key == "EMPTY_ZKPASS_PRIVKEY".to_string()
    {
        request_private_keys_to_ws(arc_util_socket).await?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::mocks::*;
    use serial_test::serial;
    use zkpass_core::interface::PublicKeyOption;
    use zkpass_svc_common::interface::errors::ZkPassHostError;
    use zkpass_svc_common::interface::HostKeyPairs;

    async fn inject_mock_host_key_pairs() -> HostKeyPairs {
        let mock_host_key_pairs: HostKeyPairs = init_mock_host_key_pairs();
        let mut key_pairs = HOST_KEY_PAIRS.lock().await;
        *key_pairs = mock_host_key_pairs.clone();
        drop(key_pairs);

        mock_host_key_pairs
    }

    #[tokio::test]
    #[serial]
    async fn test_decrypt_tokens() {
        let mock_host_key_pairs: HostKeyPairs = inject_mock_host_key_pairs().await;

        let request_generate_proof_object = get_request_generate_proof(mock_host_key_pairs);
        let result = decrypt_tokens(request_generate_proof_object).await;
        assert!(result.is_ok());

        let decrypted_tokens = result.unwrap();
        assert_eq!(decrypted_tokens.dvr_token, MOCK_DVR_TOKEN.to_string());
        assert_eq!(decrypted_tokens.user_data_token, MOCK_USER_DATA_TOKEN);
    }

    #[test]
    #[serial]
    fn test_request_verification_keyset() {
        let dvr_token = MOCK_DVR_TOKEN.to_string();
        let (encryption_pub_key, signing_pub_key) = get_public_key();

        let result = request_verification_keyset(&dvr_token);
        assert!(result.is_ok());

        let verification_key_option = result.unwrap();
        let dvr_public_key_option = verification_key_option.dvr_public_key_option.unwrap();
        let user_data_public_key_option =
            verification_key_option.user_data_public_key_option.unwrap();
        assert_eq!(dvr_public_key_option, PublicKeyOption::PublicKey(encryption_pub_key));
        assert_eq!(user_data_public_key_option, PublicKeyOption::PublicKey(signing_pub_key));
    }

    #[tokio::test]
    #[serial]
    async fn test_check_or_retrieve_private_keys() {
        inject_mock_host_key_pairs().await;
        let arc_util_socket = Arc::new(Mutex::new(RefCell::new(None)));
        let result = check_or_retrieve_private_keys(arc_util_socket).await;
        assert!(result.is_ok());
    }

    #[test]
    fn test_json_to_object() {
        let request_generate_proof_object = RequestGenerateProof {
            dvr_token: "encrypted_dvr_token".to_string(),
            user_data_token: "encrypted_user_data_token".to_string(),
        };
        let json = serde_json::to_string(&request_generate_proof_object).unwrap();
        let result: Result<RequestGenerateProof, ZkPassHostError> = json_to_object(json);
        assert!(result.is_ok());

        let result = result.unwrap();
        assert_eq!(result.dvr_token, request_generate_proof_object.dvr_token);
        assert_eq!(result.user_data_token, request_generate_proof_object.user_data_token);
    }
}
