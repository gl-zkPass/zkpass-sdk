#!/bin/bash

cargo build

export LD_LIBRARY_PATH=lib
./target/debug/zkpass-demo r0 test/data/dewi-profile.json test/data/bca-insurance-dewi-dvr.json
