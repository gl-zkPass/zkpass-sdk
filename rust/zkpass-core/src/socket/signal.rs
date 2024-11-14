/*
 * signal.rs
 * this file contains signal handling, for now it only handles
 * SIGTERM and SIGINT
 *
 * Authors:
 * Created Date: January 30th 2024
 * -----
 * Last Modified: October 31st 2024
 * -----
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
use tokio::{ signal::unix::{ signal, SignalKind }, select };
use tokio_util::sync::CancellationToken;
use tracing::{ error, info };

use super::globals::SOCKET_FDS;

/// Handle SIGTERM and SIGINT signal to shutdown the application.
/// When SIGTERM or SIGINT signal is received, it will cancel the CancellationToken,
/// thus shutting down the application.
///
/// # Arguments
/// * `term_token` - A CancellationToken that will be used to cancel the application
pub async fn handle_sigterm(term_token: CancellationToken) {
    let mut sigterm = signal(SignalKind::terminate())
        .map_err(|err| {
            error!("Failed to listen to SIGTERM: {}", err);
            err
        })
        .unwrap();
    let mut sigint = signal(SignalKind::interrupt())
        .map_err(|err| {
            error!("Failed to listen to SIGINT: {}", err);
            err
        })
        .unwrap();

    select! {
        _ = sigterm.recv() => info!("Received SIGTERM, shutting down"),
        _ = sigint.recv() => info!("Received SIGINT, shutting down"),
    }
    shutdown(term_token).await;
}

/// Shutdown the application by closing all socket fds.
///
/// # Arguments
/// * `term_token` - A CancellationToken that will will be used to cancel the application
pub async fn shutdown(term_token: CancellationToken) {
    term_token.cancel();

    for fd in SOCKET_FDS.lock().await.iter() {
        unsafe {
            libc::shutdown(*fd, libc::SHUT_RDWR);
            libc::close(*fd);
        }
    }
    info!("Shutting down socket fds");
}

#[cfg(test)]
mod tests {
    use crate::utils::yielding::FixCoverage;
    use super::*;
    use tokio::time::{ sleep, Duration };

    #[tokio::test]
    async fn test_handle_sigterm() {
        let term_token = CancellationToken::new();
        let handle = tokio::spawn(handle_sigterm(term_token.clone()));

        // Simulate receiving SIGTERM signal
        let sigterm_handle = tokio::spawn(async {
            sleep(Duration::from_secs(1)).fix_cov().await;
            unsafe {
                libc::raise(libc::SIGTERM);
            }
        });

        // Wait for the handle to complete
        let _ = sigterm_handle.await;
        let _ = handle.await;

        // Assert that the term_token is cancelled
        assert!(term_token.is_cancelled());
    }
}
