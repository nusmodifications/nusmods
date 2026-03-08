#!/bin/bash

# production pushing 
if [[ "$VERCEL_GIT_COMMIT_REF" == "master" || \
      "$VERCEL_GIT_COMMIT_REF" == "production" ]]; then
  echo "✅ Core branch detected ($VERCEL_GIT_COMMIT_REF). Proceeding with build."
  exit 1

# PR
# (note: for maintainers, there is a race condition that may cause the PR build to be ignored if the PR is created and the workflow runs immediately without a PR ID. Just redeploy.)
elif [[ -n "$VERCEL_GIT_PULL_REQUEST_ID" ]]; then
  echo "✅ Pull Request detected (ID: $VERCEL_GIT_PULL_REQUEST_ID). Proceeding with build."
  exit 1

# ignore build
else
  echo "🛑 Skipping build."
  exit 0
fi
