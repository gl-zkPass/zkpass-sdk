/*
 * user_data_helpers.rs
 * Helpers for operations related to User Data token
 *
 * References:
 *   https://docs.ssi.id/zkpass/v/zkpass-developers-guide/introduction/key-concepts/user-data
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
use crate::interface::{VerifiedNestedTokenUserData, ZkPassError};
use crate::jwt_helpers::{decrypt_jwe_token, verify_jws_token};
use std::collections::HashMap;

// The function pair (encode_user_data_tokens & decode_user_data_tokens) must be put side-by-side for clarity

// On client-side, we need to combine multiple user data tokens into single string
pub fn encode_user_data_tokens(user_data_tokens: &HashMap<String, String>) -> String {
    serde_json::to_string(user_data_tokens).unwrap_or_default()
}

// On server-side, we need to reverse the single string into multiple user data tokens
pub fn decode_user_data_tokens(
    encoded: &str,
) -> Result<HashMap<String, String>, serde_json::Error> {
    serde_json::from_str(encoded)
}

// This function will decrypt the outer JWE, extract multiple user data JWS, then verify each inner JWS, and return the payloads
pub fn verify_user_data_nested_token(
    // verifying keys were retrieved from the DVR
    verifying_keys: &HashMap<String, String>,
    decrypting_key: &str,
    // `jwe_token` is actually JWE(JWS(user data payload)), a payload wrapped in JWS wrapped in JWE, so a "nested" token.
    jwe_token: &str,
) -> Result<VerifiedNestedTokenUserData, ZkPassError> {
    // step 1: decrypt the outer token to get the inner tokens
    let (jwe_payload, outer_header) = decrypt_jwe_token(decrypting_key, jwe_token)?;

    // step 2: remove the surrounding quotes because jwe_payload was a string literal
    let unwrapped_jwe_payload: String = serde_json::from_str(&jwe_payload).unwrap_or_default();

    // step 3: decode one payload into multiple user data tokens
    let jws_tokens = decode_user_data_tokens(&unwrapped_jwe_payload)
        .map_err(|e| ZkPassError::CustomError(e.to_string()))?;

    // step 4: iterate over the inner tokens, verify their signature, and pull the data payloads
    let mut inner_headers = HashMap::new();
    let mut payloads = HashMap::new();
    for (tag, jws_token) in jws_tokens.iter() {
        let verifying_key = verifying_keys
            .get(tag)
            .ok_or(ZkPassError::MissingPublicKey)?;
        let (user_data_payload, inner_header) = verify_jws_token(verifying_key, jws_token)?;
        inner_headers.insert(tag.clone(), inner_header);
        payloads.insert(tag.clone(), user_data_payload);
    }

    Ok(VerifiedNestedTokenUserData {
        outer_header,  // JWE header
        inner_headers, // JWS headers
        payloads,
    })
}

#[cfg(test)]
mod test {
    use super::*;
    use maplit::hashmap;

    #[test]
    fn test_encode_and_decode_user_data_tokens() {
        let user_data_tokens = hashmap! {
            String::from("user_data_1") => String::from("t\"o\"k\"e\"n_1"),
            String::from("user_data_2") => String::from("t\"o\"k\"e\"n_2"),
        };

        let encoded = encode_user_data_tokens(&user_data_tokens);
        let decoded = decode_user_data_tokens(&encoded).unwrap();

        assert_eq!(decoded, user_data_tokens);
    }

    #[test]
    fn test_decode_user_data_tokens_invalid() {
        let encoded = r#"{"key1":"value1","key2":value2}"#; // Invalid JSON
        let result = decode_user_data_tokens(encoded);
        assert!(result.is_err());
    }
}
