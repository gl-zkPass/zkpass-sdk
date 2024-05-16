/// This macro will generate three functions for rust crate to call into this dll/so:
/// 1. A function for verifying a zero-knowledge proof: "<prefix>_verify_zkproof_internal"
/// 2. A function for getting the version of the query method: "<prefix>_get_query_method_version_internal"
/// 3. A function for getting the version of the query engine: "<prefix>_get_query_engine_version_internal"
///
/// How to use:
/// ```ignore
/// use paste::paste;
/// use zkpass_query::def_exported_functions;
///
/// // def_exported_functions!(<prefix>);
/// def_exported_functions!(r0);
/// // will generate: r0_verify_zkproof_internal, r0_get_query_method_version_internal, r0_get_query_engine_version_internal
/// ```
#[macro_export]
macro_rules! def_exported_functions {
    ($prefix:ident) => {
        use std::panic;
        use zkpass_query::engine::{ ZkPassQueryEngineError };
        use crate::zkvm_adapter::{
            verify_zkproof_internal,
            get_query_engine_version_internal,
            get_query_method_version_internal,
        };

        paste! {
            #[no_mangle]
            pub extern "C" fn [<$prefix _verify_zkproof_internal>](
                receipt: &str
            ) -> Result<String, ZkPassQueryEngineError> {
                match panic::catch_unwind(|| verify_zkproof_internal(receipt)) {
                    Ok(result) => Ok(result),
                    Err(_error) => Err(ZkPassQueryEngineError::UnhandledPanicError),
                }
            }
        }

        paste! {
            #[no_mangle]
            pub extern "C" fn [<$prefix _get_query_method_version_internal>]() -> String {
                get_query_method_version_internal()
            }
        }

        paste! {
            #[no_mangle]
            pub extern "C" fn [<$prefix _get_query_engine_version_internal>]() -> String {
                get_query_engine_version_internal()
            }
        }
    };
}
