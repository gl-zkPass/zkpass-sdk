use paste::paste;
use zkpass_query::def_exported_functions;

//
//  Use the 'def_exported_functions' macro to define extern "C' exported functions in this crate.
//  This is primarily used to access the query engine as a dll/so.
//
def_exported_functions!(sp1);

#[cfg(test)]
mod exports_test {
    use super::*;
    use zkpass_core::utils::query_utils::decode_zkproof;
    use crate::tests::constants::constants::{
        PROOF_CORRECT,
        QUERY_ENGINE_VERSION_CORRECT,
        QUERY_METHOD_VERSION_CORRECT,
    };

    #[test]
    fn sp1_get_query_engine_version_internal_test() {
        let query_engine_version = sp1_get_query_engine_version_internal();
        assert!(query_engine_version == QUERY_ENGINE_VERSION_CORRECT);
    }

    #[test]
    fn sp1_get_query_method_version_internal_test() {
        let query_method_version = sp1_get_query_method_version_internal();
        assert!(query_method_version == QUERY_METHOD_VERSION_CORRECT);
    }

    #[test]
    fn sp1_verify_zkproof_internal_test() {
        let verification_result = sp1_verify_zkproof_internal(
            &decode_zkproof(PROOF_CORRECT)
        ).unwrap();
        println!("{}", verification_result);
    }

    #[test]
    fn sp1_verify_zkproof_internal_fail_test() {
        let verification_result = sp1_verify_zkproof_internal("some_invalid_proof");
        assert!(verification_result.is_err());
    }
}
