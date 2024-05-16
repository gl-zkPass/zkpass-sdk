use sp1_core::utils::BabyBearBlake3;
use sp1_core::{SP1ProofWithIO, SP1Prover, SP1Stdin, SP1Verifier};
use tracing::{info, error};
use bincode;
use std::panic;
use base64;
use base64::{ engine::general_purpose, Engine as _ };
use sha2::{Digest, Sha256};
use hex;
use zkpass_query::engine::{
    ZkPassQueryEngine,
    ProofMethodInput,
    ZkPassQueryEngineError
};

const ELF: &[u8] = include_bytes!("../../program/elf/riscv32im-succinct-zkvm-elf");

fn execute_query_and_create_zkproof_internal(input: &ProofMethodInput) -> Result<String, ZkPassQueryEngineError> {
    info!(">> execute_query_and_create_zkproof_internal");

    let mut stdin = SP1Stdin::new();
    stdin.write(&input);

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

    info!("<< execute_query_and_create_zkproof_internal");
    Ok(zkproof_b64)
}

pub(crate) fn verify_zkproof_internal(zkproof_b64: &str) -> String {
    info!(">> verify_zkproof_internal");

    // deserialize the proof b64 string into proof value
    let zkproof_ser = general_purpose::STANDARD.decode(zkproof_b64).expect("Failed to decode base64");
    let mut zkproof: SP1ProofWithIO<BabyBearBlake3>= bincode::deserialize(&zkproof_ser).expect("Failed to deserialize");
    // verify the proof
    SP1Verifier::verify(ELF, &zkproof).expect("verification failed");
    // read the output
    let output: String = zkproof.stdout.read::<String>();

    info!("<< verify_zkproof_internal");
    output
}

pub(crate) fn get_query_method_version_internal() -> String {
    info!(">> get_query_method_version_internal");

    let mut hasher = Sha256::new();
    hasher.update(ELF);
    let result = hasher.finalize();

    info!("<< get_query_method_version_internal");
    hex::encode(result)
}

pub(crate) fn get_query_engine_version_internal() -> String {
    info!(">> get_query_engine_version_internal");

    let pkgver = env!("CARGO_PKG_VERSION").to_string();

    info!("<< get_query_engine_version_internal");
    pkgver
}

struct SP1ZkPassQueryEngine;
impl ZkPassQueryEngine for SP1ZkPassQueryEngine {
    fn execute_query_and_create_zkproof_internal(
        &self,
        input: &ProofMethodInput
    ) -> Result<String, ZkPassQueryEngineError> {
        match panic::catch_unwind(||execute_query_and_create_zkproof_internal(input)) {
            // returns normally: Ok and Err case
            Ok(Ok(result)) => Ok(result),
            Ok(Err(error)) => Err(error),

            // panic is thrown
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

pub fn create_zkpass_query_engine() -> Box<dyn ZkPassQueryEngine> {
    let query_engine = SP1ZkPassQueryEngine;
    Box::new(query_engine) as Box<dyn ZkPassQueryEngine>
}
