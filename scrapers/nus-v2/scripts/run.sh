#!/bin/bash
set -e

# Ensure cwd is the root of the v2 scraper project
cd "$(dirname "$0")"
cd ..

# Run the scraper
yarn build
pm2 start ecosystem.config.js

# Update docs
yarn docs

# Sync with live data
rsync -ahz --delete-after --exclude='cache/' data/ ../../../api.nusmods.com/v2
