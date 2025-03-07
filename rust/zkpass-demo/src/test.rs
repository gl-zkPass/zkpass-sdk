/*
 * test.rs
 * Test cases for the zkPass Demo
 *
 * ---
 * References:
 *   -
 * ---
 */
#[cfg(test)]
mod tests {
    use client_utils::interface::PrivacyAppCredentialsFfi;
    use dvr_types::{ DvrDataFfi, ExpectedDvrMetadataFfi, UserDataRequestFfi };
    use std::ffi::CString;
    use uuid::Uuid;
    use crate::{ data_issuer::DataIssuer, proof_verifier::ProofVerifier };

    #[test]
    fn test_access() {
        // This section ensures that all necessary public types are accessible.
        let _credentials = PrivacyAppCredentialsFfi {
            base_url: CString::new("base_url").unwrap().into_raw(),
            api_key: CString::new("api_key").unwrap().into_raw(),
            secret_api_key: CString::new("secret_api_key").unwrap().into_raw(),
        };

        let _data_issuer = DataIssuer;
        let proof_verifier = ProofVerifier::default();

        let data_issuer_pub_key_holder = proof_verifier.generate_public_key_option(false);
        let data_issuer_pub_key = data_issuer_pub_key_holder.public_key_option;

        let proof_verifier_pub_key_holder = proof_verifier.generate_public_key_option(true);
        let proof_verifier_pub_key = proof_verifier_pub_key_holder.public_key_option;

        let empty_str = CString::new("").unwrap();
        let user_data_request = UserDataRequestFfi {
            key: empty_str.as_ptr(),
            value: data_issuer_pub_key,
        };

        let zkvm_cstring = CString::new("r0").unwrap();
        let dvr_title_cstring = CString::new("My DVR").unwrap();
        let dvr_id_cstring = CString::new(Uuid::new_v4().to_string()).unwrap();
        let query_cstring = CString::new("query_string").unwrap();
        let user_data_requests_slice = [user_data_request];

        let _dvr_data = DvrDataFfi {
            zkvm: zkvm_cstring.as_ptr(),
            dvr_title: dvr_title_cstring.as_ptr(),
            dvr_id: dvr_id_cstring.as_ptr(),
            query: query_cstring.as_ptr(),
            user_data_requests: user_data_requests_slice.as_ptr(),
            user_data_requests_len: user_data_requests_slice.len() as u64,
            dvr_verifying_key: proof_verifier_pub_key,
        };

        let some_ttl: u64 = 3600;
        let expected_dvr_cstring = CString::new("expected_dvr").unwrap();
        let _expected_metadata = ExpectedDvrMetadataFfi {
            ttl: some_ttl,
            dvr: expected_dvr_cstring.as_ptr(),
            user_data_verifying_keys: user_data_requests_slice.as_ptr(),
            user_data_verifying_keys_len: user_data_requests_slice.len() as u64,
        };
    }
}
