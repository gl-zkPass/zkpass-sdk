/*
 * data_holder.rs
 * Simulating the Data Holder process for the zkPass Demo
 *
 * ---
 * References:
 *   https://docs.ssi.id/zkpass/zkpass-developers-guide/privacy-apps/dvr/dvr-client-roles/data-holder
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
use crate::{
    data_issuer::DataIssuer,
    proof_verifier::ProofVerifier,
    lib_loader::generate_zkpass_proof,
};
use client_utils::interface::PrivacyAppCredentialsFfi;
use std::{ collections::HashMap, time::Instant, ffi::CString };
use tracing::info;
use zkpass_query_types::OutputReader;

pub struct DataHolder;

impl DataHolder {
    ///
    /// Starts the Data Holder process.
    ///
    pub async fn start(&self, zkvm: &str, data_files: HashMap<String, String>, dvr_file: &str) {
        //
        //  Get the user data from the data issuer
        //
        let data_issuer = DataIssuer;
        let user_data_tokens_map = data_issuer.get_user_data_tokens(data_files);
        let user_data_tags_list: Vec<&String> = user_data_tokens_map.keys().collect();
        let user_data_tokens = serde_json::to_string(&user_data_tokens_map).unwrap();

        //
        //  Get the dvr from the verifier
        //
        let mut proof_verifier = ProofVerifier::default();
        let dvr_token = proof_verifier.get_dvr_token(zkvm, dvr_file, user_data_tags_list);

        let zkpass_service_url = std::env
            ::var("ZKPASS_URL")
            .unwrap_or("https://staging-zkpass.ssi.id".to_string());
        info!("service_url={}", zkpass_service_url);
        println!("\n#### starting zkpass proof generation...");
        let start = Instant::now();

        //
        //  Data Holder's integration points with the zkpass-client SDK library
        //

        //
        // Step 1: Call the dvr client's generate_zk_pass_proof
        //         to get the zkpass_proof_token.
        //
        let credentials = self.generate_credential();
        let zkpass_proof_token = unsafe {
            generate_zkpass_proof(credentials, user_data_tokens, dvr_token)
        };

        let duration = start.elapsed();
        println!("#### generation completed [time={:?}]", duration);

        //
        //  Step 2: Send the zkpass_proof_token to the Proof Verifier
        //          to get the proof verified and retrieve the query result.
        //
        let query_result = proof_verifier.verify_zkpass_proof(zkvm, &zkpass_proof_token).await;

        println!("json-result={}", OutputReader::pretty_print(&query_result));
        let output_reader = OutputReader::from_json(&query_result).unwrap();
        println!(">> output list:");
        for entry in output_reader.enumerate() {
            println!("key={}, value={:?}", entry.key, entry.val);
        }
        println!("<< end of list");

        let val = output_reader.find_bool("result").unwrap();
        println!("the query result is {}", val);
    }

    ///
    /// Generates the privacy app credentials.
    ///
    fn generate_credential(&self) -> PrivacyAppCredentialsFfi {
        let base_url = std::env
            ::var("ZKPASS_URL")
            .unwrap_or("https://staging-zkpass.ssi.id".to_string());
        let api_key = std::env::var("API_KEY").expect("API_KEY must be set");
        let secret_api_key = std::env::var("SECRET_API_KEY").expect("SECRET_API_KEY must be set");

        PrivacyAppCredentialsFfi {
            base_url: CString::new(base_url).unwrap().into_raw(),
            api_key: CString::new(api_key).unwrap().into_raw(),
            secret_api_key: CString::new(secret_api_key).unwrap().into_raw(),
        }
    }
}
