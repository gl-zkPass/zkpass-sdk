/*
 * errors.rs
 * this file contains common errors and their implementation
 * that are used on zkpass-host and zkpass-ws
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 *   JaniceLaksana (janice.laksana@gdplabs.id)
 * Created Date: November 30th 2023
 * -----
 * Last Modified: March 7th 2024
 * Modified By: William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * -----
 * Reviewers:
 *   Antony Halim (antony.halim@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   ntejapermana (nugraha.tejapermana@gdplabs.id)
 *   Khandar William (khandar.william@gdplabs.id)
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
use zkpass_core::interface::ZkPassError;

#[derive(Debug, Clone)]
pub enum ZkPassSocketError {
    DeserializeError(String),
    SerializeError(String),
    ReadError,
    WriteError,
    ConnectionError,
    SocketBindingError,
    ConversionError,
    UtilError(ZkPassUtilError),
    CustomError(String),
    EmptyParameterError,
}

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
            ZkPassSocketError::ReadError => "E2003-EReadError",
            ZkPassSocketError::WriteError => "E2004-EWriteError",
            ZkPassSocketError::ConnectionError => "E2005-EConnectionError",
            ZkPassSocketError::SocketBindingError => "E2006-ESocketBindingError",
            ZkPassSocketError::ConversionError => "E2007-EConversionError",
            ZkPassSocketError::CustomError(_) => "E2008-ECustomError",
            ZkPassSocketError::UtilError(_) => "E2009-EUtilError",
            ZkPassSocketError::EmptyParameterError => "E2010-EEmptyParameter",
        }
    }

    pub fn get_error_key(&self) -> &'static str {
        match self {
            ZkPassSocketError::DeserializeError(_) => "DeserializeError",
            ZkPassSocketError::SerializeError(_) => "SerializeError",
            ZkPassSocketError::ReadError => "ReadError",
            ZkPassSocketError::WriteError => "WriteError",
            ZkPassSocketError::ConnectionError => "ConnectionError",
            ZkPassSocketError::SocketBindingError => "SocketBindingError",
            ZkPassSocketError::ConversionError => "ConversionError",
            ZkPassSocketError::CustomError(_) => "CustomError",
            ZkPassSocketError::UtilError(_) => "UtilError",
            ZkPassSocketError::EmptyParameterError => "EmptyParameterError",
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
            ZkPassUtilError::ConnectionError => String::from("Conenction Error"),
            ZkPassUtilError::MissingEnvError(var) => format!("Missing env variable `{}`", var),
            ZkPassUtilError::ActionError(var) =>
                match var.is_empty() {
                    true => String::from("Failed to perform action"),
                    false => format!("Failed to perform action `{}`", var),
                }
            ZkPassUtilError::CustomError(var) => var.to_string(),
            ZkPassUtilError::MQError(var) => var.to_string(),
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
