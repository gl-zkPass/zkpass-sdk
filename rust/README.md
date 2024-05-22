# zkPass SDK

## SDK Components

The zkPass SDK is composed of several components, each serving a distinct role in the system. At the repo root directory, there are subdirectories that correspond to SDK components.  Here's a breakdown:

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

#
To run all unit tests, at the zkPass repo root dir run the following:
<pre>
  cargo test --release  
</pre>

## Subdirectories
To update the zkPass subdirectory modules:
1. Copy the .env.example file to a .env file:
  <pre>
    cp .env.example .env
  </pre>
2. Run update-subdirectories.sh
  <pre>
    ./update-subdirectories.sh
  </pre>




