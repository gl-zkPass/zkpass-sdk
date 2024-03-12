use std::time::Instant;
use tracing::info;
//use serde_json::Value;
use crate::constants;
use crate::data_issuer::DataIssuer;
use crate::proof_verifier::ProofVerifier;
use zkpass_client::interface::{ZkPassApiKey, ZkPassClient, ZkPassProofGenerator};

pub struct DataHolder;

impl DataHolder {
    pub async fn start(&self, zkvm: &str, data_file: &str, dvr_file: &str) {
        //
        //  Get the user data from the data issuer
        //
        let data_issuer = DataIssuer;
        let user_data_token = data_issuer.get_user_data_token(zkvm, data_file);

        //
        //  Get the dvr from the verifier
        //
        let proof_verifier = ProofVerifier;
        let dvr_token = proof_verifier.get_dvr_token(zkvm, dvr_file);

        let zkpass_service_url = constants::ZKPASS_URL; // Use the ZKPASS_URL constant from the constants module
        info!("service_url={}", zkpass_service_url);
        println!("\n#### starting zkpass proof generation...");
        let start = Instant::now();

        //
        //  Data Holder's integration points with the zkpass-client SDK library
        //

        //
        // Step 1: Instantiate the zkpass_client object.
        //
        let api_key = String::from(constants::API_KEY);
        let secret_api_key = String::from(constants::SECRET_API_KEY);
        let zkpass_api_key = ZkPassApiKey {
            api_key,
            secret_api_key,
        };
        let zkpass_client = ZkPassClient::new(&zkpass_service_url, zkpass_api_key, zkvm);

        //
        // Step 2: Call the zkpass_client.generate_zk_pass_proof
        //         to get the zkpass_proof_token.
        //
        let zkpass_proof_token = zkpass_client
            .generate_zkpass_proof(&user_data_token, &dvr_token)
            .await
            .unwrap();

        let duration = start.elapsed();
        println!("#### generation completed [time={:?}]", duration);

        //
        //  Step 3: Send the zkpass_proof_token to the Proof Verifier
        //          to get the proof verified and retrieve the query result.
        //
        let query_result = proof_verifier
            .verify_zkpass_proof(zkvm, zkpass_proof_token.as_str())
            .await;

        println!("the query result is {}", query_result)
    }
}
