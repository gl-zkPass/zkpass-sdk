/*
 * dvr_helpers.rs
 * Helpers for operations related to DVR token
 *
 * References:
 *   https://docs.ssi.id/zkpass/v/zkpass-developers-guide/introduction/key-concepts/dvr
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
use jsonwebtoken::{ decode, DecodingKey, Header, Validation };
use serde::{ Deserialize, Serialize };
use serde_json::{ json, Value };
use std::collections::HashMap;
use crate::interface::{
    DataVerificationRequest,
    KeysetEndpoint,
    PublicKey,
    PublicKeyOption,
    UserDataRequest,
    VerifiedNestedTokenDvr,
    ZkPassError,
};
use crate::jwt_helpers::{ decrypt_jwe_token, verify_jws_token };

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
struct WrappedDataVerificationRequest {
    pub data: DataVerificationRequest,
}

// Retrieve DVR public key information from DVR object
// First try to get keyset endpoint from header, then try to get public key from payload
pub fn get_dvr_public_key_option(
    dvr: &DataVerificationRequest,
    header: &Header
) -> Result<PublicKeyOption, ZkPassError> {
    if let Ok(result) = get_keyset_endpoint_params(header) {
        return Ok(PublicKeyOption::KeysetEndpoint(result));
    } else if let Some(dvr_key) = &dvr.dvr_verifying_key {
        match dvr_key {
            PublicKeyOption::KeysetEndpoint(keyset) => {
                return Ok(PublicKeyOption::KeysetEndpoint(keyset.clone()));
            }
            PublicKeyOption::PublicKey(publick_key) => {
                return Ok(PublicKeyOption::PublicKey(publick_key.clone()));
            }
        }
    } else {
        return Err(ZkPassError::MissingPublicKey);
    }
}

// Return KeysetEndpoint struct from JWT header, if it exists
fn get_keyset_endpoint_params(header: &Header) -> Result<KeysetEndpoint, ZkPassError> {
    let header_val: Value = json!(header);

    let header_jku = (match header_val.get("jku") {
        Some(result) => Ok(result),
        None => Err(ZkPassError::MissingKeysetEndpoint),
    })?;
    let header_kid = (match header_val.get("kid") {
        Some(result) => Ok(result),
        None => Err(ZkPassError::MissingKeysetEndpoint),
    })?;
    let jku: String = serde_json
        ::from_str(&header_jku.to_string())
        .map_err(|_| ZkPassError::MissingKeysetEndpoint)?;
    let kid: String = serde_json
        ::from_str(&header_kid.to_string())
        .map_err(|_| ZkPassError::MissingKeysetEndpoint)?;

    let ep = KeysetEndpoint { jku, kid };
    Ok(ep)
}

// Try to decode JWT string into DataVerificationRequest struct and JWT header
pub fn decode_dvr_token(dvr_jwt: &str) -> Result<(DataVerificationRequest, Header), ZkPassError> {
    let decoding_key = DecodingKey::from_secret(&[]);
    let mut validation = Validation::default();
    validation.insecure_disable_signature_validation();
    validation.set_required_spec_claims(&["data"]);

    match decode::<WrappedDataVerificationRequest>(dvr_jwt, &decoding_key, &validation) {
        Ok(dvr_wrapped) => Ok((dvr_wrapped.claims.data, dvr_wrapped.header)),
        Err(err) => Err(ZkPassError::CustomError(format!("MissingRootDataElementError: {err}"))),
    }
}

// This function will decrypt the outer JWE, then verify the inner JWS, and return the payload
pub fn verify_dvr_nested_token(
    verify_dvr_publickey: PublicKey,
    decrypting_key: &str,
    // `jwe_token` is actually JWE(JWS(dvr payload)), a payload wrapped in JWS wrapped in JWE, so a "nested" token
    jwe_token: &str
) -> Result<VerifiedNestedTokenDvr, ZkPassError> {
    // step 1: decrypt the outer token to get the inner token
    let (jwe_payload, outer_header) = decrypt_jwe_token(decrypting_key, jwe_token)?;

    // remove the surrounding quotes because jws_token was a string literal
    // normally we'll use serde_json::from_str(), but this is faster as long as the payload doesn't contain escaped character
    let jws_token = &jwe_payload[1..jwe_payload.len() - 1];

    // step 2: the verifying_key is already given
    let dvr_verifying_key = verify_dvr_publickey;

    // step 3: verify the sig of the inner token, and pull the "dvr" payload
    let (dvr_payload, inner_header) = verify_jws_token(&dvr_verifying_key.to_pem(), jws_token)?;

    // step 4: extract the payload from the inner token
    let dvr: DataVerificationRequest = serde_json
        ::from_value(dvr_payload)
        .map_err(|e|
            ZkPassError::CustomError(
                format!("Error parsing payload to DataVerificationRequest: {}", e.to_string())
            )
        )?;

    // step 5: there are some rules for DataVerificationRequest
    validate_user_data_requests(&dvr.user_data_requests)?;

    Ok(VerifiedNestedTokenDvr {
        inner_header,
        outer_header,
        dvr,
        dvr_verifying_key,
    })
}

// Valid user data requests:
// - HashMap itself must not be empty.
// - HashMap key is allowed to be empty if there's only one user data request,
//   else all keys must not be empty.
// - All keys can only contains alphanumeric characters and underscore.
fn validate_user_data_requests(
    user_data_requests: &HashMap<String, UserDataRequest>
) -> Result<bool, ZkPassError> {
    if user_data_requests.is_empty() {
        return Err(
            ZkPassError::QueryEngineError(String::from("User data requests must not be empty"))
        );
    }

    for (key, _) in user_data_requests.iter() {
        if key.is_empty() && user_data_requests.len() > 1 {
            return Err(
                ZkPassError::QueryEngineError(
                    String::from(
                        "User data request tag must not be empty if there are more than one"
                    )
                )
            );
        }

        if !key.chars().all(|c| (c.is_ascii_alphanumeric() || c == '_')) {
            return Err(
                ZkPassError::QueryEngineError(
                    String::from(
                        "User data request tag must only contain alphanumeric characters and underscores"
                    )
                )
            );
        }
    }

    Ok(true)
}

// Retrieve user data public key information from DVR object
pub fn get_user_data_public_key_options(
    dvr: &DataVerificationRequest
) -> HashMap<String, PublicKeyOption> {
    dvr.user_data_requests
        .iter()
        .map(|(key, value)| (key.clone(), value.user_data_verifying_key.clone()))
        .collect()
}

#[cfg(test)]
mod test {
    use crate::interface::{ PublicKey, PublicKeyOption };
    use maplit::hashmap;
    use super::*;

    fn mock_user_data() -> UserDataRequest {
        UserDataRequest {
            user_data_url: Some(String::from("https://example.com")),
            user_data_verifying_key: PublicKeyOption::PublicKey(PublicKey {
                x: String::from("x"),
                y: String::from("y"),
            }),
        }
    }

    #[test]
    fn test_validate_user_data_requests_success() {
        let multi_user_data_requests =
            hashmap! {
                String::from("user_data_1") => mock_user_data(),
                String::from("user_data_2") => mock_user_data(),
            };
        let single_user_data_requests =
            hashmap! {
                String::from("") => mock_user_data(),
            };

        assert_eq!(validate_user_data_requests(&multi_user_data_requests).unwrap(), true);
        assert_eq!(validate_user_data_requests(&single_user_data_requests).unwrap(), true);
    }

    #[test]
    fn test_validate_user_data_requests_empty_user_data_requests() {
        let user_data_requests = HashMap::new();

        assert!(
            matches!(
                validate_user_data_requests(&user_data_requests).unwrap_err(),
                ZkPassError::QueryEngineError(_)
            )
        );
    }

    #[test]
    fn test_validate_user_data_requests_empty_key() {
        let user_data_requests =
            hashmap! {
                String::from("") => mock_user_data(),
                String::from("user_data_2") => mock_user_data(),
            };

        assert!(
            matches!(
                validate_user_data_requests(&user_data_requests).unwrap_err(),
                ZkPassError::QueryEngineError(_)
            )
        );
    }

    #[test]
    fn test_validate_user_data_requests_invalid_key() {
        let user_data_requests =
            hashmap! {
                String::from("user_data_1") => mock_user_data(),
                String::from("user_data_2$") => mock_user_data(),
            };

        assert!(
            matches!(
                validate_user_data_requests(&user_data_requests).unwrap_err(),
                ZkPassError::QueryEngineError(_)
            )
        );
    }
}
