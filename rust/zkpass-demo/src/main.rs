/*
 * main.rs
 * Main function for the zkPass Demo
 *
 * ---
 * References:
 *   -
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
mod data_holder;
mod data_issuer;
mod helper;
mod lib_loader;
mod proof_verifier;
mod sample_keys;
#[cfg(test)]
mod sample_proof;
mod test;

use clap::{ App, Arg };
use helper::{ extract_user_data_tags, pick_example_data_and_dvr, validate_path };
use std::collections::HashMap;
use std::path::PathBuf;
use tokio::runtime::Runtime;
use data_holder::DataHolder;
use tracing_subscriber::{ self, EnvFilter };
use tracing::{ error, instrument, level_filters::LevelFilter };

///
/// Initializes the tracing subscriber.
///
fn initialize_tracing() {
    if tracing::dispatcher::has_been_set() {
        return;
    }

    let filter = EnvFilter::try_from_default_env()
        .or_else(|_| EnvFilter::try_new("INFO"))
        .unwrap();

    tracing_subscriber::fmt::fmt().with_env_filter(filter).with_max_level(LevelFilter::INFO).init();
}

///
/// Runs the Data Holder process.
///
#[instrument]
async fn run_data_holder(zkvm: &str, user_data_files: HashMap<String, String>, dvr_file: &str) {
    let data_holder = DataHolder;
    data_holder.start(zkvm, user_data_files, dvr_file).await;
}

fn create_app() -> App<'static> {
    App::new("zkpass-demo")
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
}

fn main() {
    initialize_tracing();
    let env_path = PathBuf::from("./zkpass-demo/.env");
    dotenv::from_path(env_path.as_path()).ok();

    let matches = create_app().get_matches();

    let zkvm_type = matches.value_of("zkvm-type").unwrap();
    // Check if zkvm_type is either "sp1" or "r0"
    if zkvm_type != "sp1" && zkvm_type != "r0" {
        error!("Error: 'zkvm-type' must be 'sp1' or 'r0'");
        std::process::exit(1);
    }

    let rt = Runtime::new().unwrap();

    let example = matches.value_of("pick-example").unwrap_or("");
    if example != "" {
        let (user_data_tags, dvr_file_path) = pick_example_data_and_dvr(example);
        rt.block_on(run_data_holder(zkvm_type, user_data_tags, dvr_file_path));
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
        rt.block_on(run_data_holder(zkvm_type, user_data_tags, dvr_file_path));
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use httpmock::{ Method::{ GET, POST }, MockServer };
    use serde_json::json;
    use crate::sample_proof::SAMPLE_PROOF;

    #[test]
    fn test_initialize_tracing() {
        initialize_tracing();
        initialize_tracing(); // test for double initialization
    }

    #[test]
    fn test_create_app() {
        let app = create_app();
        let subcommands = app.get_subcommands().collect::<Vec<_>>();

        assert_eq!(app.get_name(), "zkpass-demo");
        assert_eq!(app.get_version().unwrap(), "0.1.0");
        assert_eq!(subcommands.len(), 0);
    }

    fn add_dummy_file() {
        let data =
            json!({
                "name": "Ramana",
                "_name_zkpass_public_": true,
                "dateOfBirth": "21/04/2003",
                "email": "ramana@example.com",
                "city": "Jakarta",
                "country": "Indonesia",
                "skills": ["Rust", "JavaScript", "HTML/CSS"]
            });
        std::fs::write("./user_data_holder.json", data.to_string()).expect("Unable to write file");

        let dvr =
            json!( [
                {
                    "assign": {
                        "query_result": {
                            "and": [
                                { "==": [{ "dvar": "country" }, "Indonesia"] },
                                { "==": [{ "dvar": "city" }, "Jakarta"] },
                                {
                                    "or": [
                                        { "~==": [{ "dvar": "skills[0]" }, "Rust"] },
                                        { "~==": [{ "dvar": "skills[1]" }, "Rust"] },
                                        { "~==": [{ "dvar": "skills[2]" }, "Rust"] }
                                    ]
                                }
                            ]
                        }
                    }
                },
                { "output": { "title": "Job Qualification" } },
                { "output": { "name": { "dvar": "name" } } },
                { "output": { "is_qualified": { "lvar": "query_result" } } },
                { "output": { "result": { "lvar": "query_result" } } }
            ]);
        std::fs::write("./dvr_holder.json", dvr.to_string()).expect("Unable to write file");
    }

    #[tokio::test]
    async fn test_data_holder() {
        add_dummy_file();
        let service_encryption_pub_key_jwt: &str = concat!(
            "eyJhbGciOiJFUzI1NiJ9.eyJ4IjoiTUZrd0V3WUhLb1pJemowQ0FRWUlLb",
            "1pJemowREFRY0RRZ0FFcDZXSmx3QXRsZC9VNGhEbW11dU1kWkNWdE1lVSIsInkiOiJJVDN4a0RkVXdMT3ZzVlZBK2lpU3dmYVg0SHFLbFJQREdHK",
            "0Y2V0dqbnh5czlUNUd0TmUzbnZld09BPT0ifQ.pVOBooPoKdZVBfTuQ_codQg5C4YbhwFWiGvZ2nrosRbCUfDHRv9r747DCY7Hl0LDaqW0htGnPc",
            "obLY4GMatfqQ"
        );
        let service_signing_pub_key_jwt: &str = concat!(
            "eyJhbGciOiJFUzI1NiJ9.eyJ4IjoiTUZrd0V3WUhLb1pJemowQ0FRWUlLb",
            "1pJemowREFRY0RRZ0FFcDZXSmx3QXRsZC9VNGhEbW11dU1kWkNWdE1lVSIsInkiOiJJVDN4a0RkVXdMT3ZzVlZBK2lpU3dmYVg0SHFLbFJQREdHK",
            "0Y2V0dqbnh5czlUNUd0TmUzbnZld09BPT0ifQ.JiYyxmDjNk_FEwIyscWHPWEji2ROjVlhPKJIkqlsxRB4JyY0z3xzXdZGW4wXf-2UdqiSu2yFEOh1t8lRnt-DqA"
        );
        let well_known_jwks_json: String = format!(
            r#"[{{
                "kty": "EC",
                "crv": "P-256",
                "x": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU",
                "y": "IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==",
                "kid": "ServiceSigningPubK",
                "jwt": "{service_encryption_pub_key_jwt}"
            }},
            {{
                "kty": "EC",
                "crv": "P-256",
                "x": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU",
                "y": "IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==",
                "kid": "ServiceEncryptionPubK",
                "jwt": "{service_signing_pub_key_jwt}"
            }},
            {{
                "kty": "EC",
                "crv": "P-256",
                "x": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEGI0BnWm1eMGnX3aVt6vevBjfkZ2N",
                "y": "EfzRy1giqA6Tg1cecU60fkNxOjkFwxZeU0tO7TAfjUvAYyvbfNKdAOfrOA==",
                "kid": "VerifyingPubK"
            }}
            ]"#
        );

        let server = MockServer::start();
        server.mock(|when, then| {
            when.method(POST).path("/api/1.0/dvr/1.0/proof");
            then.status(200).body(SAMPLE_PROOF);
        });
        server.mock(|when, then| {
            when.method(GET).path("/.well-known/jwks.json");
            then.status(200).body(well_known_jwks_json);
        });

        let zkpass_url = format!("http://{}", server.address());
        std::env::set_var("ZKPASS_URL", zkpass_url);
        std::env::set_var("API_KEY", "api_key");
        std::env::set_var("SECRET_API_KEY", "secret_api_key");
        std::env::set_var(
            "DVR_MODULE_PATH",
            "/home/builder/zkPass/target/release/libdvr_client.so"
        );
        std::env::set_var("DVR_APP_PATH", "/api/1.0/dvr/1.0/proof");

        let zkvm = "r0";
        let mut data_files = HashMap::new();
        data_files.insert(String::from(""), String::from("./user_data_holder.json"));
        let dvr_file = "./dvr_holder.json";

        // The generate proof will pass, but the verification will fail because the mocked generated proof has dvr_id which does not placed on the DVR_TABLE
        let join_handle = tokio::spawn(async move {
            run_data_holder(zkvm, data_files, dvr_file).await
        });
        let result = join_handle.await;
        println!("result: {:?}", result);
        assert!(result.is_err());

        std::fs::remove_file(dvr_file).expect("Unable to remove file");
        std::fs::remove_file("./user_data_holder.json").expect("Unable to remove file");
    }
}
