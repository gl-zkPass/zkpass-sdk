#!/bin/bash

cargo build -r

export LD_LIBRARY_PATH=lib

# Single User Data
./target/release/zkpass-demo r0 --user-data-file test/data/dewi-profile.json --dvr-file test/data/bca-insurance-dewi-dvr.json

# Multiple User Data
./target/release/zkpass-demo r0 -U test/data/multiple/health.json test/data/multiple/bank.json -D test/data/multiple/insurance-dvr.json
