/*
 * api_keys.rs
 * this file consist of how to authorize users using api-key and secret-api-key
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 *   JaniceLaksana (janice.laksana@gdplabs.id)
 * Created Date: December 4th 2023
 * -----
 * Last Modified: April 3rd 2024
 * Modified By: William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * -----
 * Reviewers:
 *   Antony Halim (antony.halim@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   Khandar William (khandar.william@gdplabs.id)
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * ---
 * References:
 *   [1] https://nunomaduro.com/load_environment_variables_from_dotenv_files_in_your_rust_program
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
use std::{ collections::HashMap, sync::RwLock };

use actix_web::http::header::{ HeaderValue, HeaderMap };
use base64::{ engine::general_purpose, Engine };
use lazy_static::lazy_static;
use mysql::{ prelude::Queryable, Pool };
use serde::Deserialize;
use tracing::{ info, error };
use zkpass_svc_common::interface::{ errors::ZkPassUtilError, retrieve_env_var };
use tokio::{ fs::File, io::AsyncReadExt };

pub const DEFAULT_API_KEY_SOURCE: &str = "file";

lazy_static! {
    static ref API_KEYS: RwLock<HashMap<String, String>> = {
        let api_keys_map = HashMap::<String, String>::new();
        RwLock::new(api_keys_map)
    };
}

#[derive(Deserialize, Debug)]
struct ApiKey {
    api_key: String,
    secret_api_key: String,
}

#[allow(dead_code)]
pub async fn read_api_key_from_file(file_path: &str) -> Result<(), ZkPassUtilError> {
    let mut data_content = File::open(file_path).await.map_err(|_| ZkPassUtilError::IOError)?;
    let mut data = String::new();
    data_content.read_to_string(&mut data).await.map_err(|_| ZkPassUtilError::DeserializeError)?;
    let api_keys: Vec<ApiKey> = serde_json
        ::from_str(&data)
        .map_err(|_| ZkPassUtilError::DeserializeError)?;

    let mut api_keys_handle = API_KEYS.write().unwrap();
    api_keys_handle.clear();
    for api_key in api_keys {
        api_keys_handle.insert(api_key.api_key.clone(), api_key.secret_api_key.clone());
    }

    Ok(())
}

pub async fn read_api_key_from_db() -> Result<(), ZkPassUtilError> {
    let database_url_env = retrieve_env_var("DATABASE_URL")?;
    let pool = Pool::new(database_url_env.as_str()).map_err(|_| ZkPassUtilError::ConnectionError)?;
    let mut conn = pool.get_conn().map_err(|_| ZkPassUtilError::ConnectionError)?;

    let result = conn
        .query_map("CALL GetActiveApiKeys()", |(api_key, secret_api_key)| {
            ApiKey {
                api_key,
                secret_api_key,
            }
        })
        .map_err(|_| ZkPassUtilError::ConnectionError)?;

    let mut api_keys_handle = API_KEYS.write().unwrap();
    api_keys_handle.clear();
    for api_key in result {
        api_keys_handle.insert(api_key.api_key.clone(), api_key.secret_api_key.clone());
    }

    info!("build api key from db success");

    Ok(())
}

pub fn match_key(auth_header: &HeaderValue) -> bool {
    if let Some(api_key) = auth_header.to_str().ok() {
        if !api_key.starts_with("Basic ") {
            return false;
        }
        let token = api_key.trim_start_matches("Basic ");
        if let Ok(decoded_bytes) = general_purpose::STANDARD.decode(token) {
            if let Ok(decoded_str) = String::from_utf8(decoded_bytes) {
                let parts: Vec<&str> = decoded_str.split(':').collect();
                if parts.len() != 2 {
                    return false;
                }
                let api_key = parts[0];
                let secret_api_key = parts[1];

                if api_key.is_empty() || secret_api_key.is_empty() {
                    return false;
                }
                let api_keys_handle = API_KEYS.read().unwrap();
                if let Some(secret_key) = api_keys_handle.get(api_key) {
                    return secret_api_key == secret_key;
                }
            }
        }
    }
    false
}

pub fn authenticate(header: &HeaderMap) -> bool {
    match header.get("Authorization") {
        Some(auth_header) => match_key(auth_header),
        None => false,
    }
}

pub async fn retrieve_api_key() {
    let api_key_source = retrieve_env_var("API_KEY_SOURCE").unwrap_or(
        DEFAULT_API_KEY_SOURCE.to_string()
    );
    match api_key_source.as_str() {
        "file" => {
            let api_key_path = retrieve_env_var("API_KEY_FILE").unwrap();
            read_api_key_from_file(&api_key_path).await
                .map_err(|err| error!("{:?}", err))
                .unwrap();
        }
        "database" => {
            read_api_key_from_db().await
                .map_err(|err| error!("{:?}", err))
                .unwrap();
        }
        _ => {
            error!("Not supported yet");
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::http::header::HeaderName;
    use serial_test::serial;
    use std::sync::Once;

    static INIT: Once = Once::new();

    fn initialize() {
        INIT.call_once(|| {
            std::env::set_var("API_KEY_SOURCE", "file");
            std::env::set_var("API_KEY_FILE", "./sample-api-keys.json");
        });
    }

    #[actix_web::test]
    #[serial]
    async fn test_authenticate() {
        initialize();
        retrieve_api_key().await;

        let mut header_map = HeaderMap::new();
        header_map.insert(
            HeaderName::from_static("authorization"),
            HeaderValue::from_static("Basic YXBpXzE6c2VjcmV0X2FwaV8x")
        );
        assert!(authenticate(&header_map));
    }
}
