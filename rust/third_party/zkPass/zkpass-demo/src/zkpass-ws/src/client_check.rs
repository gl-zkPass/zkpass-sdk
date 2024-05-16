/*
 * client_check.rs
 * Implement logic for checking client version
 *
 * Authors:
 *   Khandar William (khandar.william@gdplabs.id)
 * Created at: March 4th 2024
 * -----
 * Last Modified: March 7th 2024
 * Modified By: Khandar William (khandar.william@gdplabs.id)
 * -----
 * Reviewers:
 *
 * ---
 * References:
 *   https://crates.io/crates/semver
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
use actix_web::http::header::HeaderMap;
use crate::utils::package_version;
use reqwest::header::HeaderValue;
use semver::Version;

const ZKPASS_CLIENT_HEADER: &'static str = "X-zkPass-Client";

/// The header version will be checked only if all of these conditions are met:
///     1. The zkPass-ws package version is parsable (from Cargo.toml)
///     2. The header value is not None (from request)
pub fn client_version_check(headers: &HeaderMap) -> bool {
    if let Ok(ws_version) = Version::parse(package_version()) {
        if let Some(header_value) = headers.get(ZKPASS_CLIENT_HEADER) {
            return is_header_version_compatible(&header_value, &ws_version);
        }
    }
    true
}

/// The header value is considered compatible if all of these conditions are met:
///     1. It is parsable
///     2. Same major version
///     3. Same minor version
fn is_header_version_compatible(header_value: &HeaderValue, ws_version: &Version) -> bool {
    if let Ok(header_version) = Version::parse(header_value.to_str().unwrap_or("")) {
        return header_version.major == ws_version.major && header_version.minor == ws_version.minor;
    }
    // Unparsable header value
    false
}

#[cfg(test)]
mod tests {
    use super::*;
    use actix_web::http::header::HeaderValue;
    use reqwest::header::HeaderName;
    use semver::Version;

    #[test]
    fn test_is_header_version_compatible() {
        let ws_version = Version::parse("0.3.5-beta.2").unwrap();
        let same_header = HeaderValue::from_static("0.3.0-beta.2");
        let larger_major_header = HeaderValue::from_static("1.0.0");
        let larger_minor_header = HeaderValue::from_static("0.4.0");
        let larger_patch_header = HeaderValue::from_static("0.3.6");
        let lesser_minor_header = HeaderValue::from_static("0.2.0");
        let lesser_patch_header = HeaderValue::from_static("0.3.4");
        let unparsable_header = HeaderValue::from_static("unparsable");

        assert!(
            is_header_version_compatible(&same_header, &ws_version),
            "request 0.3.0-beta.2 is compatible with ws 0.3.0-beta.2 (same version)"
        );

        assert!(
            !is_header_version_compatible(&larger_major_header, &ws_version),
            "request 1.0.0 is incompatible with ws 0.3.5-beta.2 (different major version)"
        );

        assert!(
            !is_header_version_compatible(&larger_minor_header, &ws_version),
            "request 0.4.0 is incompatible with ws 0.3.5-beta.2 (different minor version)"
        );

        assert!(
            is_header_version_compatible(&larger_patch_header, &ws_version),
            "request 0.3.6 is compatible with ws 0.3.5-beta.2 (same major and minor version)"
        );

        assert!(
            !is_header_version_compatible(&lesser_minor_header, &ws_version),
            "request 0.2.0 is incompatible with ws 0.3.5-beta.2 (different minor version)"
        );

        assert!(
            is_header_version_compatible(&lesser_patch_header, &ws_version),
            "request 0.3.4 is compatible with ws 0.3.5-beta.2 (same major and minor version)"
        );

        assert!(
            !is_header_version_compatible(&unparsable_header, &ws_version),
            "unparsable header is always incompatible"
        );
    }

    #[test]
    fn test_client_version_check() {
        let current_version = Version::parse(package_version()).unwrap();
        let incompatible_version = Version::new(
            current_version.major + 1,
            current_version.minor,
            current_version.patch
        );
        let mut headers = HeaderMap::new();
        let header_name = HeaderName::from_bytes(ZKPASS_CLIENT_HEADER.as_bytes()).unwrap();

        headers.insert(
            header_name.clone(),
            HeaderValue::from_str(current_version.to_string().as_str()).unwrap()
        );
        assert!(client_version_check(&headers), "current version is compatible");

        headers.insert(
            header_name.clone(),
            HeaderValue::from_str(incompatible_version.to_string().as_str()).unwrap()
        );
        assert!(!client_version_check(&headers), "current version with major+1 is not compatible");

        headers.remove(header_name.clone());
        assert!(client_version_check(&headers), "missing header should return true");
    }
}
