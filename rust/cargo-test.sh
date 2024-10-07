#!/bin/bash

# Set the environment to "playground"
export ZKPASS_ENV=playground

# Download the necessary .so files
./download-so.sh

# Build the project
cargo build -r

# Set the LD_LIBRARY_PATH to the lib directory (to be able to run the tests without e2e tests)
export LD_LIBRARY_PATH=../lib

# Run the tests
cargo test -r -- --skip e2e_tests

# Unset the LD_LIBRARY_PATH
export LD_LIBRARY_PATH=lib

# Run the e2e tests
cargo test -r e2e_tests

