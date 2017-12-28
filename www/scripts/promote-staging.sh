#!/usr/bin/env bash
# Promotes built product to production after a dry run and confirmation.
# Usage: promote-staging.sh

STAGING_DIR=./dist
PROD_DIR=../../nusmods.com

# Abort on any error
set -e

echo "Promote $STAGING_DIR to production at $PROD_DIR."

# Ensure that staging exists
if [[ ! -d $STAGING_DIR ]]; then
  echo "Staging directory does not exist!"
  echo "Aborting"
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

# Sync filename with `scripts/build.js`.
COMMIT_HASH_FILE="commit-hash.txt"
PROD_COMMIT=""
if [[ -d $PROD_DIR ]]; then
  PROD_COMMIT=$(cat $PROD_DIR/$COMMIT_HASH_FILE)
fi

DEPLOYMENT_COMMIT=$(cat $STAGING_DIR/$COMMIT_HASH_FILE)
LOG_FORMAT="%h %s by %an"

echo
if [[ "$PROD_COMMIT" = "$DEPLOYMENT_COMMIT" ]]; then
  echo "No changes to be deployed, both src and dst dirs are on:"
  echo
  git --no-pager log --pretty=format:"$LOG_FORMAT%n" $PROD_COMMIT -1
  echo
  echo "But you may continue anyway"
elif [[ "$PROD_COMMIT" = "" ]]; then
  # Usually a case of a fresh deployment. This almost never happens.
  echo "No existing version found in production dir."
else
  echo "The following commits will be deployed:"
  echo
  git --no-pager log --pretty=format:"$LOG_FORMAT" $PROD_COMMIT...$DEPLOYMENT_COMMIT
  echo
fi
echo

read -p "Ready to promote? [y/N] " -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo
  echo "Aborting"
  exit
fi

# Deploy
echo
echo "Promoting..."
npm run rsync -- $PROD_DIR
echo "All done!"
