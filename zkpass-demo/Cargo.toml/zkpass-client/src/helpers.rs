/*
 * helper.rs
 * Provide several helper functions for zkpass-client
 *
 * Authors:
 *   Khandar William (khandar.william@gdplabs.id)
 * Created at: February 29th 2024
 * -----
 * Last Modified: March 6th 2024
 * Modified By: Khandar William (khandar.william@gdplabs.id)
 * -----
 * Reviewers:
 *
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
use crate::package_version;
use reqwest::RequestBuilder;

const ZKPASS_CLIENT_HEADER: &'static str = "X-zkPass-Client";

pub fn inject_client_version_header(request: RequestBuilder) -> RequestBuilder {
    request.header(ZKPASS_CLIENT_HEADER, package_version())
}
