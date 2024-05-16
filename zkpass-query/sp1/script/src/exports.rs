use paste::paste;
use zkpass_query::def_exported_functions;

//
//  Use the 'def_exported_functions' macro to define extern "C' exported functions in this crate.
//  This is primarily used to access the query engine as a dll/so.
//
def_exported_functions!(sp1);
