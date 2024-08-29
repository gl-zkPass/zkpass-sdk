use std::{ collections::HashMap, fs };

use tracing::{ error, info };

// Helper function to check if a file path exists
fn path_exists(path: &str) -> bool {
    fs::metadata(path).is_ok()
}

pub fn validate_path(tag: &str, path: &str) {
    if !path_exists(path) {
        error!("Error: {} file path '{}' does not exist or is not accessible", tag, path);
        std::process::exit(1);
    }
}

// Helper for extracting the specified user data tags
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
                        error!("Error: tag '{}' is defined twice", tag);
                        std::process::exit(1);
                    } else if tag.is_empty() || user_data_file.is_empty() {
                        error!(
                            "Error: When defining multiple user data, 'tags' for each user-data-file must be specified"
                        );
                        std::process::exit(1);
                    } else {
                        extracted_user_data_tags.insert(tag, user_data_file);
                    }
                }
            }
            _ => {
                error!("Error: 'user-data-files' is not on the correct format");
                std::process::exit(1);
            }
        }
    }

    return extracted_user_data_tags;
}

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
            error!("Error: Invalid example name '{}'", example_name);
            std::process::exit(1);
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
