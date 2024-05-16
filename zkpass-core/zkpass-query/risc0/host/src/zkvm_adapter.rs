use tracing::{ instrument, info };
use bincode;
use std::panic;
use base64;
use base64::{ engine::general_purpose, Engine as _ };
use risc0_zkvm::{ default_prover, ExecutorEnv, Receipt, VerifierContext, ProverOpts };
use r0_zkpass_query_methods::{ EVAL_EXPR_ID, EVAL_EXPR_ELF };
use zkpass_query::engine::{
    ZkPassQueryEngine,
    ProofMethodInput,
    ZkPassQueryEngineError
};

pub(crate) fn verify_zkproof_internal(receipt: &str) -> String {
    info!(">> verify_zkproof_internal");

    //
    //          Verifier side
    //
    let receipt_ser = general_purpose::STANDARD.decode(receipt).expect("Failed to decode base64");
    let receipt: Receipt = bincode::deserialize(&receipt_ser).expect("Failed to deserialize");

    receipt.verify(EVAL_EXPR_ID).expect("Proven code should verify");

    // get the journal
    let proof_method_output = receipt.journal.decode().unwrap();

    info!("<< verify_zkproof_internal");
    proof_method_output
}

fn execute_query_and_create_zkproof_internal(input: &ProofMethodInput) -> String {
    info!(">> execute_query_and_create_zkproof_internal");
    let env = ExecutorEnv::builder().write(&input).unwrap().build().unwrap();

    // run the prover, get the receipt

    let opts = ProverOpts { hashfn: String::from("sha-256"), prove_guest_errors: false };
    let prover = default_prover();
    let receipt = prover
        .prove_with_ctx(env, &VerifierContext::default(), EVAL_EXPR_ELF, &opts)
        .unwrap();

    // serialize and encode
    let receipt_ser = bincode::serialize(&receipt).unwrap();
    //let receipt_gz = compress(&receipt_ser).unwrap();
    let receipt_b64 = general_purpose::STANDARD.encode(receipt_ser);

    info!("<< execute_query_and_create_zkproof_internal");
    receipt_b64
}

pub(crate) fn get_query_method_version_internal() -> String {
    let mut result = String::new();
    for &num in EVAL_EXPR_ID.iter() {
        result.push_str(&format!("{:x}", num));
    }

    result
}

pub(crate) fn get_query_engine_version_internal() -> String {
    let pkgver = env!("CARGO_PKG_VERSION").to_string();
    pkgver
}

struct Risc0PassQueryEngine;
impl ZkPassQueryEngine for Risc0PassQueryEngine {
    fn execute_query_and_create_zkproof_internal(
        &self,
        input: &ProofMethodInput
    ) -> Result<String, ZkPassQueryEngineError> {
        match panic::catch_unwind(|| execute_query_and_create_zkproof_internal(input)) {
            Ok(result) => Ok(result),
            Err(_error) => Err(ZkPassQueryEngineError::UnhandledPanicError),
        }
    }

    fn verify_zkproof(&self, receipt: &str) -> Result<String, ZkPassQueryEngineError> {
        match panic::catch_unwind(|| verify_zkproof_internal(receipt)) {
            Ok(result) => Ok(result),
            Err(_error) => Err(ZkPassQueryEngineError::UnhandledPanicError),
        }
    }

    fn get_query_method_version(&self) -> String {
        get_query_method_version_internal()
    }

    fn get_query_engine_version(&self) -> String {
        get_query_engine_version_internal()
    }
}

#[instrument]
pub fn create_zkpass_query_engine() -> Box<dyn ZkPassQueryEngine> {
    info!("entered");

    let query_engine = Risc0PassQueryEngine;
    Box::new(query_engine) as Box<dyn ZkPassQueryEngine>
}
