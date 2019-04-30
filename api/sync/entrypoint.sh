#!/bin/bash

# An entrypoint script to fix a Rails-specific issue that prevents the server
# from restarting when a certain server.pid file pre-exists. This script should
# be executed every time the container gets started.
# Source: https://docs.docker.com/compose/rails/

set -e

# Remove a potentially pre-existing server.pid for Rails.
rm -f /nusmods-rails/tmp/pids/server.pid

# Then exec the container's main process (what's set as CMD in the Dockerfile).
exec "$@"
