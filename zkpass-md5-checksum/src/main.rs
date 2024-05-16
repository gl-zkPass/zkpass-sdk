/*
 * main.rs
 *
 * Authors:
 *   GDPWinnerPranata (winner.pranata@gdplabs.id)
 * Created Date: May 7th 2024
 * -----
 * Last Modified: May 7th 2024
 * Modified By: GDPWinnerPranata (winner.pranata@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   khandar-william
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

use std::io::Write;
use std::{ fs::File, io::Read };
use clap::{ Arg, Command };

fn main() {
    // Clap args
    let matches = Command::new("zkpass-md5-checksum")
        .arg(
            Arg::new("file-in")
                .short('i')
                .long("in")
                .help("(Required) Input file path")
                .long_help("(Required) Input file path")
                .required(true)
        )
        .arg(
            Arg::new("file-out")
                .short('o')
                .long("out")
                .help("Output file path")
                .long_help("Output file path")
        )
        .get_matches();

    // Value extraction from args
    let in_path = matches.get_one::<String>("file-in").unwrap();
    let out_path = matches.get_one::<String>("file-out");

    // Get Digest
    let digest = get_digest(in_path.as_str());

    // Print or write
    if let Some(path) = out_path {
        let mut output_file = File::create(path).unwrap();
        write!(output_file, "{}", digest).unwrap();
    } else {
        println!("{}", digest);
    }
}

fn get_digest(path: &str) -> String {
    // Open file by path
    let mut input_file = File::open(path).unwrap();
    let mut buffer = Vec::new();
    input_file.read_to_end(&mut buffer).unwrap();

    // Calculate hash
    let hash = md5::compute(&buffer);
    let hash_hex = format!("{:x}", hash);
    return hash_hex;
}

#[test]
fn test_get_digest() {
    // Create & write mock file
    let path = "test.txt";
    let mut file: File = File::create(path).unwrap();
    write!(file, "{}", "Hello, world!").unwrap();

    // Assertion
    let digest = get_digest(path);
    let expected_digest = "6cd3556deb0da54bca060b4c39479839";
    assert_eq!(digest, expected_digest);

    // Delete mock file
    std::fs::remove_file(path).unwrap();
}
