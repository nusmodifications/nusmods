#!/bin/bash

# 1. Allow core branches to build immediately
if [[ "$VERCEL_GIT_COMMIT_REF" == "master" || "$VERCEL_GIT_COMMIT_REF" == "production" ]]; then
    echo "✅ Core branch detected"
    exit 1
fi

# 2. Allow maintainers to force a build using the [build] keyword
if [[ "$VERCEL_GIT_COMMIT_MESSAGE" == *"[build]"* ]]; then
    echo "✅ Build commit detected: $VERCEL_GIT_COMMIT_MESSAGE"
    exit 1
fi

# 3. Check if this is a Pull Request
if [[ -n "$VERCEL_GIT_PULL_REQUEST_ID" ]]; then

    # Query the GitHub API to find the origin of the PR branch.
    PR_URL="https://api.github.com/repos/nusmodifications/$VERCEL_GIT_REPO_SLUG/pulls/$VERCEL_GIT_PULL_REQUEST_ID"
    PR_DATA=$(curl -s -m 10 -H "Authorization: Bearer $GITHUB_API_TOKEN" "$PR_URL")

    if [[ -z "$PR_DATA" ]]; then
        echo "🛑 Failed to fetch PR info from GitHub. Build cancelled."
        exit 0
    fi

    # Response contains "head" and "base" branches, which each contain a nested "fork" field:
    # { "head": { "repo": { "fork": true, ... }}, "base": { "repo": { "fork": false }}}
    IS_FORK=$(
        echo "$PR_DATA"                         |
            sed 's/.*"head"://'                 | # get everything after "head"
            grep '"fork":'                      | # get all lines with "fork"
            head -n 1                           | # get the first line with "fork"
            sed -E 's/.*: (true|false),?/\1/'     # extract the boolean value
    )

    if [[ "$IS_FORK" == "true" ]]; then
        echo "✅ Fork PR detected: #$VERCEL_GIT_PULL_REQUEST_ID"
        # Exiting 1 here hands it off to Vercel's native fork protection for authorization
        exit 1
    else
        echo "🛑 Maintainer PR detected without [build] keyword. Build cancelled to save queue."
        exit 0
    fi
fi

# 4. Catch-all for anything else (e.g., maintainer pushing to a local feature branch without opening a PR)
echo "🛑 Build cancelled"
exit 0
