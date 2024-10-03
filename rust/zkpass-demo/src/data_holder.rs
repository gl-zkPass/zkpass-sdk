use crate::constants;
use crate::data_issuer::DataIssuer;
use crate::proof_verifier::ProofVerifier;
use std::collections::HashMap;
use std::time::Instant;
use tracing::info;
use zkpass_client::core::OutputReader;
use zkpass_client::interface::{ZkPassApiKey, ZkPassClient, ZkPassProofGenerator};

pub struct DataHolder;

impl DataHolder {
    pub async fn start(&self, zkvm: &str, data_files: HashMap<String, String>, dvr_file: &str) {
        //
        //  Get the user data from the data issuer
        //
        let data_issuer = DataIssuer;
        let user_data_tokens = data_issuer.get_user_data_tokens(zkvm, data_files);
        let user_data_tags: Vec<&String> = user_data_tokens.keys().collect();

        //
        //  Get the dvr from the verifier
        //
        let proof_verifier = ProofVerifier;
        let dvr_token = proof_verifier.get_dvr_token(zkvm, dvr_file, user_data_tags);

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
        let zkpass_client = ZkPassClient::new(&zkpass_service_url, Some(zkpass_api_key), zkvm);

        //
        // Step 2: Call the zkpass_client.generate_zk_pass_proof
        //         to get the zkpass_proof_token.
        //
        let zkpass_proof_token = zkpass_client
            .generate_zkpass_proof(&user_data_tokens, &dvr_token)
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
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::sample_proof::SAMPLE_PROOF;
    use httpmock::{
        Method::{GET, POST},
        MockServer,
    };
    use serde_json::json;

    fn add_dummy_file() {
        let data = json!({
            "name": "Ramana",
            "_name_zkpass_public_": true,
            "dateOfBirth": "21/04/2003",
            "email": "ramana@example.com",
            "city": "Jakarta",
            "country": "Indonesia",
            "skills": ["Rust", "JavaScript", "HTML/CSS"]
        });
        std::fs::write("./user_data_holder.json", data.to_string()).expect("Unable to write file");

        let dvr = json!( [
            {
                "assign": {
                    "query_result": {
                        "and": [
                            { "==": [{ "dvar": "country" }, "Indonesia"] },
                            { "==": [{ "dvar": "city" }, "Jakarta"] },
                            {
                                "or": [
                                    { "~==": [{ "dvar": "skills[0]" }, "Rust"] },
                                    { "~==": [{ "dvar": "skills[1]" }, "Rust"] },
                                    { "~==": [{ "dvar": "skills[2]" }, "Rust"] }
                                ]
                            }
                        ]
                    }
                }
            },
            { "output": { "title": "Job Qualification" } },
            { "output": { "name": { "dvar": "name" } } },
            { "output": { "is_qualified": { "lvar": "query_result" } } },
            { "output": { "result": { "lvar": "query_result" } } }
        ]);
        std::fs::write("./dvr_holder.json", dvr.to_string()).expect("Unable to write file");
    }

    #[tokio::test]
    async fn test_data_holder() {
        add_dummy_file();
        let server = MockServer::start();
        server.mock(|when, then| {
            when.method(POST).path("/v1/proof");
            then.status(200).body(SAMPLE_PROOF);
        });
        server.mock(|when, then| {
            when.method(GET).path("/.well-known/jwks.json");
            then.status(200).body(
                "[
                    {\"kty\": \"EC\",\"crv\": \"P-256\",\"x\": \"MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU\",\"y\": \"IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==\",\"kid\": \"ServiceEncryptionPubK\",\"jwt\": \"\"},
                    {\"kty\": \"EC\",\"crv\": \"P-256\",\"x\": \"MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU\",\"y\": \"IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==\",\"kid\": \"ServiceSigningPubK\",\"jwt\": \"\"}
                ]"
            );
        });

        let zkpass_url = format!("http://{}", server.address());
        std::env::set_var("ZKPASS_URL", zkpass_url);
        std::env::set_var("API_KEY", "api_key");
        std::env::set_var("SECRET_API_KEY", "secret_api_key");

        let data_holder = DataHolder;
        let zkvm = "r0";
        let mut data_files = HashMap::new();
        data_files.insert(String::from(""), String::from("./user_data_holder.json"));
        let dvr_file = "./dvr_holder.json";

        let join_handle =
            tokio::spawn(async move { data_holder.start(zkvm, data_files, dvr_file).await });
        let result = join_handle.await;
        assert!(result.is_ok());

        std::fs::remove_file(dvr_file).expect("Unable to remove file");
        std::fs::remove_file("./user_data_holder.json").expect("Unable to remove file");
    }
}
