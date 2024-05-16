use paste::paste;
use zkpass_query::def_exported_functions_for_ts;

//
//  Exported functions for typescript and other non-rust app to call into this dll/so
//
def_exported_functions_for_ts!(sp1);
