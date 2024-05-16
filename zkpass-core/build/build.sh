#!/bin/bash
set -e

export PATH=$PATH:/home/builder/.cargo/bin

rustup override set nightly-2024-01-25-x86_64-unknown-linux-gnu
cargo build -r

cargo test --release -- --skip e2e_tests

./target/release/zkpass-md5-checksum -i ./target/release/libr0_zkpass_query.so -o ./target/release/libr0_zkpass_query.md5
./target/release/zkpass-md5-checksum -i ./target/release/libsp1_zkpass_query.so -o ./target/release/libsp1_zkpass_query.md5

sed -i "s|ENV|${ENV}|" build/docker-compose.yml

#tar -czvf target.tar.gz target

