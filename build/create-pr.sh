#!/bin/bash

COMMIT_MESSAGE=$(git log -1 --pretty=%B | grep -E 'update_version=(minor|major|patch|alpha|beta|rc|[0-9]+\.[0-9]+\.[0-9]+(-(alpha|beta|rc)(\.[0-9]+)?)?)')

if [[ -z "$COMMIT_MESSAGE" ]]; then
    echo "No version bump specified in commit message. Not Create PR. Exiting."
else
    VERSION=$(grep '^version = ' ../zkpass-core/Cargo.toml | cut -d '=' -f2 | tr -d ' ' | tr -d '"')

    echo "creating PR for version $VERSION ..."
    git config --unset credential.helper
    git config --global user.username "infra-gl"
    git config --global user.email "infra@gdplabs.id"
    git config --global url."https://${GH_TOKEN}:x-oauth-basic@github.com/".insteadOf "https://github.com/"
    git checkout -b "v/$VERSION"
    git add -u
    git restore --staged docker-compose.yml
    git status
    git commit -m "Update Version Release $VERSION"
    git push --set-upstream origin "v/$VERSION"

    TEMPLATE="bump-version-pr-template.md"
    OUTPUT_TEMPLATE="pr-description.md"

    sed "s/<VERSION>/$VERSION/g" "$TEMPLATE" > "$OUTPUT_TEMPLATE"

    gh pr create -B development -H "v/$VERSION" -t "Update Version Release $VERSION" --body-file "$OUTPUT_TEMPLATE"

    rm "$OUTPUT_TEMPLATE"
fi

