#!/usr/bin/env bash
# Starts a production instance of NUSMods.
# Usage: prod-up.sh

# Exit when any command fails
set -e

# Echo commands
set -x

# Start docker-compose
export GIT_COMMIT_HASH=$(git rev-parse HEAD)
dir=~/data/traefik
filename=$dir/acme.json
if [ ! -f $filename ]; then
    mkdir -p $dir
    sudo touch $filename
    sudo chmod 600 $filename
fi

docker-compose --project-name=machine -f infra/machine/docker-compose.yml build --no-cache
docker-compose --project-name=machine -f infra/machine/docker-compose.yml up -d
docker-compose --project-name=blue    -f docker-compose.prod.yml          build --no-cache
docker-compose --project-name=blue    -f docker-compose.prod.yml          up -d
