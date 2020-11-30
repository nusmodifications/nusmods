#!/usr/bin/env bash
# Updates the production instance of NUSMods without downtime.
# Usage: prod-deploy.sh

# Exit when any command fails
set -e

# Echo commands
set -x

git pull

# At the end of this script, we'll want to only keep cached builds of both the
# current and new deploys.
# --force simply disables confirmation.
docker system prune --all --force

# Build and deploy green, we have 2 versions now
export GIT_COMMIT_HASH=$(git rev-parse HEAD)
docker-compose --project-name=green -f docker-compose.prod.yml build --no-cache
docker-compose --project-name=green -f docker-compose.prod.yml up -d

# Wait for green to start
sleep 2m

# Restart blue, bringing it to latest
docker-compose --project-name=blue -f docker-compose.prod.yml build # Use cached build from green
docker-compose --project-name=blue -f docker-compose.prod.yml down --remove-orphans
docker-compose --project-name=blue -f docker-compose.prod.yml up -d

# Wait for blue to start
sleep 2m

# Tear down green, we can now reuse it for next deploy
docker-compose --project-name=green  -f docker-compose.prod.yml down --remove-orphans
