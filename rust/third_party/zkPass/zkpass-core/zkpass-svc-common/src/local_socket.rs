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
use std::io::{ Error, ErrorKind, Read, Write };
use std::os::fd::AsRawFd;
use std::os::unix::net::{ UnixListener, UnixStream };
use futures::Future;
use std::cell::RefCell;
use std::sync::Arc;
use std::thread;
use std::time::Duration;
use tokio::fs::{ self, remove_file };
use tokio::select;
use tokio::sync::Mutex;
use tokio_util::sync::CancellationToken;
use tracing::{ error, info, warn };

use crate::globals::*;
use crate::interface::errors::ZkPassSocketError;
use crate::interface::socket::SocketConnection;

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

impl SocketConnection for LocalSocket {
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
    pub fn local_socket(
        stream: UnixStream
    ) -> Result<Box<dyn SocketConnection>, ZkPassSocketError> {
        let local_addr = stream.local_addr().unwrap();
        let path = local_addr.as_pathname().unwrap().to_str().unwrap().to_string();
        Ok(Box::from(LocalSocket::new(stream, path)))
    }

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

    async fn local_stream_listener_with_util<T, F, FutOut>(
        listener: UnixListener,
        util_socket: Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>,
        operation: F
    )
        -> Result<(), ZkPassSocketError>
        where
            T: std::fmt::Debug + std::marker::Send + 'static,
            F: FnOnce(
                UnixStream,
                Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>
            ) -> FutOut +
                std::marker::Copy,
            FutOut: Future<Output = Result<(), T>>
    {
        for stream in listener.incoming() {
            match stream {
                Ok(stream) =>
                    match operation(stream, util_socket.clone()).await {
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

    pub async fn listen_local_socket_with_util<T, F, FutOut>(
        socket_path: &str,
        util_socket: Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>,
        operation: F
    )
        -> Result<(), ZkPassSocketError>
        where
            T: std::fmt::Debug + std::marker::Send + 'static,
            F: FnOnce(
                UnixStream,
                Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>
            ) -> FutOut +
                std::marker::Copy,
            FutOut: Future<Output = Result<(), T>>
    {
        let listener = prepare_local_socket(socket_path).await.map_err(
            |_| ZkPassSocketError::SocketBindingError
        )?;
        InternalLocalServer::local_stream_listener_with_util::<T, F, FutOut>(
            listener,
            util_socket,
            operation
        ).await?;
        Ok(())
    }
}

impl InternalLocalClient {
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
