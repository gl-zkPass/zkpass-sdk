/*
 * keys.rs
 * this file consists of all private-public keys functionality for zkpass-host
 * like getting the private-public keys, decrypting the private keys, and
 * request decrypting the private keys
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
 *   https://github.com/GDPWinnerPranata/enclave-kms-test/tree/master
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
use std::{ cell::RefCell, path::PathBuf, sync::Arc };
use base64::{ engine::general_purpose, Engine };
use openssl::symm::{ Cipher, Crypter, Mode };
use sha2::{ Digest, Sha256 };

use lazy_static::lazy_static;
use tokio::sync::Mutex;
use tracing::{ error, info };
use zkpass_core::interface::{ KeysetEndpoint, PublicKey };
use zkpass_svc_common::interface::{
    errors::{ ZkPassHostError, ZkPassSocketError, ZkPassUtilError },
    retrieve_env_var,
    socket::SocketConnection,
    DecryptionRequest,
    HostKeyPairs,
    HostPrivateKeys,
    KeyPair,
    KeyService,
    OPERATION_FETCHING_PRIVATE_KEYS,
    OPERATION_SEPARATOR,
};

lazy_static! {
    pub static ref HOST_KEY_PAIRS: Mutex<HostKeyPairs> = Mutex::new(HostKeyPairs {
        encryption_key: KeyPair {
            private_key: "EMPTY_ZKPASS_PRIVKEY".to_string(),
            public_key: PublicKey {
                x: "EMPTY_ZKPASS_PUBKEY_X".to_string(),
                y: "EMPTY_ZKPASS_PUBKEY_Y".to_string(),
            },
        },
        signing_key: KeyPair {
            private_key: "EMPTY_ZKPASS_PRIVKEY".to_string(),
            public_key: PublicKey {
                x: "EMPTY_ZKPASS_PUBKEY_X".to_string(),
                y: "EMPTY_ZKPASS_PUBKEY_Y".to_string(),
            },
        },
        decryption_request_option: None,
        key_service: KeyService::NATIVE,
        signing_keyset_endpoint: KeysetEndpoint {
            jku: "https://hostname/zkpass/jwks".to_string(),
            kid: "zkpass-dh-pubkey".to_string(),
        },
    });
}

pub async fn request_private_keys_to_ws(
    arc_util_socket: Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>
) -> Result<(), ZkPassHostError> {
    let guard = arc_util_socket.lock().await;
    let mut socket_option = guard.borrow_mut();
    if socket_option.is_some() {
        let socket = socket_option.as_mut().unwrap();
        let request_string = format!("{}{}", OPERATION_FETCHING_PRIVATE_KEYS, OPERATION_SEPARATOR);

        info!("Request fetching private keys");
        socket.send(request_string).map_err(ZkPassHostError::ZkPassSocketError)?;

        let params = socket.receive().map_err(ZkPassHostError::ZkPassSocketError)?;

        let host_key_pairs: HostKeyPairs = serde_json
            ::from_str(params.as_str())
            .map_err(|_| {
                ZkPassHostError::ZkPassSocketError(
                    ZkPassSocketError::DeserializeError("HostKeyPairs".to_string())
                )
            })?;

        drop(socket_option);
        drop(guard);

        let mut encryption_key = KeyPair {
            private_key: "".to_string(),
            public_key: host_key_pairs.encryption_key.public_key,
        };
        let mut signing_key = KeyPair {
            private_key: "".to_string(),
            public_key: host_key_pairs.signing_key.public_key,
        };
        let decryption_request_option = host_key_pairs.decryption_request_option;

        let encrypted_private_keys = HostPrivateKeys {
            encryption_key: host_key_pairs.encryption_key.private_key,
            signing_key: host_key_pairs.signing_key.private_key,
        };

        info!("Request decrypting private keys");
        match host_key_pairs.key_service {
            KeyService::NATIVE => {
                let (decrypted_encryption_key, decrypted_signing_key) = decrypt_private_keys_local(
                    &encrypted_private_keys
                ).map_err(ZkPassHostError::ZkPassUtilError)?;
                encryption_key.private_key = decrypted_encryption_key;
                signing_key.private_key = decrypted_signing_key;
            }
            KeyService::KMS => {
                match decryption_request_option.clone() {
                    Some(decryption_request) => {
                        info!("Begin to decrypt encryption private key");
                        let encryption_private_key = request_decrypt_key_kms(
                            &decryption_request,
                            &encrypted_private_keys.encryption_key
                        )?;
                        info!("Begin to decrypt signing private key");
                        let signing_private_key = request_decrypt_key_kms(
                            &decryption_request,
                            &encrypted_private_keys.signing_key
                        )?;
                        info!("Decryption of both private keys completed");
                        encryption_key.private_key = encryption_private_key;
                        signing_key.private_key = signing_private_key;
                    }
                    None => {
                        return Err(
                            ZkPassHostError::ZkPassUtilError(
                                ZkPassUtilError::CustomError(
                                    "DecryptionRequest is None".to_string()
                                )
                            )
                        );
                    }
                }
            }
        }
        info!("Private keys decrypted");

        *HOST_KEY_PAIRS.lock().await = HostKeyPairs {
            encryption_key,
            signing_key,
            decryption_request_option,
            key_service: host_key_pairs.key_service,
            signing_keyset_endpoint: host_key_pairs.signing_keyset_endpoint,
        };
    } else {
        return Err(
            ZkPassHostError::ZkPassSocketError(
                ZkPassSocketError::CustomError("Util socket is None".to_string())
            )
        );
    }
    Ok(())
}

pub async fn get_zkpass_key() -> (String, String, KeysetEndpoint) {
    let private_keys = HOST_KEY_PAIRS.lock().await;
    let signing_key_ep = private_keys.signing_keyset_endpoint.clone();
    let encryption_key = private_keys.encryption_key.clone().private_key;
    let signing_key = private_keys.signing_key.clone().private_key;
    return (encryption_key, signing_key, signing_key_ep);
}

fn request_decrypt_key_kms(
    request: &DecryptionRequest,
    encrypted_private_key: &String
) -> Result<String, ZkPassHostError> {
    info!("Request decrypting private keys KMS");
    let path = "./kmstool_enclave_cli";
    let args = vec![
        "decrypt",
        "--region",
        &request.region,
        "--proxy-port",
        &request.proxy_port,
        "--aws-access-key-id",
        &request.access_key_id,
        "--aws-secret-access-key",
        &request.secret_access_key,
        "--aws-session-token",
        &request.session_token,
        "--ciphertext",
        &encrypted_private_key,
        "--key-id",
        &request.key_id,
        "--encryption-algorithm",
        &request.encryption_algorithm
    ];

    let output: String = call_executable(path, &args)?;

    let decoded = general_purpose::STANDARD
        .decode(output)
        .map_err(|err|
            ZkPassHostError::ZkPassUtilError(ZkPassUtilError::CustomError(err.to_string()))
        )?;
    String::from_utf8(decoded).map_err(|_|
        ZkPassHostError::ZkPassUtilError(ZkPassUtilError::DeserializeError)
    )
}

fn call_executable(path: &str, args: &[&str]) -> Result<String, ZkPassHostError> {
    info!("calling executable");
    let output = std::process::Command
        ::new(path)
        .args(args)
        .output()
        .map_err(|err|
            ZkPassHostError::ZkPassUtilError(
                ZkPassUtilError::CustomError(format!("Failed to execute command: {:?}", err))
            )
        )?;

    if !output.status.success() {
        error!("Failed to execute command: {:?}", output);
        return Err(
            ZkPassHostError::ZkPassUtilError(
                ZkPassUtilError::CustomError(format!("{:?}", output.stderr))
            )
        );
    }

    let output = String::from_utf8(output.stdout).map_err(|err|
        ZkPassHostError::ZkPassUtilError(ZkPassUtilError::CustomError(err.to_string()))
    )?;

    Ok(
        String::from(
            output.split("PLAINTEXT: ").collect::<Vec<&str>>()[1].split("\n").collect::<Vec<&str>>()
                [0]
        )
    )
}

fn decrypt_private_keys_local(
    encrypted_private_keys: &HostPrivateKeys
) -> Result<(String, String), ZkPassUtilError> {
    info!("Decrypting private keys");
    let my_path = PathBuf::from("./zkpass-host/.env");
    dotenvy::from_path_override(my_path.as_path()).ok();

    let secret = retrieve_env_var("PRIVATE_KEY_LOCAL_SECRET")?;

    let encryption_key = decrypt_key(&encrypted_private_keys.encryption_key, &secret)?;
    let signing_key = decrypt_key(&encrypted_private_keys.signing_key, &secret)?;
    Ok((encryption_key, signing_key))
}

fn decrypt_key(ciphertext: &String, key: &String) -> Result<String, ZkPassUtilError> {
    let mut buffer = if ciphertext.is_ascii() {
        general_purpose::STANDARD
            .decode(ciphertext)
            .map_err(|err| ZkPassUtilError::CustomError(err.to_string()))?
    } else {
        ciphertext.as_bytes().to_vec()
    };

    // Create a SHA256 hash of the key
    let mut hasher = Sha256::new();
    hasher.update(key);
    let key_hash = hasher.finalize();

    // Split the buffer into iv and cipher
    let (iv, cipher) = buffer.split_at_mut(16);

    // Create a new AES256-GCM cipher instance
    let decipher = Cipher::aes_256_gcm();
    let mut decrypter = Crypter::new(decipher, Mode::Decrypt, &key_hash, Some(iv)).map_err(|err|
        ZkPassUtilError::CustomError(err.to_string())
    )?;

    // Decrypt the cipher
    let mut output = vec![0; cipher.len() + decipher.block_size()];
    let count = decrypter
        .update(cipher, &mut output)
        .map_err(|err| ZkPassUtilError::CustomError(err.to_string()))?;
    output.truncate(count);
    String::from_utf8(output).map_err(|err| ZkPassUtilError::CustomError(err.to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::mocks::*;

    #[tokio::test]
    async fn test_get_zkpass_key() {
        let mock_host_key_pairs = init_mock_host_key_pairs();
        let mut key_pairs = HOST_KEY_PAIRS.lock().await;
        *key_pairs = mock_host_key_pairs.clone();
        drop(key_pairs);

        let (encryption_key, signing_key, signing_key_ep) = get_zkpass_key().await;
        assert_eq!(encryption_key, mock_host_key_pairs.encryption_key.private_key);
        assert_eq!(signing_key, mock_host_key_pairs.signing_key.private_key);
        assert_eq!(signing_key_ep, mock_host_key_pairs.signing_keyset_endpoint);
    }

    #[test]
    fn test_decrypt_key_success() {
        let ciphertext = ENCRYPTED_ENCRYPTION_KEY;
        let key = SECRET_KEY;
        let result = decrypt_key(&ciphertext.to_string(), &key.to_string());
        assert!(result.is_ok());
    }

    #[test]
    fn test_decrypt_key_failure() {
        let ciphertext = ENCRYPTED_ENCRYPTION_KEY;
        let key = "encryption_key";
        let result = decrypt_key(&ciphertext.to_string(), &key.to_string());
        assert!(result.is_err());
    }

    #[test]
    fn test_decrypt_private_keys_local() {
        let key = SECRET_KEY;
        std::env::set_var("PRIVATE_KEY_LOCAL_SECRET", key);

        let encrypted_private_keys = HostPrivateKeys {
            encryption_key: ENCRYPTED_ENCRYPTION_KEY.to_string(),
            signing_key: ENCRYPTED_SIGNING_KEY.to_string(),
        };
        let result = decrypt_private_keys_local(&encrypted_private_keys);
        assert!(result.is_ok());

        let encrypted_private_keys = HostPrivateKeys {
            encryption_key: "invalid_encrypted_encryption_key".to_string(),
            signing_key: "invalid_encrypted_signing_key".to_string(),
        };
        let result = decrypt_private_keys_local(&encrypted_private_keys);
        assert!(result.is_err());
    }

    #[tokio::test]
    async fn test_request_private_keys_to_ws() {
        let key = SECRET_KEY;
        std::env::set_var("PRIVATE_KEY_LOCAL_SECRET", key);

        let util_socket: Option<Box<dyn SocketConnection>> = Some(Box::new(MockSocketConnection));
        let arc_util_socket = Arc::new(Mutex::new(RefCell::new(util_socket)));
        let result = request_private_keys_to_ws(arc_util_socket.clone()).await;
        assert!(result.is_ok());
    }

    #[derive(Debug)]
    struct MockSocketConnection;

    impl SocketConnection for MockSocketConnection {
        fn send(&mut self, _message: String) -> Result<(), ZkPassSocketError> {
            Ok(())
        }

        fn receive(&mut self) -> Result<String, ZkPassSocketError> {
            let mut mock_host_key_pairs = init_mock_host_key_pairs();
            mock_host_key_pairs.encryption_key.private_key = ENCRYPTED_ENCRYPTION_KEY.to_string();
            mock_host_key_pairs.signing_key.private_key = ENCRYPTED_SIGNING_KEY.to_string();
            Ok(serde_json::to_string(&mock_host_key_pairs.clone()).unwrap())
        }

        fn reconnect(self: &mut Self) -> Result<(), ZkPassSocketError> {
            Ok(())
        }
    }
}
