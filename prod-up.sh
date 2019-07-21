#!/usr/bin/env bash
# Starts a production instance of NUSMods.
# Usage: prod-up.sh

# Exit when any command fails
set -e

# Echo commands
set -x

# Start docker-compose
export GIT_COMMIT_HASH=$(git rev-parse HEAD)
mkdir -p ~/data/traefik && touch acme.json && sudo chmod 600 acme.json
docker-compose --project-name=machine -f infra/machine/docker-compose.yml build --no-cache
docker-compose --project-name=machine -f infra/machine/docker-compose.yml up -d
docker-compose --project-name=blue    -f docker-compose.prod.yml          build --no-cache
docker-compose --project-name=blue    -f docker-compose.prod.yml          up -d
