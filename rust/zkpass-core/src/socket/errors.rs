/*
 * errors.rs
 * this file contains common errors and their implementation
 * that are used on zkpass-host and zkpass-ws
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
use crate::{ dvr_app::interface::ZkPassError, privacy_apps::interface::ZkPassPrivacyAppError };

#[derive(Debug, Clone)]
pub enum ZkPassSocketError {
    DeserializeError(String),
    SerializeError(String),
    ReadError(String),
    WriteError(String),
    ConnectionError,
    SocketBindingError,
    ConversionError,
    UtilError(ZkPassUtilError),
    CustomError(String),
    EmptyParameterError,
    OperationNotSupportedError(String),
    InvalidParameterError(String),
    OutOfSyncError,
}

impl ZkPassPrivacyAppError for ZkPassSocketError {}

impl ToString for ZkPassSocketError {
    fn to_string(&self) -> String {
        return self.get_code().to_owned();
    }
}

impl ZkPassSocketError {
    pub fn get_code(&self) -> &'static str {
        match self {
            ZkPassSocketError::DeserializeError(_) => "E2001-EDeserializeError",
            ZkPassSocketError::SerializeError(_) => "E2002-ESerializeError",
            ZkPassSocketError::ReadError(_) => "E2003-EReadError",
            ZkPassSocketError::WriteError(_) => "E2004-EWriteError",
            ZkPassSocketError::ConnectionError => "E2005-EConnectionError",
            ZkPassSocketError::SocketBindingError => "E2006-ESocketBindingError",
            ZkPassSocketError::ConversionError => "E2007-EConversionError",
            ZkPassSocketError::CustomError(_) => "E2008-ECustomError",
            ZkPassSocketError::UtilError(_) => "E2009-EUtilError",
            ZkPassSocketError::EmptyParameterError => "E2010-EEmptyParameter",
            ZkPassSocketError::OperationNotSupportedError(_) => "E2011-EOperationNotSupported",
            ZkPassSocketError::InvalidParameterError(_) => "E2012-EInvalidParameter",
            ZkPassSocketError::OutOfSyncError => "E2013-EOutOfSyncError",
        }
    }

    pub fn get_error_key(&self) -> &'static str {
        match self {
            ZkPassSocketError::DeserializeError(_) => "DeserializeError",
            ZkPassSocketError::SerializeError(_) => "SerializeError",
            ZkPassSocketError::ReadError(_) => "ReadError",
            ZkPassSocketError::WriteError(_) => "WriteError",
            ZkPassSocketError::ConnectionError => "ConnectionError",
            ZkPassSocketError::SocketBindingError => "SocketBindingError",
            ZkPassSocketError::ConversionError => "ConversionError",
            ZkPassSocketError::CustomError(_) => "CustomError",
            ZkPassSocketError::UtilError(_) => "UtilError",
            ZkPassSocketError::EmptyParameterError => "EmptyParameterError",
            ZkPassSocketError::OperationNotSupportedError(_) => "OperationNotSupportedError",
            ZkPassSocketError::InvalidParameterError(_) => "InvalidParameterError",
            ZkPassSocketError::OutOfSyncError => "OutOfSyncError",
        }
    }

    pub fn get_args(&self) -> Option<String> {
        match self {
            | ZkPassSocketError::DeserializeError(msg)
            | ZkPassSocketError::SerializeError(msg)
            | ZkPassSocketError::CustomError(msg) => Some(msg.to_string()),
            ZkPassSocketError::UtilError(util_err) => { Some(util_err.to_string()) }
            _ => None,
        }
    }
}

#[derive(Debug)]
pub enum ZkPassHostError {
    ZkPassSocketError(ZkPassSocketError),
    ZkPassError(ZkPassError),
    ZkPassUtilError(ZkPassUtilError),
}

impl ZkPassPrivacyAppError for ZkPassHostError {}

impl std::fmt::Display for ZkPassHostError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            ZkPassHostError::ZkPassSocketError(err) => {
                write!(f, "ZkPassSocketError: {:?}", err.to_string())
            }
            ZkPassHostError::ZkPassError(err) => write!(f, "ZkPassError: {:?}", err),
            ZkPassHostError::ZkPassUtilError(err) => {
                write!(f, "ZkPassUtilError: {:?}", err.to_string())
            }
        }
    }
}

impl std::error::Error for ZkPassHostError {}

#[derive(Debug, Clone)]
pub enum ZkPassUtilError {
    DeserializeError,
    SerializeError,
    InitializeError,
    IOError,
    WriteLockError,
    ReadLockError,
    ConnectionError,
    MissingEnvError(String),
    ActionError(String),
    CustomError(String),
    MQError(ZkPassMQError),
    MissingVariableError(String),
}

impl ToString for ZkPassUtilError {
    fn to_string(&self) -> String {
        match self {
            ZkPassUtilError::DeserializeError => String::from("Failed to deserialize"),
            ZkPassUtilError::SerializeError => String::from("Failed to serialize"),
            ZkPassUtilError::InitializeError => String::from("Failed to initialize"),
            ZkPassUtilError::IOError => String::from("I/O Error happened"),
            ZkPassUtilError::WriteLockError => String::from("Failed to use write-lock"),
            ZkPassUtilError::ReadLockError => String::from("Failed to use read-lock"),
            ZkPassUtilError::ConnectionError => String::from("Connection Error"),
            ZkPassUtilError::MissingEnvError(var) => format!("Missing env variable `{}`", var),
            ZkPassUtilError::ActionError(var) =>
                match var.is_empty() {
                    true => String::from("Failed to perform action"),
                    false => format!("Failed to perform action `{}`", var),
                }
            ZkPassUtilError::CustomError(var) => var.to_string(),
            ZkPassUtilError::MQError(var) => var.to_string(),
            ZkPassUtilError::MissingVariableError(var) => format!("Missing variable `{}`", var),
        }
    }
}

#[derive(Debug, Clone)]
pub enum ZkPassMQError {
    ConnectionError,
    ConnectionCallbackError,
    ChannelCallbackError,
    ChannelError,
    DeclareError,
    PublishError,
    ConsumeError,
    BindError,
}

impl ToString for ZkPassMQError {
    fn to_string(&self) -> String {
        match self {
            ZkPassMQError::ConnectionError => String::from("Failed to connect to rabbitmq"),
            ZkPassMQError::ConnectionCallbackError =>
                String::from("Failed to register rabbitmq connection callback"),
            ZkPassMQError::ChannelCallbackError =>
                String::from("Failed to register rabbitmq channel callback"),
            ZkPassMQError::ChannelError => String::from("Failed to create channel"),
            ZkPassMQError::DeclareError => String::from("Failed to declare exchange and queue"),
            ZkPassMQError::PublishError => String::from("Failed to publish message"),
            ZkPassMQError::ConsumeError => String::from("Failed to consume message"),
            ZkPassMQError::BindError => String::from("Failed to bind queue to exchange"),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_zkpass_socket_error() {
        let err = ZkPassSocketError::DeserializeError(String::from("Failed to deserialize"));
        assert_eq!(err.to_string(), "E2001-EDeserializeError");
        assert_eq!(err.get_error_key(), "DeserializeError");
        assert_eq!(err.get_args().unwrap(), "Failed to deserialize");

        let err = ZkPassSocketError::SerializeError(String::from("Failed to serialize"));
        assert_eq!(err.to_string(), "E2002-ESerializeError");
        assert_eq!(err.get_error_key(), "SerializeError");
        assert_eq!(err.get_args().unwrap(), "Failed to serialize");

        let err = ZkPassSocketError::ReadError(String::from("Failed to read"));
        assert_eq!(err.to_string(), "E2003-EReadError");
        assert_eq!(err.get_error_key(), "ReadError");
        assert_eq!(err.get_args(), None);

        let err = ZkPassSocketError::WriteError(String::from("Failed to write"));
        assert_eq!(err.to_string(), "E2004-EWriteError");
        assert_eq!(err.get_error_key(), "WriteError");
        assert_eq!(err.get_args(), None);

        let err = ZkPassSocketError::ConnectionError;
        assert_eq!(err.to_string(), "E2005-EConnectionError");
        assert_eq!(err.get_error_key(), "ConnectionError");
        assert_eq!(err.get_args(), None);

        let err = ZkPassSocketError::SocketBindingError;
        assert_eq!(err.to_string(), "E2006-ESocketBindingError");
        assert_eq!(err.get_error_key(), "SocketBindingError");
        assert_eq!(err.get_args(), None);

        let err = ZkPassSocketError::ConversionError;
        assert_eq!(err.to_string(), "E2007-EConversionError");
        assert_eq!(err.get_error_key(), "ConversionError");
        assert_eq!(err.get_args(), None);

        let err = ZkPassSocketError::CustomError(String::from("Custom error"));
        assert_eq!(err.to_string(), "E2008-ECustomError");
        assert_eq!(err.get_error_key(), "CustomError");
        assert_eq!(err.get_args().unwrap(), "Custom error");

        let err = ZkPassSocketError::UtilError(ZkPassUtilError::DeserializeError);
        assert_eq!(err.to_string(), "E2009-EUtilError");
        assert_eq!(err.get_error_key(), "UtilError");
        assert_eq!(err.get_args().unwrap(), "Failed to deserialize");

        let err = ZkPassSocketError::EmptyParameterError;
        assert_eq!(err.to_string(), "E2010-EEmptyParameter");
        assert_eq!(err.get_error_key(), "EmptyParameterError");
        assert_eq!(err.get_args(), None);

        let err = ZkPassSocketError::OperationNotSupportedError(
            String::from("Operation not supported")
        );
        assert_eq!(err.to_string(), "E2011-EOperationNotSupported");
        assert_eq!(err.get_error_key(), "OperationNotSupportedError");
        assert_eq!(err.get_args(), None);

        let err = ZkPassSocketError::InvalidParameterError(String::from("Invalid parameter"));
        assert_eq!(err.to_string(), "E2012-EInvalidParameter");
        assert_eq!(err.get_error_key(), "InvalidParameterError");
        assert_eq!(err.get_args(), None);

        let err = ZkPassSocketError::OutOfSyncError;
        assert_eq!(err.to_string(), "E2013-EOutOfSyncError");
        assert_eq!(err.get_error_key(), "OutOfSyncError");
        assert_eq!(err.get_args(), None);
    }

    #[test]
    fn test_zkpass_util_error() {
        let err = ZkPassUtilError::DeserializeError;
        assert_eq!(err.to_string(), "Failed to deserialize");

        let err = ZkPassUtilError::SerializeError;
        assert_eq!(err.to_string(), "Failed to serialize");

        let err = ZkPassUtilError::InitializeError;
        assert_eq!(err.to_string(), "Failed to initialize");

        let err = ZkPassUtilError::IOError;
        assert_eq!(err.to_string(), "I/O Error happened");

        let err = ZkPassUtilError::WriteLockError;
        assert_eq!(err.to_string(), "Failed to use write-lock");

        let err = ZkPassUtilError::ReadLockError;
        assert_eq!(err.to_string(), "Failed to use read-lock");

        let err = ZkPassUtilError::ConnectionError;
        assert_eq!(err.to_string(), "Connection Error");

        let err = ZkPassUtilError::MissingEnvError(String::from("env_var"));
        assert_eq!(err.to_string(), "Missing env variable `env_var`");

        let err = ZkPassUtilError::ActionError(String::from("action"));
        assert_eq!(err.to_string(), "Failed to perform action `action`");

        let err = ZkPassUtilError::ActionError(String::from(""));
        assert_eq!(err.to_string(), "Failed to perform action");

        let err = ZkPassUtilError::CustomError(String::from("custom error"));
        assert_eq!(err.to_string(), "custom error");

        let err = ZkPassUtilError::MQError(ZkPassMQError::ConnectionError);
        assert_eq!(err.to_string(), "Failed to connect to rabbitmq");

        let err = ZkPassUtilError::MissingVariableError(String::from("variable"));
        assert_eq!(err.to_string(), "Missing variable `variable`");
    }

    #[test]
    fn test_zkpass_mq_error() {
        let err = ZkPassMQError::ConnectionError;
        assert_eq!(err.to_string(), "Failed to connect to rabbitmq");

        let err = ZkPassMQError::ConnectionCallbackError;
        assert_eq!(err.to_string(), "Failed to register rabbitmq connection callback");

        let err = ZkPassMQError::ChannelCallbackError;
        assert_eq!(err.to_string(), "Failed to register rabbitmq channel callback");

        let err = ZkPassMQError::ChannelError;
        assert_eq!(err.to_string(), "Failed to create channel");

        let err = ZkPassMQError::DeclareError;
        assert_eq!(err.to_string(), "Failed to declare exchange and queue");

        let err = ZkPassMQError::PublishError;
        assert_eq!(err.to_string(), "Failed to publish message");

        let err = ZkPassMQError::ConsumeError;
        assert_eq!(err.to_string(), "Failed to consume message");

        let err = ZkPassMQError::BindError;
        assert_eq!(err.to_string(), "Failed to bind queue to exchange");
    }
}
