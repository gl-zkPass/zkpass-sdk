#!/bin/bash

# Variables
REPO_ZKPASS_URL="<put zkPass repo URL here>"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TEMP_REPO_ZKPASS_DIR="$SCRIPT_DIR/tmp/zkpass"
TARGET_BASE_DIR="$SCRIPT_DIR"
DIRS_TO_COPY="<put the directories and files to copy>"

# Clone zkpass repo to a temporary directory
if git clone "$REPO_ZKPASS_URL" "$TEMP_REPO_ZKPASS_DIR"; then
  echo "Repository cloned successfully."
else
  echo "Failed to clone the repository."
  exit 1
fi

# Check if the directories or files to copy exist in the temporary cloned repo
for DIR in "${DIRS_TO_COPY[@]}"; do
  if [ ! -e "$TEMP_REPO_ZKPASS_DIR/$DIR" ]; then
    echo "$DIR does not exist in the temporary cloned repo."
    exit 1
  fi
done


# Create necessary directories in the target base directory
for DIR in "${DIRS_TO_COPY[@]}"; do
  DEST_DIR="$TARGET_BASE_DIR/$(dirname "$DIR")"

  if [ "$DEST_DIR" != "$TARGET_BASE_DIR" ]; then
    if [ ! -e "$DEST_DIR" ]; then
        mkdir -p "$DEST_DIR"
    fi
  else
    rm -rf "$TARGET_BASE_DIR/$(basename "$DIR")"
  fi
done

# Copy each directory or file from the temporary cloned repo to the target base directory
for DIR in "${DIRS_TO_COPY[@]}"; do
  if [ -d "$TEMP_REPO_ZKPASS_DIR/$DIR" ]; then
    # If it's a directory, copy contents
    cp -r "$TEMP_REPO_ZKPASS_DIR/$DIR/." "$TARGET_BASE_DIR/$DIR"
  else
    # If it's a file, copy the file
    cp "$TEMP_REPO_ZKPASS_DIR/$DIR" "$TARGET_BASE_DIR/$DIR"
  fi
done

# Clean up the temporary directory
rm -rf "$TEMP_REPO_ZKPASS_DIR"
rm -rf "tmp"  # Remove the tmp directory

echo "Subdirectories have been successfully updated."
