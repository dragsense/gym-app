#!/bin/bash

# Deployment script - Copy env files then build Docker
# This runs from PM2 deploy directory: /path/to/deploy/source/

# Copy env files from shared to backend and frontend
cp -f ../shared/.env ./backend/.env
cp -f ../shared/.env.prod ./frontend/.env.prod

# Build and start Docker
cd ..
make setup-prod

# Restart with PM2 inside Docker container
docker exec app-build-prod pm2 start ecosystem.config.js --only trainer-dev

echo "✅ Backend server started!"
