mod constants;
mod data_holder;
mod data_issuer;
mod helper;
mod proof_verifier;
mod test;

use clap::{App, Arg};
use data_holder::DataHolder;
use helper::{extract_user_data_tags, pick_example_data_and_dvr, validate_path};
use std::collections::HashMap;
use tokio::runtime::Runtime;
use tracing::{error, instrument, level_filters::LevelFilter};
use tracing_subscriber::{self, EnvFilter};

fn initialize_tracing() {
    let filter = EnvFilter::try_from_default_env()
        .or_else(|_| EnvFilter::try_new("INFO"))
        .unwrap();

    tracing_subscriber::fmt::fmt()
        .with_env_filter(filter)
        .with_max_level(LevelFilter::INFO)
        .init();
}

#[instrument]
fn run_data_holder(zkvm: &str, data_files: HashMap<String, String>, dvr_file: &str) {
    let data_holder = DataHolder;
    let rt = Runtime::new().unwrap();

    rt.block_on(data_holder.start(zkvm, data_files, dvr_file));
}

fn main() {
    initialize_tracing();

    let matches = App::new("zkpass-demo")
        .version("0.1.0")
        .about("A CLI app for submitting a DVR query to the zkPass service")
        .arg(
            Arg::with_name("zkvm-type").help("The zkVM type: 'sp1' or 'r0'").required(true).index(1)
        )
        .arg(
            Arg::with_name("user-data-file")
                .help(
                    "Path to the user data JSON file, use [tag:]<user_data_file> if you want to use multiple user data files"
                )
                .multiple_values(true)
                .long("user-data-file")
                .short('U')
                .takes_value(true)
        )
        .arg(
            Arg::with_name("dvr-file")
                .help("Path to the DVR query JSON file")
                .long("dvr-file")
                .short('D')
                .takes_value(true)
        )
        .arg(
            Arg::with_name("pick-example")
                .help(
                    "Run the example, overriding any user data and dvr file.\n
                    Only these example are supported:\n
                    - dewi\n
                    - dewi-wrong\n
                    - ramana\n
                    - ramana-wrong\n
                    - healthcheck\n
                    - multiple"
                )
                .long("example")
                .short('E')
                .takes_value(true)
        )
        .get_matches();

    let zkvm_type = matches.value_of("zkvm-type").unwrap();
    // Check if zkvm_type is "r0"
    if zkvm_type != "r0" {
        eprintln!("Error: 'zkvm-type' must be 'r0'");
        std::process::exit(1);
    }

    let example = matches.value_of("pick-example").unwrap_or("");
    if example != "" {
        let (user_data_tags, dvr_file_path) = pick_example_data_and_dvr(example);
        run_data_holder(zkvm_type, user_data_tags, dvr_file_path);
    } else {
        let user_data_paths: Vec<&str> = match matches.values_of("user-data-file") {
            Some(values) => values.collect(),
            None => {
                error!("Error: 'user-data-file' is required");
                std::process::exit(1);
            }
        };
        let dvr_file_path = match matches.value_of("dvr-file") {
            Some(values) => values,
            None => {
                error!("Error: 'dvr-file' is required");
                std::process::exit(1);
            }
        };
        let user_data_tags = extract_user_data_tags(&user_data_paths);

        validate_path("DVR query", dvr_file_path);
        run_data_holder(zkvm_type, user_data_tags, dvr_file_path);
    }
}
