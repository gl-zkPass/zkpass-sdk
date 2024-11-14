/*
 * initiator.rs
 * Initialize tracing for zkpass-host
 *
 * Authors:
 * Created at: September 5th 2024
 * -----
 * Last Modified: September 26th 2024
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
use tracing::level_filters::LevelFilter;
use tracing_subscriber::EnvFilter;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;
use crate::privacy_apps::interface::SocketConnectionMutex;
use super::logger::SocketLayer;

/// Initialize tracing for zkpass-host.
/// the tracing is used for logging the zkpass-host activity
///
/// # Arguments
/// * `util_socket` - utilitiy socket that is used for communication when zkpass-host sending the logs to zkpass-ws (because host is running on nitro)
pub fn initialize_tracing(util_socket: SocketConnectionMutex) {
    // Check if the global default subscriber is already set
    if tracing::dispatcher::has_been_set() {
        return;
    }

    let filter = EnvFilter::try_from_default_env()
        .or_else(|_| EnvFilter::try_new("INFO"))
        .unwrap();

    let socket_layer = SocketLayer::new(util_socket);
    tracing_subscriber::fmt
        ::fmt()
        .with_env_filter(filter)
        .with_max_level(LevelFilter::INFO)
        .with_ansi(false)
        .finish()
        .with(socket_layer)
        .init();
}

#[cfg(test)]
mod tests {
    use std::{ cell::RefCell, sync::Arc };
    use tokio::sync::Mutex;
    use super::*;

    #[test]
    fn test_initialize_tracing() {
        let util_socket = Arc::new(Mutex::new(RefCell::new(None)));
        initialize_tracing(util_socket.clone());
        initialize_tracing(util_socket.clone()); // test for the return statement
    }
}
