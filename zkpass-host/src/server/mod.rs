/*
 * mod.rs
 * this file consists of how to run `clap` program
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
pub mod generate_proof;
pub mod utils;
pub mod local;
pub mod logger;
pub mod parser;
pub mod process_client;
pub mod public_keys;
#[cfg(target_os = "linux")]
pub mod vsock;

use std::cell::RefCell;
use std::sync::Arc;

use tokio::sync::Mutex;
use zkpass_svc_common::interface::errors::ZkPassHostError;
use zkpass_svc_common::interface::socket::SocketConnection;

use self::local::local_socket;
use self::parser::{ Env, ServerEnvArgs };
#[cfg(target_os = "linux")]
use self::vsock::vsock_socket;

pub async fn create_server(
    server_env_args: ServerEnvArgs,
    util_socket: Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>
) -> Result<(), ZkPassHostError> {
    match server_env_args.env {
        Env::Local => local_socket(&server_env_args.args, util_socket).await,
        #[cfg(target_os = "linux")]
        Env::Vsock => vsock_socket(&server_env_args.args, util_socket).await,
    }
}
