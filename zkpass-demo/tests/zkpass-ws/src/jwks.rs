/*
 * jwks.rs
 * this file contains helper function to fetch public keys from jwks endpoint
 *
 * Authors:
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 * Created Date: November 30th 2023
 * -----
 * Last Modified: May 3rd 2024
 * Modified By: William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * -----
 * Reviewers:
 *   Antony Halim (antony.halim@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
use std::path::PathBuf;
use reqwest::Error;
use tracing::{ info, error };
use zkpass_core::interface::{ Jwk, KeysetEndpoint, PublicKey };
use zkpass_svc_common::interface::retrieve_env_var;

use crate::utils::{ read_json_from_file, FetchKeysResponse };

lazy_static::lazy_static! {
    static ref ZKPASS_JWKS: Vec<Jwk> = {
        let my_path = PathBuf::from("./zkpass-ws/.env");
        dotenvy::from_path(my_path.as_path()).ok();
        info!("Reading JWKS from file");

        let filepath = retrieve_env_var("JWKS_FILE_PATH").unwrap();
        let jwks: Vec<Jwk> = read_json_from_file::<Vec<Jwk>>(&filepath, true).unwrap_or_else(|err| {
            error!("Error reading JWKS from file: {}", err.to_string());
            Vec::new()
        });
        info!("JWKS received from file");
        jwks
    };
}

async fn fetch_keys(url: String) -> Result<FetchKeysResponse, Error> {
    info!("Fetching keys from {}", url);
    let response = reqwest::get(url).await?;
    let response = response.json().await?;
    Ok(response)
}

pub async fn fetch_keys_from_jwks(
    verification_endpoint: KeysetEndpoint
) -> Result<PublicKey, String> {
    let url = verification_endpoint.jku;
    info!("Fetching URL: {}", url);

    let key_response = fetch_keys(url).await;

    match key_response {
        Ok(keys) => {
            for key in keys.keys {
                if key.kid == verification_endpoint.kid {
                    return Ok(PublicKey { x: key.x, y: key.y });
                }
            }
            Err("No matching key found".to_string())
        }
        Err(err) => Err(format!("Error fetching issuer keys: {}", err)),
    }
}

pub fn read_jwks_from_file() -> Vec<Jwk> {
    let jwks = ZKPASS_JWKS.clone();
    jwks
}

#[cfg(test)]
mod tests {
    use super::*;
    use httpmock::{ Method::GET, MockServer };
    use serial_test::serial;
    use std::sync::Once;

    static INIT: Once = Once::new();

    fn initialize() {
        INIT.call_once(|| {
            std::env::set_var("JWKS_FILE_PATH", "./sample-jwks.json");
        });
    }

    #[test]
    #[serial]
    fn test_read_jwks_from_file() {
        initialize();
        let jwks = read_jwks_from_file();
        assert!(jwks.len() > 0);

        let service_signing_pub_key = jwks.iter().find(|jwk| jwk.kid == "ServiceSigningPubK");
        let service_encryption_pub_key = jwks.iter().find(|jwk| jwk.kid == "ServiceEncryptionPubK");
        let verifying_pub_key = jwks.iter().find(|jwk| jwk.kid == "VerifyingPubK");

        assert!(service_signing_pub_key.is_some());
        assert!(service_encryption_pub_key.is_some());
        assert!(verifying_pub_key.is_some());
    }

    #[tokio::test]
    async fn test_fetch_keys_from_jwks() {
        let server = MockServer::start();
        let jwks =
            r#"
            {
                "keys": [
                    {
                        "kty": "EC",
                        "crv": "P-256",
                        "x": "x",
                        "y": "y",
                        "kid": "kid"
                    }
                ]
            }
        "#;
        let jwks_url = server.mock(|when, then| {
            when.method(GET).path("/jwks");
            then.status(200).body(jwks);
        });

        let verification_endpoint = KeysetEndpoint {
            jku: server.url("/jwks").to_string(),
            kid: "kid".to_string(),
        };

        let public_key = fetch_keys_from_jwks(verification_endpoint).await.unwrap();
        assert_eq!(public_key.x, "x");
        assert_eq!(public_key.y, "y");

        jwks_url.assert();
    }
}
