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
use serde_json::Value;
use zkpass_core::interface::{
    encrypt_data_to_jwe_token,
    KeysetEndpoint,
    PublicKey,
    PublicKeyOption,
};
use zkpass_svc_common::interface::{
    errors::ZkPassSocketError,
    socket::SocketConnection,
    HostKeyPairs,
    KeyPair,
    KeyService,
    RequestGenerateProof,
    VerificationPublicKeyOption,
    VerificationPublicKeys,
    OPERATION_GENERATE_PROOF,
    OPERATION_SEPARATOR,
};

#[allow(dead_code)]
pub const ENCRYPTED_ENCRYPTION_KEY: &str =
    "HBhzA2T/K8zoLgyPNSdmQP8jahHfn6fXOg57IYs1s8+LC6OEinBb2n2kbCi+oKk1F6mqoYI9exJN5EOxmMmO7AY+4xE8b/WoXG/DeqSyNGVoEi9fY7HE9tCE0o1QDNpN5EPhugsDOzWLHdRrafMNEZSc2U5TsMeAZfw6T8+Pm1WDp4IyHBQq9tPdnlG3TJKTq/1PyII/O/tyUhdmPfBJSQLF0cihrz21bjCJXShZix0hOxa3ZI8isy77KJsKP3B105c/ybbcwDVriT1DLntLNT7JPGSev09S+jyD7eye7IpgT9H6dT733LIxfEjbf2dOLpOxT+ttYb8SHtus/JcAZw==";

#[allow(dead_code)]
pub const ENCRYPTED_SIGNING_KEY: &str =
    "aQ+tKZ5AXEuhzzAHeawJp367rQRMiPFLkPC3X7uN/nzSxmC1wvgy+sWcK3sNcDu/U7F4gFPA3zye6x+cHbg7ZmTGloxyOZa//NY4icAQLWfqCZfXcdsKBy4+d3lmrqsV6daepxkqVvT62gxcM5YepfMKZyt0OrYn44SBQYDTVGTfcxghEwh0dZxTxcV4383P4JyGW68kg4nnC4YAQPluoKYHD/Xjn8KFq6hiL7ZcjjwrBwM6wPsPlYNCKk/f26146EmLSJeh4PyHnrV4FCu1g2xq4pskRs8lh/o1Nl/VK4YX+dc7iwNFdnBJ00hB27arCLtkvS4AYZKSHP4UbGCFPw==";

#[allow(dead_code)]
pub const SECRET_KEY: &str = "e1bBXWmthEJVnJkzfY3ycFu8nrq3iwIbw2F+e2P7Dzc=";

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
pub const MOCK_DVR_TOKEN: &str =
    "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJkYXRhIjp7Inprdm0iOiJzcDEiLCJkdnJfdGl0bGUiOiJNeSBEVlIiLCJkdnJfaWQiOiJmZDE2ZWIyMC03OThjLTQ0NzEtODI4OC0wODdlOGQ4OTAzOTIiLCJxdWVyeV9lbmdpbmVfdmVyIjoiMC4zLjAtcmMuMSIsInF1ZXJ5X21ldGhvZF92ZXIiOiI5MjYwOWQwZTRhZTMyMTEwMTY2NjhkNjkzMDA3MDI2ZDJhMDA1ZjFjZWQ2YzZlZDY3ZTQ0MGM4NWJiNjNlZmU1IiwicXVlcnkiOiJbe1wiYXNzaWduXCI6e1wicmVzdWx0X3N0YXR1c1wiOntcIj09XCI6W3tcImR2YXJcIjpcImhlYWx0aGNoZWNrXCJ9LFwicGluZ1wiXX19fSx7XCJvdXRwdXRcIjp7XCJyZXN1bHRcIjp7XCJsdmFyXCI6XCJyZXN1bHRfc3RhdHVzXCJ9fX1dIiwidXNlcl9kYXRhX3VybCI6Imh0dHBzOi8vaG9zdG5hbWUvYXBpL3VzZXJfZGF0YS8iLCJ1c2VyX2RhdGFfdmVyaWZ5aW5nX2tleSI6eyJQdWJsaWNLZXkiOnsieCI6Ik1Ga3dFd1lIS29aSXpqMENBUVlJS29aSXpqMERBUWNEUWdBRTdmMFFvVlVzY2NCOXlNd0hBUjdvVmsvTCtaa1giLCJ5IjoiOFpxQzFaMFhUYWozQk1jTW5xaCtWemRIWlgzeUdLYTMrdWhOQWhLV1d5ZkIvciszRThyUFNIdFhYUT09In19LCJkdnJfdmVyaWZ5aW5nX2tleSI6eyJQdWJsaWNLZXkiOnsieCI6Ik1Ga3dFd1lIS29aSXpqMENBUVlJS29aSXpqMERBUWNEUWdBRXA2V0psd0F0bGQvVTRoRG1tdXVNZFpDVnRNZVUiLCJ5IjoiSVQzeGtEZFV3TE92c1ZWQStpaVN3ZmFYNEhxS2xSUERHRytGNldHam54eXM5VDVHdE5lM252ZXdPQT09In19fX0.H_u2ifd0zOQevrqGw7iPflhg2IFT7GuTEEiBMnadYf95eUq9xbc8z1Ucv4r1gSGn3tbHRE5oWzFOgzwRH2HB6Q";

/*
 * JWS {
 *   "data": {
 *     "healthcheck": "ping"
 *   }
 * }
 */
pub const MOCK_USER_DATA_TOKEN: &str =
    "eyJ0eXAiOiJKV1QiLCJqa3UiOiJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vZ2wtemtQYXNzL3prcGFzcy1zZGsvbWFpbi9kb2NzL3prcGFzcy9zYW1wbGUtandrcy9pc3N1ZXIta2V5Lmpzb24iLCJraWQiOiJrLTEiLCJhbGciOiJFUzI1NiJ9.eyJkYXRhIjp7ImhlYWx0aGNoZWNrIjoicGluZyJ9fQ.5hgvcGMSi-bRc4J_X6D7XH9ASpUpyoGBPJ3wfj4pRrHG6S9OiZb81ikLj-_uHglceSxzClYl2lDUGAhB1I6qvw";

pub fn init_mock_host_key_pairs() -> HostKeyPairs {
    let (encryption_public_key, signing_pub_key) = get_public_key();
    HostKeyPairs {
        encryption_key: KeyPair {
            private_key: r"-----BEGIN PRIVATE KEY-----
            MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLxxbcd7aVcNEdE/C
            EGPwLzM6lkLuDYzhd3FqALuuHCahRANCAASnpYmXAC2V39TiEOaa64x1kJW0x5Qh
            PfGQN1TAs6+xVUD6KJLB9pfgeoqVE8MYb4XpYaOfHKz1Pka017ee97A4
            -----END PRIVATE KEY-----".to_string(),
            public_key: encryption_public_key,
        },
        signing_key: KeyPair {
            private_key: r"-----BEGIN PRIVATE KEY-----
            MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg3J/wAlzSD8ZyAU8f
            bPkuCY/BSlq2Y2S5hym8sRccpZehRANCAATt/RChVSxxwH3IzAcBHuhWT8v5mRfx
            moLVnRdNqPcExwyeqH5XN0dlffIYprf66E0CEpZbJ8H+v7cTys9Ie1dd
            -----END PRIVATE KEY-----".to_string(),
            public_key: signing_pub_key,
        },
        decryption_request_option: None,
        key_service: KeyService::NATIVE,
        signing_keyset_endpoint: KeysetEndpoint {
            jku: "https://hostname/zkpass/jwks".to_string(),
            kid: "zkpass-dh-pubkey".to_string(),
        },
    }
}

pub fn get_request_generate_proof(mock_host_key_pairs: HostKeyPairs) -> RequestGenerateProof {
    let dvr_token = MOCK_DVR_TOKEN.to_string();
    let user_data_token = MOCK_USER_DATA_TOKEN.to_string();
    let public_key = mock_host_key_pairs.encryption_key.public_key.to_pem();
    let encrypted_dvr_token = encrypt_data_to_jwe_token(
        public_key.as_str(),
        Value::String(String::from(dvr_token))
    ).unwrap();
    let encrypted_user_data_token = encrypt_data_to_jwe_token(
        public_key.as_str(),
        Value::String(String::from(user_data_token))
    ).unwrap();

    RequestGenerateProof {
        dvr_token: encrypted_dvr_token,
        user_data_token: encrypted_user_data_token,
    }
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

#[allow(dead_code)]
pub fn get_verification_public_key_option() -> VerificationPublicKeyOption {
    VerificationPublicKeyOption {
        dvr_public_key_option: Some(
            PublicKeyOption::PublicKey(PublicKey {
                x: "x".to_string(),
                y: "y".to_string(),
            })
        ),
        user_data_public_key_option: Some(
            PublicKeyOption::KeysetEndpoint(KeysetEndpoint {
                jku: "jku".to_string(),
                kid: "kid".to_string(),
            })
        ),
    }
}

#[derive(Debug)]
pub struct MockSocketConnection {
    operation: String,
    first_time: bool, // for end the loop
}

impl MockSocketConnection {
    #[allow(dead_code)]
    pub fn new(operation: String) -> Self {
        Self { operation, first_time: true }
    }
}

impl SocketConnection for MockSocketConnection {
    fn send(&mut self, _payload: String) -> Result<(), ZkPassSocketError> {
        Ok(())
    }

    fn receive(&mut self) -> Result<String, ZkPassSocketError> {
        if !self.first_time {
            return Ok("".to_string()); // return empty string to end the loop
        }
        let result: String;
        if self.operation == "".to_string() {
            // for test_server_request_public_key_option
            let verification_public_keys = VerificationPublicKeys {
                dvr_key: PublicKey {
                    x: "dvr_public_key_x".to_string(),
                    y: "dvr_public_key_y".to_string(),
                },
                user_data_key: PublicKey {
                    x: "user_data_public_key_x".to_string(),
                    y: "user_data_public_key_y".to_string(),
                },
            };
            result = serde_json::to_string(&verification_public_keys).unwrap();
        } else {
            // for test_process_client
            self.first_time = false;
            result = match self.operation.as_str() {
                OPERATION_GENERATE_PROOF => {
                    let host_key_pairs = init_mock_host_key_pairs();
                    let request_payload = get_request_generate_proof(host_key_pairs);

                    let bytes = serde_json::to_string(&request_payload).unwrap();
                    let payload = format!(
                        "{}{}{}",
                        OPERATION_GENERATE_PROOF,
                        OPERATION_SEPARATOR,
                        bytes
                    );
                    payload
                }
                _ => "no operation".to_string(),
            };
        }
        Ok(result)
    }

    fn reconnect(self: &mut Self) -> Result<(), ZkPassSocketError> {
        Ok(())
    }
}
