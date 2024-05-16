#[cfg(test)]
mod tests {
    // use std::time::{SystemTime, UNIX_EPOCH};
    use zkpass_core::interface::*;
    use zkpass_svc_common::interface::*;
    //use r0_zkpass_query::{create_zkpass_query_engine, ZkPassQueryEngine};
    use crate::generate_zkpass_proof::generate_zkpass_proof;
    use crate::keys::HOST_KEY_PAIRS;
    use crate::server::utils::{ decrypt_tokens, request_verification_keyset, DecryptedTokens };
    // use async_trait::async_trait;
    use futures::executor::block_on;
    use serde_json::json;

    //
    //  TODO:
    //  These 2 private keys of zkPass must be managed by key manager
    //
    //  For AWS/Nitro deployment, AWS KMS must be used to provision the private keys
    //
    const ZKPASS_PRIVKEY: &str =
        r"-----BEGIN PRIVATE KEY-----
    MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLxxbcd7aVcNEdE/C
    EGPwLzM6lkLuDYzhd3FqALuuHCahRANCAASnpYmXAC2V39TiEOaa64x1kJW0x5Qh
    PfGQN1TAs6+xVUD6KJLB9pfgeoqVE8MYb4XpYaOfHKz1Pka017ee97A4
    -----END PRIVATE KEY-----";

    // const ZKPASS_ECDH_PRIVKEY: &str = r"-----BEGIN PRIVATE KEY-----
    // MIGEAgEAMBAGByqGSM49AgEGBSuBBAAKBG0wawIBAQQgmCciFlxKpprQRqlLFnnh
    // 9eiKAditGlfOssFKjLZ0tF+hRANCAARTiTnflkU7RIJdSBNe6/KAGmOFwHRPZVYw
    // le25LC6VqsKfh0vKFLnI+zz2LHbluvJGhbBvqHQwSPHWxmWivTEn
    // -----END PRIVATE KEY-----";

    const ZKPASS_PUBKEY: &str =
        r"-----BEGIN PUBLIC KEY-----
    MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU
    IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==
    -----END PUBLIC KEY-----";

    // const ZKPASS_ECDH_PUBKEY: &str = r"-----BEGIN PUBLIC KEY-----
    // MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEU4k535ZFO0SCXUgTXuvygBpjhcB0T2VW
    // MJXtuSwularCn4dLyhS5yPs89ix25bryRoWwb6h0MEjx1sZlor0xJw==
    // -----END PUBLIC KEY-----";

    const ISSUER_PRIVKEY: &str =
        r"-----BEGIN PRIVATE KEY-----
    MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg3J/wAlzSD8ZyAU8f
    bPkuCY/BSlq2Y2S5hym8sRccpZehRANCAATt/RChVSxxwH3IzAcBHuhWT8v5mRfx
    moLVnRdNqPcExwyeqH5XN0dlffIYprf66E0CEpZbJ8H+v7cTys9Ie1dd
    -----END PRIVATE KEY-----";

    // const ISSUER_PUBKEY: &str = r"-----BEGIN PUBLIC KEY-----
    // MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7f0QoVUsccB9yMwHAR7oVk/L+ZkX
    // 8ZqC1Z0XTaj3BMcMnqh+VzdHZX3yGKa3+uhNAhKWWyfB/r+3E8rPSHtXXQ==
    // -----END PUBLIC KEY-----";

    const VERIFIER_PRIVKEY: &str =
        r"-----BEGIN PRIVATE KEY-----
    MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLxxbcd7aVcNEdE/C
    EGPwLzM6lkLuDYzhd3FqALuuHCahRANCAASnpYmXAC2V39TiEOaa64x1kJW0x5Qh
    PfGQN1TAs6+xVUD6KJLB9pfgeoqVE8MYb4XpYaOfHKz1Pka017ee97A4
    -----END PRIVATE KEY-----";

    // const VERIFIER_PUBKEY: &str = r"-----BEGIN PUBLIC KEY-----
    // MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU
    // IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==
    // -----END PUBLIC KEY-----";

    // struct DummyResolver;
    // #[async_trait]
    // impl KeysetEndpointResolver for DummyResolver {
    //     async fn get_key(&self, _jku: &str, _kid: &str) -> PublicKey {
    //         let future = async {
    //             PublicKey {
    //                 x: String::from(
    //                     "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU",
    //                 ),
    //                 y: String::from("IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA=="),
    //             }
    //         };

    //         future.await
    //     }
    // }
    // fn get_resolver() -> Box<dyn KeysetEndpointResolver> {
    //     Box::new(DummyResolver) as Box<dyn KeysetEndpointResolver>
    // }

    #[tokio::test]
    async fn test() {
        //
        //  Data Issuer
        //  - has the user data and signs it into data_token
        //  - sends the data token to the user
        //
        let data =
            json!(
        {
            "bcaDocID": "DOC897923CP",
            "bcaDocName": "BCA Customer Profile",
            "customerID": "BCA123756108",
            "personalInfo": {
                "firstName": "Ramana",
                "lastName": "Maharshi",
                "dateOfBirth": "1970-10-08",
                "driverLicenseNumber": "DL77108108"
            },
            "financialInfo": {
                "averageMonthlyBalance": 200000000,
                "creditRatings": {
                "pefindo": 710,
                "CreditKarma": 755,
                "EquiInfo": 695
                },
                "accounts": {
                "checking": {
                    "accountNumber": "CHK1238569",
                    "balance": 89000000
                },
                "savings": {
                    "accountNumber": "SAV1231770",
                    "balance": 380000000
                }
                }
            },
            "loanHistory": [
                {
                "loanType": "auto",
                "loanAmount": 500000000,
                "loanStatus": "closed"
                }
            ],
            "contactInfo": {
                "email": "Ramana.Maharshi@karma.org",
                "phone": "+62-856-685-0108"
            },
            "flags": {
                "isOverdraftProtected": true,
                "isVIP": false,
                "fraudAlerts": false
            }
        }
        );
        // let data2 = data.clone();
        //println!("data={:#?}", data);

        let kid = String::from("mykey");
        let jku = String::from("https://hostname.com/jwks/data");
        let ep = KeysetEndpoint { kid, jku };
        // issuer's pubkey:
        // x: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7f0QoVUsccB9yMwHAR7oVk/L+ZkX"
        // y: "8ZqC1Z0XTaj3BMcMnqh+VzdHZX3yGKa3+uhNAhKWWyfB/r+3E8rPSHtXXQ=="
        // #### data token ####
        let data_token = sign_data_to_jws_token(ISSUER_PRIVKEY, data, Some(ep)).unwrap();
        // #### data token ####

        //
        // Proof Verifier
        // - has dvr and signs it into dvr_token
        // - sends the dvr_token to the user
        //
        let query =
            json!(
            {
                "and": [
                {
                    "==": [
                    "bcaDocID",
                    "DOC897923CP"
                    ]
                },
                {
                    "~==": [
                    "personalInfo.firstName",
                    "Ramana"
                    ]
                },
                {
                    "~==": [
                    "personalInfo.lastName",
                    "Maharshi"
                    ]
                },
                {
                    "~==": [
                    "personalInfo.driverLicenseNumber",
                    "DL77108108"
                    ]
                },
                {
                    ">=": [
                    "financialInfo.creditRatings.pefindo",
                    650
                    ]
                },
                {
                    ">=": [
                    "financialInfo.accounts.savings.balance",
                    55000000
                    ]
                }
                ]
            }
        );

        let dvr_id = "12345678";
        // issuer's pubkey params:
        let x = "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7f0QoVUsccB9yMwHAR7oVk/L+ZkX";
        let y = "8ZqC1Z0XTaj3BMcMnqh+VzdHZX3yGKa3+uhNAhKWWyfB/r+3E8rPSHtXXQ==";

        let dvr = DataVerificationRequest {
            zkvm: String::from("r0"),
            dvr_title: String::from("My DVR"),
            dvr_id: String::from(dvr_id),
            query_engine_ver: String::from("1.0.2"),
            query_method_ver: String::from("918912819"),
            query: serde_json::to_string(&query).unwrap(),
            user_data_url: Some(String::from("https://xyz.com")),
            user_data_verifying_key: PublicKeyOption::PublicKey(PublicKey {
                x: String::from(x),
                y: String::from(y),
            }),
            dvr_verifying_key: None,
        };

        let kid = String::from("mykey");
        let jku = String::from("https://hostname.com/jwks/dvr");
        let ep = KeysetEndpoint { kid, jku };
        // #### dvr token ####
        let dvr_token = sign_data_to_jws_token(VERIFIER_PRIVKEY, json!(dvr), Some(ep)).unwrap();
        // #### dvr token ####

        //
        //  Data Holder (User)
        //  - receives the data_token and the dvr_token
        //  - encrypts both tokens into data_nested_token and dvr_nested_token respectively
        //  - sends both nested tokens to zkpass-ws via rest api call
        //
        let data_nested_token = encrypt_data_to_jwe_token(
            ZKPASS_PUBKEY,
            json!(data_token)
        ).unwrap();
        let dvr_nested_token = encrypt_data_to_jwe_token(ZKPASS_PUBKEY, json!(dvr_token)).unwrap();

        //
        //  zkpass-ws
        //  - receives both data_nested_token and dvr_nested_token via rest api from the user
        //  - sends both tokens to zkpass-host as-is via vsock
        //

        //
        // zkpass-host
        //  - receives both data_nested_token and dvr_nested_token from zkpass-ws
        //  - sent to zkpass-ws to retrieve the verifying key for dvr & user data
        //

        *HOST_KEY_PAIRS.lock().await = HostKeyPairs {
            encryption_key: KeyPair {
                private_key: r"-----BEGIN PRIVATE KEY-----
                            MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLxxbcd7aVcNEdE/C
                            EGPwLzM6lkLuDYzhd3FqALuuHCahRANCAASnpYmXAC2V39TiEOaa64x1kJW0x5Qh
                            PfGQN1TAs6+xVUD6KJLB9pfgeoqVE8MYb4XpYaOfHKz1Pka017ee97A4
                            -----END PRIVATE KEY-----".to_string(),
                public_key: PublicKey {
                    x: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU".to_string(),
                    y: "IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==".to_string(),
                },
            },
            signing_key: KeyPair {
                private_key: r"-----BEGIN PRIVATE KEY-----
                            MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLxxbcd7aVcNEdE/C
                            EGPwLzM6lkLuDYzhd3FqALuuHCahRANCAASnpYmXAC2V39TiEOaa64x1kJW0x5Qh
                            PfGQN1TAs6+xVUD6KJLB9pfgeoqVE8MYb4XpYaOfHKz1Pka017ee97A4
                            -----END PRIVATE KEY-----".to_string(),
                public_key: PublicKey {
                    x: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU".to_string(),
                    y: "IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==".to_string(),
                },
            },
            decryption_request_option: None,
            key_service: KeyService::NATIVE,
            signing_keyset_endpoint: KeysetEndpoint {
                jku: String::from("https://hostname/zkpass/jwks"),
                kid: String::from("zkpass-dh-pubkey"),
            },
        };

        let request_generate_proof_object = RequestGenerateProof {
            dvr_token: dvr_nested_token.clone(),
            user_data_token: data_nested_token.clone(),
        };

        let decrypted_tokens: DecryptedTokens = decrypt_tokens(
            request_generate_proof_object.clone()
        ).await.unwrap();
        request_verification_keyset(&decrypted_tokens.dvr_token).unwrap();

        // zkpass-ws
        //  - retrieve the keys from keyset endpoint
        //  - sent to zkpass-host

        let issuer_verifier_keys = VerificationPublicKeys {
            user_data_key: PublicKey {
                x: String::from("MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE7f0QoVUsccB9yMwHAR7oVk/L+ZkX"),
                y: String::from("8ZqC1Z0XTaj3BMcMnqh+VzdHZX3yGKa3+uhNAhKWWyfB/r+3E8rPSHtXXQ=="),
            },
            dvr_key: PublicKey {
                x: String::from("MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU"),
                y: String::from("IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA=="),
            },
        };

        //
        // zkpass-host
        //  - call generate_zkproof
        //  - returns the zkproof_token to zkpass-ws
        //
        // let resolver = get_resolver();
        let signing_key_ep = KeysetEndpoint {
            jku: String::from("https://hostname/zkpass/jwks"),
            kid: String::from("zkpass-dh-pubkey"),
        };
        let zkpass_proof_token = block_on(
            generate_zkpass_proof(
                data_nested_token.as_str(),
                dvr_nested_token.as_str(),
                issuer_verifier_keys,
                ZKPASS_PRIVKEY,
                ZKPASS_PRIVKEY,
                &signing_key_ep
            )
        ).unwrap();

        //
        //  zkpass-ws
        //  - receives zkproof_token from zkpass-host
        //  - returns zkproof_token to the user as the return value of the rest api call
        //
        println!("zkpass_proof_token=[{}]", shorten_string(&zkpass_proof_token, 100));
        println!("dvr digest=[{}]", dvr.get_sha256_digest());
    }

    fn shorten_string(input: &str, max_length: usize) -> String {
        if input.len() <= max_length {
            return input.to_string();
        }

        let half_ellipsis_length = (max_length - 3) / 2;
        let first_half = &input[0..half_ellipsis_length];
        let second_half = &input[input.len() - half_ellipsis_length..];

        format!("{}...{}", first_half, second_half)
    }
}
