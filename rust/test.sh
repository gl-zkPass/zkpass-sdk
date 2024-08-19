#!/bin/bash

cargo build -r

export LD_LIBRARY_PATH=lib
./target/release/zkpass-demo r0 test/data/dewi-profile.json test/data/bca-insurance-dewi-dvr.json
