#[cfg(test)]
mod tests {
    use crate::{dvr_helpers::*, interface::*, jwt_helpers::*, user_data_helpers::*};
    use async_trait::async_trait;
    use futures::executor::block_on;
    use maplit::hashmap;
    use serde_json::{json, Value};

    const RECIPIENT_PRIVKEY: &str = r"-----BEGIN PRIVATE KEY-----
        MIGEAgEAMBAGByqGSM49AgEGBSuBBAAKBG0wawIBAQQgmCciFlxKpprQRqlLFnnh
        9eiKAditGlfOssFKjLZ0tF+hRANCAARTiTnflkU7RIJdSBNe6/KAGmOFwHRPZVYw
        le25LC6VqsKfh0vKFLnI+zz2LHbluvJGhbBvqHQwSPHWxmWivTEn
        -----END PRIVATE KEY-----";

    const RECIPIENT_PUBKEY: &str = r"-----BEGIN PUBLIC KEY-----
        MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEU4k535ZFO0SCXUgTXuvygBpjhcB0T2VW
        MJXtuSwularCn4dLyhS5yPs89ix25bryRoWwb6h0MEjx1sZlor0xJw==
        -----END PUBLIC KEY-----";

    const SENDER_PRIVKEY: &str = r"-----BEGIN PRIVATE KEY-----
        MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgLxxbcd7aVcNEdE/C
        EGPwLzM6lkLuDYzhd3FqALuuHCahRANCAASnpYmXAC2V39TiEOaa64x1kJW0x5Qh
        PfGQN1TAs6+xVUD6KJLB9pfgeoqVE8MYb4XpYaOfHKz1Pka017ee97A4
        -----END PRIVATE KEY-----";

    const SENDER_PUBKEY: &str = r"-----BEGIN PUBLIC KEY-----
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
        let jws_token = sign_data_to_jws_token(SENDER_PRIVKEY, data, Some(ep)).unwrap();

        let jwe_payload = encode_user_data_tokens(
            &(hashmap! {
                tag.clone() => jws_token,
            }),
        );

        let jwe_token =
            encrypt_data_to_jwe_token(RECIPIENT_PUBKEY, Value::from(jwe_payload)).unwrap();

        let ver_token = verify_user_data_nested_token(
            &(hashmap! {
                tag.clone() => String::from(SENDER_PUBKEY),
            }),
            RECIPIENT_PRIVKEY,
            &jwe_token,
        )
        .unwrap();
        println!("ver_token.payloads={:#?}", ver_token.payloads);

        assert_eq!(&data2, ver_token.payloads.get(&tag).unwrap());
    }

    struct DummyResolver;
    #[async_trait]
    impl KeysetEndpointResolver for DummyResolver {
        async fn get_key(&self, _jku: &str, _kid: &str) -> PublicKey {
            let future = async {
                PublicKey {
                    x: String::from(
                        "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEp6WJlwAtld/U4hDmmuuMdZCVtMeU",
                    ),
                    y: String::from("IT3xkDdUwLOvsVVA+iiSwfaX4HqKlRPDGG+F6WGjnxys9T5GtNe3nvewOA=="),
                }
            };

            future.await
        }
    }

    fn get_resolver() -> Box<dyn KeysetEndpointResolver> {
        Box::new(DummyResolver) as Box<dyn KeysetEndpointResolver>
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

        let verify_dvr_publickey = block_on(get_resolver().get_key(&jku.clone(), &kid.clone()));

        let ver_token =
            verify_dvr_nested_token(verify_dvr_publickey, RECIPIENT_PRIVKEY, &jwe_token).unwrap();

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
        dvr2.user_data_requests = hashmap! {
            String::from(tag2) => user_data_req2.clone(),
            String::from(tag3) => user_data_req3.clone(),
            String::from(tag1) => user_data_req1.clone(),
        };
        let mut dvr3 = dvr1.clone();
        dvr3.user_data_requests = hashmap! {
            String::from(tag3) => user_data_req3.clone(),
            String::from(tag1) => user_data_req1.clone(),
            String::from(tag2) => user_data_req2.clone(),
        };

        let expected_digest =
            String::from("c5acef6bedd47a8de15c71be0a5c5bbda195eb9d069a247e2dabbe9802ed995a");
        assert_eq!(dvr1.get_sha256_digest(), expected_digest);
        assert_eq!(dvr1.get_sha256_digest(), dvr2.get_sha256_digest());
        assert_eq!(dvr1.get_sha256_digest(), dvr3.get_sha256_digest());
        assert_eq!(dvr2.get_sha256_digest(), dvr3.get_sha256_digest());
    }
}
