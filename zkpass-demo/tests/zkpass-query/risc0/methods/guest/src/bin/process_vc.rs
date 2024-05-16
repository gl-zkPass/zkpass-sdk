#![no_main]

//use json::parse;
use serde_derive::{Deserialize, Serialize};
//use zkpass_query_core::VCOutput;
use risc0_zkvm::{
    guest::env,
    sha::{Impl, Sha256},
};

risc0_zkvm::guest::entry!(main);

#[derive(Deserialize, Serialize, Debug)]
struct VC {
    id: String
}
pub fn main() {
    let data: String = env::read();
    let _sha = *Impl::hash_bytes(&data.as_bytes());

    let vc: VC = serde_json::from_str(&data[..]).unwrap();
    assert_eq!(vc.id, String::from("http://example.org/credentials/3731"));

    /*
    let out = VCOutput {
        id: vc.id,
        hash: sha
    };

    // call assert!() as necessary here

    env::commit(&out);
    */
}
