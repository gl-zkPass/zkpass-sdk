#![no_main]

use risc0_zkvm::guest::env;
use zkpass_query::engine::{ ProofMethodInput, ZkPassQuery };
use postcard::from_bytes;

risc0_zkvm::guest::entry!(main);

///
/// The zkvm's proof method
///
pub fn main() {
    let len: usize = env::read();
    let mut bytes_input = vec![0u8; len];
    env::read_slice(&mut bytes_input);

    let input: ProofMethodInput = from_bytes(&bytes_input).unwrap();
    let output = ZkPassQuery::execute(&input);

    env::commit(&output);
}
