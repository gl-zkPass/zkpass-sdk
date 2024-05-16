/*
 * utils.rs
 * this file is contains utility functions and common interfaces
 * on zkpass-ws. Also including how to create `clap` program
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * Created Date: November 30th 2023
 * -----
 * Last Modified: May 3rd 2024
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
use clap::{ App, AppSettings, Arg, ArgMatches, SubCommand };
use lazy_static::lazy_static;
use serde::{ de::DeserializeOwned, Deserialize, Serialize };
use tokio::sync::RwLock;
use tracing_subscriber::EnvFilter;
use std::{ io::BufReader, sync::Arc };
use serde_json::{ json, Value };
#[cfg(target_os = "linux")]
use zkpass_svc_common::interface::socket::DEFAULT_UTIL_PORT;
use tracing::{ error, info, level_filters::LevelFilter };
use zkpass_svc_common::interface::{
    errors::{ ZkPassSocketError, ZkPassUtilError },
    retrieve_env_var,
    socket::SocketConnection,
};

use crate::localization::{ get_localized_error_message, get_localized_error_with_custom_message };

lazy_static! {
    pub static ref MAIN_SOCKET: Arc<RwLock<Option<Box<dyn SocketConnection>>>> = Arc::new(
        RwLock::new(None)
    );
}

#[derive(Deserialize)]
pub struct FetchKeysResponse {
    pub keys: Vec<PublicKeyResponse>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct PublicKeyResponse {
    pub kid: String,
    pub x: String,
    pub y: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct GenerateProofRequestPayload {
    user_info: String,
    dvr: String,
}

pub fn create_app() -> App<'static> {
    App::new("zkPass web service")
        .about("Hello world example for zkPass web server communication")
        .setting(AppSettings::ArgRequiredElseHelp)
        .version(env!("CARGO_PKG_VERSION"))
        .subcommand(
            SubCommand::with_name("local")
                .about("Listen on a local environment")
                .arg(
                    Arg::with_name("port")
                        .long("port")
                        .help("The port to bind the local socket to")
                        .takes_value(true)
                )
                .arg(
                    Arg::with_name("ipc-path")
                        .long("ipc-path")
                        .help("The ipc path to bind the local socket to")
                        .takes_value(true)
                        .value_name("FILE")
                )
                .arg(
                    Arg::with_name("ipc-util-path")
                        .long("ipc-util-path")
                        .help("The ipc util path to bind the local utilization socket to")
                        .takes_value(true)
                        .value_name("FILE")
                )
        )
        .subcommand(
            SubCommand::with_name("vsock")
                .about("Listen on a vsock environment")
                .arg(
                    Arg::with_name("port")
                        .long("port")
                        .help("port")
                        .takes_value(true)
                        .required(true)
                )
                .arg(Arg::with_name("cid").long("cid").help("cid").takes_value(true).required(true))
                .arg(
                    Arg::with_name("util-port")
                        .long("util-port")
                        .help("util-port")
                        .takes_value(true)
                        .required(false)
                )
        )
}

#[derive(Debug)]
pub enum ArgsParseError {
    MissingArgument,
    InvalidValue,
}

#[allow(dead_code)]
fn parse_arg(args: &ArgMatches, arg: &str) -> Result<u32, ArgsParseError> {
    let arg_str = args.value_of(arg).ok_or(ArgsParseError::MissingArgument)?;
    let value: Result<u32, std::num::ParseIntError> = arg_str.parse();
    match value {
        Ok(data) => Ok(data),
        Err(_) => Err(ArgsParseError::InvalidValue),
    }
}

#[cfg(target_os = "linux")]
pub fn parse_arg_vsock(args: &ArgMatches) -> Result<(u32, u32, u32), ArgsParseError> {
    let cid = parse_arg(args, "cid")?;
    let port = parse_arg(args, "port")?;
    let util_port = match parse_arg(args, "util-port") {
        Ok(port) => port,
        Err(_) => {
            error!("Invalid or no util-port, setting to default on {}", DEFAULT_UTIL_PORT);
            DEFAULT_UTIL_PORT
        }
    };
    Ok((cid, port, util_port))
}

pub fn is_rabbitmq_enabled() -> bool {
    match retrieve_env_var("RABBITMQ_HOST") {
        Ok(_) => true,
        Err(_) => false,
    }
}

pub fn get_localized_socket_error_message(err: &ZkPassSocketError) -> String {
    let localized_message = match err.get_args() {
        Some(m) => get_localized_error_with_custom_message(err.get_error_key(), &m),
        None => get_localized_error_message(err.get_error_key()),
    };

    return localized_message;
}

pub fn convert_socket_error_to_response_body(err: &ZkPassSocketError) -> Value {
    json!({
        "status": 400,
        "status_code": err.get_code(),
        "status_text": get_localized_socket_error_message(err)
    })
}

pub fn read_json_from_file<T: DeserializeOwned>(
    filepath: &str,
    using_reader: bool
) -> Result<T, ZkPassUtilError> {
    info!("Reading from file");

    if using_reader {
        let file = std::fs::File::open(filepath).map_err(|_| ZkPassUtilError::IOError)?;
        let reader = BufReader::new(file);
        let keys = serde_json::from_reader(reader).map_err(|_| ZkPassUtilError::DeserializeError)?;
        Ok(keys)
    } else {
        let value = std::fs::read_to_string(&filepath).map_err(|_| ZkPassUtilError::IOError)?;
        let output = serde_json::from_str(&value).map_err(|_| ZkPassUtilError::DeserializeError)?;

        info!("Data received from file");
        Ok(output)
    }
}

pub fn package_version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}

pub fn initialize_tracing() {
    let filter = EnvFilter::try_from_default_env()
        .or_else(|_| EnvFilter::try_new("INFO"))
        .unwrap();
    tracing_subscriber
        ::fmt()
        .with_env_filter(filter)
        .with_max_level(LevelFilter::INFO)
        .with_ansi(false)
        .init();
}

#[cfg(test)]
mod tests {
    use std::io::Write;

    use super::*;

    fn mock_vsock_app() -> App<'static> {
        let app = App::new("test")
            .arg(Arg::with_name("cid").long("cid").takes_value(true))
            .arg(Arg::with_name("port").long("port").takes_value(true))
            .arg(Arg::with_name("util-port").long("util-port").takes_value(true));
        app
    }

    #[test]
    fn test_parse_arg_valid() {
        let app = App::new("test").arg(Arg::with_name("port").long("port").takes_value(true));
        let args = vec!["test", "--port", "8080"];
        let matches = app.get_matches_from(args);
        let result = parse_arg(&matches, "port");
        assert_eq!(result.unwrap(), 8080);

        let result = parse_arg(&matches, "second-port");
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_arg_vsock_valid() {
        let app = mock_vsock_app();
        let args = vec!["test", "--cid", "123", "--port", "8080", "--util-port", "9090"];
        let matches = app.get_matches_from(args);
        let result = parse_arg_vsock(&matches).unwrap();
        assert_eq!(result, (123, 8080, 9090));
    }

    #[test]
    fn test_parse_arg_vsock_missing_util_port() {
        let app = mock_vsock_app();
        let args = vec!["test", "--cid", "123", "--port", "8080"];
        let matches = app.get_matches_from(args);
        let result = parse_arg_vsock(&matches).unwrap();
        assert_eq!(result, (123, 8080, DEFAULT_UTIL_PORT));
    }

    #[test]
    fn test_is_rabbitmq_enabled_true() {
        std::env::set_var("RABBITMQ_HOST", "localhost");
        let result = is_rabbitmq_enabled();
        assert_eq!(result, true);

        std::env::remove_var("RABBITMQ_HOST");
        let result = is_rabbitmq_enabled();
        assert_eq!(result, false);
    }

    #[test]
    fn test_read_json_from_file_using_reader() {
        let filepath = "test_reader.json";
        let mut file = std::fs::File::create(filepath).unwrap();
        file.write_all(b"{\"name\":\"John\",\"age\":30}").unwrap();
        let result = read_json_from_file::<serde_json::Value>(filepath, true).unwrap();
        std::fs::remove_file(filepath).unwrap();
        assert_eq!(result, json!({"name": "John", "age": 30}));
    }

    #[test]
    fn test_read_json_from_file_using_read_to_string() {
        let filepath = "test_file.json";
        let mut file = std::fs::File::create(filepath).unwrap();
        file.write_all(b"{\"name\":\"John\",\"age\":30}").unwrap();
        let result = read_json_from_file::<serde_json::Value>(filepath, false).unwrap();
        std::fs::remove_file(filepath).unwrap();
        assert_eq!(result, json!({"name": "John", "age": 30}));
    }

    #[test]
    fn test_package_version() {
        let result = package_version();
        assert_eq!(result, env!("CARGO_PKG_VERSION"));
    }
}
