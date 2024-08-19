/*
 * helper.rs
 * Provide several helper functions for zkpass-client
 *
 * Authors:
 *   Khandar William (khandar.william@gdplabs.id)
 * Created at: February 29th 2024
 * -----
 * Last Modified: August 19th 2024
 * Modified By: William H Hendrawan (william.h.hendrawan@gdplabs.id)
 * -----
 * Reviewers:
 *
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
use reqwest::RequestBuilder;
use std::collections::HashMap;

const ZKPASS_CLIENT_HEADER: &'static str = "X-zkPass-Client";

pub fn package_version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}

pub fn inject_client_version_header(request: RequestBuilder) -> RequestBuilder {
    request.header(ZKPASS_CLIENT_HEADER, package_version())
}

/// zkPass supports multiple user data input, that's why several user data input should be wrapped in a HashMap
/// If you only have a single user data input, you can use this function to wrap it in a HashMap
pub fn wrap_single_user_data_input<T>(input: T) -> HashMap<String, T> {
    let mut map = HashMap::new();
    map.insert(String::from(""), input);
    map
}
