#!/bin/bash

./download-so.sh

cargo build -r

export API_KEY="api_1"
export SECRET_API_KEY="secret_api_1"
export ZKPASS_URL="http://localhost:10888"
export DVR_APP_PATH="/api/1.0/dvr/1.0/proof"
export DVR_MODULE_PATH="/home/builder/zkPass/target/release/libdvr_client.so"


# Single User Data
./target/release/zkpass-demo r0 --user-data-file test/data/dewi-profile.json --dvr-file test/data/bca-insurance-dewi-dvr.json

# Multiple User Data
./target/release/zkpass-demo r0 -U health:test/data/multiple/health.json bank:test/data/multiple/bank.json -D test/data/multiple/insurance-dvr.json

# Using Example
./target/release/zkpass-demo r0 -E ramana
