use std::env;
use std::io::prelude::*;
use std::time::Instant;
use std::fs::OpenOptions;
use std::io::{ Write, Result };
use serde_json::Value;
use r0_zkpass_query::zkpass_core::*;
use r0_zkpass_query::create_zkpass_query_engine as create_zkpass_query_engine_r0;
use sp1_zkpass_query::create_zkpass_query_engine as create_zkpass_query_engine_sp1;

const ZKPASS_PRIVKEY: &str =
    r"-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLxxbcd7aVcNEdE/C
EGPwLzM6lkLuDYzhd3FqALuuHCahRANCAASnpYmXAC2V39TiEOaa64x1kJW0x5Qh
PfGQN1TAs6+xVUD6KJLB9pfgeoqVE8MYb4XpYaOfHKz1Pka017ee97A4
-----END PRIVATE KEY-----";

const ZKPASS_PUBKEY: &str =
    r"-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU
IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==
-----END PUBLIC KEY-----";

/*
const ZKPASS_ECDH_PRIVKEY: &str = r"-----BEGIN PRIVATE KEY-----
MIGEAgEAMBAGByqGSM49AgEGBSuBBAAKBG0wawIBAQQgmCciFlxKpprQRqlLFnnh
9eiKAditGlfOssFKjLZ0tF+hRANCAARTiTnflkU7RIJdSBNe6/KAGmOFwHRPZVYw
le25LC6VqsKfh0vKFLnI+zz2LHbluvJGhbBvqHQwSPHWxmWivTEn
-----END PRIVATE KEY-----";

const ZKPASS_ECDH_PUBKEY: &str = r"-----BEGIN PUBLIC KEY-----
MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEU4k535ZFO0SCXUgTXuvygBpjhcB0T2VW
MJXtuSwularCn4dLyhS5yPs89ix25bryRoWwb6h0MEjx1sZlor0xJw==
-----END PUBLIC KEY-----";
*/

fn write_string_to_file(filename: &str, content: &str) -> Result<()> {
    // Open the file in write mode. If the file exists, it will be truncated.
    let mut file = OpenOptions::new().write(true).create(true).truncate(true).open(filename)?;

    file.write_all(content.as_bytes())?;
    Ok(())
}

fn read_file(path: &str) -> String {
    let mut data_content = std::fs::File::open(path).expect("Failed to open file");
    let mut data = String::new();
    data_content.read_to_string(&mut data).expect("Should not have I/O errors");
    data
}

fn gen_proof(data_files: &str, rules_file: &str) -> String {
    //
    //          Prover side
    //
    //
    // prep the inputs
    //
    let mut data_content = std::fs::File
        ::open(data_files)
        .expect("Example file should be accessible");
    let mut data = String::new();
    data_content.read_to_string(&mut data).expect("Should not have I/O errors");
    println!("input: data={}", data);

    let mut rules_data = std::fs::File
        ::open(rules_file)
        .expect("Example file should be accessible");
    let mut rules = String::new();
    rules_data.read_to_string(&mut rules).expect("Should not have I/O errors");
    println!("input: rules={}", rules);

    println!("executing query and generating zkproof...");
    let start = Instant::now();
    //////////////// the meat //////////////////
    let query_engine = create_zkpass_query_engine_r0();
    let receipt = query_engine
        .execute_query_and_create_zkproof(data.as_str(), rules.as_str())
        .unwrap();
    //println!("receipt: len={}", receipt.len());
    ////////////////////////////////////////////
    let duration = start.elapsed();

    println!("zkproof generation completed, time={:?}", duration);

    receipt
}

fn verify_proof(receipt: &str) {
    /*******************************************************/
    // the receipt normally would be sent to the verifier
    /*******************************************************/

    //
    //          Verifier side
    //

    let query_engine = create_zkpass_query_engine_r0();

    // verify the receipt
    let start = Instant::now();
    //////////////////////// the meat ///////////////////////////////
    let output = query_engine.verify_zkproof(receipt);
    /////////////////////////////////////////////////////////////////
    let duration = start.elapsed();

    println!("\nverifying zkproof...");
    println!("zkproof verified, time={:?}\n", duration);
    println!("output/journal: output={:?}", output);
}

fn print_usage() {
    let query_engine_r0 = create_zkpass_query_engine_r0();
    println!(
        "zkvm: r0, version: query-engine={}, query-method={}",
        query_engine_r0.get_query_engine_version(),
        query_engine_r0.get_query_method_version()
    );
    let query_engine_sp1 = create_zkpass_query_engine_sp1();
    println!(
        "zkvm: sp1, version: query-engine={}, query-method={}",
        query_engine_sp1.get_query_engine_version(),
        query_engine_sp1.get_query_method_version()
    );

    println!(
        "\nUsage: zkpass-query-tool gen-proof <user-data-file> <query-file> <zkproof-outfile>"
    );
    println!("                         ver-proof <zkproof-file>");
    println!("                         gen-ver-proof <user-data-file> <query-file>\n");
    println!("                         sign-jws <json-file> <jws-outfile>");
    println!("                         ver-jws <jws-file>");
    println!("                         encrypt-jwe <json-file> <jwe-outfile>");
    println!("                         decrypt-jwe <jwe-file>\n");
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() >= 2 {
        match args[1].as_str() {
            "gen-proof" => {
                if args.len() != 5 {
                    print_usage();
                } else {
                    let zkproof = gen_proof(args[2].as_str(), args[3].as_str());
                    write_string_to_file(args[4].as_str(), zkproof.as_str()).unwrap();
                    println!("zkproof saved to {}", args[4]);
                }
            }
            "ver-proof" => {
                if args.len() != 3 {
                    print_usage();
                } else {
                    let proof_file = args[2].as_str();
                    let mut proof_content = std::fs::File
                        ::open(proof_file)
                        .expect("Example file should be accessible");
                    let mut proof = String::new();
                    proof_content.read_to_string(&mut proof).expect("Should not have I/O errors");
                    //println!("{}", proof);
                    verify_proof(proof.as_str());
                }
            }
            "gen-ver-proof" => {
                if args.len() != 4 {
                    print_usage();
                } else {
                    let zkproof = gen_proof(args[2].as_str(), args[3].as_str());
                    verify_proof(zkproof.as_str());
                }
            }
            "sign-jws" => {
                if args.len() != 4 {
                    print_usage();
                } else {
                    let data = read_file(args[2].as_str());
                    let data_val: Value = serde_json::from_str(data.as_str()).unwrap();
                    let signing_key = ZKPASS_PRIVKEY;

                    let kid = String::from("mykey");
                    let jku = String::from("https://hostname.com/jwks");
                    let ep = KeysetEndpoint { kid, jku };

                    let jws_token = sign_data_to_jws_token(
                        signing_key,
                        data_val,
                        Some(ep)
                    ).unwrap();
                    write_string_to_file(args[3].as_str(), jws_token.as_str()).unwrap();
                }
            }
            "ver-jws" => {
                if args.len() != 3 {
                    print_usage();
                } else {
                    let jws_token = read_file(args[2].as_str());
                    //println!("{}", jws_token);
                    let (data, _header) = verify_jws_token(
                        ZKPASS_PUBKEY,
                        jws_token.as_str()
                    ).unwrap();
                    println!("verified!");
                    let json = serde_json::to_string_pretty(&data).unwrap();
                    println!("{}", json);
                }
            }
            "encrypt-jwe" => {
                if args.len() != 4 {
                    print_usage();
                } else {
                    let data = read_file(args[2].as_str());
                    let data_val: Value = serde_json::from_str(data.as_str()).unwrap();
                    let signing_key = ZKPASS_PUBKEY;

                    let jwe_token = encrypt_data_to_jwe_token(signing_key, data_val).unwrap();
                    write_string_to_file(args[3].as_str(), jwe_token.as_str()).unwrap();
                }
            }
            "decrypt-jwe" => {
                if args.len() != 3 {
                    print_usage();
                } else {
                    let jwe_token = read_file(args[2].as_str());
                    //println!("{}", jws_token);
                    let (data, _header) = decrypt_jwe_token(
                        ZKPASS_PRIVKEY,
                        jwe_token.as_str()
                    ).unwrap();
                    println!("decrypted!");
                    let json = serde_json::to_string_pretty(&data).unwrap();
                    println!("{}", json);
                }
            }
            &_ => {
                print_usage();
            }
        }
    } else {
        print_usage();
    }
}
