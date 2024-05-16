/*
 * mocks.rs
 * this file contains the mock implementations and shared components for unit testing
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * Created Date: April 17th 2024
 * -----
 * Last Modified: April 22nd 2024
 * Modified By: William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * -----
 * Reviewers:
 *   NONE
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2023 PT Darta Media Indonesia. All rights reserved.
 */
use zkpass_core::interface::{ KeysetEndpoint, PublicKey, PublicKeyOption };
use zkpass_svc_common::interface::{
    errors::ZkPassSocketError,
    socket::SocketConnection,
    RequestGenerateProof,
    VerificationPublicKeyOption,
    VerificationPublicKeys,
    OPERATION_FETCHING_KEYS,
    OPERATION_GENERATE_PROOF,
    OPERATION_PRINTING_LOGS,
    OPERATION_SEPARATOR,
};

#[derive(Debug)]
pub struct MockSocketConnection {
    dvr_token: String,
    user_data_token: String,
}

impl MockSocketConnection {
    #[allow(dead_code)]
    pub fn new(dvr_token: String, user_data_token: String) -> Self {
        Self {
            dvr_token,
            user_data_token,
        }
    }
}

impl SocketConnection for MockSocketConnection {
    fn send(&mut self, payload: String) -> Result<(), ZkPassSocketError> {
        if !self.dvr_token.is_empty() && !self.user_data_token.is_empty() {
            let request_payload = RequestGenerateProof {
                dvr_token: self.dvr_token.clone(),
                user_data_token: self.user_data_token.clone(),
            };
            let bytes = serde_json::to_string(&request_payload).unwrap();
            let expected_payload = format!(
                "{}{}{}",
                OPERATION_GENERATE_PROOF,
                OPERATION_SEPARATOR,
                bytes
            );
            assert_eq!(payload, expected_payload);
        }
        Ok(())
    }

    fn receive(&mut self) -> Result<String, ZkPassSocketError> {
        let result = "{\"proof\":\"mock_proof\"}";
        let bytes = serde_json::to_string(result).unwrap();
        Ok(bytes)
    }

    fn reconnect(self: &mut Self) -> Result<(), ZkPassSocketError> {
        Ok(())
    }
}

#[derive(Debug)]
pub struct MockHelperSocketConnection { //only used on client_helper.rs
    operation: String,
    address: String,
    first_time: bool, // for end the loop
}

impl MockHelperSocketConnection {
    #[allow(dead_code)]
    pub fn new(operation: String, address: String) -> Self {
        Self { operation, address, first_time: true }
    }
}

impl SocketConnection for MockHelperSocketConnection {
    fn send(&mut self, payload: String) -> Result<(), ZkPassSocketError> {
        let verification_public_keys: VerificationPublicKeys = serde_json
            ::from_str(&payload)
            .unwrap();
        let dvr_public_key = verification_public_keys.dvr_key;
        let user_data_public_key = verification_public_keys.user_data_key;

        assert_eq!(user_data_public_key, PublicKey {
            x: "user_data_public_key_x".to_string(),
            y: "user_data_public_key_y".to_string(),
        });
        assert_eq!(dvr_public_key, PublicKey {
            x: "dvr_public_key_x".to_string(),
            y: "dvr_public_key_y".to_string(),
        });
        Ok(())
    }

    fn receive(&mut self) -> Result<String, ZkPassSocketError> {
        if !self.first_time {
            return Ok("".to_string()); // return empty string to end the loop
        }
        let result = match self.operation.as_str() {
            OPERATION_FETCHING_KEYS => {
                self.first_time = false;
                let keyset = KeysetEndpoint {
                    jku: format!("http://{}/jwks", self.address),
                    kid: "kid".to_string(),
                };
                let request_payload = VerificationPublicKeyOption {
                    dvr_public_key_option: Some(PublicKeyOption::KeysetEndpoint(keyset.clone())),
                    user_data_public_key_option: Some(
                        PublicKeyOption::PublicKey(PublicKey {
                            x: "user_data_public_key_x".to_string(),
                            y: "user_data_public_key_y".to_string(),
                        })
                    ),
                };

                let bytes = serde_json::to_string(&request_payload).unwrap();
                let payload = format!(
                    "{}{}{}",
                    OPERATION_FETCHING_KEYS,
                    OPERATION_SEPARATOR,
                    bytes
                );
                payload
            }
            OPERATION_PRINTING_LOGS => {
                self.first_time = false;
                let request_payload = "test_printing_logs";
                let bytes = serde_json::to_string(&request_payload).unwrap();
                let payload = format!(
                    "{}{}{}",
                    OPERATION_PRINTING_LOGS,
                    OPERATION_SEPARATOR,
                    bytes
                );
                payload
            }
            _ => "no operation".to_string(),
        };
        Ok(result)
    }

    fn reconnect(self: &mut Self) -> Result<(), ZkPassSocketError> {
        Ok(())
    }
}
