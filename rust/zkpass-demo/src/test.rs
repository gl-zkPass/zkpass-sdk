#[cfg(test)]
mod tests {
    use hex;
    use sha2::{Digest, Sha256};
    use zkpass_client::core::{
        DataVerificationRequest, PublicKey, PublicKeyOption, ZkPassError, ZkPassProof,
    };

    #[test]
    fn test_access() {
        // this is to make sure all public types defined in zkpass-core::interface are accessible
        let _error = ZkPassError::NotImplementedError;

        let pubkey2 = PublicKey {
            x: String::from("1234"),
            y: String::from("9123"),
        };
        let _dvr = DataVerificationRequest {
            zkvm: String::from("r0"),
            dvr_title: String::from("title"),
            dvr_id: String::from("myid"),
            user_data_url: Some(String::from("https://xyz-issuer.com")),
            user_data_verifying_key: PublicKeyOption::PublicKey(pubkey2),
            query_engine_ver: String::from("1.0.2"),
            query_method_ver: String::from("12122121"),
            query: String::from(""),
            dvr_verifying_key: None,
        };

        let pubkey = PublicKey {
            x: String::from("9480"),
            y: String::from("9232"),
        };
        let pubkey2 = PublicKey {
            x: String::from("9480"),
            y: String::from("9232"),
        };
        let mut hasher = Sha256::new();
        hasher.update(serde_json::to_string(&_dvr).unwrap());
        let digest = hex::encode(hasher.finalize());

        let digest2 = _dvr.get_sha256_digest();
        assert!(digest == digest2);
        println!("digest={}", digest2);

        let _zkpass_proof = ZkPassProof {
            zkproof: String::from("xxx"),
            dvr_verifying_key: pubkey,
            user_data_verifying_key: pubkey2,
            dvr_title: String::from("dvr title"),
            dvr_id: String::from("12179312"),
            dvr_digest: digest,
            time_stamp: 123,
        };
    }
}
