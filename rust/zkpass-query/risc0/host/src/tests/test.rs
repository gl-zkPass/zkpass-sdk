#[cfg(test)]
mod tests {
    mod heavy_tests {
        use lazy_static::lazy_static;
        use zkpass_query_test_utils::proof::{ gen_proof, verify_proof };
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

        #[test]
        fn heavy_test_generate_proof_using_r0() {
            for test in TEST_CASES.iter() {
                println!("\n#### Running test for {}", test.user_data_file);
                let zkproof = gen_proof(test.user_data_file.as_str(), test.query_file.as_str(), create_zkpass_query_engine);
                let output = verify_proof(zkproof.as_str(), create_zkpass_query_engine);
                let output_reader = OutputReader::from_json(&output).unwrap();
                let b = output_reader.find_bool("result").unwrap();
                assert!(b == test.expected_result);
            }
        }
    }
}
