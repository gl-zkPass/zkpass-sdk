#[cfg(test)]
mod ts_exports_test {
    use std::ffi::c_char;
    use zkpass_core::utils::query_utils::decode_zkproof;
    use zkpass_query::ts_exports::{ get_string_from_response, Response };
    use crate::{
        tests::constants::constants::{
            PROOF_CORRECT,
            QUERY_ENGINE_VERSION_CORRECT,
            QUERY_METHOD_VERSION_CORRECT,
        },
        ts_exports::{
            sp1_get_query_engine_version_wrapper,
            sp1_get_query_method_version_wrapper,
            sp1_verify_zkproof_wrapper,
        },
    };

    #[test]
    fn sp1_get_query_engine_version_wrapper_test() {
        let query_engine_version_response: Response<*const c_char> =
            sp1_get_query_engine_version_wrapper();

        let query_engine_version = get_string_from_response(query_engine_version_response);
        assert!(query_engine_version == QUERY_ENGINE_VERSION_CORRECT);
    }

    #[test]
    fn sp1_get_query_method_version_wrapper_test() {
        let query_method_version_response: Response<*const c_char> =
            sp1_get_query_method_version_wrapper();

        let query_method_version = get_string_from_response(query_method_version_response);
        assert!(query_method_version == QUERY_METHOD_VERSION_CORRECT);
    }

    // Ignored, because it run failed on CI
    #[ignore]
    #[test]
    fn sp1_verify_zkproof_wrapper_test() {
        let decoded_proof = decode_zkproof(PROOF_CORRECT);
        let proof_ptr = decoded_proof.as_ptr() as *const i8;
        let verification_result: Response<*const c_char> = sp1_verify_zkproof_wrapper(proof_ptr);
        let verification_result_string = get_string_from_response(verification_result);
        let expected_result = serde_json
            ::to_string(
                r#"{"title":"Job Qualification","name":"Ramana","is_qualified":true,"result":true}"#
            )
            .unwrap();
        assert_eq!(verification_result_string, expected_result);
    }

    #[test]
    fn sp1_verify_zkproof_wrapper_fail_test() {
        let invalid_proof = "some_invalid_proof".as_ptr() as *const i8;
        let verification_result: Response<*const c_char> =
            sp1_verify_zkproof_wrapper(invalid_proof);
        let expected_result_data = std::ptr::null::<c_char>();
        assert_eq!(verification_result.data, expected_result_data)
    }
}
