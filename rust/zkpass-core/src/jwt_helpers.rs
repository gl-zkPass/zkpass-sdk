/*
 * jwt_helpers.rs
 * Helpers for JWT, JWS, JWE operations that are not specific to User Data or DVR token
 *
 * Authors:
 *   Khandar William (khandar.william@gdplabs.id)
 * Created at: June 26th 2024
 * -----
 * Last Modified: July 1st 2024
 * Modified By: Khandar William (khandar.william@gdplabs.id)
 * -----
 * Reviewers:
 *
 * ---
 * References:
 *   - [RFC 7519: JWT](https://datatracker.ietf.org/doc/html/rfc7519)
 *   - [RFC 7516: JWE](https://datatracker.ietf.org/doc/html/rfc7516)
 *   - [RFC 7515: JWS](https://datatracker.ietf.org/doc/html/rfc7515)
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
use josekit::{ jwe::{ JweHeader, ECDH_ES }, jws::{ JwsHeader, ES256 }, jwt::{ self, JwtPayload } };
use serde_json::Value;
use std::time::{ SystemTime, UNIX_EPOCH };
use crate::interface::{ KeysetEndpoint, ZkPassError };

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
    payload.set_claim("data", user_data).map_err(|e| ZkPassError::JoseError(e))?;

    // Encrypting JWT
    let encrypter = ECDH_ES.encrypter_from_pem(&key).map_err(|e| ZkPassError::JoseError(e))?;
    let jwe_token = jwt
        ::encode_with_encrypter(&payload, &header, &encrypter)
        .map_err(|e| ZkPassError::JoseError(e))?;

    Ok(jwe_token)
}

pub fn decrypt_jwe_token(key: &str, jwe_token: &str) -> Result<(String, String), ZkPassError> {
    let decrypter = ECDH_ES.decrypter_from_pem(&key).map_err(|e| ZkPassError::JoseError(e))?;
    let (payload, header) = jwt
        ::decode_with_decrypter(&jwe_token, &decrypter)
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
    verifying_key_jwks: Option<KeysetEndpoint>
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
    payload.set_claim("data", user_data).map_err(|e| ZkPassError::JoseError(e))?;

    // Signing JWT
    let signer = ES256.signer_from_pem(&signing_key).map_err(|e| ZkPassError::JoseError(e))?;
    let jws_token = jwt
        ::encode_with_signer(&payload, &header, &signer)
        .map_err(|e| ZkPassError::JoseError(e))?;

    Ok(jws_token)
}

pub fn verify_jws_token(key: &str, jws_token: &str) -> Result<(Value, String), ZkPassError> {
    let verifier = ES256.verifier_from_pem(&key).map_err(|e| ZkPassError::JoseError(e))?;
    let (payload, header) = jwt
        ::decode_with_verifier(&jws_token, &verifier)
        .map_err(|e| ZkPassError::JoseError(e))?;

    if let Some(data) = payload.claim("data") {
        Ok((data.clone(), header.to_string()))
    } else {
        Err(ZkPassError::MissingRootDataElementError)
    }
}
