#!/usr/bin/env bash
# Starts a production instance of NUSMods.
# Usage: start-prod.sh <port to expose NUSMods on>

# Exit when any command fails
set -e

# Echo commands
set -x

# Start docker-compose
docker-compose --project-name=blue    -f docker-compose.prod.yml down
docker-compose --project-name=green   -f docker-compose.prod.yml down
docker-compose -f infra/machine/docker-compose.yml down --remove-orphans
