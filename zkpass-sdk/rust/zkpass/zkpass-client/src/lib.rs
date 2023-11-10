//! # zkPass-client SDK Library
//!
//! The **zkpass-client** crate is the official Rust SDK for integrating with the zkPass ecosystem. It offers a suite of functionalities designed to facilitate the interaction between applications and the zkPass platform via its RESTful API.
//!
//! This SDK abstracts the complexity of direct API calls and provides a robust, idiomatic Rust interface for the zkPass Service. By handling lower-level details, zkpass-client allows developers to focus on building feature-rich applications with confidence in their security and reliability.
//!
//! ## Features
//!
//! **zkpass-client** comes with a comprehensive set of features that include, but are not limited to:
//!
//! - **JWS Support**: Simplified interface for signing JSON Web Signatures (JWS) and verifying the authenticity of data . 
//! - **JWE Handling**: Functions to encrypt data into JSON Web Encryption (JWE) tokens and decrypt received JWE tokens, ensuring the privacy of sensitive information.
//! - **ZkPassProof Generation**: Mechanisms to generate ZkPassProofs as part of the data verification process without revealing the underlying user data.
//! - **Proof Verification**: Functions to verify the validity of a ZkPassProof, confirming the integrity and authenticity of the proof without the need for a third-party verifier.
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
        get_current_timestamp,
    };

    ///
    /// <span style="font-size: 1.1em; color: #996515;"> ***The `ProofMethodOutput` struct represents the result of a zkPass query.*** </span>
    /// 
    #[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
    pub struct ProofMethodOutput {
        /// `result` is a boolean value for the result of the query
        pub result: bool
    }
}

use zkpass_core::interface::verify_jws_token;
use crate::interface::{*};
use crate::core::{*};

const ZKPASS_DSA_PUBKEY_X: &str = "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU";
const ZKPASS_DSA_PUBKEY_Y: &str ="IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==";


fn verify_zkproof_internal(receipt: &str) -> ProofMethodOutput {
    unsafe {
        let lib = libloading::Library::new("libr0_zkpass_query.so").unwrap();
        let func: libloading::Symbol<unsafe extern "C" fn(&str) -> ProofMethodOutput> = lib.get(b"verify_zkproof_internal").unwrap();
        func(receipt)
    }
}

fn get_query_method_version_internal() -> String {
    unsafe {
        let lib = libloading::Library::new("libr0_zkpass_query.so").unwrap();
        let func: libloading::Symbol<unsafe extern "C" fn() -> String> = lib.get(b"get_query_method_version_internal").unwrap();
        func()
    }
}

fn get_query_engine_version_internal() -> String {
    unsafe {
        let lib = libloading::Library::new("libr0_zkpass_query.so").unwrap();
        let func: libloading::Symbol<unsafe extern "C" fn() -> String> = lib.get(b"get_query_engine_version_internal").unwrap();
        func()
    }
}

impl ZkPassProofVerifier for ZkPassClient {
    fn verify_zkpass_proof_internal(
        &self,
        zkpass_proof_token:                 &str
    ) -> Result<(bool, ZkPassProof), ZkPassError> {
        let zkpass_proof_verifying_key = PublicKey {
            x: String::from(ZKPASS_DSA_PUBKEY_X),
            y: String::from(ZKPASS_DSA_PUBKEY_Y)
        };

        let (zkpass_proof, _header) = verify_jws_token(
            zkpass_proof_verifying_key.to_pem().as_str(),
            zkpass_proof_token)?;
        let zkpass_proof: ZkPassProof = serde_json::from_value(zkpass_proof).unwrap();
        //
        //  zkp verification
        //
        let output = verify_zkproof_internal(&zkpass_proof.zkproof);

        Ok((output.result, zkpass_proof))
    }

    fn get_query_engine_version_info(&self) -> (String, String) {
        (get_query_engine_version_internal(), get_query_method_version_internal())
    }
}