/*
 * main.rs
 * this file is the main file of zkpass-ws that runs using `clap` and
 * its endpoints registered
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: November 30th 2023
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
 *   [1] https://nunomaduro.com/load_environment_variables_from_dotenv_files_in_your_rust_program
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
mod api_key;
mod cache;
mod client_check;
mod client_helper;
mod health_check;
mod jwks;
mod guard;
mod logger;
mod local;
mod rabbitmq;
mod route_handlers;
mod utils;
mod localization;
mod keys;
mod v1;
mod mocks;
#[cfg(target_os = "linux")]
mod vsock;

use rabbitmq::receive_msg;
use std::{ path::PathBuf, time::Duration };
use tokio_util::sync::CancellationToken;

use actix_web::{ web, App, HttpServer };
#[cfg(target_os = "linux")]
use vsock::{ client_socket as vsock_client_socket, client_helper as vsock_client_helper };
#[cfg(target_os = "linux")]
use utils::parse_arg_vsock;

use crate::{
    api_key::retrieve_api_key,
    guard::ApiGuard,
    local::{ client_helper as local_client_helper, client_socket as local_client_socket },
    logger::Logger,
    route_handlers::*,
    utils::{ create_app, initialize_tracing, is_rabbitmq_enabled },
    v1::service::service as v1_service,
};

use tracing::{ error, info };
use zkpass_svc_common::interface::{
    errors::{ ZkPassSocketError, ZkPassUtilError },
    signal::handle_sigterm,
};

pub const DEFAULT_SERVER_URL: &str = "0.0.0.0:10888";
pub const STAGING_SERVER_URL: &str = "https://staging-zkpass.ssi.id";
const DEFAULT_WORKERS: u8 = 2;
const DEFAULT_CLIENT_REQUEST_TIMEOUT: u8 = 60;

#[tokio::main]
async fn main() -> Result<(), ZkPassSocketError> {
    initialize_tracing();
    info!("zkpass-ws started");

    let my_path = PathBuf::from("./zkpass-ws/.env");
    dotenvy::from_path(my_path.as_path()).ok();
    retrieve_api_key().await;

    let term_token = CancellationToken::new();
    let signal_handler_handle = tokio::spawn(handle_sigterm(term_token.clone()));

    let app = create_app();
    let args = app.get_matches();
    let http_server_url: String;
    let mut handles = vec![];
    match args.subcommand() {
        Some(("local", args)) => {
            let port: Option<u16> = args.value_of("port").map(|s| s.parse().unwrap());

            http_server_url = if let Some(port) = port {
                format!("0.0.0.0:{}", port)
            } else {
                DEFAULT_SERVER_URL.to_string()
            };

            //spawn a util socket / host helper
            let client_helper_handler = tokio::spawn(
                local_client_helper(term_token.clone(), args.clone())
            );
            //try to connect to host
            let client_main_socket_handler = tokio::spawn(
                local_client_socket(term_token.clone(), args.clone())
            );
            handles.push(client_helper_handler);
            handles.push(client_main_socket_handler);
        }
        #[cfg(target_os = "linux")]
        Some(("vsock", args)) => {
            http_server_url = DEFAULT_SERVER_URL.to_string();
            let (cid, port, util_port) = parse_arg_vsock(args).unwrap();
            //spawn a util socket / host helper
            let client_helper_handler = tokio::spawn(
                vsock_client_helper(util_port.clone(), term_token.clone())
            );
            //try to connect to host
            let client_main_socket_handler = tokio::spawn(
                vsock_client_socket(cid, port, term_token.clone())
            );
            handles.push(client_helper_handler);
            handles.push(client_main_socket_handler);
        }
        Some(_) | None => {
            error!("Invalid subcommand or missing subcommand. Please provide a valid subcommand.");
            std::process::exit(1);
        }
    }

    let mut rabbit_handle: tokio::task::JoinHandle<Result<(), ZkPassUtilError>> = tokio::spawn(
        async move {
            Ok(())
        }
    );
    if is_rabbitmq_enabled() {
        let rabbit_term_token = term_token.clone();
        rabbit_handle = tokio::spawn(receive_msg(rabbit_term_token));
    }

    let workers = std::env
        ::var("MAX_WORKERS")
        .unwrap_or(DEFAULT_WORKERS.to_string())
        .parse::<u8>()
        .unwrap_or(DEFAULT_WORKERS);

    let client_request_timeout = std::env
        ::var("CLIENT_REQUEST_TIMEOUT")
        .unwrap_or(DEFAULT_CLIENT_REQUEST_TIMEOUT.to_string())
        .parse::<u8>()
        .unwrap_or(DEFAULT_CLIENT_REQUEST_TIMEOUT);

    info!("Running on {}, with timeout {}", http_server_url, client_request_timeout);
    HttpServer::new(move || {
        App::new()
            .wrap(Logger)
            // common routes
            .route("/healthcheck", web::get().to(healthcheck))
            .route("/public-keys", web::post().guard(ApiGuard).to(get_public_keys))
            .route("/public-key", web::delete().guard(ApiGuard).to(remove_cached_public_keys))
            .route("/.well-known/jwks.json", web::get().to(get_jwks))
            // v1 service
            .service(v1_service())
            .default_service(web::route().to(default_service))
    })
        .workers(workers.into())
        .client_request_timeout(Duration::from_secs(client_request_timeout.into()))
        .bind(http_server_url)
        .expect("Cannot bind to the url")
        .run().await
        .unwrap();

    for handle in handles {
        handle.await.unwrap()?;
    }
    rabbit_handle.await.unwrap().map_err(|err| ZkPassSocketError::UtilError(err))?;
    signal_handler_handle.await.unwrap();

    info!("all threads are joined, zkpass-ws stopped");
    Ok(())
}
