#!/usr/bin/env bash
set -e

# Print date for logs
date

# Ensure cwd is the root of the MPE scraper project
cd "$(dirname "$0")"
cd ..

# Build the scraper
rm -rf build
yarn build

# Run the scraper
echo "Running MPE scraper"
node build/src/index.js

# Sync with live data
echo "Syncing data"
\cp data/mpeModules.json ../../../api.nusmods.com/v2

# pm2 doesn't restart processes that have stopped, so this just noops until
# the next cron restart
echo "Finished syncing data. Sleeping."
