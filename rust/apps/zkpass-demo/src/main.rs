mod data_holder;
mod data_issuer;
mod proof_verifier;
mod test;

use std::env;
use tokio::runtime::Runtime;
use data_holder::DataHolder;

fn run_data_holder(data_file: &String, dvr_file: &String) {
    let data_holder = DataHolder;
    let rt = Runtime::new().unwrap();

    rt.block_on(
        data_holder.start(data_file.as_str(), dvr_file.as_str())
    );
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() == 3 {
        run_data_holder(&args[1], &args[2]);
    } else {
        println!("required arguments: <data-file> <rules-file>");
    }
}