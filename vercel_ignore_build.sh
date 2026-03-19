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
    dnf install -y jq
    PR_URL="https://api.github.com/repos/nusmodifications/$VERCEL_GIT_REPO_SLUG/pulls/$VERCEL_GIT_PULL_REQUEST_ID" 
    PR_HEAD_REPO=$(curl -s -m 10 -H "Authorization: Bearer $GITHUB_API_TOKEN" "$PR_URL" | jq -r '.head.repo.full_name')

    if [[ -z "$PR_HEAD_REPO" ]]; then
        echo "🛑 Failed to fetch PR info from GitHub API. Build cancelled."
        exit 0
    fi

    # Compare the PR origin to the base repository
    if [[ "$PR_HEAD_REPO" != "nusmodifications/$VERCEL_GIT_REPO_SLUG" && "$PR_HEAD_REPO" != "null" ]]; then
        echo "✅ Forked PR detected: $VERCEL_GIT_PULL_REQUEST_ID from $PR_HEAD_REPO"
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
