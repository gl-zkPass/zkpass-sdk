/*
 * public_keys.rs
 * this file contains the utilities functions that handling public keys
 * like request public keys to zkpass-ws
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * Created Date: April 18th 2024
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

use std::{ cell::RefCell, sync::Arc };

use tokio::sync::Mutex;
use tracing::info;
use zkpass_core::interface::PublicKeyOption;
use zkpass_svc_common::interface::{
    errors::{ ZkPassHostError, ZkPassSocketError },
    socket::SocketConnection,
    VerificationPublicKeyOption,
    VerificationPublicKeys,
    OPERATION_FETCHING_KEYS,
    OPERATION_SEPARATOR,
};

use super::utils::json_to_object;

pub fn extract_public_key(
    verification_public_keys_option: VerificationPublicKeyOption
) -> VerificationPublicKeys {
    info!("Extracting public keys");
    let mut verification_public_keys = VerificationPublicKeys::new();
    let (dvr_public_key_option, user_data_public_key_option) =
        verification_public_keys_option.into();
    if let Some(PublicKeyOption::PublicKey(key)) = dvr_public_key_option {
        verification_public_keys.dvr_key = key;
    }
    if let Some(PublicKeyOption::PublicKey(key)) = user_data_public_key_option {
        verification_public_keys.user_data_key = key;
    }
    verification_public_keys
}

pub fn should_request_public_key_option(
    verification_key_option: VerificationPublicKeyOption
) -> Result<(bool, VerificationPublicKeyOption), ZkPassHostError> {
    info!("Checking if should request public key option");
    let mut request_verification_key_option = verification_key_option.clone();
    let (dvr_public_key_option, user_data_public_key_option) = request_verification_key_option
        .clone()
        .into();
    match dvr_public_key_option {
        Some(data) =>
            match data.clone() {
                PublicKeyOption::KeysetEndpoint(_keyset) => {
                    request_verification_key_option.dvr_public_key_option = Some(data);
                }
                PublicKeyOption::PublicKey(_pubkey) => {
                    request_verification_key_option.dvr_public_key_option = None;
                }
            }
        None => {
            request_verification_key_option.dvr_public_key_option = None;
        }
    }
    match user_data_public_key_option {
        Some(data) =>
            match data.clone() {
                PublicKeyOption::KeysetEndpoint(_keyset) => {
                    request_verification_key_option.user_data_public_key_option = Some(data);
                }
                PublicKeyOption::PublicKey(_pubkey) => {
                    request_verification_key_option.user_data_public_key_option = None;
                }
            }
        None => {
            request_verification_key_option.user_data_public_key_option = None;
        }
    }

    if
        request_verification_key_option.dvr_public_key_option != None ||
        request_verification_key_option.user_data_public_key_option != None
    {
        return Ok((true, request_verification_key_option));
    }
    return Ok((false, request_verification_key_option));
}

pub async fn server_request_public_key_option(
    arc_socket: Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>,
    verification_key_option: VerificationPublicKeyOption
) -> Result<VerificationPublicKeys, ZkPassHostError> {
    info!("Requesting public key option");
    let guard = arc_socket.lock().await;
    let mut socket_option = guard.borrow_mut();
    if socket_option.is_some() {
        let util_socket = socket_option.as_mut().unwrap();
        let verification_key_option_string = serde_json
            ::to_string(&verification_key_option)
            .map_err(|_| {
                ZkPassHostError::ZkPassSocketError(
                    ZkPassSocketError::SerializeError("VerificationPublicKeyOptions".to_string())
                )
            })?;
        let request_public_key_option = format!(
            "{}{}{}",
            OPERATION_FETCHING_KEYS,
            OPERATION_SEPARATOR,
            verification_key_option_string
        );

        util_socket.send(request_public_key_option).map_err(ZkPassHostError::ZkPassSocketError)?;

        let verification_public_keys_json = util_socket
            .receive()
            .map_err(ZkPassHostError::ZkPassSocketError)?;
        let verification_public_keys: VerificationPublicKeys = json_to_object(
            verification_public_keys_json
        )?;

        info!("Public key option received");
        Ok(verification_public_keys)
    } else {
        return Err(
            ZkPassHostError::ZkPassSocketError(
                ZkPassSocketError::CustomError("Util socket is None".to_string())
            )
        );
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::mocks::*;
    use zkpass_core::interface::{ KeysetEndpoint, PublicKey };
    use zkpass_svc_common::interface::socket::SocketConnection;

    #[test]
    fn test_extract_public_key() {
        let dvr_key = PublicKey {
            x: "x".to_string(),
            y: "y".to_string(),
        };
        let verification_public_keys_option = get_verification_public_key_option();
        let verification_public_keys = extract_public_key(verification_public_keys_option);
        assert_eq!(verification_public_keys.dvr_key, dvr_key);
        assert_eq!(verification_public_keys.user_data_key, PublicKey {
            x: "".to_string(),
            y: "".to_string(),
        });
    }

    #[test]
    fn test_should_request_public_key_option() {
        let verification_public_keys_option = get_verification_public_key_option();
        let result = should_request_public_key_option(verification_public_keys_option);
        assert!(result.is_ok());

        let (should_request_flag, request_verification_key_option) = result.unwrap();
        assert_eq!(should_request_flag, true);
        assert_eq!(request_verification_key_option.dvr_public_key_option, None);
        assert!(request_verification_key_option.user_data_public_key_option.is_some());
        assert_eq!(
            request_verification_key_option.user_data_public_key_option.unwrap(),
            PublicKeyOption::KeysetEndpoint(KeysetEndpoint {
                jku: "jku".to_string(),
                kid: "kid".to_string(),
            })
        );
    }

    #[tokio::test]
    async fn test_server_request_public_key_option() {
        let socket: Box<dyn SocketConnection> = Box::new(MockSocketConnection::new("".to_string()));
        let arc_socket = Arc::new(Mutex::new(RefCell::new(Some(socket))));
        let verification_key_option = get_verification_public_key_option();
        let result = server_request_public_key_option(arc_socket, verification_key_option).await;
        assert!(result.is_ok());

        let verification_public_keys = result.unwrap();
        assert_eq!(verification_public_keys.dvr_key, PublicKey {
            x: "dvr_public_key_x".to_string(),
            y: "dvr_public_key_y".to_string(),
        });
        assert_eq!(verification_public_keys.user_data_key, PublicKey {
            x: "user_data_public_key_x".to_string(),
            y: "user_data_public_key_y".to_string(),
        });
    }
}
