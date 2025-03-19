#!/bin/sh
set -e

# Ensure data directory has correct permissions
echo "Setting up data directory permissions..."
mkdir -p /app/data
chmod 777 /app/data
ls -la /app/data

# Show current user
echo "Current user:"
id

# Start the application
echo "Starting application..."
exec "$@" 