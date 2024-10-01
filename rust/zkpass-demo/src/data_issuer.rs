use serde_json::Value;
use std::collections::HashMap;
use std::io::prelude::*;
use tracing::info;
use zkpass_client::core::KeysetEndpoint;
use zkpass_client::interface::{ZkPassClient, ZkPassUtility};

use crate::constants::ISSUER_PRIVKEY;

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
        zkvm: &str,
        data_files: HashMap<String, String>,
    ) -> HashMap<String, String> {
        //
        //  Data Issuer's integration points with the zkpass-client SDK library
        //

        //
        // Step 1: Instantiate the zkpass_client object
        //
        let zkpass_client = ZkPassClient::new("", None, zkvm);

        //
        // Step 2: Call the zkpass_client.sign_data_to_jws_token.
        //         This is to digitally-sign the user data.
        //
        data_files
            .iter()
            .map(|(data_tag, data_file)| {
                let data = self.read_user_data_token(data_file);
                let data_token = self.sign_user_data_token(&zkpass_client, data);
                (data_tag.clone(), data_token)
            })
            .collect()
    }

    fn sign_user_data_token(&self, zkpass_client: &ZkPassClient, data: Value) -> String {
        let kid = String::from("k-1");
        let jku = String::from(
            "https://raw.githubusercontent.com/gl-zkPass/zkpass-sdk/main/docs/zkpass/sample-jwks/issuer-key.json"
        );
        let ep = KeysetEndpoint { jku, kid };
        zkpass_client
            .sign_data_to_jws_token(ISSUER_PRIVKEY, data, Some(ep))
            .unwrap()
    }

    fn read_user_data_token(&self, data_file: &String) -> Value {
        let mut data_content =
            std::fs::File::open(data_file).expect("Cannot find the user data file");
        let mut data = String::new();
        data_content
            .read_to_string(&mut data)
            .expect("Should not have I/O errors");
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

    #[test]
    fn test_get_user_data_tokens() {
        add_dummy_file();

        let data_issuer = DataIssuer;
        let zkvm = "sp1";
        let data_files = vec![
            ("tag1".to_string(), "./user_data_1.json".to_string()),
            ("tag2".to_string(), "./user_data_2.json".to_string()),
        ]
        .into_iter()
        .collect();

        let user_data_tokens = data_issuer.get_user_data_tokens(zkvm, data_files);
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
