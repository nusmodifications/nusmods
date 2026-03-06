#!/bin/bash

if [ "$VERCEL_GIT_COMMIT_REF" != "master" ] && [ "$VERCEL_GIT_COMMIT_REF" != "production" ] && [ "$VERCEL_GIT_COMMIT_REF" != "cpex-staging" ]; then 
    exit 0; 
else 
    # Proceed with the build
    exit 1; 
fi
