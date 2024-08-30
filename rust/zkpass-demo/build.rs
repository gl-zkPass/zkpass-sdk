// build.rs
use reqwest::blocking::get;
use std::env;
use std::fs;
use std::fs::File;
use std::io::copy;
use std::path::Path;

fn main() {
    if env::var("PROFILE").unwrap() == "release" {
        println!("Running custom build script...");

        // Remove files in ../lib/*
        let lib_path = "../lib";
        if Path::new(lib_path).exists() {
            for entry in fs::read_dir(lib_path).expect("Failed to read lib directory") {
                let entry = entry.expect("Failed to get entry");
                let path = entry.path();
                if path.is_file() {
                    fs::remove_file(path).expect("Failed to remove file");
                }
            }
        }

        // URLs to download
        let urls = [
            "https://github.com/gl-zkPass/zkpass-sdk/releases/download/playground-lib/libsp1_zkpass_query.so",
            "https://github.com/gl-zkPass/zkpass-sdk/releases/download/playground-lib/libr0_zkpass_query.so",
        ];

        // Download files and place them into ./lib/
        for url in urls {
            let response = get(url).expect("Failed to download file");
            let file_name = url.split('/').last().expect("Failed to get file name");
            let file_path = format!("{}/{}", lib_path, file_name);
            println!("filepath={}", file_path);
            let mut dest = File::create(&file_path).expect("Failed to create file");
            copy(
                &mut response.bytes().expect("Failed to get bytes").as_ref(),
                &mut dest,
            )
            .expect("Failed to copy content");
        }
    } else {
        println!("Skipping custom build script in non-release mode...");
    }
}
