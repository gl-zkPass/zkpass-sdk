// The program to be proven inside the zkVM.
#![no_main]
sp1_zkvm::entrypoint!(main);

use zkpass_query::engine::{ProofMethodInput, ZkPassQuery};

pub fn main() {
    let input: ProofMethodInput = sp1_zkvm::io::read::<ProofMethodInput>();

    //let output = ZkPassQuery::execute(&input.map, &input.stmts);
    let output = ZkPassQuery::execute(&input);

    sp1_zkvm::io::write(&output);
}
