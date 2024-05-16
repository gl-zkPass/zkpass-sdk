pub use zkpass_query::engine::{ZkPassQueryEngine, ProofMethodInput, ZkPassQueryEngineError};

struct ValidaZkPassQueryEngine;

impl ZkPassQueryEngine for ValidaZkPassQueryEngine {
    fn execute_query_and_create_zkproof_internal(&self, _input: &ProofMethodInput) -> Result<String, ZkPassQueryEngineError> {
        panic!("TODO")
    }

    fn verify_zkproof(&self, _receipt: &str) -> Result<String, ZkPassQueryEngineError> {
        panic!("TODO")
    }

    fn get_query_method_version(&self) -> String {
        String::from("")
    }

    fn get_query_engine_version(&self) -> String {
        String::from("")
    }
}

pub fn create_zkpass_query_engine() -> Box<dyn ZkPassQueryEngine> {
    let query_engine = ValidaZkPassQueryEngine;
    Box::new(query_engine) as Box<dyn ZkPassQueryEngine>
}
