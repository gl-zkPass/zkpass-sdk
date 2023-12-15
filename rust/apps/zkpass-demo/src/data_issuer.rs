//
//  Simulating the REST call to the Data Issuer
//

#[cfg(feature = "oop")]
pub mod issuer {
    use std::io::prelude::*;
    use serde_json::{Value};
    use zkpass_client::core::KeysetEndpoint;
    use zkpass_client::interface::{DataIssuer};

    pub struct MyDataIssuer;

    impl DataIssuer for MyDataIssuer {}

    impl MyDataIssuer {
        //
        // This function simulates the Data Issuer's get_user_data_token REST API
        //
        pub fn get_user_data_token(&self, data_file: &str) -> String {
            const ISSUER_PRIVKEY: &str = r"-----BEGIN PRIVATE KEY-----
            MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg3J/wAlzSD8ZyAU8f
            bPkuCY/BSlq2Y2S5hym8sRccpZehRANCAATt/RChVSxxwH3IzAcBHuhWT8v5mRfx
            moLVnRdNqPcExwyeqH5XN0dlffIYprf66E0CEpZbJ8H+v7cTys9Ie1dd
            -----END PRIVATE KEY-----";

            let mut data_content = std::fs::File::open(data_file).expect("Cannot find the user data file");
            let mut data = String::new();
            data_content
                .read_to_string(&mut data)
                .expect("Should not have I/O errors");
            println!("data={}", data);

            let data: Value = serde_json::from_str(&data).unwrap();

            let kid = String::from("k-1");
            let jku = String::from(
                "https://gdp-admin.github.io/zkpass-sdk/zkpass/sample-jwks/issuer-key.json",
            );
            let ep = KeysetEndpoint { jku, kid };

            //
            //  Data Issuer's integration points with the zkpass-client SDK library
            //
            let data_token = self.sign_user_data(
                ISSUER_PRIVKEY,
                data,
                Some(ep))
            .unwrap();

            //println!("data_token={}", data_token);
            data_token
        }
    }
}

#[cfg(feature = "straight")]
pub mod issuer {
    use std::io::prelude::*;
    use serde_json::{json, Value};
    use zkpass_client::core::KeysetEndpoint;
    use zkpass_client::interface::{ZkPassClient, ZkPassUtility};
    pub struct MyDataIssuer;
        impl MyDataIssuer {
            //
            // This function simulates the Data Issuer's get_user_data_token REST API
            //
            pub fn get_user_data_token(&self, data_file: &str) -> String {
                const ISSUER_PRIVKEY: &str = r"-----BEGIN PRIVATE KEY-----
                MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg3J/wAlzSD8ZyAU8f
                bPkuCY/BSlq2Y2S5hym8sRccpZehRANCAATt/RChVSxxwH3IzAcBHuhWT8v5mRfx
                moLVnRdNqPcExwyeqH5XN0dlffIYprf66E0CEpZbJ8H+v7cTys9Ie1dd
                -----END PRIVATE KEY-----";

                let mut data_content = std::fs::File::open(data_file).expect("Cannot find the user data file");
                let mut data = String::new();
                data_content
                    .read_to_string(&mut data)
                    .expect("Should not have I/O errors");
                println!("data={}", data);

                let data: Value = serde_json::from_str(&data).unwrap();

                let kid = String::from("k-1");
                let jku = String::from(
                    "https://gdp-admin.github.io/zkpass-sdk/zkpass/sample-jwks/issuer-key.json",
                );
                let ep = KeysetEndpoint { jku, kid };

                //
                //  Data Issuer's integration points with the zkpass-client SDK library
                //

                //
                // Step 1: Instantiate the zkpass_client object
                //
                let zkpass_client = ZkPassClient;

                //
                // Step 2: Call the zkpass_client.sign_data_to_jws_token.
                //         This is to digitally-sign the user data.
                //
                let data_token = zkpass_client
                    .sign_data_to_jws_token(
                        ISSUER_PRIVKEY,
                        json!(data),
                        Some(ep))
                    .unwrap();

                //println!("data_token={}", data_token);
                data_token
            }
        }
}