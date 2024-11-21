/*
 * interface.rs
 * Provides common interface for Privacy App clients.
 * Some interfaces must be FFI-safe, these ones will have the suffix "*Ffi".
 *
 * Authors:
 * Created at: September 5th 2024
 * -----
 * Last Modified: September 14th 2024
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
use serde::{ Deserialize, Serialize };
use std::ffi::c_char;
use thiserror::Error;

// FFI-safe struct to contain the credentials needed to authenticate with Privacy App API
// To be FFI-safe, we use `*const c_char` instead of String
#[repr(C)]
pub struct PrivacyAppCredentialsFfi {
    pub base_url: *const c_char,
    pub api_key: *const c_char,
    pub secret_api_key: *const c_char,
}

// Types of error that can occur in the client library
// This enum will be expanded as we find more error cases
#[derive(Error, Debug)]
pub enum ClientLibError {
    #[error(transparent)] SerdeJsonError(#[from] serde_json::Error),

    #[error(transparent)] ReqwestError(#[from] reqwest::Error),

    #[error("Server returned HTTP status '{0}' with body: {1}")] ServerResponseNotOk(
        reqwest::StatusCode,
        String,
    ),

    #[error("{0}")] CustomError(String),
}

// Represents the response object from the Privacy App API
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PrivacyAppResult {
    pub status: u32,
    pub output: String,
}
