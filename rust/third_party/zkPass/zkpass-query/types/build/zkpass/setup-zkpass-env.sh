#!/bin/bash
# install rust compiler and tools
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
source ~/.profile
# install risc0 tools
./update-risczero.sh
./configure-sp1.sh
# install other deps
sudo apt install libnghttp2-dev
