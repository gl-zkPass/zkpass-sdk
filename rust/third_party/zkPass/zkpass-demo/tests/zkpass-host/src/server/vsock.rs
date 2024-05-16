/*
 * vsock.rs
 * this file is the actual vsock implementation for zkpass-host
 * including initialization and processing the generate-proof
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
use clap::ArgMatches;
use tokio::sync::Mutex;
use std::sync::Arc;
use std::cell::RefCell;
use vsock::VsockStream;
use zkpass_svc_common::interface::errors::{ ZkPassHostError, ZkPassSocketError };
use zkpass_svc_common::interface::socket::{
    Client,
    Server,
    SocketConnection,
    VMADDR_CID_ANY,
    VMADDR_CID_INSTANCE,
    DEFAULT_HOST_PORT,
    DEFAULT_UTIL_PORT,
};
use tracing::{ info, error };

use crate::server::process_client::process_client;

use super::parser::parse_arg;

pub async fn vsock_socket(
    args: &ArgMatches,
    util_socket: Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>
) -> Result<(), ZkPassHostError> {
    let port = parse_arg(&args, "port").unwrap_or_else(|_| {
        error!("port is not specified, using default port {}", DEFAULT_HOST_PORT);
        DEFAULT_HOST_PORT
    });

    Server::vsock_socket_listener_with_util::<ZkPassHostError, _, _>(
        VMADDR_CID_ANY,
        port,
        util_socket,
        handle_client
    ).await.map_err(ZkPassHostError::ZkPassSocketError)?;
    Ok(())
}

async fn handle_client(
    stream: VsockStream,
    port: u32,
    util_socket: Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>
) -> Result<(), ZkPassHostError> {
    info!("Accepted connection from client");

    let mut socket: Box<dyn SocketConnection> = Server::vsock_socket(
        stream,
        VMADDR_CID_ANY,
        port
    ).map_err(ZkPassHostError::ZkPassSocketError)?;
    process_client(&mut socket, util_socket).await?;
    Ok(())
}

pub async fn init_util_socket(
    args: &ArgMatches
) -> Result<Box<dyn SocketConnection>, ZkPassHostError> {
    let util_port = parse_arg(&args, "util-port").unwrap_or_else(|_| {
        error!("util port is not specified, using default port {}", DEFAULT_UTIL_PORT);
        DEFAULT_UTIL_PORT
    });

    let option_util_socket: Option<Box<dyn SocketConnection>> = Client::vsock_socket(
        VMADDR_CID_INSTANCE,
        util_port,
        None
    ).await.map_err(ZkPassHostError::ZkPassSocketError)?;

    if let Some(util_socket) = option_util_socket {
        Ok(util_socket)
    } else {
        Err(ZkPassHostError::ZkPassSocketError(ZkPassSocketError::ConnectionError))
    }
}
