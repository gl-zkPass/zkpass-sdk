/*
 * interface.rs
 * zkPass public interfaces, structs, and enums
 *
 * References:
 *   NONE
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
use async_trait::async_trait;
use hex;
use josekit::{jws::ES256, jwt, JoseError};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use thiserror::Error;

///
/// <span style="font-size: 1.1em; color: #996515;"> ***Defines various errors that come from the zkPass Service.*** </span>
///
#[derive(Debug, Error)]
pub enum ZkPassError {
    #[error("Missing Root Data Element")]
    MissingRootDataElementError,

    #[error("Missing {0} Element")]
    MissingElementError(String),

    #[error("Not Implemented")]
    NotImplementedError,

    #[error(transparent)]
    JoseError(#[from] JoseError),

    #[error("Mismatched User Data Verifying Key")]
    MismatchedUserDataVerifyingKey,

    #[error("Mismatched Dvr Verifying Key")]
    MismatchedDvrVerifyingKey,

    #[error("Mismatched Dvr Id")]
    MismatchedDvrId,

    #[error("Mismatched Dvr Title")]
    MismatchedDvrTitle,

    #[error("Mismatched Dvr Digest")]
    MismatchedDvrDigest,

    #[error("Expired ZkPass Proof")]
    ExpiredZkPassProof,

    #[error("Missing Keyset field")]
    MissingKeysetEndpoint,

    #[error("Missing Public Key")]
    MissingPublicKey,

    #[error("{0}")]
    CustomError(String),

    #[error("Invalid Public Key")]
    InvalidPublicKey,

    #[error("Missing API Key")]
    MissingApiKey,

    #[error("Missing ZkPass Query Library")]
    MissingZkPassQueryLibrary,

    #[error("Failed to Retrieve Function from ZKPass Query Library")]
    FunctionRetrievalError,

    #[error("Invalid ZKVM name")]
    InvalidZkVm,

    #[error("{0}")]
    QueryEngineError(String),
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
    pub user_data_verifying_keys: HashMap<String, PublicKey>,

    /// The public key actually used by the zkPass Service to verify the signature of the DVR
    pub dvr_verifying_key: PublicKey,

    /// The time stamp of the ZkPassProof as created by the zkPass Service
    pub time_stamp: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct UserDataRequest {
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
}

///
/// <span style="font-size: 1.1em; color: #996515;"> ***Represents a request that contains information needed to verify user data.*** </span>
///
///  This struct is typically created by the Proof Verifier client, and the DVR
///  represents a request to verify certain attributes or properties of a user data.
///
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct DataVerificationRequest {
    /// The type of zkvm used to process the DVR
    pub zkvm: String,

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

    /// We allow more than one user data specification in a single DVR.
    ///
    /// The key in this HashMap is the tag of the user data.
    /// This tag will be used in the `dvar` path.
    /// This tag is allowed to be empty (by putting empty string "") if there's only one user data.
    /// Tag can only contains alphanumeric characters and underscore.
    pub user_data_requests: HashMap<String, UserDataRequest>,

    /// The public key information used to verify the signature of this dvr.
    ///
    /// This field is optional. If this field is None, then the one who processing
    /// this DVR, which typically is the zkpass-ws, should check the header of this DVR,
    /// whether there is keyset (JKU & KID) or not.
    /// This field is set by the Proof Verifier to inform the zkPass Service which key
    /// to use to verify this DVR.
    pub dvr_verifying_key: Option<PublicKeyOption>,
}

impl DataVerificationRequest {
    // `user_data_requests` is a hashmap and doesn't have a guarantee of the order of the items.
    // So every time there are two DataVerificationRequest with the same content, the digest could be different if the order of the items is different.
    // Solution: sort the hashmap by key before hashing.
    pub fn get_sha256_digest(&self) -> String {
        let mut sorted_user_data_requests: Vec<(_, _)> = self.user_data_requests.iter().collect();
        sorted_user_data_requests.sort_by(|a, b| a.0.cmp(b.0));

        #[derive(Serialize)]
        struct DvrForHash<'a> {
            zkvm: &'a str,
            dvr_title: &'a str,
            dvr_id: &'a str,
            query_engine_ver: &'a str,
            query_method_ver: &'a str,
            query: &'a str,
            user_data_requests: Vec<(&'a String, &'a UserDataRequest)>,
            dvr_verifying_key: &'a Option<PublicKeyOption>,
        }
        let dvr_for_hash = DvrForHash {
            zkvm: &self.zkvm,
            dvr_title: &self.dvr_title,
            dvr_id: &self.dvr_id,
            query_engine_ver: &self.query_engine_ver,
            query_method_ver: &self.query_method_ver,
            query: &self.query,
            user_data_requests: sorted_user_data_requests,
            dvr_verifying_key: &self.dvr_verifying_key,
        };

        let mut hasher = Sha256::new();
        hasher.update(serde_json::to_string(&dvr_for_hash).unwrap());
        hex::encode(hasher.finalize())
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifiedNestedTokenUserData {
    pub outer_header: String,
    pub inner_headers: HashMap<String, String>,
    pub payloads: HashMap<String, Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerifiedNestedTokenDvr {
    pub outer_header: String,
    pub inner_header: String,
    pub dvr: DataVerificationRequest,
    pub dvr_verifying_key: PublicKey,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Jwk {
    pub kty: String,
    pub crv: String,
    pub kid: String,
    pub x: String,
    pub y: String,
    pub jwt: Option<String>,
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

// Used by zkpass-ws, doesn't have to be in zkpass-core
pub fn verify_key_token(key: &str, jws_token: &str) -> Result<(String, PublicKey), ZkPassError> {
    let verifier = ES256
        .verifier_from_pem(&key)
        .map_err(|e| ZkPassError::JoseError(e))?;
    let (payload, _header) =
        jwt::decode_with_verifier(&jws_token, &verifier).map_err(|e| ZkPassError::JoseError(e))?;

    if let Some(private_key) = payload.claim("privateKey") {
        if let Some(public_key) = payload.claim("publicKey") {
            let private_key: String = serde_json::from_value(private_key.clone())
                .map_err(|err| ZkPassError::CustomError(err.to_string()))?;
            let public_key: PublicKey = serde_json::from_value(public_key.clone())
                .map_err(|err| ZkPassError::CustomError(err.to_string()))?;
            Ok((private_key, public_key))
        } else {
            Err(ZkPassError::MissingElementError("publicKey".to_string()))
        }
    } else {
        Err(ZkPassError::MissingElementError("privateKey".to_string()))
    }
}
