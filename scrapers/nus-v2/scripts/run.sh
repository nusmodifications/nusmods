#!/bin/bash
set -e

# Print date for logs
date

# Ensure cwd is the root of the v2 scraper project
cd "$(dirname "$0")"
cd ..

# Print to Node version for logs
echo "Running on Node version: $(node --version)"

# Build the scraper
rm -rf build
yarn build

# Run the scraper
echo "Running scraper"
node build/index.js all

# Update docs
yarn docs

# Sync with live data
echo "Syncing data"
rsync -ahz --delete-after --exclude='cache/' --exclude='mpeModules.json' --exclude='cpexModules.json' data/ ../../../api.nusmods.com/v2

# pm2 doesn't restart processes that have stopped, so this just noops until
# the next cron restart
echo "Finished syncing data. Sleeping."
