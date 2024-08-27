/*
 * zkpass_client.rs
 * File contains the implementation of zkpass client
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
use crate::core::*;
use crate::helpers::inject_client_version_header;
use crate::interface::*;
use async_trait::async_trait;
use base64::{engine::general_purpose, Engine};
use serde_json::{json, Value};
use std::collections::HashMap;
use std::time::Duration;
use tracing::info;
use zkpass_core::jwt_helpers::{
    decrypt_jwe_token, encrypt_data_to_jwe_token, sign_data_to_jws_token, verify_jws_token,
};
use zkpass_core::user_data_helpers::encode_user_data_tokens;

const JWKS_PATH: &str = ".well-known/jwks.json";
const GENERATE_PROOF_PATH: &str = "v1/proof";

const KID_SERVICE_ENCRYPTION_PUB_KEY: &str = "ServiceEncryptionPubK";
const KID_SERVICE_SIGNING_PUB_KEY: &str = "ServiceSigningPubK";
const DEFAULT_TIMEOUT: u64 = 60;

impl ZkPassClient {
    pub fn new(
        zkpass_service_url: &str,
        zkpass_api_key: Option<ZkPassApiKey>,
        zkvm: &str,
    ) -> ZkPassClient {
        ZkPassClient {
            zkpass_service_url: String::from(zkpass_service_url),
            zkpass_api_key,
            zkvm: String::from(zkvm),
        }
    }

    pub fn get_api_token(&self) -> Result<String, ZkPassError> {
        let zkpass_api_key = match self.zkpass_api_key.clone() {
            Some(zkpass_api_key) => zkpass_api_key,
            None => {
                return Err(ZkPassError::MissingApiKey);
            }
        };
        Ok(zkpass_api_key.get_api_token())
    }

    pub async fn fetch_public_keys(&self, kid: &str) -> Result<Jwk, ZkPassError> {
        let client = reqwest::Client::new();
        info!(
            "Fetching public keys from {}",
            format!("{}/{}", self.zkpass_service_url, JWKS_PATH)
        );
        let response = client
            .get(format!("{}/{}", self.zkpass_service_url, JWKS_PATH))
            .send()
            .await
            .map_err(|err| ZkPassError::CustomError(err.to_string()))?;

        let keys_json = response
            .text()
            .await
            .map_err(|err| ZkPassError::CustomError(err.to_string()))?;

        let keys: Vec<Jwk> = serde_json::from_str(&keys_json)
            .map_err(|_| ZkPassError::MissingElementError("Jwk".to_string()))?;

        let pub_key = keys.iter().find(|key| key.kid == kid);

        match pub_key {
            Some(key) => Ok(key.clone()),
            None => Err(ZkPassError::CustomError(format!(
                "No public key with kid {} found",
                kid
            ))),
        }
    }
}

impl ZkPassApiKey {
    pub fn get_api_token(&self) -> String {
        let formatted_api_key = format!("{}:{}", self.api_key, self.secret_api_key);
        general_purpose::STANDARD.encode(formatted_api_key)
    }
}

impl ZkPassUtility for ZkPassClient {
    fn sign_data_to_jws_token(
        &self,
        signing_key: &str,
        data: Value,
        verifying_key_jwks: Option<KeysetEndpoint>,
    ) -> Result<String, ZkPassError> {
        sign_data_to_jws_token(signing_key, data, verifying_key_jwks)
    }

    fn verify_jws_token(&self, key: &str, jws_token: &str) -> Result<(Value, String), ZkPassError> {
        verify_jws_token(key, jws_token)
    }

    fn encrypt_data_to_jwe_token(&self, key: &str, data: Value) -> Result<String, ZkPassError> {
        encrypt_data_to_jwe_token(key, data)
    }

    fn decrypt_jwe_token(
        &self,
        key: &str,
        jwe_token: &str,
    ) -> Result<(String, String), ZkPassError> {
        decrypt_jwe_token(key, jwe_token)
    }
}

#[async_trait]
impl ZkPassProofGenerator for ZkPassClient {
    #[tracing::instrument(skip(user_data_tokens, dvr_token))]
    async fn generate_zkpass_proof(
        &self,
        user_data_tokens: &HashMap<String, String>,
        dvr_token: &str,
    ) -> Result<String, ZkPassError> {
        info!(">> generate_zkpass_proof");

        let encryption_pub: String =
            match self.fetch_public_keys(KID_SERVICE_ENCRYPTION_PUB_KEY).await {
                Ok(pub_key) => {
                    format!(
                        r"-----BEGIN PUBLIC KEY-----
                        {}
                        {}
                        -----END PUBLIC KEY-----",
                        pub_key.x.to_string(),
                        pub_key.y.to_string()
                    )
                }
                Err(err) => {
                    return Err(err);
                }
            };

        // Transform multiple user data token parameters into one long string to be encrypted
        let user_data_jwe_payload = encode_user_data_tokens(user_data_tokens);
        let user_data_enc = self.encrypt_data_to_jwe_token(
            encryption_pub.as_str(),
            Value::String(user_data_jwe_payload),
        )?;
        let dvr_enc = self.encrypt_data_to_jwe_token(
            encryption_pub.as_str(),
            Value::String(String::from(dvr_token)),
        )?;

        let request_body = json!({
            "user_data_token": &user_data_enc,
            "dvr_token": &dvr_enc
        });

        let timeout = Duration::from_secs(DEFAULT_TIMEOUT);
        let api_key_token = format!("Basic {}", self.get_api_token()?);
        let api_request = reqwest::Client::new()
            .post(format!(
                "{}/{}",
                &self.zkpass_service_url, GENERATE_PROOF_PATH
            ))
            .timeout(timeout)
            .header("Authorization", api_key_token);
        let api_request = inject_client_version_header(api_request);
        let api_response = match api_request.json(&request_body).send().await {
            Ok(response) => response,
            Err(e) => {
                return Err(ZkPassError::CustomError(e.to_string()));
            }
        };

        info!("<< generate_zkpass_proof");
        let is_response_success = api_response.status().is_success();
        let response_body = match api_response.text().await {
            Ok(body) => body,
            Err(e) => {
                return Err(ZkPassError::CustomError(e.to_string()));
            }
        };

        if is_response_success {
            let response_body: Value = serde_json::from_str(&response_body).unwrap();
            // extract the proof under the root "proof" element
            let proof = response_body["proof"].as_str().unwrap().to_string();
            Ok(proof)
        } else {
            Err(ZkPassError::CustomError(format!(
                "Request failed: {}",
                response_body.to_string()
            )))
        }
    }
}

#[async_trait]
impl ZkPassProofVerifier for ZkPassClient {
    #[tracing::instrument(skip(zkpass_proof_token))]
    async fn verify_zkpass_proof_internal(
        &self,
        zkpass_proof_token: &str,
    ) -> Result<(String, ZkPassProof), ZkPassError> {
        info!(">> verify_zkpass_proof_internal");

        let zkpass_dsa_pubkey_x: String;
        let zkpass_dsa_pubkey_y: String;

        match self.fetch_public_keys(KID_SERVICE_SIGNING_PUB_KEY).await {
            Ok(pub_key) => {
                zkpass_dsa_pubkey_x = pub_key.x.to_string();
                zkpass_dsa_pubkey_y = pub_key.y.to_string();
            }
            Err(err) => {
                return Err(err);
            }
        }

        let zkpass_proof_verifying_key = PublicKey {
            x: String::from(zkpass_dsa_pubkey_x),
            y: String::from(zkpass_dsa_pubkey_y),
        };

        let (zkpass_proof, _header) = verify_jws_token(
            zkpass_proof_verifying_key.to_pem().as_str(),
            zkpass_proof_token,
        )?;
        let zkpass_proof: ZkPassProof = serde_json::from_value(zkpass_proof).unwrap();
        //
        //  zkp verification
        //
        let output = crate::import::verify_zkproof(&self.zkvm, &zkpass_proof.zkproof)?;

        info!("<< verify_zkpass_proof_internal");
        Ok((output, zkpass_proof))
    }

    fn get_query_engine_version_info(&self) -> Result<(String, String), ZkPassError> {
        let engine_version = crate::import::get_query_engine_version(&self.zkvm)?;
        let method_version = crate::import::get_query_method_version(&self.zkvm)?;

        Ok((engine_version, method_version))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use httpmock::{
        Method::{GET, POST},
        MockServer,
    };
    use maplit::hashmap;
    use serde_json::json;

    const RECIPIENT_PRIVKEY: &str = r"-----BEGIN PRIVATE KEY-----
        MIGEAgEAMBAGByqGSM49AgEGBSuBBAAKBG0wawIBAQQgmCciFlxKpprQRqlLFnnh
        9eiKAditGlfOssFKjLZ0tF+hRANCAARTiTnflkU7RIJdSBNe6/KAGmOFwHRPZVYw
        le25LC6VqsKfh0vKFLnI+zz2LHbluvJGhbBvqHQwSPHWxmWivTEn
        -----END PRIVATE KEY-----";

    const RECIPIENT_PUBKEY: &str = r"-----BEGIN PUBLIC KEY-----
        MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEU4k535ZFO0SCXUgTXuvygBpjhcB0T2VW
        MJXtuSwularCn4dLyhS5yPs89ix25bryRoWwb6h0MEjx1sZlor0xJw==
        -----END PUBLIC KEY-----";

    const SENDER_PRIVKEY: &str = r"-----BEGIN PRIVATE KEY-----
        MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLxxbcd7aVcNEdE/C
        EGPwLzM6lkLuDYzhd3FqALuuHCahRANCAASnpYmXAC2V39TiEOaa64x1kJW0x5Qh
        PfGQN1TAs6+xVUD6KJLB9pfgeoqVE8MYb4XpYaOfHKz1Pka017ee97A4
        -----END PRIVATE KEY-----";

    const SENDER_PUBKEY: &str = r"-----BEGIN PUBLIC KEY-----
        MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU
        IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==
        -----END PUBLIC KEY-----";

    #[test]
    fn test_tokenize_and_verify_data() {
        let data = json!(
            {"name":"John", "age":30}
        );
        println!("data={:#?}", data);

        let zkpass_client = ZkPassClient::new("https://hostname.com", None, "r0");
        let kid = String::from("mykey");
        let jku = String::from("https://hostname.com/jwks");
        let ep = KeysetEndpoint { kid, jku };

        // sign and encrypt
        let jws_token = zkpass_client
            .sign_data_to_jws_token(SENDER_PRIVKEY, data.clone(), Some(ep))
            .unwrap();
        let jwe_token = zkpass_client
            .encrypt_data_to_jwe_token(RECIPIENT_PUBKEY, json!(jws_token))
            .unwrap();

        // decrypt and verify
        let (decrypted_jwe_payload, _) = zkpass_client
            .decrypt_jwe_token(RECIPIENT_PRIVKEY, &jwe_token)
            .unwrap();
        let reconstructed_jws_token = &decrypted_jwe_payload[1..decrypted_jwe_payload.len() - 1];
        let (verified_data, _) = zkpass_client
            .verify_jws_token(SENDER_PUBKEY, &reconstructed_jws_token)
            .unwrap();
        println!("verified_data={:#?}", verified_data);

        assert_eq!(data, verified_data);
    }

    #[tokio::test]
    async fn test_generate_proof() {
        // endpoint mocking
        let server = MockServer::start();
        server.mock(|when, then| {
            when.method(POST).path(format!("/{}", GENERATE_PROOF_PATH));
            then.status(200).body("{\"proof\":\"kjsdafkjasdfkdlaf\"}");
        });
        server.mock(|when, then| {
            when.method(GET).path("/.well-known/jwks.json");
            then.status(200).body(
                /*
                PublicKey {
                    x: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU",
                    y: "IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==",
                }
                 */
                "[{\"kty\": \"EC\",\"crv\": \"P-256\",\"x\": \"MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU\",\"y\": \"IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==\",\"kid\": \"ServiceEncryptionPubK\",\"jwt\": \"\"}]"
            );
        });

        let dvr_token = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=";
        let user_data_tokens = hashmap! {
            String::from("") => String::from("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_="),
        };

        let zkpass_api_key = ZkPassApiKey {
            api_key: String::from("my-api-key"),
            secret_api_key: String::from("my-secret-api-key"),
        };
        let zkpass_service_url = server.url("");
        let zkpass_client = ZkPassClient::new(&zkpass_service_url, Some(zkpass_api_key), "r0");
        let result = zkpass_client
            .generate_zkpass_proof(&user_data_tokens, dvr_token)
            .await
            .unwrap();
        println!("result: {:?}", result);
    }
}
