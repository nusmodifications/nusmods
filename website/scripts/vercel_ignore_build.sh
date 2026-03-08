#!/bin/bash

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
    else
        echo "🛑 Core branch not detected ($VERCEL_GIT_COMMIT_REF)"
        exit 0
    fi
fi
