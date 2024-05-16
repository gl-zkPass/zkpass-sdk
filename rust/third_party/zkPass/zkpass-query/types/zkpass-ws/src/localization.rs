/*
 * localization.rs
 * This file is for localization service
 *
 * Authors:
 *   Janice Laksana (janice.laksana@gdplabs.id)
 * Created at: January 15th 2024
 * -----
 * Last Modified: April 17th 2024
 * Modified By:
 *   Janice Laksana (janice.laksana@gdplabs.id)
 * -----
 * Reviewers:
 *   ntejapermana (nugraha.tejapermana@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   Khandar William (khandar.william@gdplabs.id)
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * ---
 * References:
 *   [1] https://docs.rs/fluent/latest/fluent/
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */

use fluent::{ FluentBundle, FluentValue, FluentResource, FluentArgs };
use lazy_static::lazy_static;
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;
use unic_langid::LanguageIdentifier;

lazy_static! {
    static ref LOCALIZATIONS: HashMap<String, String> = load_localizations();
}

fn load_localizations() -> HashMap<String, String> {
    let mut localizations = HashMap::new();
    let localization_folder = PathBuf::from("localization");

    if !localization_folder.exists() {
        eprintln!("Error: Localization directory '{:?}' does not exist.", localization_folder);
        return localizations;
    }

    if !localization_folder.is_dir() {
        eprintln!("Error: '{:?}' is not a directory.", localization_folder);
        return localizations;
    }

    match fs::read_dir(&localization_folder) {
        Ok(entries) => {
            for entry in entries.filter_map(Result::ok) {
                let path = entry.path();
                if path.is_file() && path.extension().and_then(|s| s.to_str()) == Some("ftl") {
                    if let Some(locale) = path.file_stem().and_then(|s| s.to_str()) {
                        match fs::read_to_string(&path) {
                            Ok(contents) => {
                                localizations.insert(locale.to_string(), contents);
                            }
                            Err(e) => {
                                eprintln!("Error reading localization file {:?}: {}", path, e);
                            }
                        }
                    }
                }
            }
        }
        Err(e) => {
            eprintln!("Error reading directory '{:?}': {}", localization_folder, e);
        }
    }

    localizations
}

pub fn get_user_locale() -> String {
    "en-US".to_string()
}

pub fn get_localized_message(error_key: &str, args: Option<&FluentArgs>) -> String {
    let user_locale = get_user_locale(); // Get the user's locale

    if let Some(localization) = LOCALIZATIONS.get(&user_locale) {
        let fluent_resource = FluentResource::try_new(localization.clone()).unwrap();
        let mut fluent_bundle = FluentBundle::new(
            vec![user_locale.parse::<LanguageIdentifier>().unwrap()]
        );
        fluent_bundle.set_use_isolating(false);
        fluent_bundle.add_resource(fluent_resource).unwrap();

        if let Some(message) = fluent_bundle.get_message(error_key) {
            if let Some(pattern) = message.value() {
                let mut errors = vec![];
                return fluent_bundle.format_pattern(pattern, args, &mut errors).to_string();
            }
        }
    }
    format!("Localization not found for key: {}", error_key)
}

pub fn get_localized_error_message(error_key: &str) -> String {
    get_localized_message(error_key, None)
}

pub fn get_localized_error_with_custom_message(error_key: &str, msg: &str) -> String {
    let mut args = FluentArgs::new();
    args.set("msg", FluentValue::from(msg));

    get_localized_message(error_key, Some(&args))
}
#[cfg(test)]
mod tests {
    use serial_test::serial;

    use crate::localization::get_user_locale;

    use super::{ get_localized_error_message, get_localized_error_with_custom_message };

    fn setup_environment<F>(closure: F) where F: Fn() {
        std::env::set_current_dir("../").unwrap();
        closure();
        std::env::set_current_dir("./zkpass-ws").unwrap();
    }

    #[test]
    fn test_get_user_locale() {
        assert_eq!(get_user_locale(), "en-US");
    }

    #[test]
    #[serial]
    fn test_get_localized_error_message() {
        // Test case for existing localization
        setup_environment(|| {
            let error_key = "ReadError";
            let expected_message = "Read Error: Error occurred while reading from the socket.";

            assert_eq!(get_localized_error_message(error_key), expected_message);

            // Test case for non-existing localization
            let non_existing_error_key = "non_existing_error_key";
            let expected_default_message =
                format!("Localization not found for key: {}", non_existing_error_key);
            assert_eq!(
                get_localized_error_message(non_existing_error_key),
                expected_default_message
            );
        });
    }

    #[test]
    #[serial]
    fn test_get_localized_error_with_custom_message() {
        // Test case for existing localization
        setup_environment(|| {
            let error_key = "DeserializeError";
            let custom_message = "Custom error message";
            let expected_message = format!("Failed to deserialize the data: {}", custom_message);
            assert_eq!(
                get_localized_error_with_custom_message(error_key, custom_message),
                expected_message
            );

            // Test case for non-existing localization
            let non_existing_error_key = "non_existing_error_key";
            let expected_default_message =
                format!("Localization not found for key: {}", non_existing_error_key);
            assert_eq!(
                get_localized_error_with_custom_message(non_existing_error_key, custom_message),
                expected_default_message
            );
        });
    }
}
