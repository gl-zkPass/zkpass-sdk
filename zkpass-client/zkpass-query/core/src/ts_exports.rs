#![allow(unused_imports)]
#![allow(dead_code)]
use paste::paste;
use std::{ ffi::{ CString, c_char, CStr }, panic };
use core::any::Any;

//
//  Macros for ts-related exported functions
//

#[repr(C)]
pub struct Response<T> {
    data: T,
    error: *const c_char,
}

pub fn return_response<T>(data: T) -> Response<T> {
    Response {
        data,
        error: std::ptr::null(),
    }
}

pub fn return_error<T>(error: Box<dyn Any + Send>) -> Response<*const T> {
    let panic_information = match error.downcast::<String>() {
        Ok(v) => *v,
        Err(e) =>
            match e.downcast::<&str>() {
                Ok(v) => v.to_string(),
                _ => "Unknown Source of Error".to_owned(),
            }
    };
    Response {
        data: std::ptr::null::<T>(),
        error: CString::new(panic_information).unwrap().into_raw(),
    }
}

/// This macro will generate three functions for rust crate to call into this dll/so:
/// 1. <prefix>_verify_zkproof_wrapper
/// 2. <prefix>_get_query_method_version_wrapper
/// 3. <prefix>_get_query_engine_version_wrapper
///
/// How to use:
/// ```ignore
/// use paste::paste;
/// use zkpass_query::def_exported_functions_for_ts;
///
/// // def_exported_functions_for_ts!(<prefix>);
/// def_exported_functions_for_ts!(r0);
/// // will generate: r0_verify_zkproof_wrapper, r0_get_query_method_version_wrapper, r0_get_query_engine_version_wrapper
/// ```
#[macro_export]
macro_rules! def_exported_functions_for_ts {
    ($prefix:ident) => {
        use std::{ ffi::{ CString, c_char, CStr }, panic };
        use crate::zkvm_adapter::{verify_zkproof_internal, get_query_engine_version_internal, get_query_method_version_internal};
        use zkpass_query::ts_exports::{Response, return_response, return_error};

        paste! {
            #[no_mangle]
            pub extern "C" fn [<$prefix _verify_zkproof_wrapper>](receipt: *const c_char) -> Response<*const c_char> {
                let input_cstring: &CStr = unsafe { CStr::from_ptr(receipt) };
                let input_str: &str = input_cstring.to_str().unwrap();

                match panic::catch_unwind(|| {
                        let res = verify_zkproof_internal(input_str);
                        match serde_json::to_string(&res) {
                            Ok(v) => {
                                return v;
                            }
                            Err(e) => panic!("{:?}", e),
                        };
                    })
                {
                    Ok(result) => {
                        return return_response(CString::new(result).unwrap().into_raw());
                    }
                    Err(e) => {
                        return return_error(e);
                    }
                };
            }
        }

        paste! {
            #[no_mangle]
            #[allow(clippy::not_unsafe_ptr_arg_deref)]
            pub extern "C" fn [<$prefix _get_query_method_version_wrapper>]() -> Response<*const c_char> {
                match panic::catch_unwind(|| get_query_method_version_internal()) {
                    Ok(result) => {
                        return return_response(CString::new(result).unwrap().into_raw());
                    }
                    Err(e) => {
                        return return_error(e);
                    }
                };
            }
        }

        paste! {
            #[no_mangle]
            #[allow(clippy::not_unsafe_ptr_arg_deref)]
            pub extern "C" fn [<$prefix _get_query_engine_version_wrapper>]() -> Response<*const c_char> {
                match panic::catch_unwind(|| get_query_engine_version_internal()) {
                    Ok(result) => {
                        return return_response(CString::new(result).unwrap().into_raw());
                    }
                    Err(e) => {
                        return return_error(e);
                    }
                };
            }
        }
    };
}
