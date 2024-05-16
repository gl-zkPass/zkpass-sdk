/*
 * generate_proof.rs
 * this file consists of how zkpass-host generate zkpass proof
 * as requested from zkpass-ws
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
use std::{ cell::RefCell, panic::catch_unwind, sync::Arc };

use futures::executor::block_on;
use tokio::sync::Mutex;
use tracing::info;
use zkpass_core::interface::{ PublicKeyOption, ZkPassError };
use zkpass_svc_common::interface::{
    errors::{ ZkPassHostError, ZkPassSocketError },
    socket::SocketConnection,
    RequestGenerateProof,
    RequestGenerateProofResult,
    VerificationPublicKeyOption,
};

use crate::{
    generate_zkpass_proof::generate_zkpass_proof,
    keys::get_zkpass_key,
    server::public_keys::extract_public_key,
};

use super::{
    public_keys::{ server_request_public_key_option, should_request_public_key_option },
    utils::{
        check_or_retrieve_private_keys,
        decrypt_tokens,
        json_to_object,
        request_verification_keyset,
        DecryptedTokens,
    },
};

async fn server_request_generate_proof(
    request_generate_proof_json: &str
) -> Result<RequestGenerateProofResult, ZkPassHostError> {
    info!("Server request RequestGenerateProof");
    // client - server: get generate proof request
    let request_generate_proof_object: RequestGenerateProof = json_to_object(
        request_generate_proof_json.to_string()
    )?;

    // server: decrypt and parse dvr & user_data token
    let decrypted_tokens: DecryptedTokens = decrypt_tokens(
        request_generate_proof_object.clone()
    ).await.map_err(|err| ZkPassHostError::ZkPassError(err))?;

    // server - client: sent request dvr and user data verification key
    let verification_keyset_object: VerificationPublicKeyOption = request_verification_keyset(
        &decrypted_tokens.dvr_token
    )?;

    info!("Server requested RequestGenerateProof");
    Ok(RequestGenerateProofResult {
        request_generate_proof: request_generate_proof_object,
        verification_public_keys_option: verification_keyset_object,
    })
}

async fn server_process_generate_proof(
    socket: &mut Box<dyn SocketConnection>,
    request_generate_proof_result: RequestGenerateProofResult
) -> Result<(), ZkPassHostError> {
    info!("Server processing generate proof");
    let request_generate_proof = request_generate_proof_result.request_generate_proof;
    let (dvr_token, user_data_token) = request_generate_proof.into();

    // client - server: get dvr and user data verification key
    let verification_public_keys_option =
        request_generate_proof_result.verification_public_keys_option;
    let verification_public_keys = extract_public_key(verification_public_keys_option);

    // server: process generate proof, create zkPassProof Object, sign zkPassProof
    let (decrypting_key, signing_key, signing_key_ep) = get_zkpass_key().await;
    let result = catch_unwind(||
        block_on(
            generate_zkpass_proof(
                &user_data_token,
                &dvr_token,
                verification_public_keys,
                decrypting_key.as_str(),
                signing_key.as_str(),
                &signing_key_ep
            )
        )
    );
    let zkpass_proof = (match result {
        Ok(zkpass_proof) => Ok(zkpass_proof),
        Err(err) => {
            let error_message: String;
            if let Some(err) = err.downcast_ref::<&str>() {
                error_message = err.to_string();
            } else if let Some(err) = err.downcast_ref::<String>() {
                error_message = err.to_string();
            } else {
                error_message = "Unknown panic payload".to_string();
            }
            Err(ZkPassHostError::ZkPassError(ZkPassError::CustomError(error_message)))
        }
    })?.map_err(ZkPassHostError::ZkPassError)?;

    // server - client: sent signed zkPass proof
    let bytes = serde_json
        ::to_string(&zkpass_proof)
        .map_err(|e| {
            ZkPassHostError::ZkPassSocketError(ZkPassSocketError::SerializeError(format!("{}", e)))
        })?;
    info!("Server done generate proof");

    socket
        .send(bytes.clone())
        .map_err(|err| {
            ZkPassHostError::ZkPassSocketError(ZkPassSocketError::CustomError(err.to_string()))
        })?;

    info!("ZkPassProof sent");
    Ok(())
}

pub async fn server_generate_proof(
    socket: &mut Box<dyn SocketConnection>,
    arc_util_socket: Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>,
    request_generate_proof_json: &str
) -> Result<(), ZkPassHostError> {
    //is private keys empty?
    check_or_retrieve_private_keys(arc_util_socket.clone()).await?;

    //decrypt tokens
    let mut request_generate_proof_result_object: RequestGenerateProofResult =
        server_request_generate_proof(request_generate_proof_json).await.map_err(|err| {
            let _ = socket.send(err.to_string());
            err
        })?;

    //should request keys from ws?
    let verification_key_option =
        request_generate_proof_result_object.verification_public_keys_option.clone();
    let (should_request_flag, request_public_key_option) =
        should_request_public_key_option(verification_key_option)?;
    if should_request_flag {
        let requested_keys = server_request_public_key_option(
            arc_util_socket,
            request_public_key_option
        ).await.map_err(|err| {
            let _ = socket.send(err.to_string());
            err
        })?;
        if !requested_keys.dvr_key.x.is_empty() && !requested_keys.dvr_key.y.is_empty() {
            request_generate_proof_result_object.verification_public_keys_option.dvr_public_key_option =
                Some(PublicKeyOption::PublicKey(requested_keys.dvr_key));
        }
        if !requested_keys.user_data_key.x.is_empty() && !requested_keys.user_data_key.y.is_empty() {
            request_generate_proof_result_object.verification_public_keys_option.user_data_public_key_option =
                Some(PublicKeyOption::PublicKey(requested_keys.user_data_key));
        }
    }

    server_process_generate_proof(socket, request_generate_proof_result_object).await.map_err(
        |err| {
            let _ = socket.send(err.to_string());
            err
        }
    )?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::keys::HOST_KEY_PAIRS;
    use crate::mocks::*;
    use serial_test::serial;
    use zkpass_svc_common::interface::socket::SocketConnection;
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
    async fn test_server_generate_proof() {
        let mock_host_key_pairs = inject_mock_host_key_pairs().await;
        let mut socket: Box<dyn SocketConnection> = Box::new(
            MockSocketConnection::new("".to_string())
        );
        let arc_util_socket = Arc::new(Mutex::new(RefCell::new(None)));

        let request_generate_proof = get_request_generate_proof(mock_host_key_pairs);
        let request_generate_proof = serde_json::to_string(&request_generate_proof).unwrap();
        let result = server_generate_proof(
            &mut socket,
            arc_util_socket,
            request_generate_proof.as_str()
        ).await;
        assert!(result.is_ok());
    }
}
