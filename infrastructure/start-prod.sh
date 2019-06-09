#!/usr/bin/env bash
# Starts a production instance of NUSMods.
# Usage: start-prod.sh <port to expose NUSMods on>

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

pushd ..

# Start docker-compose
export GIT_COMMIT_HASH=$(git rev-parse HEAD)
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up
docker-compose -f docker-compose.prod.yml down --remove-orphans
