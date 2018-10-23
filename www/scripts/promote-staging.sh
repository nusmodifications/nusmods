#!/usr/bin/env bash
# Promotes built product to production after a dry run and confirmation.
# Usage: promote-staging.sh

FRONTEND_STAGING_DIR=./dist
FRONTEND_PROD_DIR=../../nusmods.com
TIMETABLE_ONLY_STAGING_DIR=./dist-timetable
TIMETABLE_ONLY_PROD_DIR=../../nusmods-export/dist-timetable

# Abort on any error
set -e

echo "Promote $FRONTEND_STAGING_DIR to production at $FRONTEND_PROD_DIR."

# Ensure that staging exists
if [[ ! -d $FRONTEND_STAGING_DIR || ! -d $TIMETABLE_ONLY_STAGING_DIR ]]; then
  echo "Staging directory does not exist! You should probably run yarn build first"
  echo "Aborting"
  exit 1
fi
echo "Staging directory $FRONTEND_STAGING_DIR exists."

# Print contents of staging
# Necessary because if nothing changed, dry run shows nothing
echo
echo "Contents of $FRONTEND_STAGING_DIR:"
ls -la $FRONTEND_STAGING_DIR
echo "Contents of $TIMETABLE_ONLY_STAGING_DIR:"
ls -la $TIMETABLE_ONLY_STAGING_DIR

# Dry run
echo
echo "Dry running deployment..."
npm run rsync -- --dry-run $FRONTEND_PROD_DIR
npm run rsync:export -- --dry-run $TIMETABLE_ONLY_PROD_DIR

# Sync filename with `scripts/build.js`.
COMMIT_HASH_FILE="commit-hash.txt"
PROD_COMMIT=""
if [[ -d $FRONTEND_PROD_DIR ]]; then
  PROD_COMMIT=$(cat $FRONTEND_PROD_DIR/$COMMIT_HASH_FILE)
fi

DEPLOYMENT_COMMIT=$(cat $FRONTEND_STAGING_DIR/$COMMIT_HASH_FILE)
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
npm run rsync -- $FRONTEND_PROD_DIR
npm run rsync:export -- $TIMETABLE_ONLY_PROD_DIR

# Create release
if [ -x "$(command -v sentry-cli)" ]; then
  echo "Creating Sentry release"

  # Follow the format <YYYYMMDD>-<7-char commit hash>
  PROD_VERSION="$(date +%Y%m%d)-${DEPLOYMENT_COMMIT}"

  sentry-cli releases new "$PROD_VERSION"
  sentry-cli releases set-commits "$PROD_VERSION" --auto
  sentry-cli releases files "$PROD_VERSION" upload-sourcemaps $FRONTEND_STAGING_DIR
  sentry-cli releases finalize "$PROD_VERSION"
fi

echo "All done!"
