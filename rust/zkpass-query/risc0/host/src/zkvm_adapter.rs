use tracing::{ instrument, info };
use bincode;
use std::panic;
use base64;
use base64::{ engine::general_purpose, Engine as _ };
use risc0_zkvm::{ default_prover, ExecutorEnv, Receipt, VerifierContext, ProverOpts };
use r0_zkpass_query_methods::{ EVAL_EXPR_ID, EVAL_EXPR_ELF };
use zkpass_query::engine::{ ZkPassQueryEngine, ProofMethodInput, ZkPassQueryEngineError };
use postcard::to_allocvec;

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
    let bytes_input: Vec<u8> = to_allocvec(&input).unwrap();

    let env = ExecutorEnv::builder()
        .write(&bytes_input.len())
        .unwrap()
        .write_slice(&bytes_input)
        .build()
        .unwrap();

    // run the prover, get the receipt
    let opts = ProverOpts::fast();
    let prover = default_prover();
    let prove_info = prover
        .prove_with_ctx(env, &VerifierContext::default(), EVAL_EXPR_ELF, &opts)
        .unwrap();

    // serialize and encode
    let receipt_serialized = bincode::serialize(&prove_info.receipt).unwrap();
    let receipt_b64 = general_purpose::STANDARD.encode(receipt_serialized);

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

#[cfg(test)]
mod zkvm_adapter_test {
    use super::*;
    use zkpass_core::utils::query_utils::decode_zkproof;
    use crate::tests::constants::constants::{
        DVR_CORRECT,
        PROOF_CORRECT,
        QUERY_ENGINE_VERSION_CORRECT,
        QUERY_METHOD_VERSION_CORRECT,
        USER_DATA_CORRECT,
    };

    #[test]
    fn verify_zkproof_internal_test() {
        let verification_result = verify_zkproof_internal(&decode_zkproof(PROOF_CORRECT));
        let expected_result =
            r#"{"title":"Job Qualification","name":"Ramana","is_qualified":true,"result":true}"#;
        assert_eq!(verification_result, expected_result);
    }

    #[test]
    fn get_query_method_version_internal_test() {
        let query_method_version = get_query_method_version_internal();
        assert!(query_method_version == QUERY_METHOD_VERSION_CORRECT);
    }

    #[test]
    fn get_query_engine_version_internal_test() {
        let query_engine_version = get_query_engine_version_internal();
        assert!(query_engine_version == QUERY_ENGINE_VERSION_CORRECT);
    }

    #[test]
    fn create_zkpass_query_engine_test() {
        let query_engine = create_zkpass_query_engine();
        assert!(query_engine.get_query_engine_version() == QUERY_ENGINE_VERSION_CORRECT);
    }

    mod heavy_tests {
        use super::*;

        #[test]
        fn zk_pass_query_engine_execute_query_and_create_zkproof_internal_test() {
            let engine = create_zkpass_query_engine();
            let result = engine.execute_query_and_create_zkproof(USER_DATA_CORRECT, DVR_CORRECT);
            assert!(result.is_ok());
        }
    }

    #[test]
    fn zk_pass_query_engine_verify_zkproof_test() {
        let engine = create_zkpass_query_engine();
        let result = engine.verify_zkproof(&decode_zkproof(PROOF_CORRECT));
        assert!(result.is_ok());
    }

    #[test]
    fn zk_pass_query_engine_get_query_method_version_test() {
        let engine = create_zkpass_query_engine();
        let result = engine.get_query_method_version();
        assert!(result == QUERY_METHOD_VERSION_CORRECT);
    }

    #[test]
    fn zk_pass_query_engineget_query_engine_version_test() {
        let engine = create_zkpass_query_engine();
        let result = engine.get_query_engine_version();
        assert!(result == QUERY_ENGINE_VERSION_CORRECT);
    }
}
