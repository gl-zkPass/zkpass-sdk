/*
 * socket.rs
 * this file is an internal file which is encapsulate the use of sockets
 * contains both initilization and implementation of how each sockets
 * communicates
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
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
use std::io::{ ErrorKind, Read, Write };
use std::os::fd::AsRawFd;
use std::cell::RefCell;
use std::sync::Arc;
use std::thread;
use std::time::Duration;
use futures::Future;
use tokio::select;
use tokio::sync::Mutex;
use tokio_util::sync::CancellationToken;
use tracing::{ error, info, warn };
use vsock::{ VsockAddr, VsockListener, VsockStream };

use crate::interface::errors::ZkPassSocketError;
use crate::interface::socket::SocketConnection;
use crate::globals::*;

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

impl SocketConnection for Vsock {
    fn send(self: &mut Self, message: String) -> Result<(), ZkPassSocketError> {
        let message = format!("{}\n", message);
        for chunk in message.as_bytes().chunks(BUFFER_SIZE) {
            match self.stream.write_all(chunk) {
                Ok(_) => (),
                Err(err) => {
                    if err.kind() == ErrorKind::BrokenPipe {
                        self.reconnect()?;
                        self.stream.write_all(chunk).map_err(|_| ZkPassSocketError::WriteError)?;
                    } else {
                        return Err(ZkPassSocketError::WriteError);
                    }
                }
            }
        }
        self.stream.flush().map_err(|_| ZkPassSocketError::WriteError)?;
        Ok(())
    }

    fn receive(self: &mut Self) -> Result<String, ZkPassSocketError> {
        let mut buffer = String::new();
        let mut received_data = String::new();
        loop {
            let mut chunk = vec![0; BUFFER_SIZE];
            let bytes_read = self.stream
                .read(&mut chunk)
                .map_err(|_| ZkPassSocketError::ReadError)?;

            if bytes_read == 0 {
                break;
            }

            let chunk_str = String::from_utf8_lossy(&chunk[0..bytes_read]);
            buffer.push_str(&chunk_str);

            if let Some(end_line_pos) = buffer.rfind('\n') {
                let end_line = buffer.split_off(end_line_pos + 1);
                buffer.truncate(end_line_pos);
                received_data = buffer.clone();
                buffer.clear();
                buffer.push_str(&end_line);
                break;
            }
        }
        if !received_data.to_lowercase().contains("error") {
            Ok(received_data)
        } else {
            Err(ZkPassSocketError::CustomError(received_data))
        }
    }

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
    pub fn vsock_socket(
        stream: VsockStream,
        cid: u32,
        port: u32
    ) -> Result<Box<dyn SocketConnection>, ZkPassSocketError> {
        Ok(Box::from(Vsock::new(stream, cid, port)))
    }

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

    async fn vsock_stream_listener_with_util<T, F, FutOut>(
        port: u32,
        util_socket: Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>,
        listener: VsockListener,
        operation: F
    )
        -> Result<(), ZkPassSocketError>
        where
            T: std::fmt::Debug + std::marker::Send + 'static,
            F: FnOnce(
                VsockStream,
                u32,
                Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>
            ) -> FutOut +
                std::marker::Copy,
            FutOut: Future<Output = Result<(), T>>
    {
        for stream in listener.incoming() {
            match stream {
                Ok(stream) =>
                    match operation(stream, port.clone(), util_socket.clone()).await {
                        Ok(_) => (),
                        Err(err) => {
                            error!("{:?}", err);
                        }
                    }
                Err(err) => {
                    error!("{:?} {:?}", ZkPassSocketError::ConnectionError, err);
                }
            }
        }
        Ok(())
    }

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

    pub async fn listen_vsock_socket_with_util<T, F, FutOut>(
        cid: u32,
        port: u32,
        util_socket: Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>,
        operation: F
    )
        -> Result<(), ZkPassSocketError>
        where
            T: std::fmt::Debug + std::marker::Send + 'static,
            F: FnOnce(
                VsockStream,
                u32,
                Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>
            ) -> FutOut +
                std::marker::Copy,
            FutOut: Future<Output = Result<(), T>>
    {
        let listener = prepare_vsock_socket(cid, port).await?;
        InternalVsockServer::vsock_stream_listener_with_util::<T, F, FutOut>(
            port,
            util_socket,
            listener,
            operation
        ).await?;
        Ok(())
    }
}

impl InternalVsockClient {
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

async fn prepare_vsock_socket(cid: u32, port: u32) -> Result<VsockListener, ZkPassSocketError> {
    let addr = VsockAddr::new(cid, port);
    let listener = VsockListener::bind(&addr).map_err(|_| ZkPassSocketError::SocketBindingError)?;
    SOCKET_FDS.lock().await.push(listener.as_raw_fd());
    info!("Server listening ...");
    Ok(listener)
}
