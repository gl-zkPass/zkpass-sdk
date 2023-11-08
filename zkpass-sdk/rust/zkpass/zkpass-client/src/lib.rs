pub mod interface;
mod zkpass_client;
use zkpass_core::interface::*;
pub mod core {
    // Re-export all types from zkpass-core
    pub use zkpass_core::interface::*;
}
pub use crate::interface::{*};
use serde::{Deserialize, Serialize};

const ZKPASS_DSA_PUBKEY_X: &str = "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU";
const ZKPASS_DSA_PUBKEY_Y: &str ="IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==";

#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
pub struct ProofMethodOutput {
    pub result: bool
}

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