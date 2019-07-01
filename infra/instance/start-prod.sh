#!/usr/bin/env bash
# Starts a production instance of NUSMods.
# Usage: start-prod.sh <port to expose NUSMods on> <website dist folder>

# Exit when any command fails
set -e

# Echo commands
set -x

# Port where NUSMods will be bound to
export EXPOSED_PORT=$1
if [ -z "$EXPOSED_PORT" ]; then
  echo "No port number provided!"
  exit 1
fi

export WEBSITE_DIST_FOLDER=$2
# if [ -z "$WEBSITE_DIST_FOLDER" ]; then
#   echo "No website dist folder provided!"
#   exit 1
# fi

# Navigate to project root
pushd ../..

# Start docker-compose
export GIT_COMMIT_HASH=$(git rev-parse HEAD)
docker-compose -f docker-compose.prod.yml build  --no-cache website
# docker-compose -f docker-compose.prod.yml up
# docker-compose -f docker-compose.prod.yml down --remove-orphans
