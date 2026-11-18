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
pnpm build

# Run the scraper
echo "Running scraper"
node build/index.js all

# Update docs
pnpm docs

# Scan all CourseReg rounds, including revisions to earlier reports.
coursereg_dir=../demand-allocation-scraper
if [ -x "$coursereg_dir/.venv/bin/python" ]; then
  echo "Checking CourseReg reports"
  if ! (cd "$coursereg_dir" && pnpm dev --python .venv/bin/python); then
    echo "CourseReg refresh failed. The main NUS data refresh succeeded." >&2
  fi
else
  echo "Skipping CourseReg refresh. Set up the demand allocation scraper's .venv to enable it." >&2
fi

# Syncing with live data is done via symlink, no need to copy or rsync

# pm2 doesn't restart processes that have stopped, so this just noops until
# the next cron restart
echo "Finished syncing data. Sleeping."
