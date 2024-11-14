/*
 * socket.rs
 * this file is an external file which is contains initilization of each socket
 *
 * Authors:
 * Created Date: November 30th 2023
 * -----
 * Last Modified: November 7th 2024
 * -----
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
use std::io::{ ErrorKind, Read, Write };
use std::os::unix::net::UnixStream;
use std::fmt::Debug;
use futures::Future;
use tokio_util::sync::CancellationToken;
#[cfg(target_os = "linux")]
use vsock::VsockStream;
use super::globals::{ BUFFER_SIZE, MAX_BYTES_TO_CHECK };
use super::vsock_socket::{ InternalVsockServer, InternalVsockClient };
use super::local_socket::{ InternalLocalServer, InternalLocalClient };
use super::errors::ZkPassSocketError;

pub const VMADDR_CID_ANY: u32 = 0xffffffff;
pub const VMADDR_CID_INSTANCE: u32 = 3;
pub const DEFAULT_HOST_PORT: u32 = 5005;
pub const DEFAULT_UTIL_PORT: u32 = 50051;
pub const DEFAULT_ZKPASS_LOCAL_SOCKET_FILE: &str = "./socket/zkpass_local_server.sock";
pub const DEFAULT_ZKPASS_UTIL_LOCAL_SOCKET_FILE: &str = "./socket/zkpass_local_server_util.sock";
pub const START_HEADER: u8 = 0x01; // SOH = Start of Header
pub const END_HEADER: u8 = 0x02; // STX = Start of Text

// Define a new trait called `Socket` that combines both `Read` and `Write`
pub trait Socket: Read + Write {}
impl<T: Read + Write> Socket for T {}

/// Trait that represents a socket connection.
///
/// * `send` - Send a message to the socket.
/// * `receive` - Receive a message from the socket.
/// * `search_marker` - Search for a certain marker in the socket. this is used to check if the message or header is complete.
/// * `reconnect` - Reconnect the socket.
pub trait SocketConnection: Send + Sync + Debug {
    fn stream(&mut self) -> &mut dyn Socket;

    /// Send a message to the socket.
    /// The message will be sent in the following format:
    /// - 1 byte of SOH (Start of Header) marker
    /// - 4 bytes of message length in network byte order
    /// - 1 byte of STX (Start of Text) marker
    /// - message bytes
    ///
    /// # Arguments
    /// * `message` - A string that contains the message that will be sent to the socket.
    ///
    /// # Returns
    /// * `Result<(), ZkPassSocketError>` - A result that contains the result of the operation.
    fn send(self: &mut Self, message: String) -> Result<(), ZkPassSocketError> {
        // Convert the message to bytes and get its length.
        let message_bytes = message.as_bytes();
        let length = message_bytes.len() as u32;

        // Convert the length to bytes in network byte order.
        let length_bytes = length.to_be_bytes();

        // Write the length to the stream.
        let mut data = Vec::with_capacity(6 + message_bytes.len());
        data.push(START_HEADER);
        data.extend_from_slice(&length_bytes);
        data.push(END_HEADER);
        data.extend_from_slice(message_bytes);

        // Write the message to the stream.
        for chunk in data.chunks(BUFFER_SIZE) {
            match self.stream().write_all(chunk) {
                Ok(_) => (),
                Err(err) => {
                    if err.kind() == ErrorKind::BrokenPipe {
                        self.reconnect()?;
                        self
                            .stream()
                            .write_all(chunk)
                            .map_err(|err| ZkPassSocketError::WriteError(err.to_string()))?;
                    } else {
                        return Err(ZkPassSocketError::WriteError(err.to_string()));
                    }
                }
            }
        }
        self
            .stream()
            .flush()
            .map_err(|err| ZkPassSocketError::WriteError(err.to_string()))?;
        Ok(())
    }

    /// Receive a message from the socket.
    /// The message will be received in the following format:
    /// - 1 byte of SOH (Start of Header) marker
    /// - 4 bytes of message length in network byte order
    /// - 1 byte of STX (Start of Text) marker
    /// - message bytes
    ///
    /// # Returns
    /// * `Result<String, ZkPassSocketError>` - A result that contains the received message.
    fn receive(self: &mut Self) -> Result<String, ZkPassSocketError> {
        // Look for the SOH marker first
        match self.search_marker(START_HEADER) {
            Ok(is_found) => {
                if !is_found {
                    return Ok("".to_string());
                }
            }
            Err(err) => {
                return Err(err);
            }
        }

        // Read the length of the message.
        let mut length_bytes = [0; 4];
        match self.stream().read_exact(&mut length_bytes) {
            Ok(_) => (),
            Err(err) => {
                if err.kind() == ErrorKind::UnexpectedEof {
                    // if the connection is closed, return empty string
                    return Ok("".to_string());
                } else {
                    return Err(ZkPassSocketError::ReadError(err.to_string()));
                }
            }
        }

        // Look for the STX marker, to mark the start of the message or end of the header.
        match self.search_marker(END_HEADER) {
            Ok(is_found) => {
                if !is_found {
                    return Ok("".to_string());
                }
            }
            Err(err) => {
                return Err(err);
            }
        }

        // Convert the length from network byte order to a u32.
        let length = u32::from_be_bytes(length_bytes) as usize;

        // Read the message.
        let mut buffer = Vec::new();
        let mut total_bytes_read = 0;

        while total_bytes_read < length {
            let bytes_to_read = std::cmp::min(BUFFER_SIZE, length - total_bytes_read);
            let mut chunk = vec![0; bytes_to_read];
            let bytes_read = self
                .stream()
                .read(&mut chunk)
                .map_err(|err| ZkPassSocketError::ReadError(err.to_string()))?;

            if bytes_read == 0 {
                //if bytes_read is 0, it means the connection is closed or there is no data to read anymore
                break;
            }

            buffer.extend_from_slice(&chunk[0..bytes_read]);
            total_bytes_read += bytes_read;
        }

        let received_data = String::from_utf8(buffer).map_err(|_|
            ZkPassSocketError::CustomError("DecodeError".to_string())
        )?;
        match received_data.to_lowercase().contains("error") {
            false => Ok(received_data),
            true => Err(ZkPassSocketError::CustomError(received_data)),
        }
    }

    /// Search for a marker in the socket stream.
    /// If the marker is found, it will return true, otherwise it will return false.
    ///
    /// # Arguments
    /// * `marker` - A u8 that contains the marker that will be searched in the socket stream.
    ///
    /// # Returns
    /// * `Result<bool, ZkPassSocketError>` - A result that contains the result of the operation.
    fn search_marker(self: &mut Self, marker: u8) -> Result<bool, ZkPassSocketError> {
        let mut buffer = [0; 1];
        let mut bytes_checked = 0;

        loop {
            match self.stream().read_exact(&mut buffer) {
                Ok(_) => {
                    if buffer[0] == marker {
                        return Ok(true);
                    }
                }
                Err(err) => {
                    if err.kind() == ErrorKind::UnexpectedEof {
                        // if the connection is closed, return empty string
                        return Ok(false);
                    } else {
                        return Err(ZkPassSocketError::ReadError(err.to_string()));
                    }
                }
            }

            bytes_checked += 1;
            if bytes_checked > MAX_BYTES_TO_CHECK {
                return Err(ZkPassSocketError::OutOfSyncError);
            }
        }
    }

    fn reconnect(self: &mut Self) -> Result<(), ZkPassSocketError>;
}

pub struct Server {}
pub struct Client {}

impl Server {
    /// Change the UnixStream into a socket connection trait.
    /// Used after the server accepts the connection.
    ///
    /// # Arguments
    /// * `stream` - A UnixStream that will be used to create the socket connection.
    ///
    /// # Returns
    /// * `Result<Box<dyn SocketConnection>, ZkPassSocketError>` - A result that contains the socket connection.
    pub fn local_socket(
        stream: UnixStream
    ) -> Result<Box<dyn SocketConnection>, ZkPassSocketError> {
        let socket_connection = InternalLocalServer::local_socket(stream)?;
        Ok(socket_connection)
    }

    /// Listen to a local socket.
    /// Used to create a server that listens to a local socket.
    ///
    /// # Arguments
    /// * `socket_path` - A string that contains the path to the socket.
    /// * `operation` - A function that will be executed when the server receives a connection.
    /// * `term_token` - A CancellationToken that will be used to cancel the server.
    ///
    /// # Returns
    /// * `Result<(), ZkPassSocketError>` - A result that contains the result of the operation.
    ///
    /// # Note
    /// - The operation function should be a function that receives a UnixStream and returns a Future.
    /// - Used by zkpass-ws for the util socket.
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

    /// Change the VsockStream into a socket connection trait.
    /// Used after the server accepts the connection.
    ///
    /// # Arguments
    /// * `stream` - A VsockStream that will be used to create the socket connection.
    /// * `cid` - A u32 that contains the context id.
    /// * `port` - A u32 that contains the port.
    ///
    /// # Returns
    /// * `Result<Box<dyn SocketConnection>, ZkPassSocketError>` - A result that contains the socket connection.
    #[cfg(target_os = "linux")]
    pub fn vsock_socket(
        stream: VsockStream,
        cid: u32,
        port: u32
    ) -> Result<Box<dyn SocketConnection>, ZkPassSocketError> {
        let socket_connection = InternalVsockServer::vsock_socket(stream, cid, port)?;
        Ok(socket_connection)
    }

    /// Listen to a vsock socket.
    /// Used to create a server that listens to a vsock socket.
    ///
    /// # Arguments
    /// * `cid` - A u32 that contains the context id.
    /// * `port` - A u32 that contains the port.
    /// * `operation` - A function that will be executed when the server receives a connection.
    /// * `term_token` - A CancellationToken that will be used to cancel the server.
    ///
    /// # Returns
    /// * `Result<(), ZkPassSocketError>` - A result that contains the result of the operation.
    ///
    /// # Note
    /// - The operation function should be a function that receives a VsockStream and returns a Future.
    /// - Used by zkpass-ws for the util socket.
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
}

impl Client {
    /// Perform connect to a local socket.
    /// Used to create a client that connects to a local socket.
    ///
    /// # Arguments
    /// * `socket_path` - A string that contains the path to the socket.
    /// * `term_token` - A CancellationToken that will be used to cancel the client.
    ///
    /// # Returns
    /// * `Result<Option<Box<dyn SocketConnection>>, ZkPassSocketError>` - A result that contains the socket connection.
    pub async fn local_socket(
        socket_path: &str,
        term_token: Option<CancellationToken>
    ) -> Result<Option<Box<dyn SocketConnection>>, ZkPassSocketError> {
        let socket_connection = InternalLocalClient::local_socket(socket_path, term_token).await?;
        Ok(socket_connection)
    }

    /// Perform connect to a vsock socket.
    /// Used to create a client that connects to a vsock socket.
    ///
    /// # Arguments
    /// * `cid` - A u32 that contains the context id.
    /// * `port` - A u32 that contains the port.
    /// * `term_token` - A CancellationToken that will be used to cancel the client.
    ///
    /// # Returns
    /// * `Result<Option<Box<dyn SocketConnection>>, ZkPassSocketError>` - A result that contains the socket connection.
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
    use crate::{ socket::signal::shutdown, utils::yielding::FixCoverage };
    use vsock::{ VsockAddr, VsockListener };

    async fn clean_up_socket(socket_path: Option<&str>, term_token: Option<CancellationToken>) {
        if term_token.is_some() {
            shutdown(term_token.unwrap()).await;
        }
        if socket_path.is_some() {
            let socket_path = socket_path.unwrap();
            std::fs::remove_file(socket_path).unwrap();
        }
    }

    async fn vsock_server_operation(
        stream: VsockStream,
        _port: u32
    ) -> Result<(), ZkPassSocketError> {
        let mut socket: Box<dyn SocketConnection> = Server::vsock_socket(stream, 2, 1234)?;

        let message = socket.receive()?;
        println!("[server_operation] Received message: {:#?}", message);

        assert_eq!(message, "Client message");

        socket.send("Server message".to_string())?;
        Ok(())
    }

    async fn vsock_client_operation(
        stream: &mut Box<dyn SocketConnection>
    ) -> Result<(), ZkPassSocketError> {
        stream.send("Client message".to_string())?;

        let message = stream.receive()?;
        println!("[client_operation] Received message: {:#?}", message);

        assert_eq!(message, "Server message");
        Ok(())
    }

    #[test]
    #[serial_test::serial]
    #[cfg(target_os = "linux")]
    fn test_vsock_socket_listener() {
        let addr = VsockAddr::new(2, 1234);
        let listener = VsockListener::bind(&addr);
        if listener.is_err() {
            println!("Vsock binding failed. Skipping test.");
            return;
        }
        drop(listener);

        let term_token = CancellationToken::new();

        let (tx, rx) = tokio::sync::oneshot::channel();

        let runtime = Runtime::new().unwrap();
        runtime.block_on(async {
            async fn server_fn(
                term_token: CancellationToken,
                tx: tokio::sync::oneshot::Sender<()>
            ) -> Result<(), ZkPassSocketError> {
                let _ = tx.send(());

                Server::vsock_socket_listener::<ZkPassSocketError, _, _>(
                    2,
                    1234,
                    vsock_server_operation,
                    term_token.clone()
                ).await?;

                Ok(())
            }
            let server = tokio::spawn(server_fn(term_token.clone(), tx));

            async fn client_fn(
                term_token: CancellationToken,
                rx: tokio::sync::oneshot::Receiver<()>
            ) -> Result<(), ZkPassSocketError> {
                let _ = rx.await;

                let mut stream: Box<dyn SocketConnection> = Client::vsock_socket(
                    2,
                    1234,
                    Some(term_token.clone())
                ).await?.unwrap();

                vsock_client_operation(&mut stream).await
            }

            let client = tokio::spawn(client_fn(term_token.clone(), rx));

            select! {
                _ = server => {
                    println!("Server finished");
                }
                _ = client => {
                    println!("Client finished");
                }
            }
        });

        runtime.shutdown_background();
        block_on(clean_up_socket(None, None));
    }

    async fn local_socket_server_operation(stream: UnixStream) -> Result<(), ZkPassSocketError> {
        let mut socket: Box<dyn SocketConnection> = Server::local_socket(stream).unwrap();

        let message = socket.receive().unwrap();
        assert_eq!(message, "Client message");

        socket.send("Server message".to_string()).unwrap();
        Ok(())
    }

    async fn local_socket_client_operation(stream: &mut Box<dyn SocketConnection>, timeout: u32) {
        stream.send("Client message".to_string()).unwrap();

        if timeout > 0 {
            tokio::time::sleep(tokio::time::Duration::from_secs(timeout.into())).await;
        }

        let message = stream.receive().unwrap();
        assert_eq!(message, "Server message");
    }

    async fn test_local_socket(case: String, term_token: CancellationToken) {
        let socket_path = match case.as_str() {
            "normal" => "/tmp/test_socket.sock",
            _ => "test_socket_reconnect.sock",
        };
        async fn server_fn(
            socket_path: &str,
            term_token: CancellationToken
        ) -> Result<(), ZkPassSocketError> {
            Server::local_socket_listener::<ZkPassSocketError, _, _>(
                socket_path,
                local_socket_server_operation,
                term_token.clone()
            ).await
        }
        let server = tokio::spawn(server_fn(socket_path, term_token.clone()));

        async fn client_fn(socket_path: &str, case: String) {
            let mut stream: Box<dyn SocketConnection> = Client::local_socket(socket_path, None)
                .fix_cov().await
                .unwrap()
                .unwrap();
            if case == "normal" {
                local_socket_client_operation(&mut stream, 0).fix_cov().await;
            } else {
                local_socket_client_operation(&mut stream, 2).fix_cov().await;
            }
        }

        let client = tokio::spawn(client_fn(&socket_path, case));

        select! {
            _ = server => {
                println!("Server finished (Reconnect Case)");
            }
            _ = client => {
                println!("Client finished (Reconnect Case)");
            }
        }
    }

    #[test]
    #[serial_test::serial]
    fn test_local_socket_listener() {
        let socket_path = "/tmp/test_socket.sock";
        let term_token = CancellationToken::new();

        let runtime = Runtime::new().unwrap();
        runtime.block_on(async {
            test_local_socket("normal".to_string(), term_token.clone()).await
        });

        runtime.shutdown_background();
        block_on(clean_up_socket(Some(socket_path), Some(term_token)));
    }

    #[test]
    #[serial_test::serial]
    fn test_local_socket_listener_reconnecting() {
        let socket_path = "test_socket_reconnect.sock";
        let term_token = CancellationToken::new();

        let runtime = Runtime::new().unwrap();
        runtime.block_on(async {
            test_local_socket("reconnect".to_string(), term_token.clone()).await
        });

        runtime.shutdown_background();
        block_on(clean_up_socket(Some(socket_path), Some(term_token)));
    }
}
