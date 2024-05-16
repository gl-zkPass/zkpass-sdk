/*
 * local.rs
 * this file is the actual local implementation for zkpass-ws
 * including request to zkpass-host to get the zkpass-proof-token
 * using local file socket
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
 *   [1] https://nunomaduro.com/load_environment_variables_from_dotenv_files_in_your_rust_program
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
use std::os::unix::net::UnixStream;

use clap::ArgMatches;
use tokio_util::sync::CancellationToken;
use tracing::{ error, info };
use zkpass_svc_common::interface::errors::ZkPassSocketError;
use zkpass_svc_common::interface::retrieve_env_var;
use zkpass_svc_common::interface::socket::{
    Client,
    Server,
    SocketConnection,
    DEFAULT_ZKPASS_LOCAL_SOCKET_FILE,
    DEFAULT_ZKPASS_UTIL_LOCAL_SOCKET_FILE,
};

use crate::client_helper::perform_client_helper;
use crate::utils::{ get_localized_socket_error_message, MAIN_SOCKET };

pub async fn client_socket(
    term_token: CancellationToken,
    args: ArgMatches
) -> Result<(), ZkPassSocketError> {
    let socket_path: String = args
        .value_of("ipc-path")
        .map(|s| s.to_string())
        .or_else(|| retrieve_env_var("LOCAL_SOCKET_FILE").ok())
        .unwrap_or_else(|| DEFAULT_ZKPASS_LOCAL_SOCKET_FILE.to_owned());

    let stream: Option<Box<dyn SocketConnection>> = Client::local_socket(
        socket_path.as_str(),
        Some(term_token.clone())
    ).await?;

    if stream.is_some() {
        let mut guard = MAIN_SOCKET.write().await;
        *guard = stream;
    } else {
        info!("Local socket trying to connect, terminated");
    }
    Ok(())
}

pub async fn client_helper(
    term_token: CancellationToken,
    args: ArgMatches
) -> Result<(), ZkPassSocketError> {
    let util_socket_path = args
        .value_of("ipc-util-path")
        .map(|s| s.to_string())
        .or_else(|| retrieve_env_var("UTIL_LOCAL_SOCKET_FILE").ok())
        .unwrap_or_else(|| DEFAULT_ZKPASS_UTIL_LOCAL_SOCKET_FILE.to_owned());

    Server::local_socket_listener::<ZkPassSocketError, _, _>(
        util_socket_path.as_str(),
        client_listen_helper,
        term_token.clone()
    ).await?;

    info!("Local socket helper listener terminated");
    Ok(())
}

async fn client_listen_helper(stream: UnixStream) -> Result<(), ZkPassSocketError> {
    info!("Accepted connection to client helper");
    let mut socket: Box<dyn SocketConnection> = Server::local_socket(stream)?;
    match perform_client_helper(&mut socket).await {
        Ok(_) => Ok(()),
        Err(err) => {
            let localized_error = get_localized_socket_error_message(&err);
            error!("{}", localized_error);
            let bytes = serde_json
                ::to_string(&localized_error)
                .map_err(|_| ZkPassSocketError::SerializeError("".to_string()))?;
            socket.send(bytes)?;
            Err(err)
        }
    }
}
