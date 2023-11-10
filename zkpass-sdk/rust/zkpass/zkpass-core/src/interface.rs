use async_trait::async_trait;
use hex;
use josekit::{
    jwe::{JweHeader, ECDH_ES},
    jws::{JwsHeader, ES256},
    jwt::{self, JwtPayload},
    JoseError,
};
use jsonwebtoken::decode_header;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::time::{SystemTime, UNIX_EPOCH};
use thiserror::Error;

///
/// <span style="font-size: 1.1em; color: #996515;"> ***Defines various errors that come from the zkPass Service.*** </span>
/// 
#[derive(Debug, Error)]
pub enum ZkPassError {
    #[error("Missing Root Data Element")]
    MissingRootDataElementError,

    #[error("Not Implemented")]
    NotImplementedError,

    #[error(transparent)]
    JoseError(#[from] JoseError),

    #[error("Mistmatched User Data Verifying Key")]
    MistmatchedUserDataVerifyingKey,

    #[error("Mistmatched Dvr Verifying Key")]
    MistmatchedDvrVerifyingKey,

    #[error("Mistmatched Dvr Id")]
    MistmatchedDvrId,

    #[error("Mismatched Dvr Title")]
    MistmatchedDvrTitle,

    #[error("Mismatched Dvr Digest")]
    MistmatchedDvrDigest,

    #[error("Expired ZkPass Proof")]
    ExpiredZkPassProof,

    #[error("Stub Implementation")]
    StubImplementation,

    #[error("{0}")]
    CustomError(String),
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
/// <span style="font-size: 1.1em; color: #996515;"> ***Represents a public key.*** </span>
pub struct PublicKey {
    /// `x` represents the x parameter of the public key.
    pub x: String,

    /// `y` represents the y parameter of the public key.
    pub y: String
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
    pub kid: String
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

pub fn get_keyset_endpoint_params(jwt: &str) -> KeysetEndpoint {
    let header = decode_header(jwt).unwrap();
    let header_val: Value = json!(header);

    let jku: String = serde_json::from_str(&header_val.get("jku").unwrap().to_string()).unwrap();
    let kid: String = serde_json::from_str(&header_val.get("kid").unwrap().to_string()).unwrap();

    let ep = KeysetEndpoint { jku, kid };

    ep
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
    let ep = get_keyset_endpoint_params(jws_token);
    println!("#### jku={}", ep.jku);
    println!("#### kid={}", ep.kid);

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
