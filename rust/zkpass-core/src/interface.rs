/*
 * interface.rs
 * This file is for all interfaces
 *
 * Authors:
 *   Antony Halim (antony.halim@gdplabs.id)
 *   GDPWinnerPranata (winner.pranata@gdplabs.id)
 *   WilliamhGDP (william.h.hendrawan@gdplabs.id)
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   JaniceLaksana (janice.laksana@gdplabs.id)
 * Created at: September 21st 2024
 * -----
 * Last Modified: January 19th 2024
 * Modified By: Janice Laksana (janice.laksana@gdplabs.id)
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
use crate::{errors::LocalizableError, localization};
use async_trait::async_trait;
use hex;
use josekit::{
    jwe::{JweHeader, ECDH_ES},
    jws::{JwsHeader, ES256},
    jwt::{self, JwtPayload},
    JoseError,
};
use jsonwebtoken::{decode, DecodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::fmt;
use std::time::{SystemTime, UNIX_EPOCH};

///
/// <span style="font-size: 1.1em; color: #996515;"> ***Defines various errors that come from the zkPass Service.*** </span>
///
#[derive(Debug)]
pub enum ZkPassError {
    MismatchedUserDataVerifyingKey,
    MissingRootDataElementError,
    NotImplementedError,
    JoseError,
    MismatchedDvrVerifyingKey,
    MismatchedDvrId,
    MismatchedDvrTitle,
    MismatchedDvrDigest,
    ExpiredZkPassProof,
    MissingKeysetEndpoint,
    InvalidPublicKey,
    MissingPublicKey,
    MissingApiKey,
    HttpRequestError,
    HttpResponseError,
    InvalidResponse,
    CustomError,
    Error(String),
}

impl fmt::Display for ZkPassError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

impl std::error::Error for ZkPassError {}

impl ZkPassError {
    pub fn mismatched_user_data_verifying_key() -> ZkPassError {
        let localized_error =
            localization::get_localized_error_message(&ZkPassError::MismatchedUserDataVerifyingKey);
        ZkPassError::Error(localized_error)
    }

    pub fn missing_root_data_element_error() -> ZkPassError {
        let localized_error =
            localization::get_localized_error_message(&ZkPassError::MissingRootDataElementError);
        ZkPassError::Error(localized_error)
    }

    pub fn not_implemented_error() -> ZkPassError {
        let localized_error =
            localization::get_localized_error_message(&ZkPassError::NotImplementedError);
        ZkPassError::Error(localized_error)
    }

    pub fn jose_error(error: JoseError) -> ZkPassError {
        let localized_error = localization::get_localized_error_with_custom_message(
            &ZkPassError::JoseError,
            &error.to_string(),
        );
        ZkPassError::Error(localized_error)
    }

    pub fn mismatched_dvr_verifying_key() -> ZkPassError {
        let localized_error =
            localization::get_localized_error_message(&ZkPassError::MismatchedDvrVerifyingKey);
        ZkPassError::Error(localized_error)
    }

    pub fn mismatched_dvr_id() -> ZkPassError {
        let localized_error =
            localization::get_localized_error_message(&ZkPassError::MismatchedDvrId);
        ZkPassError::Error(localized_error)
    }

    pub fn mismatched_dvr_title() -> ZkPassError {
        let localized_error =
            localization::get_localized_error_message(&ZkPassError::MismatchedDvrTitle);
        ZkPassError::Error(localized_error)
    }

    pub fn mismatched_dvr_digest() -> ZkPassError {
        let localized_error =
            localization::get_localized_error_message(&ZkPassError::MismatchedDvrDigest);
        ZkPassError::Error(localized_error)
    }

    pub fn expired_zkpass_proof() -> ZkPassError {
        let localized_error =
            localization::get_localized_error_message(&ZkPassError::ExpiredZkPassProof);
        ZkPassError::Error(localized_error)
    }

    pub fn invalid_public_key() -> ZkPassError {
        let localized_error =
            localization::get_localized_error_message(&ZkPassError::InvalidPublicKey);
        ZkPassError::Error(localized_error)
    }

    pub fn missing_public_key() -> ZkPassError {
        let localized_error =
            localization::get_localized_error_message(&ZkPassError::MissingPublicKey);
        ZkPassError::Error(localized_error)
    }

    pub fn missing_api_key() -> ZkPassError {
        let localized_error =
            localization::get_localized_error_message(&ZkPassError::MissingApiKey);
        ZkPassError::Error(localized_error)
    }

    pub fn missing_keyset_endpoint() -> ZkPassError {
        let localized_error =
            localization::get_localized_error_message(&ZkPassError::MissingKeysetEndpoint);
        ZkPassError::Error(localized_error)
    }

    pub fn http_request_error() -> ZkPassError {
        let localized_error =
            localization::get_localized_error_message(&ZkPassError::HttpRequestError);
        ZkPassError::Error(localized_error)
    }

    pub fn http_response_error() -> ZkPassError {
        let localized_error =
            localization::get_localized_error_message(&ZkPassError::HttpResponseError);
        ZkPassError::Error(localized_error)
    }

    pub fn invalid_response() -> ZkPassError {
        let localized_error =
            localization::get_localized_error_message(&ZkPassError::InvalidResponse);
        ZkPassError::Error(localized_error)
    }

    pub fn custom_error(message: String) -> ZkPassError {
        let error_message = message.clone();
        let localized_error = localization::get_localized_error_with_custom_message(
            &ZkPassError::CustomError,
            &error_message,
        );
        ZkPassError::Error(localized_error)
    }
}

impl LocalizableError for ZkPassError {
    fn get_code(&self) -> &'static str {
        match self {
            ZkPassError::MismatchedUserDataVerifyingKey => "E1001-EUserKeyMismatch",
            ZkPassError::MissingRootDataElementError => "E1002-ERootMissing",
            ZkPassError::NotImplementedError => "E1003-ENotImpl",
            ZkPassError::JoseError => "E1004-EJoseError",
            ZkPassError::MismatchedDvrVerifyingKey => "E1005-EDvrKeyMismatch",
            ZkPassError::MismatchedDvrId => "E1006-EDvrIdMismatch",
            ZkPassError::MismatchedDvrTitle => "E1007-EDvrTitleMismatch",
            ZkPassError::MismatchedDvrDigest => "E1008-EDvrDigestMismatch",
            ZkPassError::ExpiredZkPassProof => "E1009-EProofExpired",
            ZkPassError::InvalidPublicKey => "E1010-EInvalidPubKey",
            ZkPassError::MissingPublicKey => "E1011-EMissingPublicKey",
            ZkPassError::MissingApiKey => "E1012-EMissingApiKey",
            ZkPassError::MissingKeysetEndpoint => "E1013-EMissingKeysetEndpoint",
            ZkPassError::HttpRequestError => "E1014-HttpRequestError",
            ZkPassError::HttpResponseError => "E1015-HttpResponseError",
            ZkPassError::InvalidResponse => "E1016-InvalidResponse",
            ZkPassError::CustomError => "E1017-ECustom",
            ZkPassError::Error(_) => "E1018-EError",
        }
    }

    fn get_error_key(&self) -> &str {
        match self {
            ZkPassError::MismatchedUserDataVerifyingKey => "MismatchedUserDataVerifyingKey",
            ZkPassError::MissingRootDataElementError => "MissingRootDataElementError",
            ZkPassError::NotImplementedError => "NotImplementedError",
            ZkPassError::JoseError => "JoseError",
            ZkPassError::MismatchedDvrVerifyingKey => "MismatchedDvrVerifyingKey",
            ZkPassError::MismatchedDvrId => "MismatchedDvrId",
            ZkPassError::MismatchedDvrTitle => "MismatchedDvrTitle",
            ZkPassError::MismatchedDvrDigest => "MismatchedDvrDigest",
            ZkPassError::ExpiredZkPassProof => "ExpiredZkPassProof",
            ZkPassError::CustomError => "CustomError",
            ZkPassError::InvalidPublicKey => "InvalidPublicKey",
            ZkPassError::MissingPublicKey => "MissingPublicKey",
            ZkPassError::MissingApiKey => "MissingApiKey",
            ZkPassError::MissingKeysetEndpoint => "MissingKeysetEndpoint",
            ZkPassError::HttpRequestError => "HttpRequestError",
            ZkPassError::HttpResponseError => "HttpResponseError",
            ZkPassError::InvalidResponse => "InvalidResponse",
            ZkPassError::Error(_) => "Error",
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
/// <span style="font-size: 1.1em; color: #996515;"> ***Represents a public key.*** </span>
pub struct PublicKey {
    /// `x` represents the x parameter of the public key.
    pub x: String,

    /// `y` represents the y parameter of the public key.
    pub y: String,
}

impl PublicKey {
    pub fn to_pem(&self) -> String {
        format!(
            "-----BEGIN PUBLIC KEY-----\n{x}\n{y}\n-----END PUBLIC KEY-----",
            x = self.x.as_str(),
            y = self.y.as_str()
        )
    }
}

///
/// <span style="font-size: 1.1em; color: #996515;"> ***Represents a JWKS (JSON Web Key Set) end point.*** </span>
///
///  The JWKS endpoint serves a set of public keys.
///
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct KeysetEndpoint {
    /// The url of the end point.
    pub jku: String,
    /// The key to locate the public key.
    pub kid: String,
}

///
/// <span style="font-size: 1.1em; color: #996515;"> ***Provides alternative ways to represent a public key.*** </span>
///
/// Either the `PublicKey` or the `KeysetEndpoint` can be used as a public key.
/// This is useful for sites which do not support JWKS and opts to provide the public key using `PublicKey` directly.
///
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum PublicKeyOption {
    /// Using PublicKey as a public key
    PublicKey(PublicKey),
    /// Using KeysetEndpoint as the reference to a public key
    KeysetEndpoint(KeysetEndpoint),
}

///
/// <span style="font-size: 1.1em; color: #996515;"> ***The value returned by the `generate_zkpass_proof` API of the zkPass Service.*** </span>
///
///  This struct contains the ZK Proof, plus other metadata related to:
///  - Information about the DVR whose query was run by the zkPass Service
///  - The public keys used by the zkPass Service for digital signature verification
///  - The timestamp of the proof
///
#[derive(Debug, Serialize, Deserialize)]
pub struct ZkPassProof {
    /// The Cryptographic data blob which contains the ZK Proof
    pub zkproof: String,

    /// The title of the DVR
    pub dvr_title: String,

    /// The unique id of the DVR
    pub dvr_id: String,

    /// The hash digest of the DVR
    pub dvr_digest: String,

    /// The public key actually used by the zkPass Service to verify the signature of the user data
    pub user_data_verifying_key: PublicKey,

    /// The public key actually used by the zkPass Service to verify the signature of the DVR
    pub dvr_verifying_key: PublicKey,

    /// The time stamp of the ZkPassProof as created by the zkPass Service
    pub time_stamp: u64,
}

///
/// <span style="font-size: 1.1em; color: #996515;"> ***Represents a request that contains information needed to verify user data.*** </span>
///
///  This struct is typically created by the Proof Verifier client, and the DVR
///  represents a request to verify certain attributes or properties of a user data.
///
///
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct DataVerificationRequest {
    /// The title of the DVR
    pub dvr_title: String,

    /// The unique id of the DVR
    pub dvr_id: String,

    /// The version of the zkpass query engine used to create the DVR
    pub query_engine_ver: String,

    /// The version of the zkpass query method used to create the DVR
    pub query_method_ver: String,

    /// The zkPass Query script, which is encoded in JSON string format
    pub query: String,

    /// The url to retrieve the user data referenced by the query.
    ///
    /// This field is optional. If this is None is present then the recipient
    /// of the DVR, which typically is the Data Holder, is supposed to know
    /// where to get the user data needed by the query of this DVR.
    pub user_data_url: Option<String>,

    /// The public key information used to verify the signature of the user data.
    ///
    /// This field is set by Proof Verifier to inform the
    /// zkPass Service the public key it needs to use when verifying
    /// the signature of the user data.
    pub user_data_verifying_key: PublicKeyOption,

    /// The public key information used to verify the signature of this dvr.
    ///
    /// This field is optional. If this field is None, then the one who processing
    /// this DVR, which typically is the zkpass-ws, should check the header of this DVR,
    /// whether there is keyset (JKU & KID) or not.
    /// This field is set by the Proof Verifier to inform the zkPass Service which key
    /// to use to verify this DVR.
    pub dvr_verifying_key: Option<PublicKeyOption>,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
struct WrappedDataVerificationRequest {
    pub data: DataVerificationRequest,
}

impl DataVerificationRequest {
    pub fn get_sha256_digest(&self) -> String {
        let mut hasher = Sha256::new();
        hasher.update(serde_json::to_string(self).unwrap());
        hex::encode(hasher.finalize())
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifiedNestedTokenData {
    pub outer_header: String,
    pub inner_header: String,
    pub payload: Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifiedNestedTokenDvr {
    pub outer_header: String,
    pub inner_header: String,
    pub dvr: DataVerificationRequest,
    pub dvr_verifying_key: PublicKey,
}

///
/// <span style="font-size: 1.1em; color: #996515;"> ***Defines a function for retrieving a public key from a JWKS endpoint.*** </span>
///
#[async_trait]
pub trait KeysetEndpointResolver {
    /// # **Description**
    /// <span style="font-size: 1.2em; color: #996515;"> ***Retrieves a public key from JWKT endpoint params.*** </span>
    ///
    /// # **Parameters**
    ///
    /// | Argument                                                       | Description                               |
    /// |----------------------------------------------------------------|-------------------------------------------|
    /// | <span style="color: blue;"> **`jku`** </span>            | The url of the JWKS endpoint service |
    /// | <span style="color: blue;"> **`kid`** </span>               | The key for the public key |
    ///
    /// | Return Value                                                   | Description                               |
    /// |----------------------------------------------------------------|-------------------------------------------|
    /// |<span style="color: green;"> **`PublicKey`** </span> | The PublicKey value is returned |
    async fn get_key(&self, jku: &str, kid: &str) -> PublicKey;
}

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
        .map_err(|e| ZkPassError::jose_error(e))?;

    // Encrypting JWT
    let encrypter = ECDH_ES
        .encrypter_from_pem(&key)
        .map_err(|e| ZkPassError::jose_error(e))?;
    let jwe_token = jwt::encode_with_encrypter(&payload, &header, &encrypter)
        .map_err(|e| ZkPassError::jose_error(e))?;

    Ok(jwe_token)
}

pub fn decrypt_jwe_token(key: &str, jwe_token: &str) -> Result<(String, String), ZkPassError> {
    let decrypter = ECDH_ES
        .decrypter_from_pem(&key)
        .map_err(|e| ZkPassError::jose_error(e))?;
    let (payload, header) = jwt::decode_with_decrypter(&jwe_token, &decrypter)
        .map_err(|e| ZkPassError::jose_error(e))?;

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
        .map_err(|e| ZkPassError::jose_error(e))?;

    // Signing JWT
    let signer = ES256
        .signer_from_pem(&signing_key)
        .map_err(|e| ZkPassError::jose_error(e))?;
    let jws_token = jwt::encode_with_signer(&payload, &header, &signer)
        .map_err(|e| ZkPassError::jose_error(e))?;

    Ok(jws_token)
}

pub fn verify_jws_token(key: &str, jws_token: &str) -> Result<(Value, String), ZkPassError> {
    let verifier = ES256
        .verifier_from_pem(&key)
        .map_err(|e| ZkPassError::jose_error(e))?;
    let (payload, header) =
        jwt::decode_with_verifier(&jws_token, &verifier).map_err(|e| ZkPassError::jose_error(e))?;

    if let Some(data) = payload.claim("data") {
        Ok((data.clone(), header.to_string()))
    } else {
        Err(ZkPassError::MissingRootDataElementError)
    }
}

pub fn tokenize_data(
    signing_key: &str,
    encrypting_key: &str,
    data: Value,
) -> Result<String, ZkPassError> {
    let kid = "mykey";
    let jku = "https://hostname.com/jwks";
    let ep = KeysetEndpoint {
        kid: String::from(kid),
        jku: String::from(jku),
    };
    let jws_token = sign_data_to_jws_token(signing_key, data, Some(ep))?;
    let data = json!(jws_token);
    let jwe_token = encrypt_data_to_jwe_token(encrypting_key, data)?;

    Ok(jwe_token)
}

pub fn verify_data_nested_token(
    verifying_key: &str,
    decrypting_key: &str,
    jwe_token: &str,
) -> Result<VerifiedNestedTokenData, ZkPassError> {
    // step 1: decrypt the outer token to get the inner token
    let (jws_token, outer_header) = decrypt_jwe_token(decrypting_key, jwe_token)?;

    // remove the surrounding quotes because jws_token was a string literal
    let jws_token = &jws_token[1..jws_token.len() - 1];

    // step 2: verify the sig of the inner token, and pull the data payload
    let (payload, inner_header) = verify_jws_token(verifying_key, jws_token)?;
    //println!("header={}", header);

    /*
    // strip the "\\" (data might contains "\\" because it was a string literal in json)
    data = data.replace("\\", "");
    // strip the surrounding "
    let data = &data[1..data.len()-1];
    */
    Ok(VerifiedNestedTokenData {
        outer_header,
        inner_header,
        payload,
    })
}

fn get_keyset_endpoint_params(header: Header) -> Result<KeysetEndpoint, ZkPassError> {
    let header_val: Value = json!(header);

    let header_jku = (match header_val.get("jku") {
        Some(result) => Ok(result),
        None => Err(ZkPassError::MissingKeysetEndpoint),
    })?;
    let header_kid = (match header_val.get("kid") {
        Some(result) => Ok(result),
        None => Err(ZkPassError::MissingKeysetEndpoint),
    })?;
    let jku: String = serde_json::from_str(&header_jku.to_string())
        .map_err(|_| ZkPassError::MissingKeysetEndpoint)?;
    let kid: String = serde_json::from_str(&header_kid.to_string())
        .map_err(|_| ZkPassError::MissingKeysetEndpoint)?;

    let ep = KeysetEndpoint { jku, kid };
    Ok(ep)
}

fn get_public_key(
    payload: &DataVerificationRequest,
    is_user_data: bool,
) -> Result<PublicKeyOption, ZkPassError> {
    let dvr = payload.clone();
    if is_user_data {
        match dvr.user_data_verifying_key {
            PublicKeyOption::KeysetEndpoint(keyset) => Ok(PublicKeyOption::KeysetEndpoint(keyset)),
            PublicKeyOption::PublicKey(publick_key) => Ok(PublicKeyOption::PublicKey(publick_key)),
        }
    } else {
        match dvr.dvr_verifying_key {
            Some(dvr_key) => match dvr_key {
                PublicKeyOption::KeysetEndpoint(keyset) => {
                    Ok(PublicKeyOption::KeysetEndpoint(keyset))
                }
                PublicKeyOption::PublicKey(publick_key) => {
                    Ok(PublicKeyOption::PublicKey(publick_key))
                }
            },
            None => Err(ZkPassError::MissingPublicKey),
        }
    }
}

fn decode_unsecured(jwt: &str) -> Result<(DataVerificationRequest, Header), ZkPassError> {
    let decoding_key = DecodingKey::from_secret(&[]);
    let mut validation = Validation::default();
    validation.insecure_disable_signature_validation();
    validation.set_required_spec_claims(&["data"]);

    Ok(
        (match decode::<WrappedDataVerificationRequest>(jwt, &decoding_key, &validation) {
            Ok(dvr_wrapped) => Ok((dvr_wrapped.claims.data, dvr_wrapped.header)),
            Err(_err) => Err(ZkPassError::MissingRootDataElementError),
        })?,
    )
}

pub fn get_public_key_options(
    jwt: &str,
    is_user_data: bool,
) -> Result<Option<PublicKeyOption>, ZkPassError> {
    let (payload, header) = decode_unsecured(jwt)?;
    if is_user_data {
        let public_key_option = get_public_key(&payload, is_user_data)?;
        return Ok(Some(public_key_option));
    } else {
        let public_key_option = match get_keyset_endpoint_params(header) {
            Ok(result) => Some(PublicKeyOption::KeysetEndpoint(result)),
            Err(_) => {
                // println!("There is no keyset in DVR header");
                let public_key_option = get_public_key(&payload, is_user_data)?;
                Some(public_key_option)
            }
        };
        return Ok(public_key_option);
    }
}

pub async fn verify_dvr_nested_token(
    // resolver:               &Box<dyn KeysetEndpointResolver>,
    verify_dvr_publickey: PublicKey,
    decrypting_key: &str,
    jwe_token: &str,
) -> Result<VerifiedNestedTokenDvr, ZkPassError> {
    // step 1:
    // decrypt the outer token to get the inner token
    let (jws_token, outer_header) = decrypt_jwe_token(decrypting_key, jwe_token)?;
    // remove the surrounding quotes because jws_token was a string literal
    let jws_token = &jws_token[1..jws_token.len() - 1];

    // step 2:
    // get the keyset endpoint jku and kid params from the inner header
    // let ep = get_keyset_endpoint_params(jws_token)?;
    // println!("#### jku={}", ep.jku);
    // println!("#### kid={}", ep.kid);

    // step 3:
    // resolve the keyset endpoint to get the verifying_key
    let dvr_verifying_key = verify_dvr_publickey; // resolver.get_key(ep.jku.as_str(), ep.kid.as_str()).await;

    // step 4:
    // verify the sig of the inner token, and pull the "dvr" payload
    let (payload, inner_header) = verify_jws_token(&dvr_verifying_key.to_pem(), jws_token)?;

    let ver_token = VerifiedNestedTokenData {
        outer_header,
        inner_header,
        payload,
    };

    let dvr: DataVerificationRequest = serde_json::from_value(ver_token.payload).unwrap();

    Ok(VerifiedNestedTokenDvr {
        inner_header: ver_token.inner_header,
        outer_header: ver_token.outer_header,
        dvr,
        dvr_verifying_key,
    })
}
