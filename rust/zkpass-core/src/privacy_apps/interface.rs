/*
 * interface.rs
 * File contains shared components for privacy apps
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
use async_trait::async_trait;
use serde::{ Deserialize, Serialize };
use std::fmt::Debug;
use std::sync::Arc;
use tokio::sync::Mutex;
use std::cell::RefCell;
use crate::socket::connection::SocketConnection;

pub type SocketConnectionMutex = Arc<Mutex<RefCell<Option<Box<dyn SocketConnection>>>>>;

/// <span style="font-size: 1.1em; color: #996515;"> ***Privacy App errors trait.*** </span>
pub trait ZkPassPrivacyAppError: std::fmt::Debug {}

/// <span style="font-size: 1.1em; color: #996515;"> ***Represents a public key.*** </span>
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct PublicKey {
    /// `x` represents the x parameter of the public key.
    pub x: String,

    /// `y` represents the y parameter of the public key.
    pub y: String,
}

impl PublicKey {
    pub fn to_pem(&self) -> String {
        format!(
            "-----BEGIN PUBLIC KEY-----\n{x}\n{y}\n-----END PUBLIC KEY-----",
            x = self.x.as_str(),
            y = self.y.as_str()
        )
    }
}

///
/// <span style="font-size: 1.1em; color: #996515;"> ***Represents a JWKS (JSON Web Key Set) end point.*** </span>
///
///  The JWKS endpoint serves a set of public keys.
///
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct KeysetEndpoint {
    /// The url of the end point.
    pub jku: String,
    /// The key to locate the public key.
    pub kid: String,
}

///
/// <span style="font-size: 1.1em; color: #996515;"> ***Provides alternative ways to represent a public key.*** </span>
///
/// Either the `PublicKey` or the `KeysetEndpoint` can be used as a public key.
/// This is useful for sites which do not support JWKS and opts to provide the public key using `PublicKey` directly.
///
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum PublicKeyOption {
    /// Using PublicKey as a public key
    PublicKey(PublicKey),
    /// Using KeysetEndpoint as the reference to a public key
    KeysetEndpoint(KeysetEndpoint),
}

/// Represents the input to an application.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppInput {
    pub app_name: String,
    pub entry_point: String,
    pub input_data: Vec<String>, // each entry in JWT - signed & encrypted
    pub app_metadata: String, // in JWT - signed & encrypted
    pub aux_data: Option<String>,
}

/// Represents the output from an application.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppOutput {
    pub app_name: String,
    pub entry_point: String,
    pub output_data: String, // in JWT - signed
}

/// A trait for the ZkPass application interface.
#[async_trait]
pub trait ZkPassAppInterface {
    /// Processes the input data for the application.
    ///
    /// # Arguments
    ///
    /// * `app_version` - The version of the application.
    /// * `entry_point` - The entry point of the application.
    /// * `post_data` - The HTTP post data.
    ///
    /// # Returns
    ///
    /// A result containing the `AppInput` or a `Box<dyn ZkPassPrivacyAppError>`.
    async fn process_input(
        &self,
        app_version: &str,
        entry_point: &str,
        post_data: &str // HTTP post data
    ) -> Result<AppInput, Box<dyn ZkPassPrivacyAppError>>;

    /// Executes the application with the given input.
    ///
    /// # Arguments
    ///
    /// * `app_input` - The input to the application.
    /// * `socket` - Socket for the resolver.
    /// * `zkpass_decrypting_key` - The decrypting key for ZkPass.
    /// * `zkpass_signing_key` - The signing key for ZkPass.
    /// * `zkpass_signing_key_ep` - The keyset endpoint for the signing key.
    ///
    /// # Returns
    ///
    /// A result containing the `AppOutput` or a `Box<dyn ZkPassPrivacyAppError>`.
    async fn execute_app(
        &self,
        app_input: &AppInput,
        socket: SocketConnectionMutex,
        zkpass_decrypting_key: &str,
        zkpass_signing_key: &str,
        zkpass_signing_key_ep: &KeysetEndpoint
    ) -> Result<AppOutput, Box<dyn ZkPassPrivacyAppError>>;
}
