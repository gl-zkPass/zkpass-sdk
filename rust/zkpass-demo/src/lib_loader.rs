/*
 * lib_loader.rs
 * Loading the dvr module SDK library and calling its functions
 *
 * ---
 * References:
 *   -
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
use client_utils::{
    ffi_safe::FfiResult,
    ffi_helper::c_str_to_string,
    interface::PrivacyAppCredentialsFfi,
};
use dvr_types::{ PublicKeyOptionFfi, DvrDataFfi, ExpectedDvrMetadataFfi };
use libloading::{ Library, Symbol };
use std::ffi::{ c_char, CString };

///
/// Loads the dvr module SDK library.
///
fn load_library() -> Library {
    let library_path = std::env::var("DVR_MODULE_PATH").expect("DVR_MODULE_PATH must be set");
    unsafe { Library::new(library_path).unwrap() }
}

///
/// Calls the generate user data token function from the dvr module SDK library.
///
pub unsafe fn generate_user_data_token(
    signing_key: &str,
    user_data: &str,
    public_key_option: PublicKeyOptionFfi
) -> String {
    let signing_key_c_str = CString::new(signing_key).unwrap();
    let user_data_c_str = CString::new(user_data).unwrap();

    let lib = load_library();
    let generate_user_data_token: Symbol<
        unsafe extern "C" fn(
            *const c_char,
            *const c_char,
            PublicKeyOptionFfi
        ) -> FfiResult<*const c_char>
    > = lib.get(b"dvr_generate_user_data_token").unwrap();

    let user_data_token_result = generate_user_data_token(
        signing_key_c_str.as_ptr(),
        user_data_c_str.as_ptr(),
        public_key_option
    );
    assert!(user_data_token_result.is_success());

    let user_data_token_c_str = unsafe { *user_data_token_result.result };
    c_str_to_string(user_data_token_c_str).unwrap()
}

///
/// Calls the generate query token function from the dvr module SDK library.
///
pub unsafe fn generate_query_token(signing_key: &str, dvr_data: DvrDataFfi) -> String {
    let signing_key_c_str = CString::new(signing_key).unwrap();

    let lib = load_library();
    let generate_query_token: Symbol<
        unsafe extern "C" fn(*const c_char, DvrDataFfi) -> FfiResult<*const c_char>
    > = unsafe { lib.get(b"dvr_generate_query_token").unwrap() };

    let query_token_result = unsafe { generate_query_token(signing_key_c_str.as_ptr(), dvr_data) };
    assert!(query_token_result.is_success());

    let query_token_c_str = unsafe { *query_token_result.result };
    c_str_to_string(query_token_c_str).unwrap()
}

///
/// Calls the generate zkpass proof function from the dvr module SDK library.
///
pub unsafe fn generate_zkpass_proof(
    credentials: PrivacyAppCredentialsFfi,
    user_data_token: String,
    query_token: String
) -> String {
    let user_data_token_c_str = CString::new(user_data_token).unwrap();
    let query_token_c_str = CString::new(query_token).unwrap();

    let lib = load_library();
    let generate_zkpass_proof: Symbol<
        unsafe extern "C" fn(
            PrivacyAppCredentialsFfi,
            *const c_char,
            *const c_char
        ) -> FfiResult<*const c_char>
    > = unsafe { lib.get(b"dvr_generate_zkpass_proof").unwrap() };

    let zkpass_proof_result = unsafe {
        generate_zkpass_proof(
            credentials,
            user_data_token_c_str.as_ptr(),
            query_token_c_str.as_ptr()
        )
    };
    assert!(zkpass_proof_result.is_success());

    let zkpass_proof_c_str = unsafe { *zkpass_proof_result.result };
    c_str_to_string(zkpass_proof_c_str).unwrap()
}

///
/// Calls the verify zkpass proof function from the dvr module SDK library.
///
pub unsafe fn verify_zkpass_proof(
    base_url: &str,
    zkvm: &str,
    zkpass_proof_token: &str,
    expected_dvr_metadata: ExpectedDvrMetadataFfi
) -> String {
    let base_url_c_str = CString::new(base_url).unwrap();
    let zkvm_c_str = CString::new(zkvm).unwrap();
    let zkpass_proof_token_c_str = CString::new(zkpass_proof_token).unwrap();

    let lib = load_library();
    let verify_zkpass_proof: Symbol<
        unsafe extern "C" fn(
            *const c_char,
            *const c_char,
            *const c_char,
            ExpectedDvrMetadataFfi
        ) -> FfiResult<*const c_char>
    > = unsafe { lib.get(b"dvr_verify_zkpass_proof").unwrap() };

    let verify_zkpass_proof_result = unsafe {
        verify_zkpass_proof(
            base_url_c_str.as_ptr(),
            zkvm_c_str.as_ptr(),
            zkpass_proof_token_c_str.as_ptr(),
            expected_dvr_metadata
        )
    };
    assert!(verify_zkpass_proof_result.is_success());

    let verify_zkpass_proof_c_str = unsafe { *verify_zkpass_proof_result.result };
    c_str_to_string(verify_zkpass_proof_c_str).unwrap()
}

///
/// Calls the get dvr id from proof function from the dvr module SDK library.
///
pub unsafe fn get_dvr_id_from_proof(proof: &str) -> String {
    let proof_c_str = CString::new(proof).unwrap();

    let lib = load_library();
    let get_dvr_id_from_proof: Symbol<
        unsafe extern "C" fn(*const c_char) -> FfiResult<*const c_char>
    > = unsafe { lib.get(b"dvr_get_dvr_id").unwrap() };

    let get_dvr_id_from_proof_result = unsafe { get_dvr_id_from_proof(proof_c_str.as_ptr()) };
    assert!(get_dvr_id_from_proof_result.is_success());

    let get_dvr_id_from_proof_c_str = unsafe { *get_dvr_id_from_proof_result.result };
    c_str_to_string(get_dvr_id_from_proof_c_str).unwrap()
}
