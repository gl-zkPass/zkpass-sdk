#!/bin/bash

echo "Downloading .so files from zkpass-sdk"

lib_path="./lib"
# Create the lib directory if it does not exist    
if [ ! -d "$lib_path" ]; then
    mkdir -p "$lib_path"
fi

# Remove files in ./lib/*
rm -f "$lib_path"/*

# Determine the environment (default to "playground" if not set)
if [ -z "$ZKPASS_ENV" ]; then
    env="playground"
else
    case "$ZKPASS_ENV" in
        "staging" | "stag")
            env="staging"
            ;;
        *)
            env="playground"
            ;;
    esac
fi

echo "Using environment: $env"

# URLs to download
urls=(
    "https://github.com/gl-zkPass/zkpass-sdk/releases/download/$env-lib/libdvr_client.so"
)

# Download files and place them into ./lib/
for url in "${urls[@]}"; do
    file_name=$(basename "$url")
    file_path="$lib_path/$file_name"
    echo "Downloading $url to $file_path"
    curl -L -o "$file_path" "$url"
done
