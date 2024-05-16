/*
 * client_helper.rs
 * this file contains all the helper functions that are used when zkpass-host asks zkpass-ws for help
 * for example, when host need to retrieve some keys from the internet or simply printing log.
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: November 30th 2023
 * -----
 * Last Modified: May 2nd 2024
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
use tracing::info;

use zkpass_core::interface::{ PublicKey, PublicKeyOption };
use zkpass_svc_common::interface::cache::create_cache_key;
use zkpass_svc_common::interface::errors::{ ZkPassSocketError, ZkPassUtilError };
use zkpass_svc_common::interface::socket::SocketConnection;
use zkpass_svc_common::interface::{
    VerificationPublicKeyOption,
    VerificationPublicKeys,
    OPERATION_FETCHING_KEYS,
    OPERATION_FETCHING_PRIVATE_KEYS,
    OPERATION_PRINTING_LOGS,
    OPERATION_SEPARATOR,
};

use crate::cache::{ get_from_cache, insert_to_cache };
use crate::jwks::fetch_keys_from_jwks;
use crate::keys::sending_keys_to_host;
use crate::logger::write_host_log;

async fn fetch_keys(
    verification_object: VerificationPublicKeyOption
) -> Result<VerificationPublicKeys, ZkPassSocketError> {
    info!("Fetching keys");
    let mut issuer_verifier_keys = VerificationPublicKeys::new();
    if let Some(data) = verification_object.user_data_public_key_option {
        let public_key = fetch_keys_or_cached(data).await?;
        issuer_verifier_keys.user_data_key = public_key.clone();
    }
    if let Some(data) = verification_object.dvr_public_key_option {
        let public_key = fetch_keys_or_cached(data).await?;
        issuer_verifier_keys.dvr_key = public_key.clone();
    }
    Ok(issuer_verifier_keys)
}

async fn fetch_keys_or_cached(
    public_key_option: PublicKeyOption
) -> Result<PublicKey, ZkPassSocketError> {
    match public_key_option {
        PublicKeyOption::KeysetEndpoint(keyset) => {
            let cache_key = create_cache_key(keyset.clone()).map_err(ZkPassSocketError::UtilError)?;
            let cache_value = get_from_cache::<PublicKey>(&cache_key.as_str()).await.map_err(
                ZkPassSocketError::UtilError
            )?;

            if let Some((public_key, is_expired)) = cache_value {
                if is_expired {
                    let fetched_key = fetch_keys_from_jwks(keyset).await.map_err(|e|
                        ZkPassSocketError::UtilError(ZkPassUtilError::CustomError(e))
                    )?;

                    insert_to_cache::<PublicKey>(&cache_key, fetched_key.clone()).await.map_err(
                        ZkPassSocketError::UtilError
                    )?;

                    Ok(fetched_key)
                } else {
                    Ok(public_key)
                }
            } else {
                let fetched_key = fetch_keys_from_jwks(keyset).await.map_err(|e|
                    ZkPassSocketError::UtilError(ZkPassUtilError::CustomError(e))
                )?;

                insert_to_cache::<PublicKey>(&cache_key, fetched_key.clone()).await.map_err(
                    ZkPassSocketError::UtilError
                )?;

                Ok(fetched_key)
            }
        }
        PublicKeyOption::PublicKey(key) => Ok(key),
    }
}

pub async fn perform_client_helper(
    socket: &mut Box<dyn SocketConnection>
) -> Result<(), ZkPassSocketError> {
    loop {
        let received_data = socket.receive();

        let operation_name_and_params_json = match received_data {
            Ok(data) => {
                if data.is_empty() {
                    // if the connection is closed, the socket will receive empty string (0 KB),
                    // then we can break the loop / close the connection
                    break;
                }
                data
            }
            Err(err) => {
                let err_msg = format!("{:?}", err);
                if err_msg.contains(OPERATION_PRINTING_LOGS) {
                    err_msg.trim_start_matches("Error(\"").trim_end_matches("\")").to_string()
                } else {
                    return Err(err);
                }
            }
        };

        let operation_name_and_params: Vec<&str> = operation_name_and_params_json
            .split(OPERATION_SEPARATOR)
            .collect();
        let operation_name = operation_name_and_params[0];
        let operation_parameter = operation_name_and_params[1];

        (match operation_name {
            OPERATION_FETCHING_KEYS =>
                Ok(client_receive_request_keys(socket, operation_parameter).await?),
            OPERATION_FETCHING_PRIVATE_KEYS => Ok(sending_keys_to_host(socket).await?),
            OPERATION_PRINTING_LOGS => Ok(write_host_log(operation_parameter.to_string())),
            _ => Err(ZkPassSocketError::CustomError("Operation is not supported yet".to_string())),
        })?;
    }
    info!("Client connection closed");
    Ok(())
}

async fn client_receive_request_keys(
    socket: &mut Box<dyn SocketConnection>,
    verification_public_key_option_json: &str
) -> Result<(), ZkPassSocketError> {
    info!("Client receive request keys");
    let verification_public_key_option_object: VerificationPublicKeyOption = serde_json
        ::from_str(&verification_public_key_option_json)
        .map_err(|_| {
            ZkPassSocketError::DeserializeError("VerificationPublicKeyOption".to_string())
        })?;
    let public_keys = fetch_keys(verification_public_key_option_object).await?;
    let bytes = serde_json
        ::to_string(&public_keys)
        .map_err(|_| ZkPassSocketError::SerializeError("VerificationPublicKeys".to_string()))?;
    socket.send(bytes)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use httpmock::{ Method::GET, MockServer };

    use super::*;
    use crate::mocks::*;

    #[tokio::test]
    async fn test_write_host_log() {
        let mut socket: Box<dyn SocketConnection> = Box::new(
            MockHelperSocketConnection::new(OPERATION_PRINTING_LOGS.to_string(), "".to_string())
        );
        let result = perform_client_helper(&mut socket).await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_client_receive_request_keys() {
        let server = MockServer::start();
        let jwks =
            r#"
            {
                "keys": [
                    {
                        "kty": "EC",
                        "crv": "P-256",
                        "x": "dvr_public_key_x",
                        "y": "dvr_public_key_y",
                        "kid": "kid"
                    }
                ]
            }
        "#;
        server.mock(|when, then| {
            when.method(GET).path("/jwks");
            then.status(200).body(jwks);
        });
        let mut socket: Box<dyn SocketConnection> = Box::new(
            MockHelperSocketConnection::new(
                OPERATION_FETCHING_KEYS.to_string(),
                server.address().to_string()
            )
        );
        let result = perform_client_helper(&mut socket).await;
        assert!(result.is_ok());
    }
}
