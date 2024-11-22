/*
 * lib.rs
 * Types for DVR Module Client
 *
 * Authors:
 * Created at: November 5th 2024
 * -----
 * Last Modified: November 5th 2024
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
use std::ffi::c_char;

#[derive(Debug, Clone)]
#[repr(C)]
pub struct UserDataRequestFfi {
    pub key: *const c_char,
    pub value: PublicKeyOptionFfi,
}

#[derive(Debug, Clone)]
#[repr(C)]
pub struct PublicKeyFfi {
    pub x: *const c_char, // C-compatible string
    pub y: *const c_char, // C-compatible string
}

#[derive(Debug, Clone)]
#[repr(C)]
pub struct KeysetEndpointFfi {
    pub jku: *const c_char, // C-compatible string
    pub kid: *const c_char, // C-compatible string
}

#[derive(Debug, Clone)]
#[repr(C)]
pub enum PublicKeyOptionTagFfi {
    PublicKey,
    KeysetEndpoint,
    None,
}

#[derive(Debug, Clone)]
#[repr(C)]
pub struct PublicKeyOptionFfi {
    pub tag: PublicKeyOptionTagFfi, // To indicate which variant is used
    pub value: PublicKeyOptionUnionFfi, // Union to hold the variant data
}

#[derive(Debug, Clone)]
#[repr(C)]
pub struct PublicKeyOptionUnionFfi {
    pub public_key: PublicKeyFfi,
    pub keyset_endpoint: KeysetEndpointFfi,
}

#[derive(Debug, Clone)]
#[repr(C)]
pub struct DvrDataFfi {
    pub zkvm: *const c_char,
    pub dvr_title: *const c_char,
    pub dvr_id: *const c_char,
    pub query: *const c_char,
    pub user_data_requests: *const UserDataRequestFfi,
    pub user_data_requests_len: u64,
    pub dvr_verifying_key: PublicKeyOptionFfi,
}

#[derive(Debug, Clone)]
#[repr(C)]
pub struct ExpectedDvrMetadataFfi {
    pub ttl: u64,
    pub dvr: *const c_char,
    pub user_data_verifying_keys: *const UserDataRequestFfi,
    pub user_data_verifying_keys_len: u64,
}
