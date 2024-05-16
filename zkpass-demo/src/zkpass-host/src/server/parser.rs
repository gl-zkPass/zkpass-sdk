/*
 * parser.rs
 * this file consists of how to parse `clap` arguments
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * Created Date: November 30th 2023
 * -----
 * Last Modified: April 3rd 2024
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
use clap::ArgMatches;

#[derive(Debug, Clone, PartialEq)]
pub enum Env {
    Local,
    #[cfg(target_os = "linux")]
    Vsock,
}

#[derive(Debug, Clone)]
pub struct ServerEnvArgs {
    pub env: Env,
    pub args: ArgMatches,
}

#[derive(Debug)]
pub enum ArgsParseError {
    MissingArgument,
    InvalidValue,
}

impl ServerEnvArgs {
    pub fn new_with(env: &str, args: &ArgMatches) -> Result<Self, ArgsParseError> {
        match env {
            "local" =>
                Ok(ServerEnvArgs {
                    env: Env::Local,
                    args: args.clone(),
                }),
            #[cfg(target_os = "linux")]
            "vsock" =>
                Ok(ServerEnvArgs {
                    env: Env::Vsock,
                    args: args.clone(),
                }),
            _ => Err(ArgsParseError::InvalidValue),
        }
    }
}

#[allow(dead_code)]
pub fn parse_arg(args: &ArgMatches, arg: &str) -> Result<u32, ArgsParseError> {
    let arg_str = args.value_of(arg).ok_or(ArgsParseError::MissingArgument)?;
    arg_str.parse().map_err(|_| ArgsParseError::InvalidValue)
}

#[cfg(test)]
mod tests {
    use super::*;
    use clap::{ App, Arg };
    use zkpass_svc_common::interface::socket::{ DEFAULT_UTIL_PORT, DEFAULT_HOST_PORT };

    fn mock_vsock_app() -> App<'static> {
        let app = App::new("test")
            .arg(Arg::with_name("cid").long("cid").takes_value(true))
            .arg(Arg::with_name("port").long("port").takes_value(true))
            .arg(Arg::with_name("util-port").long("util-port").takes_value(true));
        app
    }

    #[test]
    fn test_new_with_local_env() {
        let env = "local";
        let matches = ArgMatches::default();
        let result = ServerEnvArgs::new_with(env, &matches).unwrap();

        assert_eq!(result.env, Env::Local);
        assert_eq!(result.args, matches);
    }

    #[cfg(target_os = "linux")]
    #[test]
    fn test_new_with_vsock_env() {
        let env = "vsock";
        let app = mock_vsock_app();
        let host_port = DEFAULT_HOST_PORT.to_string();
        let util_port = DEFAULT_UTIL_PORT.to_string();
        let args = vec!["test", "--port", host_port.as_str(), "--util-port", util_port.as_str()];
        let matches = app.get_matches_from(args);
        let result = ServerEnvArgs::new_with(env, &matches).unwrap();
        assert_eq!(result.env, Env::Vsock);
        assert_eq!(result.args, matches);
    }

    #[test]
    fn test_new_with_invalid_env() {
        let env = "invalid";
        let args = ArgMatches::default();
        let result = ServerEnvArgs::new_with(env, &args);
        assert!(result.is_err());
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
}
