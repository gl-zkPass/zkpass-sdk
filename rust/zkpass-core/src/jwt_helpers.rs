/*
 * jwt_helpers.rs
 * Helpers for JWT, JWS, JWE operations that are not specific to User Data or DVR token
 *
 * References:
 *   - [RFC 7519: JWT](https://datatracker.ietf.org/doc/html/rfc7519)
 *   - [RFC 7516: JWE](https://datatracker.ietf.org/doc/html/rfc7516)
 *   - [RFC 7515: JWS](https://datatracker.ietf.org/doc/html/rfc7515)
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
use crate::interface::{KeysetEndpoint, ZkPassError};
use josekit::{
    jwe::{JweHeader, ECDH_ES},
    jws::{JwsHeader, ES256},
    jwt::{self, JwtPayload},
};
use serde_json::Value;
use std::time::{SystemTime, UNIX_EPOCH};

/// <span style="font-size: 1.2em; color: #996515;"> ***Gets the number of seconds that has elapsed since the Unix Epoch time.*** </span>
///
/// # **Parameters**
///
/// | Return Value                                                   | Description                               |
/// |----------------------------------------------------------------|-------------------------------------------|
/// |<span style="color: green;"> **`u64`** </span> | The elapsed time since the Unix Epoch time (January 1, 1970) expressed in seconds|
pub fn get_current_timestamp() -> u64 {
    let now = SystemTime::now();
    let duration_since_epoch = now.duration_since(UNIX_EPOCH).expect("Time went backwards");
    duration_since_epoch.as_secs()
}

pub fn encrypt_data_to_jwe_token(key: &str, data: Value) -> Result<String, ZkPassError> {
    //
    // the static keypair, owned by the recipient
    // the sender uses ephemeral key internally so it does not need to maintain any static keypair.
    //

    let mut header = JweHeader::new();
    header.set_token_type("JWT");
    header.set_content_encryption("A256GCM");

    let mut payload = JwtPayload::new();
    let user_data: Option<Value> = Some(data);
    payload
        .set_claim("data", user_data)
        .map_err(|e| ZkPassError::JoseError(e))?;

    // Encrypting JWT
    let encrypter = ECDH_ES
        .encrypter_from_pem(&key)
        .map_err(|e| ZkPassError::JoseError(e))?;
    let jwe_token = jwt::encode_with_encrypter(&payload, &header, &encrypter)
        .map_err(|e| ZkPassError::JoseError(e))?;

    Ok(jwe_token)
}

pub fn decrypt_jwe_token(key: &str, jwe_token: &str) -> Result<(String, String), ZkPassError> {
    let decrypter = ECDH_ES
        .decrypter_from_pem(&key)
        .map_err(|e| ZkPassError::JoseError(e))?;
    let (payload, header) = jwt::decode_with_decrypter(&jwe_token, &decrypter)
        .map_err(|e| ZkPassError::JoseError(e))?;

    if let Some(data) = payload.claim("data") {
        Ok((data.to_string(), header.to_string()))
    } else {
        Err(ZkPassError::MissingRootDataElementError)
    }
}

pub fn sign_data_to_jws_token(
    signing_key: &str,
    data: Value,
    verifying_key_jwks: Option<KeysetEndpoint>,
) -> Result<String, ZkPassError> {
    //
    // set the header
    //
    let mut header = JwsHeader::new();
    header.set_token_type("JWT");
    match verifying_key_jwks {
        Some(jwks) => {
            header.set_jwk_set_url(jwks.jku);
            header.set_key_id(jwks.kid);
        }
        None => {}
    }

    let mut payload = JwtPayload::new();
    let user_data: Option<Value> = Some(data);
    payload
        .set_claim("data", user_data)
        .map_err(|e| ZkPassError::JoseError(e))?;

    // Signing JWT
    let signer = ES256
        .signer_from_pem(&signing_key)
        .map_err(|e| ZkPassError::JoseError(e))?;
    let jws_token = jwt::encode_with_signer(&payload, &header, &signer)
        .map_err(|e| ZkPassError::JoseError(e))?;

    Ok(jws_token)
}

pub fn verify_jws_token(key: &str, jws_token: &str) -> Result<(Value, String), ZkPassError> {
    let verifier = ES256
        .verifier_from_pem(&key)
        .map_err(|e| ZkPassError::JoseError(e))?;
    let (payload, header) =
        jwt::decode_with_verifier(&jws_token, &verifier).map_err(|e| ZkPassError::JoseError(e))?;

    if let Some(data) = payload.claim("data") {
        Ok((data.clone(), header.to_string()))
    } else {
        Err(ZkPassError::MissingRootDataElementError)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::interface::PublicKey;
    use serde_json::json;

    pub fn get_zkpass_key() -> (String, String) {
        let decrypting_key = r"-----BEGIN PRIVATE KEY-----
            MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLxxbcd7aVcNEdE/C
            EGPwLzM6lkLuDYzhd3FqALuuHCahRANCAASnpYmXAC2V39TiEOaa64x1kJW0x5Qh
            PfGQN1TAs6+xVUD6KJLB9pfgeoqVE8MYb4XpYaOfHKz1Pka017ee97A4
            -----END PRIVATE KEY-----"
            .to_string();
        (decrypting_key.clone(), decrypting_key)
    }

    pub fn get_public_key() -> (PublicKey, PublicKey) {
        let encryption_pub_key = PublicKey {
            x: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU".to_string(),
            y: "IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==".to_string(),
        };
        let signing_pub_key = PublicKey {
            x: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7f0QoVUsccB9yMwHAR7oVk/L+ZkX".to_string(),
            y: "8ZqC1Z0XTaj3BMcMnqh+VzdHZX3yGKa3+uhNAhKWWyfB/r+3E8rPSHtXXQ==".to_string(),
        };
        return (encryption_pub_key, signing_pub_key);
    }

    #[test]
    fn test_encrypt_decrypt_data_to_jwe_token() {
        let (key, _) = get_public_key();
        let (priv_key, _) = get_zkpass_key();
        let key = key.to_pem();
        let data = json!({"key": "value"});

        let jwe_token = encrypt_data_to_jwe_token(&key, data.clone()).unwrap();
        assert!(!jwe_token.is_empty());

        let (decrypted_data, _) = decrypt_jwe_token(&priv_key, &jwe_token).unwrap();
        assert_eq!(decrypted_data, data.to_string());

        // invalid key structure
        let key = key.replace("BEGIN", "INVALID");
        let result = encrypt_data_to_jwe_token(&key, data.clone());
        assert!(result.is_err());
    }

    #[test]
    fn test_sign_verify_data_to_jws_token() {
        let (key, _) = get_public_key();
        let (priv_key, _) = get_zkpass_key();
        let key = key.to_pem();
        let data = json!({"key": "value"});
        let verifying_key_jwks = Some(KeysetEndpoint {
            jku: "https://example.com/jwks".to_string(),
            kid: "key-id".to_string(),
        });
        let result = sign_data_to_jws_token(&priv_key, data.clone(), verifying_key_jwks);
        assert!(result.is_ok());

        let result = sign_data_to_jws_token(&priv_key, data.clone(), None);
        assert!(result.is_ok());

        let jws_token = result.unwrap();
        let result = verify_jws_token(&key, &jws_token);
        assert!(result.is_ok());

        let key = key.replace("BEGIN", "INVALID");
        let result = sign_data_to_jws_token(&key, data, None);
        assert!(result.is_err());
    }
}
