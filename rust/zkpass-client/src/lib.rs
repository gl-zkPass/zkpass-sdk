/*
 * lib.rs
 *
 * Authors:
 *   Antony Halim (antony.halim@gdplabs.id)
 * Created at: September 26th 2023
 * -----
 * Last Modified: April 29th 2024
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

//! # zkPass Client SDK Library
//!
//! The **zkpass-client** crate is the official Rust SDK library for integrating with the zkPass ecosystem. It offers a suite of functionalities designed to facilitate the interaction between applications and the zkPass platform via its RESTful API.
//!
//! This SDK abstracts the complexity of signing and encrypting data, and simplifies the direct RESTful API call by providing a robust, idiomatic Rust interface for the zkPass Service. By handling lower-level details, zkpass-client allows developers to focus on building feature-rich applications with confidence in their security and reliability.
//!
//! ## Features
//!
//! **zkpass-client** comes with a comprehensive set of features that include:
//!
//! - **ZkPass Proof Generation** <br>Mechanism to generate ZkPassProofs as part of the data verification process without revealing the underlying user data. This abstracts the call to the RESTful API of the zkPass Service.
//! - **ZkPass Proof Verification** <br> Function to verify the validity of a ZkPassProof, confirming the integrity and authenticity of the proof without the
//!  need for a third-party verifier. Unlike the proof generation, the proof verification is computed locally, having no dependency on external services.
//! - **JWS Support** <br> Simplified interface for signing JSON Web Signatures (JWS) and verifying the authenticity of data .
//! - **JWE Handling** <br> Functions to encrypt data into JSON Web Encryption (JWE) tokens and decrypt received JWE tokens, ensuring the privacy of sensitive information.
//!

pub mod interface;
mod helpers;
mod zkpass_client;
//use zkpass_core::interface::*;
pub mod core {
    use serde::{ Deserialize, Serialize };
    // Re-export all types from zkpass-core
    pub use zkpass_core::interface::{
        DataVerificationRequest,
        KeysetEndpoint,
        PublicKey,
        ZkPassProof,
        PublicKeyOption,
        ZkPassError,
        KeysetEndpointResolver,
        sign_data_to_jws_token,
        verify_jws_token,
        encrypt_data_to_jwe_token,
        decrypt_jwe_token,
        Jwk,
    };
    pub use zkpass_query_types::{ Val, Entry, OutputReader };

    ///
    /// <span style="font-size: 1.1em; color: #996515;"> ***Contains the result of a zkPass query.*** </span>
    ///
    #[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
    pub struct ProofMethodOutput {
        /// `result` is a boolean value for the result of the query
        pub result: bool,
    }
}

mod import {
    use crate::core::{ * };
    use tracing::info;
    use zkpass_query_types::ZkPassQueryEngineError;

    const ZKPASS_QUERY_DLL: &str = "zkpass_query.so";
    const VERIFY_ZKPROOF_INTERNAL_FN: &str = "verify_zkproof_internal";
    const GET_QUERY_METHOD_VERSION_INTERNAL_FN: &str = "get_query_method_version_internal";
    const GET_QUERY_ENGINE_VERSION_INTERNAL_FN: &str = "get_query_engine_version_internal";

    pub(crate) fn verify_zkproof(zkvm: &str, receipt: &str) -> Result<String, ZkPassError> {
        let dll = format!("lib{}_{}", zkvm, ZKPASS_QUERY_DLL);
        let function = format!("{}_{}", zkvm, VERIFY_ZKPROOF_INTERNAL_FN);

        unsafe {
            info!(">> verify_zkproof");
            let lib = libloading::Library
                ::new(dll)
                .map_err(|_| ZkPassError::MissingZkPassQueryLibrary)?;

            let func: libloading::Symbol<
                unsafe extern "C" fn(&str) -> Result<String, ZkPassQueryEngineError>
            > = lib.get(function.as_bytes()).map_err(|_| ZkPassError::FunctionRetrievalError)?;

            info!("<< verify_zkproof");
            let result = func(receipt).map_err(|err|
                ZkPassError::QueryEngineError(format!("{:?}", err))
            )?;
            Ok(result)
        }
    }

    pub(crate) fn get_query_method_version(zkvm: &str) -> Result<String, ZkPassError> {
        let dll = format!("lib{}_{}", zkvm, ZKPASS_QUERY_DLL);
        let function = format!("{}_{}", zkvm, GET_QUERY_METHOD_VERSION_INTERNAL_FN);

        unsafe {
            info!(">> get_query_method_version");
            let lib = libloading::Library
                ::new(dll)
                .map_err(|_| ZkPassError::MissingZkPassQueryLibrary)?;
            let func: libloading::Symbol<unsafe extern "C" fn() -> String> = lib
                .get(function.as_bytes())
                .map_err(|_| ZkPassError::FunctionRetrievalError)?;

            info!("<< get_query_method_version");
            Ok(func())
        }
    }

    pub(crate) fn get_query_engine_version(zkvm: &str) -> Result<String, ZkPassError> {
        let dll = format!("lib{}_{}", zkvm, ZKPASS_QUERY_DLL);
        let function = format!("{}_{}", zkvm, GET_QUERY_ENGINE_VERSION_INTERNAL_FN);

        println!("#### dll={}", dll);
        println!("#### function={}", function);

        unsafe {
            info!(">> get_query_engine_version");
            let lib = libloading::Library
                ::new(dll)
                .map_err(|_| ZkPassError::MissingZkPassQueryLibrary)?;
            let func: libloading::Symbol<unsafe extern "C" fn() -> String> = lib
                .get(function.as_bytes())
                .map_err(|_| ZkPassError::FunctionRetrievalError)?;

            info!("<< get_query_engine_version");
            Ok(func())
        }
    }
}

pub fn package_version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}
