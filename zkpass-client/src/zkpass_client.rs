/*
 * zkpass_client.rs
 * File contains the implementation of zkpass client
 *
 * Authors:
 *   Antony Halim (antony.halim@gdplabs.id)
 *   GDPWinnerPranata (winner.pranata@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   WilliamhGDP (william.h.hendrawan@gdplabs.id)
 *   JaniceLaksana (janice.laksana@gdplabs.id)
 * Created at: September 21st 2023
 * -----
 * Last Modified: May 6th 2024
 * Modified By: William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * -----
 * Reviewers:
 *   GDPWinnerPranata (winner.pranata@gdplabs.id)
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   WilliamhGDP (william.h.hendrawan@gdplabs.id)
 *   Khandar William (khandar.william@gdplabs.id)
 *   LawrencePatrickSianto (lawrence.p.sianto@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */

use std::time::Duration;

use tracing::info;
use async_trait::async_trait;
use serde_json::{ json, Value };
use zkpass_core::interface::{
    sign_data_to_jws_token,
    verify_jws_token,
    encrypt_data_to_jwe_token,
    decrypt_jwe_token,
};
use crate::core::{ * };
use crate::helpers::inject_client_version_header;
use crate::interface::{ * };
use base64::{ engine::general_purpose, Engine };

const JWKS_PATH: &str = ".well-known/jwks.json";
const GENERATE_PROOF_PATH: &str = "v1/proof";

const KID_SERVICE_ENCRYPTION_PUB_KEY: &str = "ServiceEncryptionPubK";
const KID_SERVICE_SIGNING_PUB_KEY: &str = "ServiceSigningPubK";
const DEFAULT_TIMEOUT: u64 = 60;

impl ZkPassClient {
    pub fn new(
        zkpass_service_url: &str,
        zkpass_api_key: Option<ZkPassApiKey>,
        zkvm: &str
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
        info!("Fetching public keys from {}", format!("{}/{}", self.zkpass_service_url, JWKS_PATH));
        let response = client
            .get(format!("{}/{}", self.zkpass_service_url, JWKS_PATH))
            .send().await
            .map_err(|err| ZkPassError::CustomError(err.to_string()))?;

        let keys_json = response
            .text().await
            .map_err(|err| ZkPassError::CustomError(err.to_string()))?;

        let keys: Vec<Jwk> = serde_json
            ::from_str(&keys_json)
            .map_err(|_| ZkPassError::MissingRootDataElementError)?;

        let pub_key = keys.iter().find(|key| key.kid == kid);

        match pub_key {
            Some(key) => Ok(key.clone()),
            None => Err(ZkPassError::CustomError(format!("No public key with kid {} found", kid))),
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
        verifying_key_jwks: Option<KeysetEndpoint>
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
        jwe_token: &str
    ) -> Result<(String, String), ZkPassError> {
        decrypt_jwe_token(key, jwe_token)
    }
}

#[async_trait]
impl ZkPassProofGenerator for ZkPassClient {
    #[tracing::instrument(skip(_user_data_token, _dvr_token))]
    async fn generate_zkpass_proof(
        &self,
        _user_data_token: &str,
        _dvr_token: &str
    ) -> Result<String, ZkPassError> {
        info!(">> generate_zkpass_proof");

        let encryption_pub: String = match
            self.fetch_public_keys(KID_SERVICE_ENCRYPTION_PUB_KEY).await
        {
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

        let user_data_enc = self.encrypt_data_to_jwe_token(
            encryption_pub.as_str(),
            Value::String(String::from(_user_data_token))
        )?;
        let dvr_enc = self.encrypt_data_to_jwe_token(
            encryption_pub.as_str(),
            Value::String(String::from(_dvr_token))
        )?;

        let data =
            json!({
            "user_data_token": &user_data_enc,
            "dvr_token": &dvr_enc
        });

        let timeout = Duration::from_secs(DEFAULT_TIMEOUT);
        let api_key_token = format!("Basic {}", self.get_api_token()?);
        let request = reqwest::Client
            ::new()
            .post(format!("{}/{}", &self.zkpass_service_url, GENERATE_PROOF_PATH))
            .timeout(timeout)
            .header("Authorization", api_key_token);
        let request = inject_client_version_header(request);
        let response = match request.json(&data).send().await {
            Ok(response) => response,
            Err(e) => {
                return Err(ZkPassError::CustomError(e.to_string()));
            }
        };

        info!("<< generate_zkpass_proof");
        let is_response_success = response.status().is_success();
        let response_body = match response.text().await {
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
            Err(ZkPassError::CustomError(format!("Request failed: {}", response_body.to_string())))
        }
    }
}

#[async_trait]
impl ZkPassProofVerifier for ZkPassClient {
    #[tracing::instrument(skip(zkpass_proof_token))]
    async fn verify_zkpass_proof_internal(
        &self,
        zkpass_proof_token: &str
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
            zkpass_proof_token
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
    use httpmock::{ Method::{ GET, POST }, MockServer };
    use serde_json::json;

    const RECIPIENT_PUBKEY: &str =
        r"-----BEGIN PUBLIC KEY-----
    MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEU4k535ZFO0SCXUgTXuvygBpjhcB0T2VW
    MJXtuSwularCn4dLyhS5yPs89ix25bryRoWwb6h0MEjx1sZlor0xJw==
    -----END PUBLIC KEY-----";

    const SENDER_PRIVKEY: &str =
        r"-----BEGIN PRIVATE KEY-----
    MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLxxbcd7aVcNEdE/C
    EGPwLzM6lkLuDYzhd3FqALuuHCahRANCAASnpYmXAC2V39TiEOaa64x1kJW0x5Qh
    PfGQN1TAs6+xVUD6KJLB9pfgeoqVE8MYb4XpYaOfHKz1Pka017ee97A4
    -----END PRIVATE KEY-----";

    #[test]
    fn test_tokenize_data() {
        let data = json!(
            {"name":"John", "age":30}
        );
        info!("data={:#?}", data);
        let zkpass_client = ZkPassClient::new("https://hostname.com", None, "r0");

        let kid = String::from("mykey");
        let jku = String::from("https://hostname.com/jwks");
        let ep = KeysetEndpoint { kid, jku };
        let jws_token = zkpass_client
            .sign_data_to_jws_token(SENDER_PRIVKEY, data, Some(ep))
            .unwrap();

        zkpass_client.encrypt_data_to_jwe_token(RECIPIENT_PUBKEY, json!(jws_token)).unwrap();

        //let ver_token = zkpass_client.verify_data_nested_token(SENDER_PUBKEY, RECIPIENT_PRIVKEY, jwe_token.as_str()).unwrap();
        //info!("ver_token.payload={:#?}", ver_token.payload);
        //assert!(data2 == ver_token.payload);
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
                "[{\"kty\": \"EC\",\"crv\": \"P-256\",\"x\": \"MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU\",\"y\": \"IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==\",\"kid\": \"ServiceEncryptionPubK\",\"jwt\": \"\"}]"
            );
        });

        let user_data_token = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=";
        let dvr_token = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=";

        let zkpass_api_key = ZkPassApiKey {
            api_key: String::from("my-api-key"),
            secret_api_key: String::from("my-secret-api-key"),
        };
        let zkpass_service_url = server.url("");
        let zkpass_client = ZkPassClient::new(&zkpass_service_url, Some(zkpass_api_key), "r0");
        let result = zkpass_client.generate_zkpass_proof(user_data_token, dvr_token).await.unwrap();
        info!("result: {:?}", result);
    }

    /*
    struct DummyResolver;
    #[async_trait]
    impl KeysetEndpointResolver for DummyResolver {
        async fn get_key(&self, jku: &str, kid: &str) -> PublicKey {
            let future = async {
                PublicKey {
                    x: String::from(
                        "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU",
                    ),
                    y: String::from("IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA=="),
                }
            };

            future.await
        }
    }
    */
}
