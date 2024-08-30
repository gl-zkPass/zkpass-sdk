#![no_main]

use risc0_zkvm::guest::env;
use zkpass_query::engine::{ProofMethodInput, ZkPassQuery};

risc0_zkvm::guest::entry!(main);

///
/// The zkvm's proof method
///
pub fn main() {
    let input: ProofMethodInput = env::read();

    let output = ZkPassQuery::execute(&input);

    env::commit(&output);
}
