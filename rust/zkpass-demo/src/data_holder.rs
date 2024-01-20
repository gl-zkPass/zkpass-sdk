#[cfg(feature = "oop")]
pub mod holder {
    use zkpass_client::interface::{ZkPassApiKey, ZkPassClient, ZkPassProofGenerator};

    //use std::time::Instant;
    //use serde_json::Value;
    use crate::data_issuer::issuer::MyDataIssuer;
    use crate::proof_verifier::verifier::MyProofVerifier;

    pub struct MyDataHolder;

    impl MyDataHolder {
        pub async fn start(&self, data_file: &str, dvr_file: &str) {
            //
            //  Get the user data from the data issuer
            //
            let data_issuer = MyDataIssuer;
            let user_data_token = data_issuer.get_user_data_token(data_file);

            //
            //  Get the dvr from the verifier
            //
            let proof_verifier = MyProofVerifier;
            let dvr_token = proof_verifier.get_dvr_token(dvr_file);

            //
            //  Data Holder's integration points with the zkpass-client SDK library
            //
            let service_url = "https://playground-zkpass.ssi.id/proof";
            let api_key = ZkPassApiKey {
                api_key: "5ecb2229-ddee-460e-b598-a0001c10fff1".to_string(),
                secret_api_key: "074a53a8-a252-45de-a9d5-0961a6362df6".to_string(),
            };
            let zkpass_client = ZkPassClient::new(service_url, api_key);
            let proof = zkpass_client
                .generate_zkpass_proof(&user_data_token, &dvr_token)
                .await
                .unwrap();
            // println!("#### proof created [time={:?}]", duration);

            //
            //  Step 3: Send the zkpass_proof_token to the Proof Verifier
            //          to get the proof verified and retrieve the query result.
            //
            let query_result = proof_verifier.verify_zkpass_proof(proof.as_str());

            println!("the query result is {}", query_result)
        }
    }
}

#[cfg(feature = "straight")]
pub mod holder {
    use std::time::Instant;
    //use serde_json::Value;
    use crate::data_issuer::issuer::MyDataIssuer;
    use crate::proof_verifier::verifier::MyProofVerifier;
    use zkpass_client::interface::{ZkPassClient, ZkPassProofGenerator};

    pub struct MyDataHolder;

    impl MyDataHolder {
        pub async fn start(&self, data_file: &str, dvr_file: &str) {
            //
            //  Get the user data from the data issuer
            //
            let data_issuer = MyDataIssuer;
            let user_data_token = data_issuer.get_user_data_token(data_file);

            //
            //  Get the dvr from the verifier
            //
            let proof_verifier = MyProofVerifier;
            let dvr_token = proof_verifier.get_dvr_token(dvr_file);

            let zkpass_service_url = String::from("https://playground-zkpass.ssi.id/proof");
            //let zkpass_service_url = String::from("http://localhost:10888/proof");
            println!("\n#### starting zkpass proof generation...");
            let start = Instant::now();

            //
            //  Data Holder's integration points with the zkpass-client SDK library
            //

            //
            // Step 1: Instantiate the zkpass_client object.
            //
            let zkpass_client = ZkPassClient;

            //
            // Step 2: Call the zkpass_client.generate_zk_pass_proof
            //         to get the zkpass_proof_token.
            //
            let zkpass_proof_token = zkpass_client
                .generate_zkpass_proof(&zkpass_service_url, &user_data_token, &dvr_token)
                .await
                .unwrap();

            let duration = start.elapsed();
            println!("#### generation completed [time={:?}]", duration);

            //
            //  Step 3: Send the zkpass_proof_token to the Proof Verifier
            //          to get the proof verified and retrieve the query result.
            //
            let query_result = proof_verifier.verify_zkpass_proof(zkpass_proof_token.as_str());

            println!("the query result is {}", query_result)
        }
    }
}
