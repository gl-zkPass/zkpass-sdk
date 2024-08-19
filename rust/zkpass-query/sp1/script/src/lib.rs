//
// Implementation of the zkPass query engine using the SP1 zkvm
//
pub mod exports;
pub mod ts_exports;
pub mod zkpass_core {
    pub use zkpass_core::interface::*;
}
mod zkvm_adapter;
mod test;

pub use crate::zkvm_adapter::create_zkpass_query_engine;
pub use zkpass_query::engine::{
    Val,
    OutputReader,
    ZkPassQueryEngine,
    ProofMethodInput,
    ZkPassQueryEngineError
};
