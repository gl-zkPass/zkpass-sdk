/*
 * ffi_helper.rs
 * Helper functions for FFI
 *
 * Authors:
 * Created at: September 18th 2024
 * -----
 * Last Modified: October 9th 2024
 * ---
 * References:
 *   NONE
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
use crate::ffi_safe::FfiResult;
use std::ffi::{ c_char, CStr, CString };

///
/// Converts a C string to a Rust `String`.
///
/// # Parameters
///
/// - `c_str`: A pointer to a C string (`*const c_char`).
///
/// # Returns
///
/// A `Result` containing:
/// - `Ok(String)`: On success, returns a `String` containing the converted C string.
/// - `Err(String)`: On failure, returns a `String` containing an error message.
///
pub fn c_str_to_string(c_str: *const c_char) -> Result<String, String> {
    if c_str.is_null() {
        return Err("Received null pointer".to_string());
    }
    unsafe {
        CStr::from_ptr(c_str)
            .to_str()
            .map(|s| s.to_string())
            .map_err(|e| format!("Failed to convert C string to Rust string: {}", e))
    }
}

///
/// Converts a Rust `String` into a C-compatible `CString` and returns FfiResult.
///
/// # Arguments
///
/// * `input` - A `String` that needs to be converted to a C-compatible string.
///
/// # Returns
///
/// * FfiResult<*const c_char> - A pointer to a C-compatible string.
///
pub fn string_to_cstring(s: String) -> FfiResult<*const c_char> {
    match CString::new(s) {
        Ok(cstring) => {
            let raw_cstring = cstring.into_raw();
            FfiResult::from_result_value(raw_cstring)
        }
        Err(e) => FfiResult::from_error_message(e.to_string()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::ffi::CString;

    #[test]
    fn test_c_str_to_string_success() {
        let original = "Hello, world!";
        let c_string = CString::new(original).unwrap();
        let c_str = c_string.as_ptr();

        let result = c_str_to_string(c_str);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), original);
    }

    #[test]
    fn test_c_str_to_string_null_pointer() {
        let c_str: *const c_char = std::ptr::null();

        let result = c_str_to_string(c_str);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Received null pointer".to_string());
    }

    #[test]
    fn test_c_str_to_string_invalid_utf8() {
        let invalid_utf8: [u8; 2] = [0xff, 0xff];
        let c_string = CString::new(&invalid_utf8[..]).unwrap();
        let c_str = c_string.as_ptr();

        let result = c_str_to_string(c_str);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Failed to convert C string to Rust string"));
    }

    #[test]
    fn test_string_to_cstring_success() {
        let original = "Hello, world!".to_string();

        let result = string_to_cstring(original.clone());
        assert!(result.is_success());

        let converted_back = c_str_to_string(unsafe { *result.result }).unwrap();
        assert_eq!(converted_back, original);
    }

    #[test]
    fn test_string_to_cstring_with_null_byte() {
        let original = "Hello\0world!".to_string();

        let result = string_to_cstring(original);
        assert!(!result.is_success());
        let err = c_str_to_string(result.error).unwrap();
        assert!(err.contains("nul byte found in provided data"));
    }
}
