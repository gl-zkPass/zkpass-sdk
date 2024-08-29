#!/bin/bash

#
#  clean-header.sh
#  Script that removes Authors and Last Modified from file headers determined by
#  psioniq template.
#
#  How it works:
#  Regex Pattern:
#  / \* Authors:.* \* References:/s
#
#  Match one specific block of text that starts with ` * Authors:` followed by
#  any content (`.*`) (including newlines due to the dotall mode (trailing `/s`
#  flag)) and ends with ` * References:`.
#
#  Usage
#  ./clean-header.sh <directory1> [<directory2> ...]
#
#  Authors:
#    GDPWinnerPranata (winner.pranata@gdplabs.id)
#  Created at: July 12th 2024
#  -----
#  Last Modified: July 15th 2024
#  Modified By: GDPWinnerPranata (winner.pranata@gdplabs.id)
#  -----
#  References:
#    NONE
#  ---
#  Copyright (c) 2024 PT Darta Media Indonesia. All rights reserved.
#

# Define the regex pattern to match the section to be removed
prefix=' \* Authors:'
suffix=' \* References:'
regex="$prefix.*$suffix"
replacement=$suffix

# Whitelist of file extensions to be processed
whitelist=("js" "ts" "tsx" "rs")

# Function to recursively process files in a directory
function process_files {
    local dir="$1"
    for file in "$dir"/*; do
        if [ -d "$file" ]; then
            # Skip node_modules directory
            if [[ "$file" != *"node_modules"* ]]; then
                process_files "$file"  # Recursively process subdirectories
            fi
        elif [ -f "$file" ]; then
            # Check file extension against whitelist
            extension="${file##*.}"
            for ext in "${whitelist[@]}"; do
                if [ "$extension" == "$ext" ]; then
                    is_whitelisted=true
                    break
                fi
            done

            if $is_whitelisted; then
                # Process only files with whitelisted extensions
                content=$(perl -0777pe "s/$regex/$replacement/s" "$file")
                # Replace literal `\n` character sequences with `\\n` for escaping slash when piping
                content="${content//\\n/\\n}"
                echo "$content" > "$file"
            else
                echo "Skipping $file: Extension .$extension is not whitelisted."
            fi
        fi
    done
}

# Check if there are arguments passed to the script
if [ $# -eq 0 ]; then
    echo "Usage: $0 <directory1> [<directory2> ...]"
    exit 1
fi

# Iterate over each directory provided as argument
for dir in "$@"; do
    # Check if the argument is a valid directory
    if [ -d "$dir" ]; then
        # Process files in the directory recursively
        process_files "$dir"
    else
        echo "Error: $dir is not a valid directory."
    fi
done

echo "Replacement complete."
