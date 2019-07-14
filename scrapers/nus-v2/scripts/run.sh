#!/bin/bash
set -e

# Print date for logs
date

# Ensure cwd is the root of the v2 scraper project
cd "$(dirname "$0")"
cd ..

# Run the scraper
yarn build
echo "Running scraper"
node build/index.js all

# Update docs
yarn docs

# Sync with live data
echo "Syncing data"
rsync -ahz --delete-after --exclude='cache/' data/ ../../../api.nusmods.com/v2
