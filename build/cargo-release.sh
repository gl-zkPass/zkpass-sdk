#!/bin/bash
# cargo release
COMMIT_MESSAGE=$(git log -1 --pretty=%B | grep -E 'update_version=(minor|major|patch|alpha|beta|rc|[0-9]+\.[0-9]+\.[0-9]+(-(alpha|beta|rc)(\.[0-9]+)?)?)')

if [[ -z "$COMMIT_MESSAGE" ]]; then
    echo "No version bump specified in commit message. Exiting."
else
    if [[ "$COMMIT_MESSAGE" =~ update_version=(minor|major|patch|alpha|beta|rc|[0-9]+\.[0-9]+\.[0-9]+(-(alpha|beta|rc)(\.[0-9]+)?)?) ]]; then
        version="${BASH_REMATCH[1]}"
        echo "Version number: $version"
        cargo release version "$version" --execute --no-confirm 
    fi
fi

