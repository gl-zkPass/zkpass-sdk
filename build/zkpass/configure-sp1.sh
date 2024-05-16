#!/bin/bash
cd ~
rustup toolchain install nightly-2024-01-25-x86_64-unknown-linux-gnu
cd ~/zkPass
rustup override set nightly-2024-01-25-x86_64-unknown-linux-gnu
