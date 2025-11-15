#!/bin/bash

# Deployment script - Copy env files then build Docker
# This runs from PM2 deploy directory: /path/to/deploy/source/

# Install make if not available
if ! command -v make &> /dev/null; then
    echo "Installing make..."
    apt-get update && apt-get install -y make || yum install -y make || apk add --no-cache make
fi

# Copy env files from shared to backend and frontend
cp -f ../shared/.env ./backend/.env
cp -f ../shared/.env.prod ./frontend/.env.prod

# Build and start Docker
#make setup-prod

echo "✅ Server deployed successfully!"
