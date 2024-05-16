mod data_holder;
mod data_issuer;
mod proof_verifier;
mod sample_keys;
mod test;

use clap::{ Arg, App };
use std::fs;
use std::path::PathBuf;
use tokio::runtime::Runtime;
use data_holder::DataHolder;
use tracing_subscriber::{ self, EnvFilter };
use tracing::{ instrument, level_filters::LevelFilter };

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

    tracing_subscriber::fmt::fmt().with_env_filter(filter).with_max_level(LevelFilter::INFO).init();
}

#[instrument]
fn run_data_holder(zkvm: &str, data_file: &str, dvr_file: &str) {
    let data_holder = DataHolder;
    let rt = Runtime::new().unwrap();

    rt.block_on(data_holder.start(zkvm, data_file, dvr_file));
}

// Helper function to check if a file path exists
fn path_exists(path: &str) -> bool {
    fs::metadata(path).is_ok()
}

fn main() {
    initialize_tracing();
    let env_path = PathBuf::from("./zkpass-demo/.env");
    dotenv::from_path(env_path.as_path()).ok();

    let matches = App::new("zkpass-demo")
        .version("0.1.0")
        .about("A CLI app for submitting a DVR query to the zkPass service")
        .arg(
            Arg::with_name("zkvm-type").help("The zkVM type: 'sp1' or 'r0'").required(true).index(1)
        )
        .arg(
            Arg::with_name("user-data-file")
                .help("Path to the user data JSON file")
                .required(true)
                .index(2)
        )
        .arg(
            Arg::with_name("dvr-query-file")
                .help("Path to the DVR query JSON file")
                .required(true)
                .index(3)
        )
        .get_matches();

    let zkvm_type = matches.value_of("zkvm-type").unwrap();
    let user_data_path = matches.value_of("user-data-file").unwrap();
    let dvr_file_path = matches.value_of("dvr-query-file").unwrap();

    // Check if zkvm_type is either "sp1" or "r0"
    if zkvm_type != "sp1" && zkvm_type != "r0" {
        eprintln!("Error: 'zkvm-type' must be 'sp1' or 'r0'");
        std::process::exit(1);
    }

    // Check if the file paths point to existing JSON files
    if !path_exists(user_data_path) || !path_exists(dvr_file_path) {
        eprintln!("Error: One or both file paths do not exist or are not accessible");
        std::process::exit(1);
    }

    run_data_holder(zkvm_type, user_data_path, dvr_file_path);
}
