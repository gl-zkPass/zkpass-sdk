/*
 * health_check.rs
 * this file contains a health check function, to check if both the ws and host is healthy or not
 *
 * Authors:
 *   William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * Created Date: April 4th 2024
 * -----
 * Last Modified: May 2nd 2024
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
use tracing::{ error, info };
use serde_json::Value;
use serde::{ Deserialize, Serialize };

use zkpass_core::interface::{ encrypt_data_to_jwe_token, PublicKey };
use zkpass_svc_common::interface::{
    errors::ZkPassSocketError,
    socket::SocketConnection,
    RequestGenerateProof,
    OPERATION_GENERATE_PROOF,
    OPERATION_SEPARATOR,
};
use crate::utils::get_localized_socket_error_message;
use crate::keys::retrieve_encryption_pubk;

/*
 * JWS {
 *   "data": {
 *     "healthcheck": "ping"
 *   }
 * }
 */

const HEALTH_CHECK_USER_DATA_TOKEN: &str =
    "eyJ0eXAiOiJKV1QiLCJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vZ2wtemtQYXNzL3prcGFzcy1zZGsvbWFpbi9kb2NzL3prcGFzcy9zYW1wbGUtandrcy9pc3N1ZXIta2V5Lmpzb24iLCJraWQiOiJrLTEiLCJhbGciOiJFUzI1NiJ9.eyJkYXRhIjp7ImhlYWx0aGNoZWNrIjoicGluZyJ9fQ.5hgvcGMSi-bRc4J_X6D7XH9ASpUpyoGBPJ3wfj4pRrHG6S9OiZb81ikLj-_uHglceSxzClYl2lDUGAhB1I6qvw";

/*
 * JWS {
 *   "data": {
 *     "zkvm": "sp1",
 *     "dvr_title": "My DVR",
 *     "dvr_id": "fd16eb20-798c-4471-8288-087e8d890392",
 *     "query_engine_ver": "0.3.0-rc.1",
 *     "query_method_ver": "92609d0e4ae3211016668d693007026d2a005f1ced6c6ed67e440c85bb63efe5",
 *     "query": "[{\"assign\":{\"result_status\":{\"==\":[{\"dvar\":\"healthcheck\"},\"ping\"]}}},{\"output\":{\"result\":{\"lvar\":\"result_status\"}}}]",
 *     "user_data_url": "https://hostname/api/user_data/",
 *     "user_data_verifying_key": {
 *       "PublicKey": {
 *         "x": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7f0QoVUsccB9yMwHAR7oVk/L+ZkX",
 *         "y": "8ZqC1Z0XTaj3BMcMnqh+VzdHZX3yGKa3+uhNAhKWWyfB/r+3E8rPSHtXXQ=="
 *       }
 *     },
 *     "dvr_verifying_key": {
 *       "PublicKey": {
 *         "x": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU",
 *         "y": "IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA=="
 *       }
 *     }
 *   }
 * }
 */
const HEALTH_CHECK_DVR_TOKEN_SP1: &str =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJkYXRhIjp7Inprdm0iOiJzcDEiLCJkdnJfdGl0bGUiOiJNeSBEVlIiLCJkdnJfaWQiOiJmZDE2ZWIyMC03OThjLTQ0NzEtODI4OC0wODdlOGQ4OTAzOTIiLCJxdWVyeV9lbmdpbmVfdmVyIjoiMC4zLjAtcmMuMSIsInF1ZXJ5X21ldGhvZF92ZXIiOiI5MjYwOWQwZTRhZTMyMTEwMTY2NjhkNjkzMDA3MDI2ZDJhMDA1ZjFjZWQ2YzZlZDY3ZTQ0MGM4NWJiNjNlZmU1IiwicXVlcnkiOiJbe1wiYXNzaWduXCI6e1wicmVzdWx0X3N0YXR1c1wiOntcIj09XCI6W3tcImR2YXJcIjpcImhlYWx0aGNoZWNrXCJ9LFwicGluZ1wiXX19fSx7XCJvdXRwdXRcIjp7XCJyZXN1bHRcIjp7XCJsdmFyXCI6XCJyZXN1bHRfc3RhdHVzXCJ9fX1dIiwidXNlcl9kYXRhX3VybCI6Imh0dHBzOi8vaG9zdG5hbWUvYXBpL3VzZXJfZGF0YS8iLCJ1c2VyX2RhdGFfdmVyaWZ5aW5nX2tleSI6eyJQdWJsaWNLZXkiOnsieCI6Ik1Ga3dFd1lIS29aSXpqMENBUVlJS29aSXpqMERBUWNEUWdBRTdmMFFvVlVzY2NCOXlNd0hBUjdvVmsvTCtaa1giLCJ5IjoiOFpxQzFaMFhUYWozQk1jTW5xaCtWemRIWlgzeUdLYTMrdWhOQWhLV1d5ZkIvciszRThyUFNIdFhYUT09In19LCJkdnJfdmVyaWZ5aW5nX2tleSI6eyJQdWJsaWNLZXkiOnsieCI6Ik1Ga3dFd1lIS29aSXpqMENBUVlJS29aSXpqMERBUWNEUWdBRXA2V0psd0F0bGQvVTRoRG1tdXVNZFpDVnRNZVUiLCJ5IjoiSVQzeGtEZFV3TE92c1ZWQStpaVN3ZmFYNEhxS2xSUERHRytGNldHam54eXM5VDVHdE5lM252ZXdPQT09In19fX0.H_u2ifd0zOQevrqGw7iPflhg2IFT7GuTEEiBMnadYf95eUq9xbc8z1Ucv4r1gSGn3tbHRE5oWzFOgzwRH2HB6Q";

/*
 * JWS {
 *   "data": {
 *     "zkvm": "r0",
 *     "dvr_title": "My DVR",
 *     "dvr_id": "746e9410-b33f-44e8-865c-9e139cce41d3",
 *     "query_engine_ver": "0.3.0-rc.1",
 *     "query_method_ver": "188247ca6eb854b46eceeadd0a601a1d7d70e27eac71ae0d959b42b9e4983c2",
 *     "query": "[{\"assign\":{\"result_status\":{\"==\":[{\"dvar\":\"healthcheck\"},\"ping\"]}}},{\"output\":{\"result\":{\"lvar\":\"result_status\"}}}]",
 *     "user_data_url": "https://hostname/api/user_data/",
 *     "user_data_verifying_key": {
 *       "PublicKey": {
 *         "x": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7f0QoVUsccB9yMwHAR7oVk/L+ZkX",
 *         "y": "8ZqC1Z0XTaj3BMcMnqh+VzdHZX3yGKa3+uhNAhKWWyfB/r+3E8rPSHtXXQ=="
 *       }
 *     },
 *     "dvr_verifying_key": {
 *       "PublicKey": {
 *         "x": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU",
 *         "y": "IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA=="
 *       }
 *     }
 *   }
 * }
 */
const HEALTH_CHECK_DVR_TOKEN_R0: &str =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJkYXRhIjp7Inprdm0iOiJyMCIsImR2cl90aXRsZSI6Ik15IERWUiIsImR2cl9pZCI6Ijc0NmU5NDEwLWIzM2YtNDRlOC04NjVjLTllMTM5Y2NlNDFkMyIsInF1ZXJ5X2VuZ2luZV92ZXIiOiIwLjMuMC1yYy4xIiwicXVlcnlfbWV0aG9kX3ZlciI6IjE4ODI0N2NhNmViODU0YjQ2ZWNlZWFkZDBhNjAxYTFkN2Q3MGUyN2VhYzcxYWUwZDk1OWI0MmI5ZTQ5ODNjMiIsInF1ZXJ5IjoiW3tcImFzc2lnblwiOntcInJlc3VsdF9zdGF0dXNcIjp7XCI9PVwiOlt7XCJkdmFyXCI6XCJoZWFsdGhjaGVja1wifSxcInBpbmdcIl19fX0se1wib3V0cHV0XCI6e1wicmVzdWx0XCI6e1wibHZhclwiOlwicmVzdWx0X3N0YXR1c1wifX19XSIsInVzZXJfZGF0YV91cmwiOiJodHRwczovL2hvc3RuYW1lL2FwaS91c2VyX2RhdGEvIiwidXNlcl9kYXRhX3ZlcmlmeWluZ19rZXkiOnsiUHVibGljS2V5Ijp7IngiOiJNRmt3RXdZSEtvWkl6ajBDQVFZSUtvWkl6ajBEQVFjRFFnQUU3ZjBRb1ZVc2NjQjl5TXdIQVI3b1ZrL0wrWmtYIiwieSI6IjhacUMxWjBYVGFqM0JNY01ucWgrVnpkSFpYM3lHS2EzK3VoTkFoS1dXeWZCL3IrM0U4clBTSHRYWFE9PSJ9fSwiZHZyX3ZlcmlmeWluZ19rZXkiOnsiUHVibGljS2V5Ijp7IngiOiJNRmt3RXdZSEtvWkl6ajBDQVFZSUtvWkl6ajBEQVFjRFFnQUVwNldKbHdBdGxkL1U0aERtbXV1TWRaQ1Z0TWVVIiwieSI6IklUM3hrRGRVd0xPdnNWVkEraWlTd2ZhWDRIcUtsUlBER0crRjZXR2pueHlzOVQ1R3ROZTNudmV3T0E9PSJ9fX19.-EUM7-XfM8gJsoka3IInVNl9e_EsWClfjybkDNbbu93PHC7b3D_U0DmCaE_lZiScMCkReE1f-xyPQvtowre57Q";

#[derive(serde::Deserialize)]
pub struct QueryEngineInfo {
    #[serde(rename = "zkvm")]
    pub query_engine_type_param: Option<String>,
}

#[derive(PartialEq, Serialize, Deserialize, Debug)]
pub enum QueryEngineStatus {
    NotChecked,
    NotHealthy,
    Healthy,
}

impl QueryEngineStatus {
    pub fn as_str(&self) -> &str {
        match self {
            QueryEngineStatus::NotChecked => "Not Checked",
            QueryEngineStatus::NotHealthy => "Not Healthy",
            QueryEngineStatus::Healthy => "Healthy",
        }
    }
}

#[derive(PartialEq, Serialize, Deserialize, Debug)]
pub struct HealthCheckResult {
    pub is_healthy: bool,
    pub sp1_health_check: QueryEngineStatus,
    pub r0_health_check: QueryEngineStatus,
}

impl HealthCheckResult {
    pub fn new() -> HealthCheckResult {
        HealthCheckResult {
            is_healthy: false,
            sp1_health_check: QueryEngineStatus::NotChecked,
            r0_health_check: QueryEngineStatus::NotChecked,
        }
    }
}

pub async fn host_health_check(
    socket: &mut Box<dyn SocketConnection>,
    query_engine_type: &str
) -> Result<HealthCheckResult, ZkPassSocketError> {
    let mut health_check_result = HealthCheckResult::new();
    let encryption_pub_key = retrieve_encryption_pubk()
        .unwrap_or(PublicKey {
            x: "".to_string(),
            y: "".to_string(),
        })
        .to_pem();

    if query_engine_type == "all" || query_engine_type == "sp1" {
        match query_engine_health_check(socket, "sp1", encryption_pub_key.clone()).await {
            Ok(query_engine_status) => {
                info!("sp1 health check: {:?}", query_engine_status);
                health_check_result.sp1_health_check = query_engine_status;
            }
            Err(err) => {
                health_check_result.sp1_health_check = QueryEngineStatus::NotHealthy;
                error!("{}", get_localized_socket_error_message(&err));
            }
        }
    }

    if query_engine_type == "all" || query_engine_type == "r0" {
        match query_engine_health_check(socket, "r0", encryption_pub_key.clone()).await {
            Ok(query_engine_status) => {
                info!("r0 health check: {:?}", query_engine_status);
                health_check_result.r0_health_check = query_engine_status;
            }
            Err(err) => {
                health_check_result.r0_health_check = QueryEngineStatus::NotHealthy;
                error!("{}", get_localized_socket_error_message(&err));
            }
        }
    }

    if
        health_check_result.sp1_health_check == QueryEngineStatus::Healthy &&
        (health_check_result.r0_health_check == QueryEngineStatus::Healthy ||
            health_check_result.r0_health_check == QueryEngineStatus::NotChecked)
    {
        health_check_result.is_healthy = true;
    }
    if
        health_check_result.r0_health_check == QueryEngineStatus::Healthy &&
        health_check_result.sp1_health_check == QueryEngineStatus::NotChecked
    {
        health_check_result.is_healthy = true;
    }
    Ok(health_check_result)
}

async fn query_engine_health_check(
    socket: &mut Box<dyn SocketConnection>,
    query_engine_type: &str,
    encryption_pub_key: String
) -> Result<QueryEngineStatus, ZkPassSocketError> {
    let dvr_token = match query_engine_type {
        "sp1" => HEALTH_CHECK_DVR_TOKEN_SP1.to_string(),
        "r0" => HEALTH_CHECK_DVR_TOKEN_R0.to_string(),
        _ => {
            error!("Invalid query engine type, setting default to sp1");
            HEALTH_CHECK_DVR_TOKEN_SP1.to_string()
        }
    };
    let dvr_token = match
        encrypt_data_to_jwe_token(encryption_pub_key.as_str(), Value::String(dvr_token))
    {
        Ok(token) => token,
        Err(err) => {
            error!("Error encrypting dvr token {:?}", err);
            return Err(ZkPassSocketError::CustomError(format!("{:?}", err)));
        }
    };

    let user_data_token = match
        encrypt_data_to_jwe_token(
            encryption_pub_key.as_str(),
            Value::String(HEALTH_CHECK_USER_DATA_TOKEN.to_string())
        )
    {
        Ok(token) => token,
        Err(err) => {
            error!("Error encrypting user data token {:?}", err);
            return Err(ZkPassSocketError::CustomError(format!("{:?}", err)));
        }
    };

    let request_payload = RequestGenerateProof {
        dvr_token,
        user_data_token,
    };

    let bytes = serde_json
        ::to_string(&request_payload)
        .map_err(|_| ZkPassSocketError::SerializeError("RequestGenerateProof".to_string()))?;
    let query_engine_health_check_string = format!(
        "{}{}{}",
        OPERATION_GENERATE_PROOF,
        OPERATION_SEPARATOR,
        bytes
    );
    socket.send(query_engine_health_check_string)?;

    let result = match socket.receive() {
        Ok(result) => {
            if result.to_lowercase().contains("error") {
                info!("Error host health check {:?}", result);
                QueryEngineStatus::NotHealthy
            } else {
                QueryEngineStatus::Healthy
            }
        }
        Err(err) => {
            error!("Error host health check {:?}", err);
            QueryEngineStatus::NotHealthy
        }
    };
    Ok(result)
}

#[cfg(test)]
mod tests {
    use futures::executor::block_on;
    use zkpass_core::interface::{ verify_dvr_nested_token, PublicKey };
    use super::*;

    const ENCRYPTING_PRIVKEY: &str =
        r"-----BEGIN PRIVATE KEY-----
        MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLxxbcd7aVcNEdE/C
        EGPwLzM6lkLuDYzhd3FqALuuHCahRANCAASnpYmXAC2V39TiEOaa64x1kJW0x5Qh
        PfGQN1TAs6+xVUD6KJLB9pfgeoqVE8MYb4XpYaOfHKz1Pka017ee97A4
        -----END PRIVATE KEY-----";

    fn initialize_encryption_pub_key() -> (PublicKey, String) {
        let pubkey = PublicKey {
            x: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU".to_string(),
            y: "IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==".to_string(),
        };

        let string_pubkey = pubkey.to_pem();
        (pubkey, string_pubkey)
    }

    #[derive(Debug)]
    struct MockSocketConnection {
        data: String,
    }

    impl SocketConnection for MockSocketConnection {
        fn receive(self: &mut Self) -> Result<String, ZkPassSocketError> {
            let request_generate_proof: RequestGenerateProof = serde_json
                ::from_str(self.data.as_str())
                .unwrap();
            let (encryption_pubkey, _) = initialize_encryption_pub_key();
            let verified_nested_token_data = block_on(
                verify_dvr_nested_token(
                    encryption_pubkey,
                    ENCRYPTING_PRIVKEY,
                    request_generate_proof.dvr_token.as_str()
                )
            ).unwrap();
            if verified_nested_token_data.dvr.zkvm == "sp1" {
                Ok("Success".to_string())
            } else {
                Ok("Error: Something went wrong".to_string())
            }
        }
        fn reconnect(self: &mut Self) -> Result<(), ZkPassSocketError> {
            Ok(())
        }
        fn send(self: &mut Self, message: String) -> Result<(), ZkPassSocketError> {
            let operation_name_and_params: Vec<&str> = message.split(OPERATION_SEPARATOR).collect();
            let operation_parameter = operation_name_and_params[1];
            self.data = operation_parameter.to_string();
            Ok(())
        }
    }

    #[tokio::test]
    async fn test_host_health_check_healthy() {
        let query_engine_type = "sp1";
        perform_test(query_engine_type, QueryEngineStatus::Healthy).await;
    }

    #[tokio::test]
    async fn test_host_health_check_not_healthy() {
        let query_engine_type = "r0";
        perform_test(query_engine_type, QueryEngineStatus::NotHealthy).await;
    }

    #[tokio::test]
    async fn test_host_health_check_invalid_query_engine_type() {
        let query_engine_type = "sp2";
        perform_test(query_engine_type, QueryEngineStatus::Healthy).await;
    }

    async fn perform_test(query_engine_type: &str, expected_result: QueryEngineStatus) {
        let socket: Box<dyn SocketConnection> = Box::new(MockSocketConnection {
            data: "".to_string(),
        });

        let (_, encryption_pubkey) = initialize_encryption_pub_key();

        let result = query_engine_health_check(
            &mut Box::new(socket),
            query_engine_type,
            encryption_pubkey
        ).await.unwrap();
        assert_eq!(result, expected_result);
    }
}
