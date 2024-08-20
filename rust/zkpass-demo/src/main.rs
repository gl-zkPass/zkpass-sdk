mod constants;
mod data_holder;
mod data_issuer;
mod proof_verifier;
mod test;

use clap::{App, Arg};
use data_holder::DataHolder;
use std::fs;
use tokio::runtime::Runtime;
use tracing::{instrument, level_filters::LevelFilter};
use tracing_subscriber::{self, EnvFilter};

fn initialize_tracing() {
    /* This code will be used in the near future
    let collector = tracing_subscriber::fmt()
        // filter spans/events with level TRACE or higher.
        .with_max_level(Level::TRACE)
        // build but do not install the subscriber.
        .finish();
    */

    let filter = EnvFilter::try_from_default_env()
        .or_else(|_| EnvFilter::try_new("INFO"))
        .unwrap();

    tracing_subscriber::fmt::fmt()
        .with_env_filter(filter)
        .with_max_level(LevelFilter::INFO)
        .init();
}

#[instrument]
fn run_data_holder(zkvm: &str, data_files: Vec<&str>, dvr_file: &str) {
    let data_holder = DataHolder;
    let rt = Runtime::new().unwrap();

    rt.block_on(data_holder.start(zkvm, data_files, dvr_file));
}

// Helper function to check if a file path exists
fn path_exists(path: &str) -> bool {
    fs::metadata(path).is_ok()
}

fn main() {
    initialize_tracing();

    let matches = App::new("zkpass-demo")
        .version("0.1.0")
        .about("A CLI app for submitting a DVR query to the zkPass service")
        .arg(
            Arg::with_name("zkvm-type")
                .help("The zkVM type: 'r0'")
                .required(true)
                .index(1),
        )
        .arg(
            Arg::with_name("user-data-file")
                .help("Path to the user data JSON file")
                .required(true)
                .multiple_values(true)
                .long("user-data-file")
                .short('U')
                .takes_value(true),
        )
        .arg(
            Arg::with_name("dvr-query-file")
                .help("Path to the DVR query JSON file")
                .required(true)
                .long("dvr-file")
                .short('D')
                .takes_value(true),
        )
        .get_matches();

    let zkvm_type = matches.value_of("zkvm-type").unwrap();
    let user_data_paths: Vec<&str> = matches.values_of("user-data-file").unwrap().collect();
    let dvr_file_path = matches.value_of("dvr-query-file").unwrap();

    // Check if zkvm_type is "r0"
    if zkvm_type != "r0" {
        eprintln!("Error: 'zkvm-type' must be 'r0'");
        std::process::exit(1);
    }

    // Check if the file paths point to existing JSON files
    for user_data_path in &user_data_paths {
        if !path_exists(user_data_path) {
            eprintln!(
                "Error: User data file path '{}' does not exist or is not accessible",
                user_data_path
            );
            std::process::exit(1);
        }
    }

    if !path_exists(dvr_file_path) {
        eprintln!(
            "Error: DVR query file path '{}' does not exist or is not accessible",
            dvr_file_path
        );
        std::process::exit(1);
    }

    run_data_holder(zkvm_type, user_data_paths, dvr_file_path);
}
