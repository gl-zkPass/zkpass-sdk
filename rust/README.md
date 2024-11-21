<h1 align="middle">zkPass SDK - Rust Demo</h1>

<p>
  <p>
    For complete information on everything you need to do before using this program, including installation and usage instructions, please refer to the Gitbook documentation.
  </p>
  <a href="https://docs.ssi.id/zkpass/v/zkpass-developers-guide/sdk-tutorial/quick-start/rust-linux" target="_blank">
      <img src="https://img.shields.io/badge/GitBook-read-blue?style=for-the-badge&logo=gitbook&logoColor=white" />
  </a>
</p>

## SDK Components

The zkPass SDK is composed of several components, each serving a distinct role in the system. At the repo root directory, there are subdirectories that correspond to SDK components. Here's a breakdown:

- **zkpass-core**  
  This is the foundational library that is shared internally across all other zkPass components. It provides the common types and codes used by the other components.

- **zkpass-demo**  
  Rust-based command-line application that simulates the generating and verifying of zkPass proofs. This demo showcases how to interact with the zkPass system, including data issuance, proof verification, and querying results.

- **privacy-apps**  
  This is a library that contains the `dvr_types` and `client_utils`, which are used to interact with the Dvr client to generate & verify proofs.

## Understanding zkpass-demo Code

The [`zkpass-demo`](./zkpass-demo) project consists of several components:

- [**data_holder.rs**](./zkpass-demo/src/data_holder.rs): Manages the issuance of user data tokens and DVR, and initiates proof generation and validation.
- [**data_issuer.rs**](./zkpass-demo/src/data_issuer.rs): Simulates the issuance of user data tokens.
- [**proof_verifier.rs**](./zkpass-demo/src/proof_verifier.rs): Generates and verifies proofs from the zkPass service.
- [**helper.rs**](./zkpass-demo/src/helper.rs): Provides utility functions for data extraction and validation.
- [**lib_loader.rs**](./zkpass-demo/src/lib_loader.rs): Loads the Dvr module client and provides a convenient interface for interacting with the zkPass service.
- [**sample_keys.rs**](./zkpass-demo/src/sample_keys.rs): Contains the sample keys for the demo.

### Disclaimer

The demo is intended for educational purposes. As such, it uses `unwrap` and `expect` liberally throughout the code. These methods will cause the program to panic if an error occurs. In a production environment, it is recommended to handle errors gracefully and avoid using these methods without proper error handling.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Rust](https://www.rust-lang.org/tools/install) (version 1.79 or later)
- [Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html) (comes with Rust)

## Build and Run the demo

<pre>
  ./test.sh
</pre>

This script will build the demo and download the Dvr client, then run 3 different demos.

## Run Tests

<pre>
  ./cargo-test.sh
</pre>

This script will run all unit tests.
