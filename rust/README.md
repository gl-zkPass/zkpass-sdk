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

## Git Submodules

**Add a Submodule**
<pre>
  git submodule add https://github.com/GDP-ADMIN/zkPass.git third_party/zkPass
  git submodule init
  git submodule update
</pre>

**Update a Submodule**
<pre>
  cd third_party/zkPass
  git fetch
  git pull origin master
</pre>

**Remove a Submodule**
<pre>
  git submodule deinit -f third_party/zkPass
  git rm -f third_party/zkPass
  rm -rf .git/modules/third_party/zkPass
  rm -rf third_party/zkPass
</pre>

**[Sparse Checkout](https://git-scm.com/docs/git-sparse-checkout)**
  - Sparse Checkout: This is configured in such a way that Git will only populate the working directory with the specified paths. Internally, Git still knows about the entire repository, but only the specified paths are visible and accessible in your working directory.
  - Initial Setup: When you initially clone a repository or add a submodule, Git checks out all files. Sparse checkout modifies this behavior so that only certain files are checked out.
  - Note : THIS COMMAND IS EXPERIMENTAL. ITS BEHAVIOR, AND THE BEHAVIOR OF OTHER COMMANDS IN THE PRESENCE OF SPARSE-CHECKOUTS, WILL LIKELY CHANGE IN THE FUTURE.

  


