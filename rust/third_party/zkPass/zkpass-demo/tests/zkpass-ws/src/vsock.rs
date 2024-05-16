/*
 * vsock.rs
 * this file is the actual vsock implementation for zkpass-ws
 * including request to zkpass-host to get the zkpass-proof-token
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
use tracing::{ error, info };
use tokio_util::sync::CancellationToken;
use vsock::VsockStream;
use zkpass_svc_common::interface::errors::ZkPassSocketError;
use zkpass_svc_common::interface::socket::{ Client, Server, SocketConnection, VMADDR_CID_INSTANCE };

use crate::client_helper::perform_client_helper;
use crate::utils::{ get_localized_socket_error_message, MAIN_SOCKET };

pub async fn client_socket(
    cid: u32,
    port: u32,
    term_token: CancellationToken
) -> Result<(), ZkPassSocketError> {
    let stream: Option<Box<dyn SocketConnection>> = Client::vsock_socket(
        cid.clone(),
        port.clone(),
        Some(term_token.clone())
    ).await?;

    if stream.is_some() {
        let mut guard = MAIN_SOCKET.write().await;
        *guard = stream;
    } else {
        info!("Virtio socket trying to connect, terminated");
    }
    Ok(())
}

pub async fn client_helper(
    port: u32,
    term_token: CancellationToken
) -> Result<(), ZkPassSocketError> {
    Server::vsock_socket_listener::<ZkPassSocketError, _, _>(
        VMADDR_CID_INSTANCE,
        port,
        client_listen_helper,
        term_token.clone()
    ).await?;

    info!("Virtio socket helper listener terminated");
    Ok(())
}

async fn client_listen_helper(stream: VsockStream, port: u32) -> Result<(), ZkPassSocketError> {
    info!("Accepted connection to client helper");
    let mut socket: Box<dyn SocketConnection> = Server::vsock_socket(
        stream,
        VMADDR_CID_INSTANCE,
        port
    )?;
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
