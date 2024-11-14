# Dvr Module Rust Demo

## Overview

This demo is a Rust-based command-line application that simulates the generating and verifying of zkPass proofs. This demo showcases how to interact with the zkPass system, including data issuance, proof verification, and querying results.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Rust](https://www.rust-lang.org/tools/install) (version 1.79 or later)
- [Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html) (comes with Rust)

## Getting Started

1. **Clone the Repository**

   Clone the repository to your local machine:

   ```bash
   git clone https://github.com/gl-zkPass/zkpass-sdk/
   cd rust
   ```

2. **Build the Project**

   Use Cargo to build the project:

   ```bash
   cargo build --release
   ```

3. **Set Up Environment Variables**

   Create a `.env` file in the `rust/zkpass-demo` directory and add the following variables:

   ```bash
   cd zkpass-demo
   cp .env.example .env
   ```

   Replace the placeholders with your actual values. You can get the API key and secret API key from the [zkPass Portal](https://portal.ssi.id/en).

4. **Run the Demo**

   You can run the demo using the following command:

   ```bash
   cd ..
   ./target/release/zkpass-demo -E <test-name>
   ```

   - `<test-name>`: Available test names are:
     - `dewi`
     - `dewi-wrong`
     - `ramana`
     - `ramana-wrong`
     - `multiple`

   **Example:**

   ```bash
   ./target/release/zkpass-demo -E ramana
   ```

## Understanding the Code

This project consists of several components:

- **data_holder.rs**: Manages the issuance of user data tokens and DVR, and initiates proof generation and validation.
- **data_issuer.rs**: Simulates the issuance of user data tokens.
- **proof_verifier.rs**: Generates and verifies proofs from the zkPass service.
- **helper.rs**: Provides utility functions for data extraction and validation.
- **lib_loader.rs**: Loads the Dvr module client and provides a convenient interface for interacting with the zkPass service.
- **sample_keys.rs**: Contains the sample keys for the demo.

## Disclaimer

This demo is intended for educational purposes. As such, it uses `unwrap` and `expect` liberally throughout the code. These methods will cause the program to panic if an error occurs. In a production environment, it is recommended to handle errors gracefully and avoid using these methods without proper error handling.

## Running Tests

To run the unit tests and integration tests, use the following command:

```bash
cargo test
```
