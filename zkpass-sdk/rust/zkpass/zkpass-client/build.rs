
fn main() {
    //println!("cargo:warning=build.rs is running");
    // Tell cargo to tell rustc to link the shared library `foo`.
    println!("cargo:rustc-link-lib=dylib=r0_zkpass_query");
    // If your shared library is not in a standard location, specify where to find it.
    //println!("cargo:rustc-link-search=native=/home/builder/didPass-demo/zkpass-demo/rust/zkPass/lib");
    println!("cargo:rustc-link-search=native=./lib");
}
