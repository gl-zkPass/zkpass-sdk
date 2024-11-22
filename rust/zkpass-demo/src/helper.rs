/*
 * helper.rs
 * Helper functions to extract user data tags and validate file paths
 *
 * ---
 * References:
 *   -
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
use core::panic;
use std::{ collections::HashMap, fs };
use tracing::info;
use base64::{ decode_config, URL_SAFE };
use serde_json::Value;
use std::str;

///
/// Extracts the payload from a JWT token without validation.
///
/// This function splits the JWT token into its three parts (header, payload, and signature),
/// decodes the payload from Base64, and parses it as JSON. It does not perform any validation
/// on the token.
///
/// # Arguments
///
/// * `token` - A string slice that holds the JWT token.
///
/// # Returns
///
/// A `Result` containing the payload as a `serde_json::Value` if successful, or an error if the
/// token format is invalid or if decoding/parsing fails.
///
pub fn extract_payload_without_validation(
    token: &str
) -> Result<Value, Box<dyn std::error::Error>> {
    let parts: Vec<&str> = token.split('.').collect();
    if parts.len() != 3 {
        return Err("Invalid JWS token format".into());
    }

    let payload = parts[1];
    let decoded_payload = decode_config(payload, URL_SAFE)?;
    let payload_str = str::from_utf8(&decoded_payload)?;
    let payload_json: Value = serde_json::from_str(payload_str)?;

    Ok(payload_json)
}

// Helper function to check if a file path exists
fn path_exists(path: &str) -> bool {
    fs::metadata(path).is_ok()
}

///
/// Validates a file path.
///
pub fn validate_path(tag: &str, path: &str) {
    if !path_exists(path) {
        panic!("Error: {} file path '{}' does not exist or is not accessible", tag, path);
    }
}

///
/// Extracts user data tags from a list of user data paths.
///
pub fn extract_user_data_tags(user_data_paths: &Vec<&str>) -> HashMap<String, String> {
    let mut extracted_user_data_tags: HashMap<String, String> = HashMap::new();
    let paths_count = user_data_paths.len();

    for value in user_data_paths {
        let parts: Vec<&str> = value.split(':').collect();
        match parts.as_slice() {
            [user_data_file] if paths_count == 1 => {
                validate_path("User data", user_data_file);
                extracted_user_data_tags.insert("".to_string(), user_data_file.to_string());
            }
            [tag, user_data_file @ ..] => {
                let user_data_file = user_data_file.concat();
                let tag = tag.to_string();
                validate_path("User data", &user_data_file);

                if paths_count == 1 {
                    extracted_user_data_tags.insert(tag, user_data_file);
                } else {
                    if extracted_user_data_tags.contains_key(&tag) {
                        panic!("Error: tag '{}' is defined twice", tag);
                    } else if tag.is_empty() || user_data_file.is_empty() {
                        panic!(
                            "Error: When defining multiple user data, 'tags' for each user-data-file must be specified"
                        );
                    } else {
                        extracted_user_data_tags.insert(tag, user_data_file);
                    }
                }
            }
            _ => {
                panic!("Error: 'user-data-files' is not on the correct format");
            }
        }
    }

    return extracted_user_data_tags;
}

///
/// Picks example data and DVR file based on the provided example name.
///
pub fn pick_example_data_and_dvr(example_name: &str) -> (HashMap<String, String>, &str) {
    let (user_data_tags, dvr_file_path) = match example_name {
        "dewi" => {
            let user_data_tags = vec!["./test/data/dewi-profile.json"];
            let dvr_file_path = "./test/data/bca-insurance-dewi-dvr.json";
            info!("Running example: {}", example_name);
            info!("Expected result: true");
            (user_data_tags, dvr_file_path)
        }
        "dewi-wrong" => {
            let user_data_tags = vec!["./test/data/dewi-profile-wrong.json"];
            let dvr_file_path = "./test/data/bca-insurance-dewi-dvr.json";
            info!("Running example: {}", example_name);
            info!("Expected result: false");
            (user_data_tags, dvr_file_path)
        }
        "ramana" => {
            let user_data_tags = vec!["./test/data/ramana-profile.json"];
            let dvr_file_path = "./test/data/bca-finance-ramana-dvr.json";
            info!("Running example: {}", example_name);
            info!("Expected result: true");
            (user_data_tags, dvr_file_path)
        }
        "ramana-wrong" => {
            let user_data_tags = vec!["./test/data/ramana-profile.json"];
            let dvr_file_path = "./test/data/bca-insurance-dewi-dvr.json";
            info!("Running example: {}", example_name);
            info!("Expected result: false");
            (user_data_tags, dvr_file_path)
        }
        "healthcheck" => {
            let user_data_tags = vec!["./test/data/health-data.json"];
            let dvr_file_path = "./test/data/health-dvr.json";
            info!("Running example: {}", example_name);
            info!("Expected result: true");
            (user_data_tags, dvr_file_path)
        }
        "multiple" => {
            let user_data_tags = vec![
                "bank:./test/data/multiple/bank.json",
                "health:./test/data/multiple/health.json"
            ];
            let dvr_file_path = "./test/data/multiple/insurance-dvr.json";
            info!("Running example: {}", example_name);
            info!("Expected result: true");
            (user_data_tags, dvr_file_path)
        }
        _ => {
            panic!("Error: Invalid example name '{}'", example_name);
        }
    };
    info!("Overiding user data and dvr file with example data");

    let user_data_tags = extract_user_data_tags(
        &user_data_tags
            .iter()
            .map(|x| x.as_ref())
            .collect()
    );

    return (user_data_tags, dvr_file_path);
}

#[cfg(test)]
mod tests {
    use std::{ panic::catch_unwind, path::PathBuf };
    use super::*;

    const DUMMY_DATA: &str = r#"{"name": "Alice", "age": 25}"#;

    fn copy_all_test_files() -> Vec<PathBuf> {
        let source_dirs = vec!["../test/data", "../test/data/multiple"];
        let current_dir = std::env::current_dir().unwrap();
        let target_dirs = vec![
            current_dir.join("test/data"),
            current_dir.join("test/data/multiple")
        ];

        // Create target directories if they don't exist
        for target_dir in &target_dirs {
            fs::create_dir_all(target_dir).unwrap();
        }

        let mut copied_files = Vec::new();
        for (source_dir, target_dir) in source_dirs.iter().zip(target_dirs.iter()) {
            // Read files from each source directory
            let paths = fs::read_dir(source_dir).unwrap();
            for path in paths {
                let path = path.unwrap().path();
                if path.is_file() {
                    let file_name = path.file_name().unwrap();

                    // Copy to the first target directory
                    let destination_first = target_dir.join(&file_name);
                    fs::copy(&path, &destination_first).unwrap();
                    copied_files.push(destination_first);
                }
            }
        }
        copied_files
    }

    fn delete_all_test_files(copied_files: Vec<PathBuf>) {
        for file in copied_files {
            fs::remove_file(file).unwrap();
        }
    }

    fn wrapper_copy_all_test_files<F>(closure: F) where F: FnOnce() {
        let copied_files = copy_all_test_files();
        closure();
        delete_all_test_files(copied_files);
    }

    #[test]
    fn test_path_exists_and_validate_path() {
        let path = "./test_path.json";
        std::fs::write(&path, DUMMY_DATA).expect("Unable to write file");
        validate_path("validate", path);
        assert_eq!(path_exists(path), true);
        std::fs::remove_file(path).expect("Unable to remove file");
    }

    #[test]
    fn test_extract_user_data_tags_single() {
        let path = "./extract_user_data.json";
        std::fs::write(&path, DUMMY_DATA).expect("Unable to write file");

        let user_data_paths = vec!["./extract_user_data.json"];
        let extracted_user_data_tags = extract_user_data_tags(&user_data_paths);
        assert_eq!(extracted_user_data_tags.len(), 1);

        let user_data_paths = vec!["tag1:./extract_user_data.json"];
        let extracted_user_data_tags = extract_user_data_tags(&user_data_paths);
        assert_eq!(extracted_user_data_tags.len(), 1);

        std::fs::remove_file(path).expect("Unable to remove file");
    }

    #[test]
    fn test_extract_user_data_tags_multiple() {
        let path1 = "./extract_user_data_1.json";
        let path2 = "./extract_user_data_2.json";
        std::fs::write(&path1, DUMMY_DATA).expect("Unable to write file");
        std::fs::write(&path2, DUMMY_DATA).expect("Unable to write file");

        let user_data_paths = vec![
            "tag1:./extract_user_data_1.json",
            "tag2:./extract_user_data_2.json"
        ];
        let extracted_user_data_tags = extract_user_data_tags(&user_data_paths);
        assert_eq!(extracted_user_data_tags.len(), 2);

        // defining tag twice
        let user_data_paths = vec![
            "tag1:./extract_user_data_1.json",
            "tag1:./extract_user_data_2.json"
        ];
        let result = catch_unwind(|| {
            extract_user_data_tags(&user_data_paths);
        });
        assert!(result.is_err());

        // empty tags
        let user_data_paths = vec![":./extract_user_data_1.json", ":./extract_user_data_2.json"];
        let result = catch_unwind(|| {
            extract_user_data_tags(&user_data_paths);
        });
        assert!(result.is_err());
        std::fs::remove_file(path1).expect("Unable to remove file");
        std::fs::remove_file(path2).expect("Unable to remove file");
    }

    #[test]
    fn test_pick_example_data_and_dvr() {
        wrapper_copy_all_test_files(|| {
            let (user_data_tags, dvr_file_path) = pick_example_data_and_dvr("dewi");
            assert_eq!(user_data_tags.len(), 1);
            assert_eq!(dvr_file_path, "./test/data/bca-insurance-dewi-dvr.json");

            let (user_data_tags, dvr_file_path) = pick_example_data_and_dvr("dewi-wrong");
            assert_eq!(user_data_tags.len(), 1);
            assert_eq!(dvr_file_path, "./test/data/bca-insurance-dewi-dvr.json");

            let (user_data_tags, dvr_file_path) = pick_example_data_and_dvr("ramana");
            assert_eq!(user_data_tags.len(), 1);
            assert_eq!(dvr_file_path, "./test/data/bca-finance-ramana-dvr.json");

            let (user_data_tags, dvr_file_path) = pick_example_data_and_dvr("ramana-wrong");
            assert_eq!(user_data_tags.len(), 1);
            assert_eq!(dvr_file_path, "./test/data/bca-insurance-dewi-dvr.json");

            let (user_data_tags, dvr_file_path) = pick_example_data_and_dvr("healthcheck");
            assert_eq!(user_data_tags.len(), 1);
            assert_eq!(dvr_file_path, "./test/data/health-dvr.json");

            let (user_data_tags, dvr_file_path) = pick_example_data_and_dvr("multiple");
            assert_eq!(user_data_tags.len(), 2);
            assert_eq!(dvr_file_path, "./test/data/multiple/insurance-dvr.json");

            let result = catch_unwind(|| {
                pick_example_data_and_dvr("invalid");
            });
            assert!(result.is_err());
        });
    }

    #[test]
    fn test_extract_payload_without_validation_success() {
        let token =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
        let payload = extract_payload_without_validation(token).unwrap();
        assert_eq!(payload["sub"], "1234567890");
        assert_eq!(payload["name"], "John Doe");
        assert_eq!(payload["iat"], 1516239022);
    }

    #[test]
    fn test_extract_payload_without_validation_invalid_token() {
        // Missing the signature part
        let token =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ";
        let result = extract_payload_without_validation(token);
        assert!(result.is_err());

        // Error from_utf8
        let token =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
        let result = extract_payload_without_validation(token);
        assert!(result.is_err());
    }
}
