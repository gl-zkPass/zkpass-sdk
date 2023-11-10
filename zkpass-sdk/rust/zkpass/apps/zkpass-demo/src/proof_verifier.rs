use std::io::prelude::*;
use std::time::Instant;
use serde_json::{json, Value};
use lazy_static::lazy_static;
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};
use std::sync::Mutex;
use uuid::Uuid;
use zkpass_client::core::{
    DataVerificationRequest, KeysetEndpoint, PublicKey, PublicKeyOption, ZkPassError,
};
use zkpass_client::interface::{
    ZkPassClient, ZkPassProofMetadataValidator, ZkPassProofVerifier, ZkPassUtility
};

//
//  Global table to store the generated DVR values
//  The Verifier needs to keep track of all generated DVRs
//  so that it can verify the proof metadata
//  Note: The hash table entry should have time-expiration
//
lazy_static! {
    static ref DVR_TABLE: Mutex<HashMap<String, DataVerificationRequest>> = {
        let map = HashMap::new();
        Mutex::new(map)
    };
}

struct MyMetadataValidator;

fn get_current_timestamp() -> u64 {
    let now = SystemTime::now();
    let duration_since_epoch = now.duration_since(UNIX_EPOCH).expect("Time went backwards");
    duration_since_epoch.as_secs()
}

impl ZkPassProofMetadataValidator for MyMetadataValidator {
    fn validate(
        &self,
        dvr_title: &str,
        dvr_id: &str,
        dvr_digest: &str,
        user_data_verifying_key: &PublicKey,
        dvr_verifying_key: &PublicKey,
        zkpass_proof_ttl: u64,
    ) -> Result<(), ZkPassError> {
        //
        //  find the DVR in the table
        //
        let dvr: DataVerificationRequest;
        let mut hash_table = DVR_TABLE.lock().unwrap();
        let removed_item: Option<DataVerificationRequest> = hash_table.remove(dvr_id);
        match removed_item {
            Some(_dvr) => { 
                println!("#### found dvr: id={}", _dvr.dvr_id);
                dvr = _dvr;
            },
            None => {
                println!("#### no dvr found for the id");
                return Err(ZkPassError::MistmatchedDvrId);
            }
        }

        let expected_user_data_verifying_key = PublicKey {
            x: String::from("MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7f0QoVUsccB9yMwHAR7oVk/L+ZkX"),
            y: String::from("8ZqC1Z0XTaj3BMcMnqh+VzdHZX3yGKa3+uhNAhKWWyfB/r+3E8rPSHtXXQ=="),
        };

        let expected_dvr_verifying_key = PublicKey {
            x: String::from("MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU"),
            y: String::from("IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA=="),
        };

        //
        //  checking for the valid dvr
        //
        if dvr_title != dvr.dvr_title {
            return Err(ZkPassError::MistmatchedDvrTitle);
        }

        if dvr_id != dvr.dvr_id {
            return Err(ZkPassError::MistmatchedDvrId);
        }

        if dvr_digest != dvr.get_sha256_digest() {
            return Err(ZkPassError::MistmatchedDvrDigest);
        }

        if *dvr_verifying_key != expected_dvr_verifying_key {
            return Err(ZkPassError::MistmatchedDvrVerifyingKey);
        }

        //
        //  checking for valid key used to verify user data
        //
        if *user_data_verifying_key != expected_user_data_verifying_key {
            return Err(ZkPassError::MistmatchedUserDataVerifyingKey);
        }

        //
        // checking for proof token timeout
        //
        if zkpass_proof_ttl > 0 {
            let diff: i64 = (get_current_timestamp() as i64) - (zkpass_proof_ttl as i64);
            //println!("time-diff={}", diff);
            if diff >= 10000000 {
                return Err(ZkPassError::ExpiredZkPassProof);
            }
        }

        Ok(())
    }
}

//
//  Simulating the Proof Verifier
//
pub struct ProofVerifier;

impl ProofVerifier {
    //
    //  Simulating the Proof Verifier's get_dvr_token REST API
    //
    pub fn get_dvr_token(&self, dvr_file: &str) -> String {
        const VERIFIER_PRIVKEY: &str = r"-----BEGIN PRIVATE KEY-----
        MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLxxbcd7aVcNEdE/C
        EGPwLzM6lkLuDYzhd3FqALuuHCahRANCAASnpYmXAC2V39TiEOaa64x1kJW0x5Qh
        PfGQN1TAs6+xVUD6KJLB9pfgeoqVE8MYb4XpYaOfHKz1Pka017ee97A4
        -----END PRIVATE KEY-----";

        let mut query_content = std::fs::File::open(dvr_file).expect("Cannot find the dvr file");
        let mut query = String::new();
        query_content
            .read_to_string(&mut query)
            .expect("Should not have I/O errors");
        println!("query={}", query);

        let kid = String::from("k-1");
        let jku = String::from("https://raw.githubusercontent.com/zulamdat/zulamdat.github.io/sample-key/zkp-key/verifier-key.json");
        let ep = KeysetEndpoint { jku, kid };
        // issuer's pubkey params:
        let issuer_pubkey = PublicKey {
            x: String::from("MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7f0QoVUsccB9yMwHAR7oVk/L+ZkX"),
            y: String::from("8ZqC1Z0XTaj3BMcMnqh+VzdHZX3yGKa3+uhNAhKWWyfB/r+3E8rPSHtXXQ=="),
        };
        let query: Value = serde_json::from_str(&query).unwrap();

        //
        //  Proof Verifier's integration points with the zkpass-client SDK library
        //  (for get_dvr_token REST API)
        //

        //
        //  Step 1: Instantiate the zkpass_client object.
        //
        let zkpass_client = ZkPassClient;

        //
        //  Step 2: Call zkpass_client.get_query_engine_version_info.
        //          The version info is needed for DVR object creation.
        //
        let query_engine_version_info = zkpass_client.get_query_engine_version_info();

        //
        // Step 3: Create the DVR object.
        //
        let dvr = DataVerificationRequest {
            dvr_title: String::from("My DVR"),
            dvr_id: Uuid::new_v4().to_string(),
            query_engine_ver: query_engine_version_info.0,
            query_method_ver: query_engine_version_info.1,
            query: serde_json::to_string(&query).unwrap(),
            user_data_url: Some(String::from("https://xyz.com")),
            user_data_verifying_key: PublicKeyOption::PublicKey(issuer_pubkey)
        };

        //
        //  Step 4: Call zkpass_client.sign_data_to_jws_token.
        //          to digitally-sign the dvr data.
        //
        let dvr_token = zkpass_client
            .sign_data_to_jws_token(
                VERIFIER_PRIVKEY, 
                json!(dvr),
                Some(ep))
            .unwrap();

        //println!("dvr_token={}", dvr_token);
        // save the dvr to a global hash table
        // this will be needed by the validator to check the proof metadata
        let mut dvr_table = DVR_TABLE.lock().unwrap();
        dvr_table.insert(dvr.dvr_id.clone(), dvr.clone());

        dvr_token
    }

    //
    //  Simulating the Proof Verifier's verify_zkpass_proof REST API
    //
    pub fn verify_zkpass_proof(&self, zkpass_proof_token: &str) -> bool {
        println!("\n#### starting zkpass proof verification...");
        let start = Instant::now();

        let proof_metadata_validator = Box::new(MyMetadataValidator) as Box<dyn ZkPassProofMetadataValidator>;

        //
        //  Proof Verifier's integration points with the zkpass-client SDK library
        //  (for verify_zkpass_proof REST API)
        //

        //
        // Step 1: Instantiate the zkpass_client object.
        //
        let zkpass_client = ZkPassClient;

        //
        // Step 2: Call zkpass_client.verify_zkpass_proof to verify the proof.
        //
        let (result, _zkpass_proof) = 
            zkpass_client.verify_zkpass_proof(
                zkpass_proof_token,
                &proof_metadata_validator
                )
            .unwrap();

        let duration = start.elapsed();
        println!("#### verification completed [time={:?}]", duration);

        result
    }
}