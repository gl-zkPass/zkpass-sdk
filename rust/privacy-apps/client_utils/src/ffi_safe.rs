/*
 * safe_ffi.rs
 * To ease client library implementation that must be FFI-safe, we provide some common FFI-safe structs
 *
 * Authors:
 * Created at: September 5th 2024
 * -----
 * Last Modified: September 24th 2024
 * ---
 * References:
 * ---
 * Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
 */
use std::ffi::{ c_char, CStr, CString };
use std::fmt;
use std::ptr;

// FFI-safe struct to represent Rust's `Result<>` type.
// This struct only contains the **pointer** to a value, to access the value you must dereference it.
//   e.g. `*ffi_result.result, *ffi_result.error`
// You need to understand that dereferencing a pointer is unsafe, so you must check `is_success()` first.
#[repr(C)]
pub struct FfiResult<T> {
    // If the operation succeed, then `result` must be filled and `error` is std::ptr::null.
    // When using this struct as dynamic library from another language, you must check the pointer not null before dereferencing it.
    //   e.g. `ffi_result.result != 0`
    pub result: *const T,
    // If the operation failed, then `result` is std::ptr::null and `error` must be filled.
    pub error: *const c_char,
}

// Although we implement several methods to this struct, these methods are not FFI-safe
// So, you cannot call these methods from another language
impl<T> FfiResult<T> {
    // Constructors
    pub fn from_result_value(result: T) -> FfiResult<T> {
        FfiResult {
            result: Box::into_raw(Box::new(result)) as *const T,
            error: ptr::null(),
        }
    }

    pub fn from_error_message(error: String) -> FfiResult<T> {
        FfiResult {
            result: ptr::null::<T>(),
            error: CString::new(error).unwrap().into_raw(),
        }
    }

    pub fn from_rust_result<E: fmt::Display>(result: Result<T, E>) -> FfiResult<T> {
        match result {
            Ok(value) => FfiResult::from_result_value(value),
            Err(error) => FfiResult::from_error_message(error.to_string()),
        }
    }

    // You must check this first before accessing `result` or `error`
    pub fn is_success(&self) -> bool {
        !self.result.is_null()
    }
}

// Display FfiResult as string
impl<T: fmt::Debug> fmt::Display for FfiResult<T> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        if self.is_success() {
            write!(f, "FfiResult<Success: {:?}>", unsafe { &*self.result })
        } else {
            write!(f, "FfiResult<Error: {:?}>", unsafe {
                CStr::from_ptr(self.error).to_str().unwrap()
            })
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_from_result_value() {
        let ffi_result = FfiResult::<u32>::from_result_value(42);
        assert_eq!(ffi_result.is_success(), true);
        assert_eq!(unsafe { *ffi_result.result }, 42);
        assert_eq!(ffi_result.error, ptr::null());
    }

    #[test]
    fn test_from_error_message() {
        let ffi_result = FfiResult::<u32>::from_error_message("Error message".to_string());
        assert_eq!(ffi_result.is_success(), false);
        assert_eq!(unsafe { CStr::from_ptr(ffi_result.error).to_str().unwrap() }, "Error message");
        assert_eq!(ffi_result.result, ptr::null());
    }

    #[test]
    fn test_from_rust_result() {
        #[derive(Debug, PartialEq)]
        struct TestStruct {
            a: i32,
            b: i32,
        }

        let test_struct = TestStruct { a: 10, b: 20 };
        let result: Result<TestStruct, String> = Ok(test_struct);

        let ffi_result = FfiResult::from_rust_result(result);

        assert!(ffi_result.is_success());
        assert_eq!(unsafe { &*ffi_result.result }, &(TestStruct { a: 10, b: 20 }));
        assert_eq!(ffi_result.error, std::ptr::null());
        assert_eq!(format!("{}", ffi_result), "FfiResult<Success: TestStruct { a: 10, b: 20 }>");

        let error_result: Result<TestStruct, String> = Err("Test error".to_string());
        let ffi_error_result = FfiResult::from_rust_result(error_result);

        assert!(!ffi_error_result.is_success());
        assert_eq!(ffi_error_result.result, std::ptr::null());
        assert_eq!(
            unsafe {
                std::ffi::CStr::from_ptr(ffi_error_result.error).to_str().unwrap()
            },
            "Test error"
        );
        assert_eq!(format!("{}", ffi_error_result), "FfiResult<Error: \"Test error\">");
    }
}
