/*
 * local.rs
 * this file is the actual local implementation for zkpass-host
 * including initialization and processing the generate-proof
 * using local file socket
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
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
use std::os::unix::net::UnixStream;
use std::sync::Arc;
use std::cell::RefCell;

use clap::ArgMatches;
use tokio::sync::Mutex;
use zkpass_svc_common::interface::errors::{ ZkPassHostError, ZkPassSocketError };
use zkpass_svc_common::interface::socket::{
    Client,
    Server,
    SocketConnection,
    DEFAULT_ZKPASS_LOCAL_SOCKET_FILE,
    DEFAULT_ZKPASS_UTIL_LOCAL_SOCKET_FILE,
};
use tracing::info;

use crate::server::process_client::process_client;

pub async fn local_socket(
    args: &ArgMatches,
    arc_util_socket: Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>
) -> Result<(), ZkPassHostError> {
    let socket_path: String = args
        .value_of("ipc-path")
        .map(|s| s.to_string())
        .unwrap_or_else(|| DEFAULT_ZKPASS_LOCAL_SOCKET_FILE.to_owned());

    Server::local_socket_listener_with_util::<ZkPassHostError, _, _>(
        &socket_path,
        arc_util_socket,
        handle_client
    ).await.map_err(ZkPassHostError::ZkPassSocketError)?;
    Ok(())
}

async fn handle_client(
    stream: UnixStream,
    util_socket: Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>
) -> Result<(), ZkPassHostError> {
    info!("Accepted connection from client");

    let mut socket: Box<dyn SocketConnection> = Server::local_socket(stream).map_err(
        ZkPassHostError::ZkPassSocketError
    )?;
    process_client(&mut socket, util_socket).await?;
    Ok(())
}

pub async fn init_util_socket(
    args: &ArgMatches
) -> Result<Box<dyn SocketConnection>, ZkPassHostError> {
    let util_socket_path: String = args
        .value_of("ipc-util-path")
        .map(|s| s.to_string())
        .unwrap_or_else(|| DEFAULT_ZKPASS_UTIL_LOCAL_SOCKET_FILE.to_owned());
    let option_util_socket: Option<Box<dyn SocketConnection>> = Client::local_socket(
        &util_socket_path,
        None
    ).await.map_err(ZkPassHostError::ZkPassSocketError)?;

    if let Some(util_socket) = option_util_socket {
        Ok(util_socket)
    } else {
        Err(ZkPassHostError::ZkPassSocketError(ZkPassSocketError::ConnectionError))
    }
}
