#!/usr/bin/env bash
# Promotes built product to production after a dry run and confirmation.
# Usage: promote-staging.sh

STAGING_DIR=./dist
PROD_DIR=../../beta.nusmods.com

# Abort on any error
set -e

echo "Promote $STAGING_DIR to production at $PROD_DIR."

# Ensure that staging exists
if [[ ! -d $STAGING_DIR ]]; then
  echo "Staging directory does not exist!"
  echo "Aborting."
  exit 1
fi
echo "Staging directory $STAGING_DIR exists."

# Print contents of staging
# Necessary because if nothing changed, dry run shows nothing
echo
echo "Contents of $STAGING_DIR:"
ls -la $STAGING_DIR

# Dry run
echo
echo "Dry running deployment..."
npm run rsync -- --dry-run $PROD_DIR
read -p "Ready to promote? [yN] " -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo
  echo "Aborting."
  exit
fi

# Deploy
echo
echo "Promoting..."
npm run rsync -- $PROD_DIR
echo "All done."
