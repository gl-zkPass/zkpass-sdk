#[cfg(test)]
mod tests {
    mod heavy_tests {
        use lazy_static::lazy_static;
        use std::io::prelude::*;
        use std::time::Instant;
        use crate::create_zkpass_query_engine;
        use crate::OutputReader;

        #[derive(Debug)]
        struct TestCase {
            user_data_file: String,
            query_file: String,
            expected_result: bool,
        }

        lazy_static! {
            static ref TEST_CASES: Vec<TestCase> = vec![
                TestCase {
                    user_data_file: "./../../../test/data/dewi-profile.json".to_string(),
                    query_file: "./../../../test/data/bca-finance-ramana-dvr.json".to_string(),
                    expected_result: false,
                },
                TestCase {
                    user_data_file: "./../../../test/data/ramana-profile.json".to_string(),
                    query_file: "./../../../test/data/bca-finance-ramana-dvr.json".to_string(),
                    expected_result: true,
                },
                TestCase {
                    user_data_file: "./../../../test/data/jane2-blood-test-result.json".to_string(),
                    query_file: "./../../../test/data/employee-onboarding-dvr.json".to_string(),
                    expected_result: false,
                },
                TestCase {
                    user_data_file: "./../../../test/data/jane-blood-test-result.json".to_string(),
                    query_file: "./../../../test/data/employee-onboarding-dvr.json".to_string(),
                    expected_result: true,
                }
            ];
        }

        fn gen_proof_r0(data_files: &str, rules_file: &str) -> String {
            //
            //          Prover side
            //
            //
            // prep the inputs
            //
            let mut data_content = std::fs::File
                ::open(data_files)
                .expect("Example file should be accessible");
            let mut data = String::new();
            data_content.read_to_string(&mut data).expect("Should not have I/O errors");

            let mut rules_data = std::fs::File
                ::open(rules_file)
                .expect("Example file should be accessible");
            let mut rules = String::new();
            rules_data.read_to_string(&mut rules).expect("Should not have I/O errors");

            println!("executing query and generating zkproof...");
            let start = Instant::now();
            //////////////// the meat //////////////////
            let query_engine = create_zkpass_query_engine();
            let receipt = query_engine
                .execute_query_and_create_zkproof(data.as_str(), rules.as_str())
                .unwrap();
            ////////////////////////////////////////////
            let duration = start.elapsed();

            println!("zkproof generation completed, time={:?}", duration);

            receipt
        }

        fn verify_proof_r0(receipt: &str) -> String {
            //
            //          Verifier side
            //

            let query_engine = create_zkpass_query_engine();

            // verify the receipt
            let start = Instant::now();
            //////////////////////// the meat ///////////////////////////////
            let output = query_engine.verify_zkproof(receipt).unwrap();
            /////////////////////////////////////////////////////////////////
            let duration = start.elapsed();

            println!("\nverifying zkproof...");
            println!("zkproof verified, time={:?}\n", duration);
            println!("output/journal: output={:?}", output);

            output
        }

        #[test]
        fn heavy_test_generate_proof_using_r0() {
            for test in TEST_CASES.iter() {
                println!("\n#### Running test for {}", test.user_data_file);
                let zkproof = gen_proof_r0(test.user_data_file.as_str(), test.query_file.as_str());
                let output = verify_proof_r0(zkproof.as_str());
                let output_reader = OutputReader::from_json(&output).unwrap();
                let b = output_reader.find_bool("result").unwrap();
                assert!(b == test.expected_result);
            }
        }
    }
}
