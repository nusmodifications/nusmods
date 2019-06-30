#!/bin/bash
set -e

# Ensure cwd is the root of the v2 scraper project
cd "$(dirname "$0")"
cd ..

# Run the scraper
yarn build
node build/index.js all

# Update docs
yarn docs

# Sync with live data
rsync -ahz --delete-after --exclude='cache/' data/ ../../../api.nusmods.com/v2
