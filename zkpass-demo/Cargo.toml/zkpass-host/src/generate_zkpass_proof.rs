/*
 * generate_zkpass_proof.rs
 *
 * Authors:
 *   Antony Halim (antony.halim@gdplabs.id)
 * Created Date: November 30th 2023
 * -----
 * Last Modified: March 13th 2024
 * Modified By: William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * -----
 * Reviewers:
 *   Zulchaidir (zulchaidir@gdplabs.id)
 *   NaufalFakhri (naufal.f.muhammad@gdplabs.id)
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
//use std::time::{SystemTime, UNIX_EPOCH};
use r0_zkpass_query::zkpass_core::{
    get_current_timestamp,
    sign_data_to_jws_token,
    verify_data_nested_token,
    verify_dvr_nested_token,
    KeysetEndpoint,
    PublicKey,
    ZkPassError,
    ZkPassProof,
};
use r0_zkpass_query::{ ZkPassQueryEngine, ZkPassQueryEngineError };
use serde_json::json;
use zkpass_svc_common::interface::VerificationPublicKeys;
use tracing::{ info, error };

fn select_zkpass_query_engine(zkvm: &str) -> Result<Box<dyn ZkPassQueryEngine>, ZkPassError> {
    let query_engine = match zkvm {
        "r0" => {
            info!("#### using r0 zkvm");
            r0_zkpass_query::create_zkpass_query_engine()
        }
        "sp1" => {
            info!("#### using sp1 zkvm");
            sp1_zkpass_query::create_zkpass_query_engine()
        }
        _ => {
            error!("#### invalid zkvm");
            return Err(ZkPassError::InvalidZkVm);
        }
    };

    Ok(query_engine)
}

pub(crate) async fn generate_zkpass_proof(
    data_nested_token: &str,
    dvr_nested_token: &str,
    // resolver:           &Box<dyn KeysetEndpointResolver>,
    verifying_key: VerificationPublicKeys,
    decrypting_key: &str,
    signing_key: &str,
    signing_key_ep: &KeysetEndpoint
) -> Result<String, ZkPassError> {
    info!(">> generate_zkpass_proof");
    // get the dvr from token
    let ver_dvr = verify_dvr_nested_token(
        verifying_key.dvr_key,
        decrypting_key,
        dvr_nested_token
    ).await?;
    info!("#### zkvm={}", ver_dvr.dvr.zkvm);
    //let dvr2 = ver_dvr.dvr.clone();
    let dvr_digest = ver_dvr.dvr.get_sha256_digest();

    // get the user_data_verifying_key from the dvr
    let user_data_verifying_key: PublicKey = verifying_key.user_data_key;
    // match ver_dvr.dvr.user_data_verifying_key {
    //     PublicKeyOption::PublicKey(pubkey) => {
    //         user_data_verifying_key = pubkey;
    //     },
    //     PublicKeyOption::KeysetEndpoint(endpoint) => {
    //         user_data_verifying_key = resolver.get_key(
    //             endpoint.jku.as_str(),
    //             endpoint.kid.as_str())
    //             .await;
    //     }
    // }

    // get the user data from the token, using user_data_verifying_key
    let ver_data = verify_data_nested_token(
        &user_data_verifying_key.to_pem(),
        decrypting_key,
        data_nested_token
    )?;

    // now we have the user data and the dvr
    let query_engine = select_zkpass_query_engine(&ver_dvr.dvr.zkvm)?;
    let zkproof = query_engine
        .execute_query_and_create_zkproof(
            ver_data.payload.to_string().as_str(),
            ver_dvr.dvr.query.as_str()
        )
        .map_err(|err: ZkPassQueryEngineError| {
            // maps all enums from ZkPassQueryEngineError to ZkPassError
            ZkPassError::QueryEngineError(format!("{:?}", err))
        })?;

    // prepare the output
    let zkpass_proof = ZkPassProof {
        zkproof,
        dvr_title: ver_dvr.dvr.dvr_title,
        dvr_id: ver_dvr.dvr.dvr_id,
        dvr_digest,
        dvr_verifying_key: ver_dvr.dvr_verifying_key,
        user_data_verifying_key,
        time_stamp: get_current_timestamp(),
    };
    //info!("zkpass_proof={:#?}", zkpass_proof);

    let jku = signing_key_ep.jku.clone();
    let kid = signing_key_ep.kid.clone();
    let ep = KeysetEndpoint { jku, kid };
    //info!("jku={}, kid={}", jku, kid);
    let zkpass_proof_token = sign_data_to_jws_token(signing_key, json!(zkpass_proof), Some(ep))?;

    info!("<< generate_zkpass_proof");
    Ok(zkpass_proof_token)
}
