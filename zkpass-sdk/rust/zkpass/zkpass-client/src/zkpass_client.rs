use async_trait::async_trait;
use serde_json::{json, Value};
use zkpass_core::interface::{sign_data_to_jws_token, verify_jws_token, encrypt_data_to_jwe_token, decrypt_jwe_token};
use crate::core::{*};
use crate::interface::{*};
//use zkpass_core::interface::verify_jws_token;

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
    async fn generate_zkpass_proof(
        &self,
        _zkpass_service_url: &str,
        _user_data_token: &str,
        _dvr_token: &str,
    ) -> Result<String, ZkPassError> {
        const ENCRYPTION_PUB: &str = r"-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU
IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==
-----END PUBLIC KEY-----";

        let user_data_enc = self
            .encrypt_data_to_jwe_token(
                ENCRYPTION_PUB,
                Value::String(String::from(_user_data_token)),
            )?;
        let dvr_enc = self
            .encrypt_data_to_jwe_token(ENCRYPTION_PUB, Value::String(String::from(_dvr_token)))?;

        let data = json!({
            "user_data_token": &user_data_enc,
            "dvr_token": &dvr_enc
        });

        let client = reqwest::Client::new();
        let response = match client.post(_zkpass_service_url).json(&data).send().await {
            Ok(response) => response,
            Err(e) => return Err(ZkPassError::CustomError(format!("{:?}", e))),
        };

        if response.status().is_success() {
            let mut response_body = match response.text().await {
                Ok(body) => body,
                Err(e) => return Err(ZkPassError::CustomError(format!("{:?}", e))),
            };
            // extract the proof under the root "proof" element
            let proof: Value = serde_json::from_str(&response_body).unwrap();
            response_body = proof["proof"].as_str().unwrap().to_string();

            Ok(response_body)
        } else {
            Err(ZkPassError::CustomError(format!(
                "Request failed with status code: {}",
                response.status(),
            )))
        }
    }
}

impl ZkPassProofVerifier for ZkPassClient {
    fn verify_zkpass_proof_internal(
        &self,
        zkpass_proof_token:                 &str
    ) -> Result<(bool, ZkPassProof), ZkPassError> {
        const ZKPASS_DSA_PUBKEY_X: &str = "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU";
        const ZKPASS_DSA_PUBKEY_Y: &str ="IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==";

        let zkpass_proof_verifying_key = PublicKey {
            x: String::from(ZKPASS_DSA_PUBKEY_X),
            y: String::from(ZKPASS_DSA_PUBKEY_Y)
        };

        let (zkpass_proof, _header) = verify_jws_token(
            zkpass_proof_verifying_key.to_pem().as_str(),
            zkpass_proof_token)?;
        let zkpass_proof: ZkPassProof = serde_json::from_value(zkpass_proof).unwrap();
        //
        //  zkp verification
        //
        let output = crate::import::verify_zkproof(&zkpass_proof.zkproof);

        Ok((output.result, zkpass_proof))
    }

    fn get_query_engine_version_info(&self) -> (String, String) {
        (crate::import::get_query_engine_version(), crate::import::get_query_method_version())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use httpmock::{Method::POST, MockServer};
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
    fn test_tokenize_data() {
        let data = json!(
            {"name":"John", "age":30}
        );
        let data2 = data.clone();
        println!("data={:#?}", data);
        let zkpass_client = ZkPassClient;

        let kid = String::from("mykey");
        let jku = String::from("https://hostname.com/jwks");
        let ep = KeysetEndpoint { kid, jku };
        let jws_token = zkpass_client
            .sign_data_to_jws_token(SENDER_PRIVKEY, data, Some(ep))
            .unwrap();

        let jwe_token = zkpass_client
            .encrypt_data_to_jwe_token(RECIPIENT_PUBKEY, json!(jws_token))
            .unwrap();

        //let ver_token = zkpass_client.verify_data_nested_token(SENDER_PUBKEY, RECIPIENT_PRIVKEY, jwe_token.as_str()).unwrap();
        //println!("ver_token.payload={:#?}", ver_token.payload);
        //assert!(data2 == ver_token.payload);
    }

    #[tokio::test]
    async fn test_generate_proof() {
        // endpoint mocking
        let server = MockServer::start();
        let endpoint = server.mock(|when, then| {
            when.method(POST).path("/generate-proof");
            then.status(200).body("{\"proof\":\"kjsdafkjasdfkdlaf\"}");
        });

        let user_data_token = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=";
        let dvr_token = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=";

        let zkpass_client = ZkPassClient {};
        let result = zkpass_client
            .generate_zkpass_proof(&server.url("/generate-proof"), user_data_token, dvr_token)
            .await.unwrap();
        println!("Result: {:?}", result);
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
