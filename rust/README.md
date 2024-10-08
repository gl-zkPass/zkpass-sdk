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

- **zkpass-client**  
  This library acts as the primary library for the zkPass SDK, designed to facilitate seamless integration of the zkPass service with the applications. It eases the complexities involved in connecting to and interacting with the zkPass RESTful API. Exclusively designed for public use, this library stands apart from other zkPass library components, which are confined for internal system use only.

- **"apps/zkpass-demo"**  
  This is a CLI demo application that utilizes the `zkpass-client` SDK library. It serves as a practical example to guide developers in effectively leveraging the `zkpass-client` library in their projects. This application is included in the zkPass SDK.

## Initial Build Setup Prerequisites

To build the zkPass repo, follow these two simple steps to configure your build tools and environment:

1. Install rust compiler  
   Follow the installation instructions at  
   [Getting started - Rust Programming Language (rust-lang.org)](https://www.rust-lang.org/learn/get-started)

## Build Instructions

To build all components, at the zkPass repo root dir run the following:

<pre>
  cargo build --release  
</pre>

This will build all components which are placed under the `target/release` directory.

## Unit test

To run all unit tests, at the zkPass repo root dir run the following:

<pre>
  cargo test --release  
</pre>

## Run the demo

Follow these steps to test demo:

1. In rust directory
2. Build zkPass with `cargo build --release`
3. Add environment with command `export LD_LIBRARY_PATH=./lib`
4. Run the demo with this format

   ```
   ./target/release/zkpass-demo r0 [--user-data-file / -U] [tag:]<test data 1> [tag:]<test data 2> [--dvr-file / - D] <dvr file>
   ```

   example (single user data):

   ```
   ./target/release/zkpass-demo r0 -U test/data/dewi-profile-wrong.json -D test/data/bca-insurance-dewi-dvr.json
   ```

   example (multiple user data):

   ```
   ./target/release/zkpass-demo r0 -U ./test/data/multiple/bank.json ./test/data/multiple/health.json -D ./test/data/multiple/insurance-dvr.json
   ```

   Or you can simply run the script with `./test.sh`
