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
        initial_command.push_str("export LD_LIBRARY_PATH=./lib:$LD_LIBRARY_PATH");
        return initial_command.to_string();
    }

    fn run_demo_and_verify_output(
        user_data_path: &str,
        dvr_path: &str,
        expected_result: &str,
        zkvm: &str
    ) {
        let initial_command = get_initial_command();
        let zkpass_demo_command = format!(
            "./target/release/zkpass-demo {} -U {} -D {}",
            zkvm,
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
            output_str.contains(expected_result),
            "Expected result is {}, but got: {}",
            expected_result,
            output_str
        );
    }

    #[test]
    fn e2e_test_demo_true_r0() {
        run_demo_and_verify_output(
            "test/data/ramana-profile.json",
            "test/data/bca-finance-ramana-dvr.json",
            "the query result is true",
            "r0"
        );
    }

    #[test]
    fn e2e_test_demo_false_r0() {
        run_demo_and_verify_output(
            "test/data/dewi-profile.json",
            "test/data/bca-finance-ramana-dvr.json",
            "the query result is false",
            "r0"
        );
    }

    #[test]
    fn e2e_test_demo_true_sp1() {
        run_demo_and_verify_output(
            "test/data/ramana-profile.json",
            "test/data/bca-finance-ramana-dvr.json",
            "the query result is true",
            "sp1"
        );
    }

    #[test]
    fn e2e_test_demo_false_sp1() {
        run_demo_and_verify_output(
            "test/data/dewi-profile.json",
            "test/data/bca-finance-ramana-dvr.json",
            "the query result is false",
            "sp1"
        );
    }
}
