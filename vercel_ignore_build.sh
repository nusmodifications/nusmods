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

# 4. Catch-all for anything else (e.g., maintainer pushing to a local feature branch without opening a PR)
echo "🛑 Build cancelled"
exit 0
