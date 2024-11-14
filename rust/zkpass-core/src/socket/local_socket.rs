/*
 * socket.rs
 * this file is an internal file which is encapsulate the use of sockets
 * contains both initilization and implementation of how each sockets
 * communicates
 *
 * Authors:
 * Created Date: November 30th 2023
 * -----
 * Last Modified: November 1st 2024
 * -----
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
use std::io::Error;
use std::os::fd::AsRawFd;
use std::os::unix::net::{ UnixListener, UnixStream };
use futures::Future;
use std::thread;
use std::time::Duration;
use tokio::fs::{ self, remove_file };
use tokio::select;
use tokio_util::sync::CancellationToken;
use tracing::{ error, info, warn };
use crate::socket::errors::ZkPassSocketError;
use crate::socket::globals::SOCKET_FDS;
use super::connection::{ Socket, SocketConnection };
use super::globals::{ DEFAULT_RECONNECTION_ATTEMPTS, MAX_CONNECTION_ATTEMPTS };

// Local Implementation
#[derive(Debug)]
pub struct LocalSocket {
    pub stream: UnixStream,
    path: String,
    reconnection_attempts: u64,
}

impl LocalSocket {
    fn new(stream: UnixStream, path: String) -> Self {
        let reconnection_attempts = std::env
            ::var("MAX_RECONNECTION_ATTEMPTS")
            .unwrap_or(DEFAULT_RECONNECTION_ATTEMPTS.to_string())
            .parse::<u64>()
            .unwrap_or(DEFAULT_RECONNECTION_ATTEMPTS);
        LocalSocket {
            stream,
            path,
            reconnection_attempts,
        }
    }
}

/// Implement the SocketConnection trait for LocalSocket
/// Only need to implement the stream and reconnect functions
impl SocketConnection for LocalSocket {
    /// Get the stream of the local socket.
    /// The stream is used to read and write data to the local socket.
    /// The stream is a type of UnixStream.
    fn stream(&mut self) -> &mut dyn Socket {
        &mut self.stream
    }

    /// Reconnect to the socket.
    /// This function will try to reconnect to the socket. by default, it will try to reconnect 5 times.
    ///
    /// # Returns
    /// * `Result<(), ZkPassSocketError>` - A result that contains the result of the operation.
    fn reconnect(self: &mut Self) -> Result<(), ZkPassSocketError> {
        for _i in 0..self.reconnection_attempts {
            match UnixStream::connect(self.path.clone()) {
                Ok(stream) => {
                    self.stream = stream;
                    info!("Client reconnected!");
                    break;
                }
                Err(_) => {
                    error!("{:?}", ZkPassSocketError::ConnectionError);
                    warn!(
                        "If the error occurs on:\n- zkpass-host, potentially it happens because zkpass-ws is not running or not ready yet,\n- zkpass-ws, potentially it happens because zkpass-host is not running or not ready yet"
                    );
                }
            }
            thread::sleep(Duration::from_secs(1));
        }
        Ok(())
    }
}

// Socket Constructor
pub struct InternalLocalServer {}
pub struct InternalLocalClient {}

impl InternalLocalServer {
    /// Change UnixStream to SocketConnection
    ///
    /// # Arguments
    /// * `stream` - A UnixStream that will be converted to SocketConnection
    ///
    /// # Returns
    /// * `Result<Box<dyn SocketConnection>, ZkPassSocketError>` - A result that contains the result of the operation.
    pub fn local_socket(
        stream: UnixStream
    ) -> Result<Box<dyn SocketConnection>, ZkPassSocketError> {
        let local_addr = stream.local_addr().unwrap();
        let path = local_addr.as_pathname().unwrap().to_str().unwrap().to_string();
        Ok(Box::from(LocalSocket::new(stream, path)))
    }

    /// Listen to local socket.
    /// It will listen until the term_token is cancelled or there is an incoming stream
    ///
    /// # Arguments
    /// * `listener` - A UnixListener that will be used to listen to the incoming stream
    /// * `operation` - A function that will be executed when there is an incoming stream
    /// * `term_token` - A CancellationToken that will be used to cancel the operation
    ///
    /// # Returns
    /// * `Result<(), ZkPassSocketError>` - A result that contains the result of the operation.
    async fn local_stream_listener<T, F, FutOut>(
        listener: UnixListener,
        operation: F,
        term_token: CancellationToken
    )
        -> Result<(), ZkPassSocketError>
        where
            T: std::fmt::Debug + std::marker::Send + 'static,
            F: FnOnce(UnixStream) -> FutOut + std::marker::Copy,
            FutOut: Future<Output = Result<(), T>>
    {
        // This code below is placed here to prevent the test from stuck
        // on running code, this should not be called because term_token is not cancelled
        if term_token.is_cancelled() {
            println!("Local socket is shutting down");
            return Ok(());
        }
        loop {
            let stream: Result<UnixStream, ZkPassSocketError>;
            select! {
                _ = term_token.cancelled() => {
                    info!("Local socket is shutting down");
                    break;
                }
                accept_stream = async {
                    match listener.accept() {
                        Ok((stream, _)) => Ok(stream),
                        Err(_) => {
                            Err(ZkPassSocketError::ConnectionError)
                        }
                    }
                } => {
                    stream = accept_stream;
                }
            }
            match stream {
                Ok(stream) => {
                    SOCKET_FDS.lock().await.push(stream.as_raw_fd());
                    match operation(stream).await {
                        Ok(_) => (),
                        Err(err) => {
                            error!("{:?}", err);
                        }
                    }
                }
                Err(_) => {
                    error!("{:?}", ZkPassSocketError::ConnectionError);
                }
            }
        }
        Ok(())
    }

    /// Encapsulate the local_stream_listener function.
    /// It prepares the listener and calls the local_stream_listener function
    ///
    /// # Arguments
    /// * `socket_path` - A string that contains the path of the socket
    /// * `operation` - A function that will be executed when there is an incoming stream
    /// * `term_token` - A CancellationToken that will be used to cancel the operation
    ///
    /// # Returns
    /// * `Result<(), ZkPassSocketError>` - A result that contains the result of the operation.
    pub async fn listen_local_socket<T, F, FutOut>(
        socket_path: &str,
        operation: F,
        term_token: CancellationToken
    )
        -> Result<(), ZkPassSocketError>
        where
            T: std::fmt::Debug + std::marker::Send + 'static,
            F: FnOnce(UnixStream) -> FutOut + std::marker::Copy,
            FutOut: Future<Output = Result<(), T>>
    {
        let listener = prepare_local_socket(socket_path).await.map_err(
            |_| ZkPassSocketError::SocketBindingError
        )?;
        InternalLocalServer::local_stream_listener::<T, F, FutOut>(
            listener,
            operation,
            term_token
        ).await?;
        Ok(())
    }
}

impl InternalLocalClient {
    /// Connect to the local socket.
    /// When connect successfully, it will return the LocalSocket.
    fn local_connect(socket_path: &str) -> Option<Box<dyn SocketConnection>> {
        match UnixStream::connect(socket_path) {
            Ok(stream) => {
                info!("Client connected!");
                let local_socket = LocalSocket::new(stream, socket_path.to_string());
                let socket: Box<dyn SocketConnection + 'static> = Box::from(local_socket);
                Some(socket)
            }
            Err(_) => {
                error!("{:?}", ZkPassSocketError::ConnectionError);
                warn!(
                    "If the error occurs on:\n- zkpass-host, potentially it happens because zkpass-ws is not running or not ready yet,\n- zkpass-ws, potentially it happens because zkpass-host is not running or not ready yet"
                );
                None
            }
        }
    }

    /// Encapsulate the local_connect function.
    /// It tries to connect to the local socket multiple times.
    /// By default, it will try to connect 60 times.
    ///
    /// # Arguments
    /// * `socket_path` - A string that contains the path of the socket
    /// * `term_token` - A CancellationToken that will be used to cancel the operation
    ///
    /// # Returns
    /// * `Result<Option<Box<dyn SocketConnection>>, ZkPassSocketError>` - A result that contains the result of the operation.
    pub async fn local_socket(
        socket_path: &str,
        term_token: Option<CancellationToken>
    ) -> Result<Option<Box<dyn SocketConnection>>, ZkPassSocketError> {
        for _i in 0..MAX_CONNECTION_ATTEMPTS {
            if let Some(term_token) = term_token.clone() {
                select! {
                    _ = term_token.cancelled() => {
                        info!("Terminating local socket trying to connect...");
                        return Ok(None);
                    }
                    stream = async {
                        InternalLocalClient::local_connect(socket_path)
                    } => {
                        if stream.is_some() {
                            return Ok(stream);
                        }
                    }
                }
            } else {
                if let Some(stream) = InternalLocalClient::local_connect(socket_path) {
                    return Ok(Some(stream));
                }
            }
            //sleep before trying to connect again
            thread::sleep(Duration::from_secs(1));
        }
        Err(ZkPassSocketError::ConnectionError)
    }
}

/// Check and create folder.
/// This function will check if the folder exists, if not, it will create the folder.
///
/// # Arguments
/// * `path` - A string that contains the path of the folder
///
/// # Returns
/// * `Result<(), Error>` - A result that contains the result of the operation.
async fn check_and_create_folder(path: &str) -> Result<(), Error> {
    if !path.is_empty() {
        if !path.ends_with('/') {
            let mut components: Vec<&str> = path.split('/').collect();
            components.pop();
            let path = components.join("/") + "/";
            fs::create_dir_all(&path).await?;
        } else {
            fs::create_dir_all(path).await?;
        }
    }
    Ok(())
}

/// Prepare local socket.
/// This function will prepare the local socket like creating folder and removing file before actually creating
/// the local socket file.
///
/// # Arguments
/// * `path` - A string that contains the path of the socket
///
/// # Returns
/// * `Result<UnixListener, ZkPassSocketError>` - A result that contains the result of the operation.
async fn prepare_local_socket(path: &str) -> Result<UnixListener, ZkPassSocketError> {
    check_and_create_folder(path).await.map_err(|_| {
        error!("Error check and create folder");
        ZkPassSocketError::SocketBindingError
    })?;
    remove_file(&path).await.ok();
    let listener = UnixListener::bind(&path).map_err(|_| ZkPassSocketError::SocketBindingError)?;
    SOCKET_FDS.lock().await.push(listener.as_raw_fd());
    info!("Server listening ...");

    Ok(listener)
}
