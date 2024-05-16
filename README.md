# zkPass Service

## zkPass Components

The zkPass service is composed of several key components, each serving a distinct role in the system. At the repo root directory, there are subdirectories that correspond to zkPass components. Here's a breakdown:

- **zkpass-core**
  This is the foundational library that is shared internally across all other zkPass components. It provides the common types and codes used by the other components.
- **zkpass-query**
  This is the query engine library built on top of a ZKVM platform (currently using RiscZero ZKVM).
  - **zkpass-query**: The zkvm-agnostic layer of the zkPass query engine
  - **r0-zkpass-query**: RiscZero ZKVM based implementation of the zkpass-query
  - **valida-zkpass-query**: Valida ZKVM based implementation of the zkpass-query (Not Implemented Yet)
  - **zkpass-query-tool**: The CLI tool for using the zkPass query engine. Useful for developing and testing the query of the data verification request (DVR). This CLI tool is included in the zkPass SDK
- **zkpass-host**
  This component serves as the host application for the zkpass-query engine. It operates within the Nitro environment on an AWS EC2 instance.
- **zkpass-ws**
  This is the web service layer responsible for handling RESTful API requests for zkPass. It is deployed in a non-TEE environment on an AWS EC2 instance.

- **zkpass-client**
  This library acts as the primary library for the zkPass SDK, designed to facilitate seamless integration of the zkPass service with the applications. It eases the complexities involved in connecting to and interacting with the zkPass RESTful API. Exclusively designed for public use, this library stands apart from other zkPass library components, which are confined for internal system use only.

- **zkpass-demo**
  This is a CLI demo application that utilizes the `zkpass-client` SDK library. It serves as a practical example to guide developers in effectively leveraging the `zkpass-client` library in their projects. This application is included in the zkPass SDK.

- **zkpass-control-panel**
  This is a web application based on Next.JS and TypeScript. ZkPass Control Panel serves as a platform for administrator to manage API keys that are being used on zkPass API usages.

## zkPass SDK

The zkPass SDK includes three rust crates/components from the list above:

- **zkpass-client (LIB)**
- **zkpass-demo (CLI)**
- **zkpass-query-tool (CLI)**

## Initial Build Setup Prerequisites

To build the zkPass repo, follow these steps to configure your build tools and environment:

1. Install the rust compiler by following the installation instructions at [Getting started - Rust Programming Language (rust-lang.org)](https://www.rust-lang.org/learn/get-started).

2. Currently, there are two toolchains available that we need to install:

   1. RiscZero Toolchain

      - Install the RiscZero toolchain by running the following commands:

        ```
        cargo install cargo-binstall
        cargo binstall cargo-risczero
        ```

      - You can verify it works via:
        ```
        cargo risczero --version
        ```

   2. SP1 Toolchain

      - Ensure you have Rust and OpenSSL 1.1 or higher installed. [Install OpenSSL 1.1 here](https://askubuntu.com/questions/1102803/how-to-upgrade-openssl-1-1-0-to-1-1-1-in-ubuntu-18-04).
      - Install SP1 by executing the following command:
        ```
        curl -L https://sp1.succinct.xyz | bash
        ```
      - To use `sp1up`, open a new terminal or run this command:
        ```
        source /home/builder/.bashrc
        ```
      - Install the SP1 toolchain by running:
        ```
        sp1up
        ```
      - Verify the installation by checking the version:
        ```
        cargo prove --version
        ```
      - In the zkPass repo root directory, we need to configure SP1 only one time with this command:
        ```
        ./build/zkpass/configure-sp1.sh
        ```

## Build Instructions

To build all components, at the zkPass repo root dir run the following:

<pre>
  cargo build --release
</pre>

This will build all components which are placed under the `target/release` directory.

#

To run all unit tests, at the zkPass repo root dir run the following:

<pre>
  cargo test --release
</pre>

## How to run zkpass-ws & zkpass-host

You could also view this step by step [here on the gitbook](https://docs.ssi.id/zkpass-internal-doc/4A2powBEoSa8bNNahHFZ/getting-started/build/how-to-run)

### On local environment

1. go to `zkpass-ws` folder, copy and paste the `.env.local` file to `.env`, then go to root folder again. make sure this value below is correct
   ```
   API_KEY_SOURCE=file #file or database
   KEY_SERVICE=NATIVE #NATIVE or KMS
   ```
2. go to `zkpass-host` folder, copy and paste the `.env.local` file to `.env`, then go to root folder again. this `.env` is only utilize for local environment
   ```
   PRIVATE_KEY_LOCAL_SECRET="e1bBXWmthEJVnJkzfY3ycFu8nrq3iwIbw2F+e2P7Dzc="
   ```
3. Run all the requirements on the [build instruction](#build-instructions).
4. Open a new terminal, on the root folder (`~builder/zkPass/`), run the command below

   ```
   ./target/release/zkpass-host local
   ```

   There are additional parameters if we want to define the IPC path file ourselves. Below is just an example value

   ```
   ./target/release/zkpass-host local --ipc-path /tmp/socket.sock --ipc-util-path /tmp/util.sock
   ```

5. open a new terminal, on the root folder, run the command below

   ```
   ./target/release/zkpass-ws local
   ```

   There are additional parameters if we want to define the IPC path file ourselves or port. Below is just an example value

   ```
   ./target/release/zkpass-ws local --ipc-path /tmp/socket.sock --ipc-util-path /tmp/util.sock --port 10889
   ```

6. Now you can test directly, there are 2 options:
   - If you want to test the endpoint only, you could hit POST `http://localhost:10888/proof` with parameter a JSON of user_data_token and dvr_token (jwe format) and set `authorization` header like below. the token below is retrieved from `sample-api-keys.json` where the value is `base64(api_1:secret_api_1)`
     ```
     Authorization: Basic YXBpXzE6c2VjcmV0X2FwaV8x
     ```
   - If you want to run with zkpass-demo and you are using `WSL` or linux OS:
     - you need to copy the `zkpass-demo`'s `.env.local` to `.env`
       ```
       cp ./zkpass-demo/.env.local ./zkpass-demo/.env
       ```
     - zkpass-demo can be run using one of two available ZKVM: `sp1` or `r0`.
     - Once you've chosen the ZKVM, use the following command to run zkpass-demo:
       ```
       ./target/release/zkpass-demo [zkvm] [user_data_file] [dvr_file]
       ```
   - Here's an example of how to run zkpass-demo with the `sp1` ZKVM:
     ```
     ./target/release/zkpass-demo sp1 test/data/dewi-profile.json test/data/bca-insurance-dewi-dvr.json
     ```

- (Optional) for local testing, there are additional setups for RabbitMQ (for rebuilt api key cache in memory), we can follow the RabbitMQ setup in [here](https://docs.ssi.id/zkpass-internal-doc/4A2powBEoSa8bNNahHFZ/getting-started/build/how-to-run/setup-rabbitmq-for-zkpass-ws-local-environment). And don't forget to add additional variables on the .env file like below
  ```
  RABBITMQ_HOST=localhost
  RABBITMQ_PORT=5672
  RABBITMQ_USER=guest
  RABBITMQ_PASSWORD=guest
  RABBITMQ_EXCHANGE=zkpass
  RABBITMQ_EXCHANGE_TYPE=fanout
  CACHE_REBUILD_MESSAGE="rebuild_api_key_cache"
  ```

### On staging environment

1. go to https://staging-zkpass-cp.ssi.id. Login using @gdplabs.id account. then create a new api key (refer to [this control-panel docs url](https://docs.google.com/document/d/1mmSQWqrjWYZDBJzwSjwQIS0dB4t_BA7bbYgq8mE_3_U/edit#heading=h.m6jora9erpw2) to step by step instruction)
2. Now you can test directly, there are 2 options:
   - If you want to test the endpoint only, you could hit POST `https://staging-zkpass.ssi.id/proof` with parameter a JSON of user_data_token and dvr_token (jwe format) and set `authorization` like below. paste the token from step number 1, where the format value is `base64(<api_key>:<secret_api_key>)`.
     ```
     Authorization: Basic [YOUR TOKEN]
     ```
   - If you want to run with zkpass-demo and you are using `WSL` or linux OS:
     - you need to copy the `zkpass-demo`'s `.env.example` to `.env`
       ```
       cp ./zkpass-demo/.env.example ./zkpass-demo/.env
       ```
     - then specify the key you want to use on the generated `.env`
       ```
       API_KEY="YOUR_ZKPASS_API_KEY"
       SECRET_API_KEY="YOUR_ZKPASS_SECRET_API_KEY
       ZKPASS_URL="YOUR_ZKPASS_URL"
       ```
       alternatively, you may use the following example API key provided by us.
       ```
       API_KEY=e7fd7ec9-33b2-4f33-a383-c2f1d151a7c2
       SECRET_API_KEY=6a79ffa2-5fe8-4764-8edf-0ebc5dbcccf9
       ZKPASS_URL=https://staging-zkpass.ssi.id
       ```
     - Change the url on `data_holder.rs` on line 27 to the staging url:
       ```
       let zkpass_service_url = String::from("https://staging-zkpass.ssi.id")
       ```
     - zkpass-demo can be run using one of two available ZKVM: `sp1` or `r0`.
     - Once you've chosen the ZKVM, use the following command to run zkpass-demo:
       ```
       ./target/release/zkpass-demo [zkvm] [user_data_file] [dvr_file]
       ```
   - Here's an example of how to run zkpass-demo with the `sp1` ZKVM:
     ```
     ./target/release/zkpass-demo sp1 test/data/dewi-profile.json test/data/bca-insurance-dewi-dvr.json
     ```
