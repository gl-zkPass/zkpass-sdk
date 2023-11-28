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
mod zkpass_client;
//use zkpass_core::interface::*;
pub mod core {
    use serde::{Deserialize, Serialize};
    // Re-export all types from zkpass-core
    pub use zkpass_core::interface::{
        DataVerificationRequest, KeysetEndpoint, PublicKey, ZkPassProof,
        PublicKeyOption, ZkPassError,
        KeysetEndpointResolver,
    };

    ///
    /// <span style="font-size: 1.1em; color: #996515;"> ***Contains the result of a zkPass query.*** </span>
    /// 
    #[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
    pub struct ProofMethodOutput {
        /// `result` is a boolean value for the result of the query
        pub result: bool
    }
}

mod import {
    use crate::core::{*};
    const ZKPASS_QUERY_DLL: &str = "libr0_zkpass_query.so";

    pub(crate) fn verify_zkproof(receipt: &str) -> ProofMethodOutput {
        unsafe {
            let lib = libloading::Library::new(ZKPASS_QUERY_DLL).unwrap();
            let func: libloading::Symbol<unsafe extern "C" fn(&str) -> ProofMethodOutput> = lib.get(b"verify_zkproof_internal").unwrap();
            func(receipt)
        }
    }

    pub(crate) fn get_query_method_version() -> String {
        unsafe {
            let lib = libloading::Library::new(ZKPASS_QUERY_DLL).unwrap();
            let func: libloading::Symbol<unsafe extern "C" fn() -> String> = lib.get(b"get_query_method_version_internal").unwrap();
            func()
        }
    }

    pub(crate) fn get_query_engine_version() -> String {
        unsafe {
            let lib = libloading::Library::new(ZKPASS_QUERY_DLL).unwrap();
            let func: libloading::Symbol<unsafe extern "C" fn() -> String> = lib.get(b"get_query_engine_version_internal").unwrap();
            func()
        }
    }
}