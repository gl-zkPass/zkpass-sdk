/*
 * main.rs
 * this file is the main file of zkpass-host that runs using `clap`
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
use clap::{ App, AppSettings, Arg, SubCommand, ArgMatches };
use keys::request_private_keys_to_ws;
use tokio::sync::Mutex;
use std::cell::RefCell;
use std::sync::Arc;

mod generate_zkpass_proof;
mod keys;
mod mocks;
mod server;
mod test;

use server::{ create_server, local::init_util_socket as local_init_util_socket };

#[allow(unused_imports)]
use server::logger::SocketLayer;

#[cfg(target_os = "linux")]
use server::vsock::init_util_socket as vsock_init_util_socket;
use server::parser::ServerEnvArgs;
use tracing::{ info, error };
use tracing_core::LevelFilter;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::EnvFilter;
#[allow(unused_imports)]
use tracing_subscriber::layer::SubscriberExt;
use zkpass_svc_common::interface::errors::ZkPassSocketError;
use zkpass_svc_common::interface::{ errors::ZkPassHostError, socket::SocketConnection };

fn initialize_tracing(_util_socket: Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>) {
    let filter = EnvFilter::try_from_default_env()
        .or_else(|_| EnvFilter::try_new("INFO"))
        .unwrap();

    /* NOTE:
     * socket_layer variable below is now commented out because it caused socket lock to be poisoned on
     * staging environment, related to issue https://github.com/GDP-ADMIN/zkPass/issues/255 .
     * until logger improvement is found, it is better to comment it out
     *
     * commented codes:
     *
     * let socket_layer = SocketLayer::new(util_socket);
     * tracing_subscriber::fmt
     *     ::fmt()
     *     .with_env_filter(filter)
     *     .with_max_level(LevelFilter::INFO)
     *     .with_ansi(false)
     *     .finish()
     *     .with(socket_layer)
     *     .init();
     */

    tracing_subscriber::fmt
        ::fmt()
        .with_env_filter(filter)
        .with_max_level(LevelFilter::INFO)
        .with_ansi(false)
        .finish()
        .init();
}

async fn initialize_util_socket(
    args: &ArgMatches,
    socket: Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>
) -> Result<(), ZkPassHostError> {
    match args.subcommand() {
        Some(("local", args)) => {
            let util_socket = local_init_util_socket(args).await?;
            let mut guard = socket.lock().await;
            *guard = RefCell::new(Some(util_socket));
            drop(guard);

            request_private_keys_to_ws(socket.clone()).await?;
            Ok(())
        }
        #[cfg(target_os = "linux")]
        Some(("vsock", args)) => {
            let util_socket = vsock_init_util_socket(args).await?;
            let mut guard = socket.lock().await;
            *guard = RefCell::new(Some(util_socket));
            drop(guard);

            request_private_keys_to_ws(socket.clone()).await?;
            Ok(())
        }
        Some(_) | None => {
            Err(
                ZkPassHostError::ZkPassSocketError(
                    ZkPassSocketError::CustomError("Cannot initialize util socket".to_string())
                )
            )
        }
    }
}

fn create_app() -> App<'static> {
    App::new("zkPass Host")
        .about("Hello world example for zkPass Host server and client communication")
        .setting(AppSettings::ArgRequiredElseHelp)
        .version(env!("CARGO_PKG_VERSION"))
        .subcommand(
            SubCommand::with_name("local")
                .about("Listen on a local environment")
                .arg(
                    Arg::with_name("ipc-path")
                        .long("ipc-path")
                        .help("The ipc path to bind the local socket to")
                        .takes_value(true)
                        .value_name("FILE")
                )
                .arg(
                    Arg::with_name("ipc-util-path")
                        .long("ipc-util-path")
                        .help("The ipc util path to bind the local utilization socket to")
                        .takes_value(true)
                        .value_name("FILE")
                )
        )
        .subcommand(
            SubCommand::with_name("vsock")
                .about("Listen on a vsock environment")
                .arg(
                    Arg::with_name("port")
                        .long("port")
                        .help("port")
                        .takes_value(true)
                        .required(true)
                )
                .arg(
                    Arg::with_name("util-port")
                        .long("util-port")
                        .help("util-port")
                        .takes_value(true)
                        .required(false)
                )
        )
}

#[tokio::main]
async fn main() {
    let app = create_app();
    let args = app.get_matches();

    let util_socket: Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>> = Arc::new(
        Mutex::new(RefCell::new(None))
    );
    initialize_tracing(util_socket.clone());
    let _ = initialize_util_socket(&args, util_socket.clone()).await;
    info!("zkpass-host started");

    match args.subcommand() {
        Some(("local", args)) => {
            let server_args = ServerEnvArgs::new_with("local", args).unwrap();
            match create_server(server_args, util_socket.clone()).await {
                Ok(_) => {}
                Err(err) => error!("{:?}", err),
            };
        }
        #[cfg(target_os = "linux")]
        Some(("vsock", args)) => {
            let server_args = ServerEnvArgs::new_with("vsock", args).unwrap();
            match create_server(server_args, util_socket.clone()).await {
                Ok(_) => {}
                Err(err) => error!("{:?}", err),
            };
        }
        Some(_) | None => {}
    }
}
