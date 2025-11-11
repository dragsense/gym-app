#!/bin/bash

# PM2 Deploy wrapper - Loads NVM then runs PM2 deploy

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# Use node
nvm use node || nvm install node

# Run PM2 deploy
pm2 deploy ecosystem.config.js "$@"

