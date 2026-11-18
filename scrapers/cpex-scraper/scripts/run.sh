#!/usr/bin/env bash
set -e

# Print date for logs
date

# Ensure cwd is the root of the CPEx scraper project
cd "$(dirname "$0")"
cd ..

# Build the scraper
rm -rf build
pnpm build

# Run the scraper
echo "Running CPEx scraper"
node build/src/index.js

# Syncing with live data is done via symlink, no need to copy or rsync

# pm2 doesn't restart processes that have stopped, so this just noops until
# the next cron restart
echo "Finished syncing data. Sleeping."
