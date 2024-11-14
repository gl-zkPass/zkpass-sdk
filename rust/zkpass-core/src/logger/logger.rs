/*
 * logger.rs
 * This file is an internal file that will send logs from the host to ws.
 * The host runs on Nitro, and its logs cannot be maintained.
 *
 * Authors:
 * Created at: January 17th 2024
 * -----
 * Last Modified: October 31st 2024
 * -----
 * References:
 *   https://burgers.io/custom-logging-in-rust-using-tracing
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
use std::{ cell::RefCell, sync::Arc };
use tokio::sync::Mutex;
use tracing_subscriber::Layer;
use crate::socket::{
    connection::SocketConnection,
    globals::{ OPERATION_PRINTING_LOGS, OPERATION_SEPARATOR },
};

/// A layer that sends logs to a socket connection.
/// The socket connection is used to send logs to the ws.
/// Type arc is needed to be able to share the socket connection between threads.
/// Type mutex is needed to be able to lock the socket connection when sending logs.
/// Type refcell is needed to be able to mutate the socket connection.
/// The socket connection is a trait object that implements the SocketConnection trait.
pub struct SocketLayer {
    socket: Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>,
}

/// Implementation of the Layer trait for the SocketLayer.
/// The Layer trait is used to define how the layer should behave.
impl SocketLayer {
    pub fn new(socket: Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>) -> Self {
        SocketLayer { socket }
    }
}

impl<S> Layer<S>
    for SocketLayer
    where S: tracing::Subscriber, S: for<'lookup> tracing_subscriber::registry::LookupSpan<'lookup>
{
    /// This function is called when an event is recorded.
    /// The event is then sent to the socket connection.
    /// The socket connection is locked to prevent multiple threads from writing to the socket connection
    /// at the same time.
    fn on_event(
        &self,
        event: &tracing::Event<'_>,
        _ctx: tracing_subscriber::layer::Context<'_, S>
    ) {
        let socket_lock_guard = match self.socket.try_lock() {
            Ok(guard) => guard,
            Err(err) => {
                eprintln!("Error getting socket lock (when sending logs): {}", err.to_string());
                return;
            }
        };
        let mut socket_option = socket_lock_guard.borrow_mut();
        if socket_option.is_some() {
            let socket = socket_option.as_mut().unwrap();
            let log_message = get_log_message(event);
            write_to_stream(socket, &log_message);
        }
    }
}

/// Visitor to visit the fields of the event.
struct ConsoleVisitor<'a>(&'a mut String);

/// Visitor to visit the fields of the event.
/// The fields are then formatted into a string.
impl tracing::field::Visit for ConsoleVisitor<'_> {
    fn record_debug(&mut self, _field: &tracing::field::Field, value: &dyn std::fmt::Debug) {
        *self.0 = format!("{:?}", value);
    }
}

/// Get the log message from the event.
/// The log message is formatted as follows:
///
/// `{timestamp} {level} {target}: {fields}`
fn get_log_message(event: &tracing::Event<'_>) -> String {
    let mut fields = String::new();
    let mut visitor = ConsoleVisitor(&mut fields);
    event.record(&mut visitor);

    let log_message = format!(
        "{} {} {}: {}",
        chrono::Utc::now().format("%Y-%m-%dT%H:%M:%S%.6fZ"),
        event.metadata().level().as_str(),
        event.metadata().target().to_string(),
        fields
    );
    let log_message = format!("{}{}{}", OPERATION_PRINTING_LOGS, OPERATION_SEPARATOR, log_message);
    log_message
}

/// Write logs to the stream.
/// The stream is a trait object that implements the SocketConnection trait.
///
/// # Arguments
/// * `stream` - The stream to write to.
/// * `log_message` - The log message to write.
fn write_to_stream(stream: &mut Box<dyn SocketConnection>, log_message: &str) {
    match stream.send(log_message.to_string()) {
        Ok(_) => (),
        Err(err) => eprintln!("Error writing logs to stream: {}", err.to_string()),
    }
}

#[cfg(test)]
mod tests {
    use crate::{
        socket::{ connection::Socket, errors::ZkPassSocketError },
        utils::yielding::FixCoverage,
    };
    use super::*;
    use std::{ cell::RefCell, io::Cursor };

    #[tokio::test]
    async fn test_socket_layer() {
        let socket = Arc::new(Mutex::new(RefCell::new(None)));
        let layer = SocketLayer::new(socket.clone());
        assert!(layer.socket.lock().fix_cov().await.borrow().is_none());
    }

    #[derive(Debug)]
    pub struct MockSocketConnection {
        dummy_stream: Cursor<Vec<u8>>,
    }

    impl SocketConnection for MockSocketConnection {
        fn stream(&mut self) -> &mut dyn Socket {
            &mut self.dummy_stream
        }

        fn send(&mut self, _payload: String) -> Result<(), ZkPassSocketError> {
            Ok(())
        }

        fn receive(&mut self) -> Result<String, ZkPassSocketError> {
            self.stream();
            self.reconnect().unwrap();
            self.search_marker(0).unwrap();

            Ok("".to_string())
        }

        fn reconnect(self: &mut Self) -> Result<(), ZkPassSocketError> {
            Ok(())
        }

        fn search_marker(self: &mut Self, _marker: u8) -> Result<bool, ZkPassSocketError> {
            Ok(true)
        }
    }

    #[test]
    fn test_write_to_stream() {
        let mut mock_socket: Box<dyn SocketConnection> = Box::new(MockSocketConnection {
            dummy_stream: Cursor::new(vec![]),
        });
        mock_socket.receive().unwrap();

        write_to_stream(&mut mock_socket, "test message");
    }
}
