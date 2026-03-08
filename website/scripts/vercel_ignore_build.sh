#!/bin/bash

# is a forked repo
if [[ "$VERCEL_GIT_REPO_OWNER" != "nusmodifications" ]]; then
    if [[ -n "$VERCEL_GIT_PULL_REQUEST_ID" ]]; then
        echo "✅ Pull request ID: $VERCEL_GIT_PULL_REQUEST_ID"
        exit 1
    else
        echo "🛑 No pull request ID found"
        exit 0
    fi
else
    if [[ "$VERCEL_GIT_COMMIT_REF" == "master" || "$VERCEL_GIT_COMMIT_REF" == "production" ]]; then
        echo "✅ Core branch detected"
        exit 1
    elif [[ "$VERCEL_GIT_COMMIT_MESSAGE" == *"[build]"* ]]; then
        echo "✅ Build commit detected: $VERCEL_GIT_COMMIT_MESSAGE"
        exit 1
    else
        echo "🛑 Build cancelled"
        exit 0
    fi
fi
