#!/usr/bin/env bash
# Stop all production instances of NUSMods.
# Usage: prod-down.sh

# Exit when any command fails
set -e

# Echo commands
set -x

# Start docker-compose
docker-compose --project-name=blue    -f docker-compose.prod.yml down
docker-compose --project-name=green   -f docker-compose.prod.yml down
docker-compose -f infra/machine/docker-compose.yml down --remove-orphans
