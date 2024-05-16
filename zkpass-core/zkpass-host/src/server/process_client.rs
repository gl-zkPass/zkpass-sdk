/*
 * process_client.rs
 * this file is used to process the client requests that are sent from zkpass-ws to zkpass-host
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * Created Date: April 19th 2024
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
use zkpass_svc_common::interface::{
    errors::{ ZkPassHostError, ZkPassSocketError },
    socket::SocketConnection,
    OPERATION_GENERATE_PROOF,
    OPERATION_SEPARATOR,
};

use super::generate_proof::server_generate_proof;

pub async fn process_client(
    socket: &mut Box<dyn SocketConnection>,
    arc_util_socket: Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>
) -> Result<(), ZkPassHostError> {
    loop {
        let operation_name_and_params_json = socket
            .receive()
            .map_err(ZkPassHostError::ZkPassSocketError)?;

        if operation_name_and_params_json.is_empty() {
            // if the connection is closed, the socket will receive empty string (0 KB),
            // then we can break the loop / close the connection
            break;
        }
        let operation_name_and_params: Vec<&str> = operation_name_and_params_json
            .split(OPERATION_SEPARATOR)
            .collect();
        let operation_name = operation_name_and_params[0];
        let operation_parameter = operation_name_and_params[1];
        info!("Operation received: {}", operation_name);

        (match operation_name {
            OPERATION_GENERATE_PROOF =>
                Ok(
                    server_generate_proof(
                        socket,
                        arc_util_socket.clone(),
                        operation_parameter
                    ).await?
                ),
            _ =>
                Err(
                    ZkPassHostError::ZkPassSocketError(
                        ZkPassSocketError::CustomError("Operation is not supported yet".to_string())
                    )
                ),
        })?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::keys::HOST_KEY_PAIRS;
    use crate::mocks::*;
    use serial_test::serial;
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
    async fn test_process_client() {
        inject_mock_host_key_pairs().await;
        let mut socket: Box<dyn SocketConnection> = Box::new(
            MockSocketConnection::new(OPERATION_GENERATE_PROOF.to_string())
        );
        let arc_util_socket = Arc::new(Mutex::new(RefCell::new(None)));
        let result = process_client(&mut socket, arc_util_socket).await;
        assert!(result.is_ok());
    }
}
