#!/bin/sh
set -e

# Print debug info
echo "============ DEBUG INFO ============"
echo "Current directory: $(pwd)"
echo "Data directory contents before:"
ls -la /app/data
echo "Current user: $(id)"

# We can't change ownership as non-root user,
# but we can ensure the directory is writable
# This script runs as 'appuser' but the volume might be owned by root
if [ -w "/app/data" ]; then
    echo "Data directory is writable, proceeding..."
else
    echo "WARNING: Data directory is not writable by current user!"
    echo "This may cause database access issues."
    echo "Consider running the container as root or setting correct permissions."
fi

# Start the application
echo "Starting application..."
exec "$@" 