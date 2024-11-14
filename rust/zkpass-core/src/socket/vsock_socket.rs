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
use std::os::fd::AsRawFd;
use std::thread;
use std::time::Duration;
use futures::Future;
use tokio::select;
use tokio_util::sync::CancellationToken;
use tracing::{ error, info, warn };
use vsock::{ VsockAddr, VsockListener, VsockStream };
use crate::socket::globals::SOCKET_FDS;
use super::connection::{ Socket, SocketConnection };
use super::errors::ZkPassSocketError;
use super::globals::{ DEFAULT_RECONNECTION_ATTEMPTS, MAX_CONNECTION_ATTEMPTS };

// Vsock Implementation
#[derive(Debug)]
pub struct Vsock {
    pub stream: VsockStream,
    pub cid: u32,
    pub port: u32,
    reconnection_attempts: u64,
}

impl Vsock {
    fn new(stream: VsockStream, cid: u32, port: u32) -> Self {
        let reconnection_attempts = std::env
            ::var("MAX_RECONNECTION_ATTEMPTS")
            .unwrap_or(DEFAULT_RECONNECTION_ATTEMPTS.to_string())
            .parse::<u64>()
            .unwrap_or(DEFAULT_RECONNECTION_ATTEMPTS);
        Vsock {
            stream,
            cid,
            port,
            reconnection_attempts,
        }
    }
}

/// Implement the SocketConnection trait for Vsock
/// Only need to implement the stream and reconnect functions
impl SocketConnection for Vsock {
    /// Get the stream of the Virtio socket.
    /// The stream is used to read and write data to the Virtio socket.
    /// The stream is a type of VsockStream.
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
            thread::sleep(Duration::from_secs(1));
            let sockaddr = VsockAddr::new(self.cid.clone(), self.port.clone());
            match VsockStream::connect(&sockaddr) {
                Ok(stream) => {
                    self.stream = stream;
                    break;
                }
                Err(_) => {
                    error!("{:?}", ZkPassSocketError::ConnectionError);
                    warn!(
                        "If the error occurs on:\n- zkpass-host, potentially it happens because zkpass-ws is not running or not ready yet,\n- zkpass-ws, potentially it happens because zkpass-host is not running or not ready yet"
                    );
                }
            }
        }
        Ok(())
    }
}

// Socket Constructor
pub struct InternalVsockServer {}
pub struct InternalVsockClient {}

impl InternalVsockServer {
    /// Change VsockStream to SocketConnection
    ///
    /// # Arguments
    /// * `stream` - A VsockStream that will be used to create the socket connection.
    /// * `cid` - A u32 that contains the context id.
    /// * `port` - A u32 that contains the port.
    ///
    /// # Returns
    /// * `Result<Box<dyn SocketConnection>, ZkPassSocketError>` - A result that contains the result of the operation.
    pub fn vsock_socket(
        stream: VsockStream,
        cid: u32,
        port: u32
    ) -> Result<Box<dyn SocketConnection>, ZkPassSocketError> {
        Ok(Box::from(Vsock::new(stream, cid, port)))
    }

    /// Listen to vsock socket.
    /// It will listen until the term_token is cancelled or there is an incoming stream
    ///
    /// # Arguments
    /// * `port` - A u32 that contains the port.
    /// * `listener` - A UnixListener that will be used to listen to the incoming stream
    /// * `operation` - A function that will be executed when there is an incoming stream
    /// * `term_token` - A CancellationToken that will be used to cancel the operation
    ///
    /// # Returns
    /// * `Result<(), ZkPassSocketError>` - A result that contains the result of the operation.
    async fn vsock_stream_listener<T, F, FutOut>(
        port: u32,
        listener: VsockListener,
        operation: F,
        term_token: CancellationToken
    )
        -> Result<(), ZkPassSocketError>
        where
            T: std::fmt::Debug + std::marker::Send + 'static,
            F: FnOnce(VsockStream, u32) -> FutOut + std::marker::Copy,
            FutOut: Future<Output = Result<(), T>>
    {
        // This code below is placed here to prevent the test from stuck
        // on running code, this should not be called because term_token is not cancelled
        if term_token.is_cancelled() {
            println!("Virtio socket is shutting down");
            return Ok(());
        }
        loop {
            let stream: Result<VsockStream, ZkPassSocketError>;
            select! {
                _ = term_token.cancelled() => {
                    info!("Virtio socket is shutting down");
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
                    match operation(stream, port.clone()).await {
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

    /// Encapsulate the vsock_stream_listener function.
    /// It prepares the listener and calls the vsock_stream_listener function
    ///
    /// # Arguments
    /// * `cid` - A u32 that contains the context id.
    /// * `port` - A u32 that contains the port.
    /// * `operation` - A function that will be executed when there is an incoming stream
    /// * `term_token` - A CancellationToken that will be used to cancel the operation
    ///
    /// # Returns
    /// * `Result<(), ZkPassSocketError>` - A result that contains the result of the operation.
    pub async fn listen_vsock_socket<T, F, FutOut>(
        cid: u32,
        port: u32,
        operation: F,
        term_token: CancellationToken
    )
        -> Result<(), ZkPassSocketError>
        where
            T: std::fmt::Debug + std::marker::Send + 'static,
            F: FnOnce(VsockStream, u32) -> FutOut + std::marker::Copy,
            FutOut: Future<Output = Result<(), T>>
    {
        let listener = prepare_vsock_socket(cid, port).await?;
        InternalVsockServer::vsock_stream_listener::<T, F, FutOut>(
            port,
            listener,
            operation,
            term_token
        ).await?;
        Ok(())
    }
}

impl InternalVsockClient {
    /// Connect to the vsock socket.
    /// When connect successfully, it will return the VsockSocket.
    fn vsock_connect(cid: u32, port: u32) -> Option<Box<dyn SocketConnection>> {
        let sockaddr = VsockAddr::new(cid, port);
        match VsockStream::connect(&sockaddr) {
            Ok(stream) => {
                info!("Client connected!");
                let virtio_socket = Vsock::new(stream, cid, port);
                let socket: Box<dyn SocketConnection + 'static> = Box::from(virtio_socket);
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

    /// Encapsulate the vsock_connect function.
    /// It tries to connect to the vsock socket multiple times.
    /// By default, it will try to connect 60 times.
    ///
    /// # Arguments
    /// * `socket_path` - A string that contains the path of the socket
    /// * `term_token` - A CancellationToken that will be used to cancel the operation
    ///
    /// # Returns
    /// * `Result<Option<Box<dyn SocketConnection>>, ZkPassSocketError>` - A result that contains the result of the operation.
    pub async fn vsock_socket(
        cid: u32,
        port: u32,
        term_token: Option<CancellationToken>
    ) -> Result<Option<Box<dyn SocketConnection>>, ZkPassSocketError> {
        for _i in 0..MAX_CONNECTION_ATTEMPTS {
            if let Some(term_token) = term_token.clone() {
                select! {
                    _ = term_token.cancelled() => {
                        info!("Terminating virtio socket trying to connect...");
                        return Ok(None);
                    }
                    stream = async {
                        InternalVsockClient::vsock_connect(cid, port)
                    } => {
                        if stream.is_some() {
                            return Ok(stream);
                        }
                    }
                }
            } else {
                if let Some(stream) = InternalVsockClient::vsock_connect(cid, port) {
                    return Ok(Some(stream));
                }
            }
            //sleep before trying to connect again
            thread::sleep(Duration::from_secs(1));
        }
        Err(ZkPassSocketError::ConnectionError)
    }
}

/// Prepare the vsock socket.
/// It will bind the socket to the address and return the listener.
/// If the binding fails, it will return an error.
/// The socket file descriptor will be stored in the SOCKET_FDS.
///
/// # Arguments
/// * `cid` - A u32 that contains the context id.
/// * `port` - A u32 that contains the port.
///
/// # Returns
/// * `Result<VsockListener, ZkPassSocketError>` - A result that contains the listener.
async fn prepare_vsock_socket(cid: u32, port: u32) -> Result<VsockListener, ZkPassSocketError> {
    let addr = VsockAddr::new(cid, port);
    let listener = VsockListener::bind(&addr).map_err(|_| ZkPassSocketError::SocketBindingError)?;
    SOCKET_FDS.lock().await.push(listener.as_raw_fd());
    info!("Server listening ...");
    Ok(listener)
}
