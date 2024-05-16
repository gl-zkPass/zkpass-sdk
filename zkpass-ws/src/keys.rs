/*
 * keys.rs
 * this file consists of all private-public keys functionality for zkpass-ws
 * like getting the private-public keys from file, decrypting the private keys (for local use),
 * and request decrypting the private keys
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * Created Date: February 20th 2024
 * -----
 * Last Modified: May 2nd 2024
 * Modified By: William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * ---
 * References:
 *   https://github.com/GDPWinnerPranata/enclave-kms-test/tree/master
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
use aws_config::Region;
use futures::executor::block_on;
use serde::{ Deserialize, Serialize };
use tracing::info;
use zkpass_core::interface::{ verify_key_token, Jwk, KeysetEndpoint, PublicKey };
use zkpass_svc_common::interface::{
    errors::{ ZkPassSocketError, ZkPassUtilError },
    retrieve_env_var,
    socket::SocketConnection,
    DecryptionRequest,
    HostKeyPairs,
    KeyPair,
    KeyService,
};

use crate::{
    jwks::read_jwks_from_file,
    utils::read_json_from_file,
    DEFAULT_SERVER_URL,
    STAGING_SERVER_URL,
};

pub const DEFAULT_KID_VERIFIYING_PUB_KEY: &str = "VerifyingPubK";
pub const DEFAULT_KID_SERVICE_SIGNING_PUB_KEY: &str = "ServiceSigningPubK";
pub const DEFAULT_KID_SERVICE_ENCRYPTION_PUB_KEY: &str = "ServiceEncryptionPubK";

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize)]
struct PrivateKeysFileResult {
    encryptKeyPair: String,
    signerKeyPair: String,
}

async fn retrieve_private_keys_from_file() -> Result<PrivateKeysFileResult, ZkPassUtilError> {
    let private_keys_path = retrieve_env_var("PRIVATE_KEY_FILE_PATH")?;
    let private_key_result = read_json_from_file::<PrivateKeysFileResult>(
        &private_keys_path,
        false
    )?;
    Ok(private_key_result)
}

fn retrieve_verifying_public_keys() -> Result<PublicKey, ZkPassUtilError> {
    let jwks_keys: Vec<Jwk> = read_jwks_from_file();
    let kid_verifying_pub_key = retrieve_env_var("KID_VERIFIYING_PUB_KEY")
        .ok()
        .unwrap_or_else(|| DEFAULT_KID_VERIFIYING_PUB_KEY.to_owned());
    let verifying_pub_key = jwks_keys.iter().find(|key| key.kid == kid_verifying_pub_key);

    match verifying_pub_key {
        Some(pub_key) => {
            Ok(PublicKey {
                x: pub_key.x.to_string(),
                y: pub_key.y.to_string(),
            })
        }
        None => { Err(ZkPassUtilError::CustomError("No verifying public key found".to_string())) }
    }
}

async fn verify_private_keys(
    key_service: &KeyService,
    params: &PrivateKeysFileResult
) -> Result<HostKeyPairs, ZkPassUtilError> {
    let verifying_public_key = retrieve_verifying_public_keys()?;
    let (signing_private_key, signing_public_key) = verify_key_token(
        verifying_public_key.to_pem().as_str(),
        params.signerKeyPair.as_str()
    ).map_err(|err| ZkPassUtilError::CustomError(format!("{}", err)))?;

    let (encryption_private_key, encryption_public_key) = verify_key_token(
        verifying_public_key.to_pem().as_str(),
        params.encryptKeyPair.as_str()
    ).map_err(|err| ZkPassUtilError::CustomError(format!("{}", err)))?;

    let jku = match key_service {
        KeyService::NATIVE => String::from(DEFAULT_SERVER_URL),
        KeyService::KMS => String::from(STAGING_SERVER_URL),
    };

    let kid_verifying_pub_key = retrieve_env_var("KID_SERVICE_SIGNING_PUB_KEY")
        .ok()
        .unwrap_or_else(|| DEFAULT_KID_SERVICE_SIGNING_PUB_KEY.to_owned());
    let mut host_key_pairs = HostKeyPairs {
        encryption_key: KeyPair {
            private_key: encryption_private_key,
            public_key: encryption_public_key,
        },
        signing_key: KeyPair {
            private_key: signing_private_key,
            public_key: signing_public_key,
        },
        decryption_request_option: None,
        key_service: key_service.clone(),
        signing_keyset_endpoint: KeysetEndpoint {
            jku,
            kid: kid_verifying_pub_key,
        },
    };

    match key_service {
        KeyService::KMS => {
            host_key_pairs.decryption_request_option = Some(get_decryption_request().await?);
        }
        _ => {}
    }

    Ok(host_key_pairs)
}

pub async fn sending_keys_to_host(
    socket: &mut Box<dyn SocketConnection>
) -> Result<(), ZkPassSocketError> {
    let key_service = retrieve_env_var("KEY_SERVICE").map_err(ZkPassSocketError::UtilError)?;
    let key_service = KeyService::from_string(key_service.as_str());

    info!("Retrieving private keys {}", key_service.to_string());
    let private_key_file_result = retrieve_private_keys_from_file().await.map_err(
        ZkPassSocketError::UtilError
    )?;
    info!("Retrieved private keys");

    info!("Verifying private keys {}", key_service.to_string());
    let host_key_pairs = verify_private_keys(&key_service, &private_key_file_result).await.map_err(
        ZkPassSocketError::UtilError
    )?;
    info!("Verified private keys");

    let serialized_params = serde_json
        ::to_string(&host_key_pairs)
        .map_err(|_| ZkPassSocketError::SerializeError("Private Keys".to_string()))?;
    info!("Sending keys to host");
    socket.send(serialized_params)?;
    Ok(())
}

async fn get_decryption_request() -> Result<DecryptionRequest, ZkPassUtilError> {
    let access_key_id = retrieve_env_var("AWS_KMS_ACCESS_KEY_ID")?;
    let secret_access_key = retrieve_env_var("AWS_KMS_SECRET_ACCESS_KEY")?;
    let region = retrieve_env_var("AWS_KMS_REGION")?;
    let key_id = retrieve_env_var("AWS_KMS_ENCRYPT_KEY_ID")?;
    let encryption_algorithm = retrieve_env_var("AWS_KMS_ENCRYPTION_ALGORITHM")?;
    let proxy_port = retrieve_env_var("AWS_KMS_PROXY_PORT")?;
    let region = Region::new(region);

    let aws_config = aws_config::from_env().region(region.clone()).load().await;

    let credentials = aws_sdk_kms::config::Credentials::new(
        access_key_id,
        secret_access_key,
        None,
        None,
        "Static"
    );
    let kms_config = aws_sdk_sts::config::Builder
        ::from(&aws_config)
        .region(region.clone())
        .credentials_provider(credentials)
        .build();

    let sts_client = aws_sdk_sts::Client::from_conf(kms_config);
    let request = sts_client.get_session_token();

    let join_handle = tokio::task::spawn_blocking(|| block_on(request.send()));
    let session_token_output = join_handle.await
        .map_err(|err| { ZkPassUtilError::CustomError(err.to_string()) })?
        .map_err(|err| ZkPassUtilError::CustomError(err.to_string()))?;

    let credentials = session_token_output.credentials.unwrap();

    Ok(DecryptionRequest {
        access_key_id: credentials.access_key_id,
        secret_access_key: credentials.secret_access_key,
        session_token: credentials.session_token,
        region: region.to_string(),
        key_id,
        encryption_algorithm,
        proxy_port,
    })
}

pub fn retrieve_encryption_pubk() -> Result<PublicKey, ZkPassUtilError> {
    let jwks_keys: Vec<Jwk> = read_jwks_from_file();
    let kid_encryption_pub_key = retrieve_env_var("KID_SERVICE_ENCRYPTION_PUB_KEY")
        .ok()
        .unwrap_or_else(|| DEFAULT_KID_SERVICE_ENCRYPTION_PUB_KEY.to_owned());
    let encryption_pub_key = jwks_keys.iter().find(|key| key.kid == kid_encryption_pub_key);

    match encryption_pub_key {
        Some(pub_key) => {
            Ok(PublicKey {
                x: pub_key.x.to_string(),
                y: pub_key.y.to_string(),
            })
        }
        None => { Err(ZkPassUtilError::CustomError("No verifying public key found".to_string())) }
    }
}

#[cfg(test)]
mod tests {
    use crate::mocks::MockSocketConnection;

    use super::*;
    use std::error::Error;
    use std::sync::Once;

    static INIT: Once = Once::new();

    fn initialize() {
        INIT.call_once(|| {
            let request = DecryptionRequest {
                access_key_id: "access_key_id".to_string(),
                secret_access_key: "secret_access_key".to_string(),
                encryption_algorithm: "algorithm".to_string(),
                region: "region".to_string(),
                proxy_port: "8080".to_string(),
                key_id: "key_id".to_string(),
                session_token: "session_token".to_string(),
            };

            std::env::set_var("KEY_SERVICE", "NATIVE");
            std::env::set_var("PRIVATE_KEY_FILE_PATH", "./sample-keys.json");
            std::env::set_var("JWKS_FILE_PATH", "./sample-jwks.json");
            std::env::set_var("KID_VERIFIYING_PUB_KEY", "VerifyingPubK");
            std::env::set_var("KID_SERVICE_SIGNING_PUB_KEY", "ServiceSigningPubK");
            std::env::set_var("KID_ENCRYPTION_PUB_KEY", "EncryptionPubK");
            std::env::set_var("AWS_KMS_ACCESS_KEY_ID", &request.access_key_id);
            std::env::set_var("AWS_KMS_SECRET_ACCESS_KEY", &request.secret_access_key);
            std::env::set_var("AWS_KMS_REGION", &request.region);
            std::env::set_var("AWS_KMS_ENCRYPT_KEY_ID", &request.key_id);
            std::env::set_var("AWS_KMS_ENCRYPTION_ALGORITHM", &request.encryption_algorithm);
            std::env::set_var("AWS_KMS_PROXY_PORT", &request.proxy_port);
        });
    }

    #[tokio::test]
    async fn test_retrieve_private_keys_from_file() {
        initialize();

        let result = retrieve_private_keys_from_file().await;
        assert!(result.is_ok());
    }

    #[test]
    fn test_retrieve_verifying_public_keys() {
        initialize();

        let result = retrieve_verifying_public_keys();
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_verify_private_keys() {
        initialize();
        let key_service = KeyService::NATIVE;
        let private_key_file_result = retrieve_private_keys_from_file().await.unwrap();

        let result = verify_private_keys(&key_service, &private_key_file_result).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_sending_keys_to_host() -> Result<(), Box<dyn Error>> {
        initialize();

        // Create a mock socket connection
        let mut socket: Box<dyn SocketConnection> = Box::new(
            MockSocketConnection::new("".to_string(), "".to_string())
        );

        // Call the sending_keys_to_host function
        let result = sending_keys_to_host(&mut socket).await;

        // Assert that the function returns Ok
        assert!(result.is_ok());

        Ok(())
    }

    #[test]
    fn test_retrieve_encryption_pubk() {
        initialize();

        // Call the retrieve_encryption_pubk function
        let result = retrieve_encryption_pubk();

        // Assert that the function returns Ok with the expected PublicKey
        assert!(result.is_ok());
        let pub_key = result.unwrap();
        assert_eq!(pub_key.x, "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU");
        assert_eq!(pub_key.y, "IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==");
    }
}
