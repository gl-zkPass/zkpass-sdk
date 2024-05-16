#!/bin/bash

# Variables
REPO_ZKPASS_URL="https://github.com/GDP-ADMIN/zkPass.git"
TEMP_REPO_ZKPASS_DIR="tmp/zkpass"
DIRS_TO_COPY=("zkpass-client" "zkpass-demo/src" "zkpass-demo/tests" "zkpass-demo/Cargo.toml" "zkpass-core" "zkpass-query/types")  # The directories and files to copy

# Clone repo A to a temporary directory
git clone "$REPO_ZKPASS_URL" "$TEMP_REPO_ZKPASS_DIR"

# Check if the directories or files to copy exist in the temporary cloned repo
for DIR in "${DIRS_TO_COPY[@]}"; do
  if [ ! -e "$TEMP_REPO_ZKPASS_DIR/$DIR" ]; then
    echo "$DIR does not exist in the temporary cloned repo."
    exit 1
  fi
done

# Create necessary directories in the current repo
for DIR in "${DIRS_TO_COPY[@]}"; do
  DEST_DIR=$(dirname "$DIR")
  if [ "$DEST_DIR" != "." ]; then
    if [ ! -e "$DEST_DIR" ]; then
        mkdir -p "$DEST_DIR"
    fi
  else
    rm -rf "$DIR"
  fi
done

# Copy each directory or file from the temporary cloned repo to the current repo
for DIR in "${DIRS_TO_COPY[@]}"; do
  if [ -d "$TEMP_REPO_ZKPASS_DIR/$DIR" ]; then
    # If it's a directory, copy contents
    cp -r "$TEMP_REPO_ZKPASS_DIR/$DIR/." "$DIR"
  else
    # If it's a file, copy the file
    cp "$TEMP_REPO_ZKPASS_DIR/$DIR" "$DIR"
  fi
done

# Clean up the temporary directory
rm -rf "$TEMP_REPO_ZKPASS_DIR"
rm -rf "tmp"  # Remove the tmp directory

echo "Submodules have been successfully copied."
