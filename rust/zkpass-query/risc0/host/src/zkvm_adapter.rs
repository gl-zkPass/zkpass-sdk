use tracing::{ error, info, instrument };
use bincode;
use std::panic;
use base64;
use base64::{ engine::general_purpose, Engine as _ };
use risc0_zkvm::{ default_prover, ExecutorEnv, Receipt, VerifierContext, ProverOpts };
use r0_zkpass_query_methods::{ EVAL_EXPR_ID, EVAL_EXPR_ELF };
use zkpass_query::engine::{ ZkPassQueryEngine, ProofMethodInput, ZkPassQueryEngineError };
use zkpass_query::zkvm_adapter::QueryEngineAdapter;
use postcard::to_allocvec;

#[cfg(test)]
use zkpass_query_test_utils::impl_zkvm_adapter_tests;

// We set the limit to 2,097,152 cycles because we consider a maximum reasonable time of generating a proof is 120 seconds
// (2 minutes on staging) or 60 seconds (on production) to avoid excessive memory usage on the server.
const MAX_LIMIT_CYCLES: u64 = 1 << 21; // 2^21 = 2,097,152

pub(crate) fn verify_zkproof_internal(receipt: &str) -> String {
    info!(">> [risc0] verify_zkproof_internal");

    //
    //          Verifier side
    //
    let receipt_ser = general_purpose::STANDARD.decode(receipt).expect("Failed to decode base64");
    let receipt: Receipt = bincode::deserialize(&receipt_ser).expect("Failed to deserialize");

    receipt.verify(EVAL_EXPR_ID).expect("Proven code should verify");

    // get the journal
    let proof_method_output = receipt.journal.decode().unwrap();

    info!("<< [risc0] verify_zkproof_internal");
    proof_method_output
}

fn execute_query_and_create_zkproof_internal(
    input: &ProofMethodInput
) -> Result<String, ZkPassQueryEngineError> {
    info!(">> [risc0] execute_query_and_create_zkproof_internal");
    let bytes_input: Vec<u8> = to_allocvec(&input).map_err(|err| {
        error!("Serialization error: {}", err);
        ZkPassQueryEngineError::SerializationError
    })?;

    let env = ExecutorEnv::builder()
        .write(&bytes_input.len())
        .map_err(|err| {
            error!("Environment error: {}", err);
            ZkPassQueryEngineError::EnvironmentError
        })?
        .write_slice(&bytes_input)
        .session_limit(Some(MAX_LIMIT_CYCLES))
        .build()
        .map_err(|err| {
            error!("Environment error: {}", err);
            ZkPassQueryEngineError::EnvironmentError
        })?;

    // run the prover, get the receipt
    let opts = ProverOpts::fast();
    let prover = default_prover();
    let prove_info = prover
        .prove_with_ctx(env, &VerifierContext::default(), EVAL_EXPR_ELF, &opts)
        .map_err(|err| {
            let error_msg = err.to_string();
            if error_msg.contains("Session limit exceeded") {
                ZkPassQueryEngineError::CyclesLimitExceededError
            } else {
                ZkPassQueryEngineError::UnhandledPanicError
            }
        })?;

    // serialize and encode
    let receipt_serialized = bincode::serialize(&prove_info.receipt).unwrap();
    let receipt_b64 = general_purpose::STANDARD.encode(receipt_serialized);

    info!("<< [risc0] execute_query_and_create_zkproof_internal");
    Ok(receipt_b64)
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

#[instrument]
pub fn create_zkpass_query_engine() -> Box<dyn ZkPassQueryEngine> {
    info!("entered");

    let query_engine = QueryEngineAdapter::new(
        |input| {
            match panic::catch_unwind(|| execute_query_and_create_zkproof_internal(input)) {
                // returns normally: Ok and Err case
                Ok(Ok(result)) => Ok(result),
                Ok(Err(error)) => Err(error),

                // panic is thrown
                Err(_error) => Err(ZkPassQueryEngineError::UnhandledPanicError),
            }
        },
        |receipt| {
            match panic::catch_unwind(|| verify_zkproof_internal(receipt)) {
                Ok(result) => Ok(result),
                Err(_error) => Err(ZkPassQueryEngineError::UnhandledPanicError),
            }
        },
        get_query_method_version_internal,
        get_query_engine_version_internal
    );

    Box::new(query_engine) as Box<dyn ZkPassQueryEngine>
}

//
//  Use the 'impl_zkvm_adapter_tests' macro to test the zkvm adapter.
//  The macro will generate the tests for the zkvm adapter.
//
#[cfg(test)]
impl_zkvm_adapter_tests!(
    verify_zkproof_internal,
    get_query_method_version_internal,
    get_query_engine_version_internal,
    create_zkpass_query_engine,
    execute_query_and_create_zkproof_internal,
    crate::tests::constants::constants
);
