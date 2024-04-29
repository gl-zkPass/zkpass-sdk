//
// Note: The e2e_tests won't be run on the Google Cloud Build
//       because it is a part of End to End Testing and not Unit Test.
//
// On the Google Cloud Build, the e2e_tests will be skipped using this command:
// `cargo test --release -- --skip e2e_tests`
//
// To run the e2e_tests locally, you can use:
// `cargo test --release -- e2e_tests -- --exact`
//

#[cfg(test)]
mod e2e_tests {
    use std::{ env, process::{ Command, Stdio } };

    fn get_initial_command() -> String {
        let path = env::current_dir().unwrap();
        let path_str = path.to_str().unwrap();

        // If test is run from zkpass-demo directory, then go to parent directory
        let mut initial_command = String::from("");
        if path_str.contains("zkpass-demo") {
            initial_command.push_str("cd ../ && ");
        }
        initial_command.push_str("export LD_LIBRARY_PATH=./target/release:$LD_LIBRARY_PATH");
        return initial_command.to_string();
    }

    #[test]
    fn e2e_test_demo_true() {
        let initial_command = get_initial_command();

        let user_data_path = "test/data/ramana-profile.json";
        let dvr_path = "test/data/bca-finance-ramana-dvr.json";
        let zkpass_demo_command = format!(
            "./target/release/zkpass-demo r0 {} {}",
            user_data_path,
            dvr_path
        );
        let output = Command::new("sh")
            .arg("-c")
            .arg(format!("{} && {}", initial_command, zkpass_demo_command))
            .stdout(Stdio::piped())
            .output()
            .expect("failed to execute process");

        let output_str = String::from_utf8_lossy(&output.stdout);

        assert!(
            output_str.contains("the query result is true"),
            "Expected result is true, but got: {}",
            output_str
        );
    }

    #[test]
    fn e2e_test_demo_false() {
        let initial_command = get_initial_command();

        let user_data_path = "test/data/dewi-profile-wrong.json";
        let dvr_path = "test/data/bca-insurance-dewi-dvr.json";
        let zkpass_demo_command = format!(
            "./target/release/zkpass-demo r0 {} {}",
            user_data_path,
            dvr_path
        );
        let output = Command::new("sh")
            .arg("-c")
            .arg(format!("{} && {}", initial_command, zkpass_demo_command))
            .stdout(Stdio::piped())
            .output()
            .expect("failed to execute process");

        let output_str = String::from_utf8_lossy(&output.stdout);

        assert!(
            output_str.contains("the query result is false"),
            "Expected result is false, but got: {}",
            output_str
        );
    }
}
