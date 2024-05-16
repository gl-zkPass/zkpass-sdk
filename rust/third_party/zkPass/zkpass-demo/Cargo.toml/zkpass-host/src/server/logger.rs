/*
 * logger.rs
 * This file is an internal file that will send logs from the host to ws.
 * The host runs on Nitro, and its logs cannot be maintained.
 *
 * Authors:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * Created at: January 17th 2024
 * -----
 * Last Modified: May 2nd 2024
 * Modified By: William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * -----
 * Reviewers:
 *
 * ---
 * References:
 *   https://burgers.io/custom-logging-in-rust-using-tracing
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
use std::{ cell::RefCell, sync::Arc };
use tokio::sync::Mutex;
use tracing_subscriber::Layer;
use zkpass_svc_common::interface::{
    socket::SocketConnection,
    OPERATION_PRINTING_LOGS,
    OPERATION_SEPARATOR,
};

pub struct SocketLayer {
    socket: Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>,
}

impl SocketLayer {
    #[allow(dead_code)]
    pub fn new(socket: Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>) -> Self {
        SocketLayer { socket }
    }
}

impl<S> Layer<S>
    for SocketLayer
    where S: tracing::Subscriber, S: for<'lookup> tracing_subscriber::registry::LookupSpan<'lookup>
{
    fn on_event(
        &self,
        event: &tracing::Event<'_>,
        _ctx: tracing_subscriber::layer::Context<'_, S>
    ) {
        let guard = match self.socket.try_lock() {
            Ok(guard) => guard,
            Err(err) => {
                eprintln!("Error getting socket lock (when sending logs): {}", err.to_string());
                return;
            }
        };
        let mut socket_option = guard.borrow_mut();
        if socket_option.is_some() {
            let socket = socket_option.as_mut().unwrap();
            let log_message = get_log_message(event);
            write_to_stream(socket, &log_message);
        }
    }
}

struct ConsoleVisitor<'a>(&'a mut String);

impl tracing::field::Visit for ConsoleVisitor<'_> {
    fn record_debug(&mut self, _field: &tracing::field::Field, value: &dyn std::fmt::Debug) {
        *self.0 = format!("{:?}", value);
    }
}

fn get_log_message(event: &tracing::Event<'_>) -> String {
    let mut fields = String::new();
    let mut visitor = ConsoleVisitor(&mut fields);
    event.record(&mut visitor);

    let log_message = format!(
        "{} {} {}: {}\n",
        chrono::Utc::now().format("%Y-%m-%dT%H:%M:%S%.6fZ"),
        event.metadata().level().as_str(),
        event.metadata().target().to_string(),
        fields
    );
    let log_message = format!("{}{}{}", OPERATION_PRINTING_LOGS, OPERATION_SEPARATOR, log_message);
    log_message
}

fn write_to_stream(stream: &mut Box<dyn SocketConnection>, log_message: &str) {
    match stream.send(log_message.to_string()) {
        Ok(_) => (),
        Err(err) => eprintln!("Error writing logs to stream: {}", err.to_string()),
    }
}
