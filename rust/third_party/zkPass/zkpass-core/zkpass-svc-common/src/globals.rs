/*
 * globals.rs
 * Contains constants and globally accessible values
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * Created Date: April 18th 2024
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

use std::sync::Arc;

use tokio::sync::Mutex;

pub const MAX_CONNECTION_ATTEMPTS: u64 = 60;
pub const DEFAULT_RECONNECTION_ATTEMPTS: u64 = 5;
pub const BUFFER_SIZE: usize = 8192;

lazy_static::lazy_static! {
    pub static ref SOCKET_FDS: Arc<Mutex<Vec<i32>>> = Arc::new(Mutex::new(Vec::new()));
}
