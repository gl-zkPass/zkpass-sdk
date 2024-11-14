/*
 * globals.rs
 * Contains constants and globally accessible values
 *
 * Authors:
 * Created Date: April 18th 2024
 * -----
 * Last Modified: September 6th 2024
 * -----
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

use std::sync::Arc;
use tokio::sync::Mutex;

pub const OPERATION_FETCHING_KEYS: &str = "request_fetching_keys_by_host";
pub const OPERATION_PRINTING_LOGS: &str = "request_printing_logs_by_host";
pub const OPERATION_GENERATE_PROOF: &str = "request_generate_proof";
pub const OPERATION_EXECUTE_APP: &str = "request_execute_app";
pub const OPERATION_PING: &str = "request_ping_to_host";
pub const OPERATION_FETCHING_PRIVATE_KEYS: &str = "request_fetching_private_keys_by_host";
pub const OPERATION_SEPARATOR: &str = "|";

pub const DEFAULT_PING: &str = "PING";
pub const DEFAULT_PONG: &str = "PONG";

pub const MAX_CONNECTION_ATTEMPTS: u64 = 60;
pub const MAX_BYTES_TO_CHECK: usize = 1024;
pub const DEFAULT_RECONNECTION_ATTEMPTS: u64 = 5;
pub const BUFFER_SIZE: usize = 8192;

lazy_static::lazy_static! {
    /// A global variable that contains all socket file descriptors.
    /// This is used to close all socket file descriptors when the application is shutting down.
    pub static ref SOCKET_FDS: Arc<Mutex<Vec<i32>>> = Arc::new(Mutex::new(Vec::new()));
}
