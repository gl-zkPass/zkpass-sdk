// The program to be proven inside the zkVM.
#![no_main]
sp1_zkvm::entrypoint!(main);

use zkpass_query::expression::{ProofMethodInput, ProofMethodOutput};

pub fn main() {
    let input: ProofMethodInput = sp1_zkvm::io::read::<ProofMethodInput>();

    let result: bool = input.expr.eval(&input.map).unwrap();

    let output = ProofMethodOutput{ result: result};

    sp1_zkvm::io::write(&output);
}
