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

PROD_COMMIT=''
if [[ -d $PROD_DIR ]]; then
  PROD_COMMIT=$(cat $PROD_DIR/app.*js | grep -Eo "20\d{6}-[0-9a-f]{7}" | cut -d '-' -f 2)
fi

DEPLOYMENT_COMMIT=$(cat $STAGING_DIR/app.*js | grep -Eo "20\d{6}-[0-9a-f]{7}" | cut -d '-' -f 2)

echo
if [[ "$PROD_COMMIT" = "$DEPLOYMENT_COMMIT" ]]; then
  echo "No changes to be deployed, both src and dst dirs are on:"
  echo
  git --no-pager log --pretty=oneline $PROD_COMMIT -1
  echo
  echo "But you may continue anyway"
elif [[ "$PROD_COMMIT" = '' ]]; then
  # Usually a case of a fresh deployment. This almost never happens.
  echo "No existing version found in production dir."
else
  echo "The following commits will be deployed:"
  echo
  git --no-pager log --pretty=oneline $PROD_COMMIT...$DEPLOYMENT_COMMIT
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
