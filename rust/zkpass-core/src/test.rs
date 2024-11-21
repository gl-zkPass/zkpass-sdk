#[cfg(test)]
mod tests {
    use async_trait::async_trait;
    use futures::executor::block_on;
    use josekit::{ jwe::JweHeader, jwt::JwtPayload };
    use maplit::hashmap;
    use serde_json::{ json, Value };
    use crate::{
        dvr_app::{
            dvr_helpers::verify_dvr_nested_token,
            interface::{
                DataVerificationRequest,
                KeysetEndpointResolver,
                UserDataRequest,
                VerifiedNestedTokenDvr,
                VerifiedNestedTokenUserData,
            },
            jwt_helpers::{
                decrypt_jwe_token,
                encrypt_data_to_jwe_token,
                sign_data_to_jws_token,
                verify_jws_token,
            },
            user_data_helpers::{ encode_user_data_tokens, verify_user_data_nested_token },
        },
        privacy_apps::interface::{ KeysetEndpoint, PublicKey, PublicKeyOption },
    };

    const RECIPIENT_PRIVKEY: &str =
        r"-----BEGIN PRIVATE KEY-----
        MIGEAgEAMBAGByqGSM49AgEGBSuBBAAKBG0wawIBAQQgmCciFlxKpprQRqlLFnnh
        9eiKAditGlfOssFKjLZ0tF+hRANCAARTiTnflkU7RIJdSBNe6/KAGmOFwHRPZVYw
        le25LC6VqsKfh0vKFLnI+zz2LHbluvJGhbBvqHQwSPHWxmWivTEn
        -----END PRIVATE KEY-----";

    const RECIPIENT_PUBKEY: &str =
        r"-----BEGIN PUBLIC KEY-----
        MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEU4k535ZFO0SCXUgTXuvygBpjhcB0T2VW
        MJXtuSwularCn4dLyhS5yPs89ix25bryRoWwb6h0MEjx1sZlor0xJw==
        -----END PUBLIC KEY-----";

    const SENDER_PRIVKEY: &str =
        r"-----BEGIN PRIVATE KEY-----
        MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLxxbcd7aVcNEdE/C
        EGPwLzM6lkLuDYzhd3FqALuuHCahRANCAASnpYmXAC2V39TiEOaa64x1kJW0x5Qh
        PfGQN1TAs6+xVUD6KJLB9pfgeoqVE8MYb4XpYaOfHKz1Pka017ee97A4
        -----END PRIVATE KEY-----";

    const SENDER_PUBKEY: &str =
        r"-----BEGIN PUBLIC KEY-----
        MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU
        IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA==
        -----END PUBLIC KEY-----";

    fn mock_user_data_request(x: &str, y: &str) -> UserDataRequest {
        UserDataRequest {
            user_data_url: Some(String::from("https://data-issuer.org")),
            user_data_verifying_key: PublicKeyOption::PublicKey(PublicKey {
                x: String::from(x),
                y: String::from(y),
            }),
        }
    }

    #[test]
    fn test_user_data_nested_token() {
        println!("============================");
        println!("== user data nested token ==");
        println!("============================");

        let data = json!(
            {"name":"John", "age":30}
        );
        let data2 = data.clone();
        println!("data={:#?}", data);
        let tag = String::from("data1");

        let kid = String::from("mykey");
        let jku = String::from("https://hostname.com/jwks");
        let ep = KeysetEndpoint { kid, jku };
        let jws_token = sign_data_to_jws_token(SENDER_PRIVKEY, data, Some(ep.clone())).unwrap();

        let jwe_payload = encode_user_data_tokens(
            &(hashmap! {
                tag.clone() => jws_token,
            })
        );

        let jwe_token = encrypt_data_to_jwe_token(
            RECIPIENT_PUBKEY,
            Value::from(jwe_payload)
        ).unwrap();

        let ver_token = verify_user_data_nested_token(
            &(hashmap! {
                tag.clone() => String::from(SENDER_PUBKEY),
            }),
            RECIPIENT_PRIVKEY,
            &jwe_token
        ).unwrap();
        let serialized_ver_token = serde_json::to_string(&ver_token).unwrap();
        let deserialized_ver_token: VerifiedNestedTokenUserData = serde_json
            ::from_str(&serialized_ver_token)
            .unwrap();
        assert_eq!(ver_token.outer_header, deserialized_ver_token.outer_header);
        println!("ver_token.payloads={:#?}", ver_token.payloads);

        assert_eq!(&data2, ver_token.payloads.get(&tag).unwrap());

        //error verify_user_data_nested_token, not a correct jws_tokens
        let jwe_payload = encode_user_data_tokens(
            &(hashmap! {
                tag.clone() => r#"{"key1":"value1","key2":"value2"}"#.to_string(),
            })
        );
        let jwe_token = encrypt_data_to_jwe_token(
            RECIPIENT_PUBKEY,
            Value::from(jwe_payload)
        ).unwrap();

        let ver_token = verify_user_data_nested_token(
            &(hashmap! {
                tag.clone() => String::from(SENDER_PUBKEY),
            }),
            RECIPIENT_PRIVKEY,
            &jwe_token
        );
        assert!(ver_token.is_err());
    }

    struct DummyResolver;
    #[async_trait]
    impl KeysetEndpointResolver for DummyResolver {
        async fn get_key(&self, _jku: &str, _kid: &str) -> PublicKey {
            let future = async {
                PublicKey {
                    x: String::from(
                        "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU"
                    ),
                    y: String::from("IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA=="),
                }
            };

            future.await
        }
    }

    fn get_resolver() -> Box<dyn KeysetEndpointResolver> {
        Box::new(DummyResolver)
    }

    #[test]
    fn test_dvr_nested_token() {
        println!("======================");
        println!("== dvr nested token ==");
        println!("======================");

        let dvr_id = "01021902";
        let query = "true";
        let x = "91829182";
        let y = "08989839";

        let dvr = DataVerificationRequest {
            zkvm: String::from("r0"),
            dvr_title: String::from("The DVR Title"),
            dvr_id: String::from(dvr_id),
            query_engine_ver: String::from("123456"),
            query_method_ver: String::from("9281212"),
            query: String::from(query),
            user_data_requests: hashmap! {
                String::from("") => mock_user_data_request(x, y),
            },
            dvr_verifying_key: None,
        };
        let dvr2 = dvr.clone();

        let kid = String::from("dvr-key");
        let jku = String::from("https://hostname.com/dvr");
        let ep = KeysetEndpoint {
            kid: kid.clone(),
            jku: jku.clone(),
        };
        let jws_token = sign_data_to_jws_token(SENDER_PRIVKEY, json!(dvr), Some(ep)).unwrap();

        let jwe_token = encrypt_data_to_jwe_token(RECIPIENT_PUBKEY, json!(jws_token)).unwrap();

        let resolver = get_resolver();

        let ver_token = block_on(
            verify_dvr_nested_token(&resolver, RECIPIENT_PRIVKEY, &jwe_token)
        ).unwrap();
        let serialized_ver_token = serde_json::to_string(&ver_token).unwrap();
        let deserialized_ver_token: VerifiedNestedTokenDvr = serde_json
            ::from_str(&serialized_ver_token)
            .unwrap();
        assert_eq!(ver_token.outer_header, deserialized_ver_token.outer_header);

        println!("ver_token.payload={:#?}", ver_token.dvr);
        assert!(dvr2 == ver_token.dvr);
    }

    #[test]
    fn test_sign() {
        println!("=============");
        println!("== signing ==");
        println!("=============");
        let data = json!({"name": "Max", "age": 17});
        println!("data={}", data);
        let data_cloned = data.clone();

        let kid = String::from("mykey");
        let jku = String::from("https://hostname.com/jwks");
        let ep = KeysetEndpoint { kid, jku };

        let jws_token = sign_data_to_jws_token(SENDER_PRIVKEY, data, Some(ep)).unwrap();
        println!("jws-token={}", jws_token);

        // Verifying JWT
        let (data_signed, _header) = verify_jws_token(SENDER_PUBKEY, &jws_token).unwrap();
        println!("data_signed={}", data_signed);
        assert!(data_signed == data_cloned);
    }

    #[test]
    fn test_encrypt() {
        println!("================");
        println!("== encrypting ==");
        println!("================");
        let data2 = json!({"name": "Tony", "age": 55});
        let data2_org = data2.to_string();
        println!("payload={}", data2);
        let jwe_token = encrypt_data_to_jwe_token(RECIPIENT_PUBKEY, data2).unwrap();
        println!("jwe-token={}", jwe_token);

        // Decrypting JWT
        let (payload2, _header) = decrypt_jwe_token(RECIPIENT_PRIVKEY, &jwe_token).unwrap();
        assert!(payload2 == data2_org);
        println!("payload2={}", payload2);
    }

    #[test]
    fn test_error_decrypt_jwe_token() {
        //error not a correct key
        let key = "test_key";
        let jwe_token = "token";
        let result = decrypt_jwe_token(key, jwe_token);
        assert!(result.is_err());

        //error not a correct token
        let result = decrypt_jwe_token(RECIPIENT_PRIVKEY, &jwe_token);
        assert!(result.is_err());

        // error missing root data element
        let data = json!({"name": "Max", "age": 17});
        let mut header = JweHeader::new();
        let mut payload = JwtPayload::new();
        let user_data: Option<Value> = Some(data);

        header.set_token_type("JWT");
        header.set_content_encryption("A256GCM");
        payload.set_claim("test", user_data).unwrap();

        let encrypter = josekit::jwe::ECDH_ES.encrypter_from_pem(RECIPIENT_PUBKEY).unwrap();
        let jwe_token = josekit::jwt::encode_with_encrypter(&payload, &header, &encrypter).unwrap();
        let result = decrypt_jwe_token(RECIPIENT_PRIVKEY, &jwe_token);
        assert!(result.is_err());
    }

    #[test]
    fn test_dvr_digest_not_affected_by_hashmap_order() {
        let tag1 = "abc1";
        let user_data_req1 = mock_user_data_request("123", "456");
        let tag2 = "def2";
        let user_data_req2 = mock_user_data_request("789", "abc");
        let tag3 = "ghi3";
        let user_data_req3 = mock_user_data_request("def", "ghi");

        let dvr1 = DataVerificationRequest {
            zkvm: String::from("r0"),
            dvr_title: String::from("The DVR Title"),
            dvr_id: String::from("UUIDv4"),
            query_engine_ver: String::from("123456"),
            query_method_ver: String::from("9281212"),
            query: String::from("true"),
            user_data_requests: hashmap! {
                String::from(tag1) => user_data_req1.clone(),
                String::from(tag2) => user_data_req2.clone(),
                String::from(tag3) => user_data_req3.clone(),
            },
            dvr_verifying_key: None,
        };
        let mut dvr2 = dvr1.clone();
        dvr2.user_data_requests =
            hashmap! {
                String::from(tag2) => user_data_req2.clone(),
                String::from(tag3) => user_data_req3.clone(),
                String::from(tag1) => user_data_req1.clone(),
            };
        let mut dvr3 = dvr1.clone();
        dvr3.user_data_requests =
            hashmap! {
                String::from(tag3) => user_data_req3.clone(),
                String::from(tag1) => user_data_req1.clone(),
                String::from(tag2) => user_data_req2.clone(),
            };

        let expected_digest = String::from(
            "c5acef6bedd47a8de15c71be0a5c5bbda195eb9d069a247e2dabbe9802ed995a"
        );
        assert_eq!(dvr1.get_sha256_digest(), expected_digest);
        assert_eq!(dvr1.get_sha256_digest(), dvr2.get_sha256_digest());
        assert_eq!(dvr1.get_sha256_digest(), dvr3.get_sha256_digest());
        assert_eq!(dvr2.get_sha256_digest(), dvr3.get_sha256_digest());
    }

    #[test]
    fn test_sign_data_to_jws_token_error() {
        let signing_key = "signing_key";
        let data = json!({"key": "value"});
        let verifying_key_jwks = None;

        // not a correct key
        let result = sign_data_to_jws_token(signing_key, data, verifying_key_jwks);
        assert!(result.is_err());
    }

    #[test]
    fn test_verify_jws_token_error() {
        let key = "verifying_key";
        let jws_token = "token";

        // not a correct key
        let result = verify_jws_token(key, jws_token);
        assert!(result.is_err());

        // not a correct token
        let result = verify_jws_token(SENDER_PUBKEY, &jws_token);
        assert!(result.is_err());

        // wrong key
        let jws_token = sign_data_to_jws_token(
            SENDER_PRIVKEY,
            json!({"key": "value"}),
            None
        ).unwrap();
        let result = verify_jws_token(RECIPIENT_PUBKEY, &jws_token);
        assert!(result.is_err());
    }
}
