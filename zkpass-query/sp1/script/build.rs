use std::process::Command;
use std::env;
use std::path::Path;

fn main() {
    println!("cargo:rerun-if-changed=./../program/elf/riscv32im-succinct-zkvm-elf");

    println!("#### running build.rs");

    // Determine the directory where your script is located
    let dir = env::current_dir().unwrap();
    let script_path = Path::new(&dir).join("./build-elf.sh");

    // Make sure the script is executable
    Command::new("chmod")
        .args(&["+x", script_path.to_str().unwrap()])
        .status()
        .unwrap();

    // Execute your script
    let output = Command::new(script_path)
        .status()
        .expect("Failed to execute script");

    if !output.success() {
        panic!("Failed to run external script");
    }

    // You can add other build-time logic here as well
}

