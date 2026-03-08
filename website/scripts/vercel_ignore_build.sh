#!/bin/bash

if [[ "$VERCEL_GIT_REPO_OWNER" != "nusmodifications" &&  -n "$VERCEL_GIT_PULL_REQUEST_ID" ]]; then
    echo "✅ Fork detected on PR. Proceeding with build."
    exit 1
fi

if [[ "$VERCEL_GIT_COMMIT_REF" == "master" || \
      "$VERCEL_GIT_COMMIT_REF" == "production" ]]; then
  echo "✅ Core branch detected ($VERCEL_GIT_COMMIT_REF). Proceeding with build."
  exit 1
fi

echo "🛑 Skipping build."
exit 0

