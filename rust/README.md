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

## Git Subtree

**Adding a Subtree**
<pre>
  # Navigate to your main repository directory
  cd zkpass-sdk
    
  # Add the zkpass-client directory from the remote repository as a subtree
  git subtree add --prefix=rust/third_party/zkPass/directory_name https://github.com/GDP-ADMIN/zkPass.git development --squash
</pre>

**Updating a Subtree**
<pre>
  # Navigate to your main repository directory
  cd zkpass-sdk

  # Pull the latest changes for the zkpass-client directory from the remote repository
  git subtree pull --prefix=rust/third_party/zkPass/zkpass-client https://github.com/GDP-ADMIN/zkPass.git development --squash

  # Pull the latest changes for other specific directories as needed
  git subtree pull --prefix=rust/third_party/zkPass/zkpass-demo/src https://github.com/GDP-ADMIN/zkPass.git development --squash
  git subtree pull --prefix=rust/third_party/zkPass/zkpass-demo/tests https://github.com/GDP-ADMIN/zkPass.git development --squash
  git subtree pull --prefix=rust/third_party/zkPass/zkpass-demo/Cargo.toml https://github.com/GDP-ADMIN/zkPass.git development --squash
  git subtree pull --prefix=rust/third_party/zkPass/zkpass-core https://github.com/GDP-ADMIN/zkPass.git development --squash
  git subtree pull --prefix=rust/third_party/zkPass/zkpass-query/types https://github.com/GDP-ADMIN/zkPass.git development --squash
</pre>

**Removing a Subtree**
<pre>
  # Navigate to your main repository directory
  cd zkpass-sdk

  # Remove the zkpass-client directory
  rm -rf rust/third_party/zkPass/zkpass-client

  # Repeat for other directories as needed
  rm -rf rust/third_party/zkPass/zkpass-demo/src
  rm -rf rust/third_party/zkPass/zkpass-demo/tests
  rm -rf rust/third_party/zkPass/zkpass-demo/Cargo.toml
  rm -rf rust/third_party/zkPass/zkpass-core
  rm -rf rust/third_party/zkPass/zkpass-query/types
</pre>




