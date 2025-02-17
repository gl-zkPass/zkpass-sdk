use sp1_core::runtime::{ Program, Runtime };
use sp1_core::utils::BabyBearBlake3;
use sp1_core::{ SP1ProofWithIO, SP1Prover, SP1Stdin, SP1Verifier };
use tracing::{ info, error };
use bincode;
use std::panic;
use base64;
use base64::{ engine::general_purpose, Engine as _ };
use sha2::{ Digest, Sha256 };
use hex;
use zkpass_query::engine::{ ZkPassQueryEngine, ProofMethodInput, ZkPassQueryEngineError };
use zkpass_query::zkvm_adapter::QueryEngineAdapter;

#[cfg(test)]
use zkpass_query_test_utils::impl_zkvm_adapter_tests;

// We set the limit to 2,097,152 cycles because we consider a maximum reasonable time of generating a proof is 80 seconds
// (1.6 minutes on staging) or 40 seconds (on production) to avoid excessive memory usage on the server.
const MAX_LIMIT_CYCLES: u64 = 1 << 21; // 2^21 = 2,097,152

const ELF: &[u8] = include_bytes!("../../program/elf/riscv32im-succinct-zkvm-elf");

fn execute_query_and_create_zkproof_internal(
    input: &ProofMethodInput
) -> Result<String, ZkPassQueryEngineError> {
    info!(">> [sp1] execute_query_and_create_zkproof_internal");

    let mut stdin = SP1Stdin::new();
    stdin.write(&input);

    restrict_cycles(MAX_LIMIT_CYCLES, &stdin)?;

    // generate the zkproof
    let zkproof = SP1Prover::prove(ELF, stdin).map_err(|e| {
        error!("resolve_variable: parsing expr error: {:?}", e);
        ZkPassQueryEngineError::ProofGenerationError
    })?;

    // serialize the proof value into base64 string
    let zkproof_ser = bincode::serialize(&zkproof).map_err(|e| {
        error!("failed to serialize the proof receipt: {:?}", e);
        ZkPassQueryEngineError::ProofSerializationError
    })?;
    let zkproof_b64 = general_purpose::STANDARD.encode(zkproof_ser);

    info!("<< [sp1] execute_query_and_create_zkproof_internal");
    Ok(zkproof_b64)
}

pub(crate) fn verify_zkproof_internal(zkproof_b64: &str) -> String {
    info!(">> [sp1] verify_zkproof_internal");

    // deserialize the proof b64 string into proof value
    let zkproof_ser = general_purpose::STANDARD
        .decode(zkproof_b64)
        .expect("Failed to decode base64");
    let mut zkproof: SP1ProofWithIO<BabyBearBlake3> = bincode
        ::deserialize(&zkproof_ser)
        .expect("Failed to deserialize");
    // verify the proof
    SP1Verifier::verify(ELF, &zkproof).expect("verification failed");
    // read the output
    let output: String = zkproof.stdout.read::<String>();

    info!("<< [sp1] verify_zkproof_internal");
    output
}

pub(crate) fn get_query_method_version_internal() -> String {
    info!(">> [sp1] get_query_method_version_internal");

    let mut hasher = Sha256::new();
    hasher.update(ELF);
    let result = hasher.finalize();

    info!("<< [sp1] get_query_method_version_internal");
    hex::encode(result)
}

pub(crate) fn get_query_engine_version_internal() -> String {
    info!(">> [sp1] get_query_engine_version_internal");

    let pkgver = env!("CARGO_PKG_VERSION").to_string();

    info!("<< [sp1] get_query_engine_version_internal");
    pkgver
}

/// Based on SP1Prover::execute,
/// Before creating zkproof using .prove function
/// We could check the cycles limit using .execute plus with some modification
/// This purpose of this function is to mimic the .execute function but restrict the cycles
fn restrict_cycles(max_cycles: u64, stdin: &SP1Stdin) -> Result<(), ZkPassQueryEngineError> {
    // Create a program instance
    let program = Program::from(ELF);

    // Create a runtime instance
    let mut runtime = Runtime::new(program);

    // Write the stdin to the runtime & Run the program
    runtime.write_stdin_slice(&stdin.buffer.data);
    runtime.run();

    // Get the cycles, then check if it exceeds the max_cycles
    let cycles = runtime.state.global_clk as u64;
    if cycles > max_cycles {
        error!("max_cycles: {}, cycles: {}", max_cycles, cycles);
        return Err(ZkPassQueryEngineError::CyclesLimitExceededError);
    }
    Ok(())
}

pub fn create_zkpass_query_engine() -> Box<dyn ZkPassQueryEngine> {
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
