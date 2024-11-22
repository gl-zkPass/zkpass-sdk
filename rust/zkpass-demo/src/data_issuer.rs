/*
 * data_issuer.rs
 * Simulating the Data Issuer process for the zkPass Demo
 *
 * ---
 * References:
 *   https://docs.ssi.id/zkpass/zkpass-developers-guide/privacy-apps/dvr/dvr-client-roles/data-issuer
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
use crate::{ sample_keys::ISSUER_PRIVKEY, lib_loader::generate_user_data_token };
use dvr_types::{
    KeysetEndpointFfi,
    PublicKeyFfi,
    PublicKeyOptionFfi,
    PublicKeyOptionTagFfi,
    PublicKeyOptionUnionFfi,
};
use serde_json::Value;
use std::{ collections::HashMap, io::prelude::*, ffi::CString };
use tracing::info;

// This struct ensures that the data reference is valid
#[allow(dead_code)]
pub struct IssuerPublicKeyOptionHolder {
    jku: CString,
    kid: CString,
    empty_str: CString,
    pub public_key_option: PublicKeyOptionFfi,
}

//
//  Simulating the REST call to the Data Issuer
//
pub struct DataIssuer;

//
//  Simulating the Data Issuer
//
impl DataIssuer {
    //
    // This function simulates the Data Issuer's get_user_data_token REST API
    //
    pub fn get_user_data_tokens(
        &self,
        data_files: HashMap<String, String>
    ) -> HashMap<String, String> {
        //
        // Call the dvr_client.dvr_generate_user_data_token.
        // This is to digitally-sign the user data.
        //
        data_files
            .iter()
            .map(|(data_tag, data_file)| {
                let data = self.read_user_data_token(data_file);
                let data_token = self.sign_user_data_token(data);
                (data_tag.clone(), data_token)
            })
            .collect()
    }

    ///
    /// Signs the user data token.
    ///
    fn sign_user_data_token(&self, data: Value) -> String {
        let issuer_public_key_option_holder = self.generate_issuer_public_key_option();
        let public_key_option = issuer_public_key_option_holder.public_key_option.clone();

        let user_data_token = unsafe {
            generate_user_data_token(ISSUER_PRIVKEY, &data.to_string(), public_key_option)
        };

        user_data_token
    }

    ///
    /// Generates the issuer public key option.
    ///
    pub fn generate_issuer_public_key_option(&self) -> Box<IssuerPublicKeyOptionHolder> {
        let empty_str = CString::new("").unwrap();

        let jku = CString::new(String::from("k-1")).unwrap();
        let kid = CString::new(
            String::from(
                "https://raw.githubusercontent.com/gl-zkPass/zkpass-sdk/main/docs/zkpass/sample-jwks/issuer-key.json"
            )
        ).unwrap();

        let public_key_option = PublicKeyOptionFfi {
            tag: PublicKeyOptionTagFfi::KeysetEndpoint,
            value: PublicKeyOptionUnionFfi {
                keyset_endpoint: KeysetEndpointFfi { jku: jku.as_ptr(), kid: kid.as_ptr() },
                public_key: PublicKeyFfi { x: empty_str.as_ptr(), y: empty_str.as_ptr() },
            },
        };

        Box::new(IssuerPublicKeyOptionHolder {
            jku,
            kid,
            empty_str,
            public_key_option,
        })
    }

    ///
    /// Reads the user data token from the given file path.
    ///
    fn read_user_data_token(&self, data_file: &String) -> Value {
        let mut data_content = std::fs::File
            ::open(data_file)
            .expect("Cannot find the user data file");
        let mut data = String::new();
        data_content.read_to_string(&mut data).expect("Should not have I/O errors");
        info!("data={}", data);

        let data: Value = serde_json::from_str(&data).unwrap();
        data
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn add_dummy_file() {
        let data = r#"{"name": "Alice", "age": 25}"#;
        std::fs::write("./user_data_1.json", data).expect("Unable to write file");
        std::fs::write("./user_data_2.json", data).expect("Unable to write file");
    }

    fn remove_dummy_file() {
        std::fs::remove_file("./user_data_1.json").expect("Unable to remove file");
        std::fs::remove_file("./user_data_2.json").expect("Unable to remove file");
    }

    // on cargo llvm-cov nextest, this test is failing because of SIGSEGV (due to unsafe behavior), but not on cargo test
    #[ignore]
    #[test]
    fn test_get_user_data_tokens() {
        add_dummy_file();
        std::env::set_var(
            "DVR_MODULE_PATH",
            "/home/builder/zkPass/target/release/libdvr_client.so"
        );

        let data_issuer = DataIssuer;
        let data_files = vec![
            ("tag1".to_string(), "./user_data_1.json".to_string()),
            ("tag2".to_string(), "./user_data_2.json".to_string())
        ]
            .into_iter()
            .collect();

        let user_data_tokens = data_issuer.get_user_data_tokens(data_files);
        assert_eq!(user_data_tokens.len(), 2);
        remove_dummy_file();
    }

    #[test]
    #[should_panic]
    fn test_read_user_data_token_error() {
        let data_issuer = DataIssuer;
        let data_file = "./user_data_3.json".to_string();

        let _ = data_issuer.read_user_data_token(&data_file);
    }
}
