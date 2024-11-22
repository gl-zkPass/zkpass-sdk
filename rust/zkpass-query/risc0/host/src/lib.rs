//
// Implementation of the zkPass query engine using the RiscZero zkvm
//
pub mod exports;
pub mod ts_exports;
mod zkvm_adapter;
mod tests;

pub use crate::zkvm_adapter::create_zkpass_query_engine;
pub use zkpass_query::engine::{
    Val,
    OutputReader,
    ZkPassQueryEngine,
    ProofMethodInput,
    ZkPassQueryEngineError
};
