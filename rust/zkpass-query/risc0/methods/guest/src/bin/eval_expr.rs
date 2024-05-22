#![no_main]

use risc0_zkvm::guest::env;
use zkpass_query::expression::{ProofMethodInput, ProofMethodOutput};

risc0_zkvm::guest::entry!(main);

pub fn main() {
    let input: ProofMethodInput = env::read();

    let result: bool = input.expr.eval(&input.map).unwrap();

    let output = ProofMethodOutput {
        result: result
    };
    // call assert!() as necessary here

    env::commit(&output);
}
