/*
 * proof_verifier.rs
 * Simulating the Proof Verifier process for the zkPass Demo
 *
 * ---
 * References:
 *   https://docs.ssi.id/zkpass/zkpass-developers-guide/privacy-apps/dvr/dvr-client-roles/proof-verifier
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
use crate::{
    helper::extract_payload_without_validation,
    lib_loader::{
        generate_query_token,
        get_dvr_id_from_proof,
        verify_zkpass_proof as verify_zkpass_proof_ffi,
    },
    sample_keys::{ issuer_pubkey, verifier_pubkey, VERIFIER_PRIVKEY },
};
use dvr_types::{
    DvrDataFfi,
    ExpectedDvrMetadataFfi,
    UserDataRequestFfi,
    PublicKeyOptionFfi,
    PublicKeyOptionTagFfi,
    PublicKeyOptionUnionFfi,
    KeysetEndpointFfi,
    PublicKeyFfi,
};
use lazy_static::lazy_static;
use serde_json::Value;
use std::{ collections::HashMap, io::prelude::*, sync::Mutex, time::Instant, ffi::CString };
use tracing::trace;
use uuid::Uuid;

//
//  Global table to store the generated DVR values
//  The Verifier needs to keep track of all generated DVRs
//  so that it can verify the proof metadata
//  Note: The hash table entry should have time-expiration
//
lazy_static! {
    static ref DVR_TABLE: Mutex<HashMap<String, String>> = {
        let map = HashMap::new();
        Mutex::new(map)
    };
}

// This struct ensures that the data reference is valid
pub struct PublicKeyOptionHolder {
    key_x: CString,
    key_y: CString,
    empty_str: CString,
    pub public_key_option: PublicKeyOptionFfi,
}

// This struct ensures that the data reference is valid
#[allow(dead_code)]
struct UserDataRequestsHolder {
    tags: Vec<CString>,
    user_data_requests: Vec<UserDataRequestFfi>,
    key_x: CString,
    key_y: CString,
    empty_str: CString,
    public_key_option: PublicKeyOptionFfi,
}

//
//  Simulating the Proof Verifier
//
pub struct ProofVerifier {
    pub user_data_tags: Vec<String>,
}

impl Default for ProofVerifier {
    fn default() -> Self {
        ProofVerifier {
            user_data_tags: Vec::new(),
        }
    }
}

impl ProofVerifier {
    ///
    /// Generates the user data requests.
    ///
    fn user_data_requests(&self) -> Box<UserDataRequestsHolder> {
        let issuer_public_key_option_holder = self.generate_issuer_public_key_option();
        let user_data_tags = self.user_data_tags.clone();
        let tags: Vec<CString> = user_data_tags
            .iter()
            .map(|tag| CString::new(tag.as_str()).unwrap())
            .collect();

        let user_data_requests = tags
            .iter()
            .map(|tag| {
                UserDataRequestFfi {
                    key: tag.as_ptr(),
                    value: issuer_public_key_option_holder.public_key_option.clone(),
                }
            })
            .collect();

        Box::new(UserDataRequestsHolder {
            tags,
            user_data_requests: user_data_requests,
            key_x: issuer_public_key_option_holder.key_x,
            key_y: issuer_public_key_option_holder.key_y,
            empty_str: issuer_public_key_option_holder.empty_str,
            public_key_option: issuer_public_key_option_holder.public_key_option,
        })
    }

    ///
    /// Simulates the Proof Verifier's get_dvr_token REST API.
    ///
    pub fn get_dvr_token(
        &mut self,
        zkvm: &str,
        dvr_file: &str,
        user_data_tags: Vec<&String>
    ) -> String {
        self.user_data_tags = user_data_tags
            .iter()
            .cloned()
            .map(|s| s.clone())
            .collect();

        let mut query_content = std::fs::File::open(dvr_file).expect("Cannot find the dvr file");
        let mut query = String::new();
        query_content.read_to_string(&mut query).expect("Should not have I/O errors");
        trace!("query={}", query);

        let query: Value = serde_json::from_str(&query).unwrap();

        //
        //  Proof Verifier's integration points with the zkpass-client SDK library
        //  (for get_dvr_token REST API)
        //

        let query_string = serde_json::to_string(&query).unwrap();

        let zkvm_cstring = CString::new(zkvm).unwrap();
        let dvr_title_cstring = CString::new("My DVR").unwrap();
        let dvr_id_cstring = CString::new(Uuid::new_v4().to_string()).unwrap();
        let query_cstring = CString::new(query_string).unwrap();

        let verifier_public_key_option_holder = self.generate_verifier_public_key_option();
        let verifier_public_key_option = verifier_public_key_option_holder.public_key_option;

        let user_data_requests_holder = self.user_data_requests();
        let user_data_requests = user_data_requests_holder.user_data_requests;
        let user_data_requests_slice = user_data_requests.as_slice();

        //
        // Step 1: Create the DVR object.
        //
        let dvr_data = DvrDataFfi {
            zkvm: zkvm_cstring.as_ptr(),
            dvr_title: dvr_title_cstring.as_ptr(),
            dvr_id: dvr_id_cstring.as_ptr(),
            query: query_cstring.as_ptr(),
            user_data_requests: user_data_requests_slice.as_ptr(),
            user_data_requests_len: user_data_requests_slice.len() as u64,
            dvr_verifying_key: verifier_public_key_option,
        };

        //
        //  Step 2: Call dvr client's generate_query_token function
        //          to digitally-sign the dvr data.
        //
        let dvr_token = unsafe { generate_query_token(VERIFIER_PRIVKEY, dvr_data) };
        let payload = extract_payload_without_validation(&dvr_token).unwrap();

        // save the dvr to a global hash table
        // this will be needed by the validator to check the proof metadata
        let mut dvr_table = DVR_TABLE.lock().unwrap();
        if let Some(data) = payload.get("data") {
            let dvr_id = data["dvr_id"].as_str().unwrap();
            dvr_table.insert(dvr_id.to_string(), data.to_string());
        }

        dvr_token
    }

    ///
    /// Generates the public key option.
    ///
    pub fn generate_public_key_option(&self, is_verifier: bool) -> Box<PublicKeyOptionHolder> {
        let (key_x, key_y) = if is_verifier { verifier_pubkey() } else { issuer_pubkey() };
        let key_x = CString::new(key_x).unwrap();
        let key_y = CString::new(key_y).unwrap();
        let empty_str = CString::new("").unwrap();

        let public_key_option = PublicKeyOptionFfi {
            tag: PublicKeyOptionTagFfi::PublicKey,
            value: PublicKeyOptionUnionFfi {
                keyset_endpoint: KeysetEndpointFfi {
                    jku: empty_str.as_ptr(),
                    kid: empty_str.as_ptr(),
                },
                public_key: PublicKeyFfi {
                    x: key_x.as_ptr(),
                    y: key_y.as_ptr(),
                },
            },
        };

        Box::new(PublicKeyOptionHolder {
            key_x,
            key_y,
            empty_str,
            public_key_option,
        })
    }

    ///
    /// Generates the verifier public key option.
    ///
    fn generate_verifier_public_key_option(&self) -> Box<PublicKeyOptionHolder> {
        self.generate_public_key_option(true)
    }

    ///
    /// Generates the issuer public key option.
    ///
    fn generate_issuer_public_key_option(&self) -> Box<PublicKeyOptionHolder> {
        self.generate_public_key_option(false)
    }

    //
    /// Simulates the Proof Verifier's verify_zkpass_proof REST API.
    ///
    pub async fn verify_zkpass_proof(&self, zkvm: &str, zkpass_proof_token: &str) -> String {
        println!("\n#### starting zkpass proof verification...");
        let start = Instant::now();

        let url = std::env
            ::var("ZKPASS_URL")
            .unwrap_or("https://staging-zkpass.ssi.id".to_string());

        let some_ttl: u64 = 3600;
        let dvr_id = unsafe { get_dvr_id_from_proof(zkpass_proof_token) };
        let expected_dvr = DVR_TABLE.lock().unwrap().get(&dvr_id).unwrap().clone();
        let expected_dvr_cstring = CString::new(expected_dvr).unwrap();

        let user_data_requests_holder = self.user_data_requests();
        let user_data_requests = user_data_requests_holder.user_data_requests;
        let user_data_requests_slice = user_data_requests.as_slice();

        //
        // Step 1: Create the expected metadata object.
        //
        let expected_metadata = ExpectedDvrMetadataFfi {
            ttl: some_ttl,
            dvr: expected_dvr_cstring.as_ptr(),
            user_data_verifying_keys: user_data_requests_slice.as_ptr(),
            user_data_verifying_keys_len: user_data_requests_slice.len() as u64,
        };

        //
        // Step 2: Call zkpass_client.verify_zkpass_proof to verify the proof.
        //
        let result = unsafe {
            verify_zkpass_proof_ffi(&url, zkvm, zkpass_proof_token, expected_metadata)
        };

        let duration = start.elapsed();
        println!("#### verification completed [time={:?}]", duration);

        result
    }
}
