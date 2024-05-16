/*
 * socket.rs
 * this file is an external file which is contains initilization of each socket
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
use std::{ os::unix::net::UnixStream, sync::Arc };
use std::cell::RefCell;
use std::fmt::Debug;
use tokio::sync::Mutex;
use futures::Future;
use tokio_util::sync::CancellationToken;
#[cfg(target_os = "linux")]
use vsock::VsockStream;

use crate::vsock_socket::{ InternalVsockServer, InternalVsockClient };
use crate::local_socket::{ InternalLocalServer, InternalLocalClient };

use super::errors::ZkPassSocketError;

pub const VMADDR_CID_ANY: u32 = 0xffffffff;
pub const VMADDR_CID_INSTANCE: u32 = 3;
pub const DEFAULT_HOST_PORT: u32 = 5005;
pub const DEFAULT_UTIL_PORT: u32 = 50051;
pub const DEFAULT_ZKPASS_LOCAL_SOCKET_FILE: &str = "./socket/zkpass_local_server.sock";
pub const DEFAULT_ZKPASS_UTIL_LOCAL_SOCKET_FILE: &str = "./socket/zkpass_local_server_util.sock";

pub trait SocketConnection: Send + Sync + Debug {
    fn send(self: &mut Self, message: String) -> Result<(), ZkPassSocketError>;
    fn receive(self: &mut Self) -> Result<String, ZkPassSocketError>;
    fn reconnect(self: &mut Self) -> Result<(), ZkPassSocketError>;
}

pub struct Server {}
pub struct Client {}

impl Server {
    pub fn local_socket(
        stream: UnixStream
    ) -> Result<Box<dyn SocketConnection>, ZkPassSocketError> {
        let socket_connection = InternalLocalServer::local_socket(stream)?;
        Ok(socket_connection)
    }

    pub async fn local_socket_listener<T, F, FutOut>(
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
        let socket_connection = InternalLocalServer::listen_local_socket::<T, F, FutOut>(
            socket_path,
            operation,
            term_token
        ).await?;
        Ok(socket_connection)
    }

    pub async fn local_socket_listener_with_util<T, F, FutOut>(
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
        let socket_connection = InternalLocalServer::listen_local_socket_with_util::<T, F, FutOut>(
            socket_path,
            util_socket,
            operation
        ).await?;
        Ok(socket_connection)
    }

    #[cfg(target_os = "linux")]
    pub fn vsock_socket(
        stream: VsockStream,
        cid: u32,
        port: u32
    ) -> Result<Box<dyn SocketConnection>, ZkPassSocketError> {
        let socket_connection = InternalVsockServer::vsock_socket(stream, cid, port)?;
        Ok(socket_connection)
    }

    #[cfg(target_os = "linux")]
    pub async fn vsock_socket_listener<T, F, FutOut>(
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
        let socket_connection = InternalVsockServer::listen_vsock_socket::<T, F, FutOut>(
            cid,
            port,
            operation,
            term_token
        ).await?;
        Ok(socket_connection)
    }

    #[cfg(target_os = "linux")]
    pub async fn vsock_socket_listener_with_util<T, F, FutOut>(
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
        let socket_connection = InternalVsockServer::listen_vsock_socket_with_util::<T, F, FutOut>(
            cid,
            port,
            util_socket,
            operation
        ).await?;
        Ok(socket_connection)
    }
}

impl Client {
    pub async fn local_socket(
        socket_path: &str,
        term_token: Option<CancellationToken>
    ) -> Result<Option<Box<dyn SocketConnection>>, ZkPassSocketError> {
        let socket_connection = InternalLocalClient::local_socket(socket_path, term_token).await?;
        Ok(socket_connection)
    }

    #[cfg(target_os = "linux")]
    pub async fn vsock_socket(
        cid: u32,
        port: u32,
        term_token: Option<CancellationToken>
    ) -> Result<Option<Box<dyn SocketConnection>>, ZkPassSocketError> {
        let socket_connection = InternalVsockClient::vsock_socket(cid, port, term_token).await?;
        Ok(socket_connection)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use futures::executor::block_on;
    use tokio::{ runtime::Runtime, select };
    use tokio_util::sync::CancellationToken;
    use crate::interface::{ errors::ZkPassSocketError, signal::shutdown };

    async fn clean_up_socket(socket_path: Option<&str>, term_token: Option<CancellationToken>) {
        if term_token.is_some() {
            shutdown(term_token.unwrap()).await;
        }
        if socket_path.is_some() {
            let socket_path = socket_path.unwrap();
            std::fs::remove_file(socket_path).unwrap();
        }
    }

    #[ignore]
    #[test]
    #[serial_test::serial]
    fn test_local_socket_listener() {
        let socket_path = "/tmp/test_socket.sock";
        let term_token = CancellationToken::new();

        async fn server_operation(stream: UnixStream) -> Result<(), ZkPassSocketError> {
            let mut socket: Box<dyn SocketConnection> = Server::local_socket(stream)?;

            let message = socket.receive()?;
            assert_eq!(message, "Hello");

            socket.send("World".to_string())?;
            Ok(())
        }

        async fn client_operation(
            stream: &mut Box<dyn SocketConnection>
        ) -> Result<(), ZkPassSocketError> {
            stream.send("Hello".to_string())?;

            let message = stream.receive()?;
            assert_eq!(message, "World");
            Ok(())
        }

        let runtime = Runtime::new().unwrap();
        runtime.block_on(async {
            async fn server_fn(
                socket_path: &str,
                term_token: CancellationToken
            ) -> Result<(), ZkPassSocketError> {
                Server::local_socket_listener::<ZkPassSocketError, _, _>(
                    socket_path,
                    server_operation,
                    term_token.clone()
                ).await
            }
            let server = tokio::spawn(server_fn(&socket_path, term_token.clone()));

            async fn client_fn(socket_path: &str) -> Result<(), ZkPassSocketError> {
                let mut stream: Box<dyn SocketConnection> = Client::local_socket(
                    socket_path,
                    None
                ).await?.unwrap();
                client_operation(&mut stream).await
            }

            let client = tokio::spawn(client_fn(&socket_path));

            select! {
                _ = server => {
                    println!("Server finished");
                }
                result = client => {
                    println!("Client finished");
                    assert!(result.unwrap().is_ok());
                }
            }
        });

        block_on(clean_up_socket(Some(socket_path), Some(term_token)));
    }

    #[ignore]
    #[test]
    #[serial_test::serial]
    fn test_local_socket_listener_with_util() {
        let socket_path = "/tmp/test_socket.sock";

        async fn server_operation(
            stream: UnixStream,
            _util_socket: Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>
        ) -> Result<(), ZkPassSocketError> {
            let mut socket: Box<dyn SocketConnection> = Server::local_socket(stream)?;

            let message = socket.receive()?;
            assert_eq!(message, "Hello");

            socket.send("World".to_string())?;
            Ok(())
        }

        async fn client_operation(
            stream: &mut Box<dyn SocketConnection>
        ) -> Result<(), ZkPassSocketError> {
            stream.send("Hello".to_string())?;

            let message = stream.receive()?;
            assert_eq!(message, "World");
            Ok(())
        }

        let runtime = Runtime::new().unwrap();
        runtime.block_on(async {
            let util_socket = Arc::new(Mutex::new(RefCell::new(None)));

            async fn server_fn(
                socket_path: &str,
                util_socket: Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>
            ) -> Result<(), ZkPassSocketError> {
                Server::local_socket_listener_with_util::<ZkPassSocketError, _, _>(
                    socket_path,
                    util_socket,
                    server_operation
                ).await
            }
            let server = tokio::spawn(server_fn(&socket_path, util_socket));

            async fn client_fn(socket_path: &str) -> Result<(), ZkPassSocketError> {
                let mut stream: Box<dyn SocketConnection> = Client::local_socket(
                    socket_path,
                    None
                ).await?.unwrap();
                client_operation(&mut stream).await
            }

            let client = tokio::spawn(client_fn(&socket_path));

            select! {
                _ = server => {
                    println!("Server finished");
                }
                result = client => {
                    println!("Client finished");
                    assert!(result.unwrap().is_ok());
                }
            }
        });

        runtime.shutdown_background();
        block_on(clean_up_socket(Some(socket_path), None));
    }
}
