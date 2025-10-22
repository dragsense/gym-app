#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# make sure we're on the right node version
nvm use node

# install deps
pnpm install --frozen-lockfile



# Copy environment files (replace if already exist)
cp -f ../shared/.env .env
cp -f ../shared/.env.development .env.development
cp -f ../shared/.env.prod client/.env.prod

cd client && pnpm install --frozen-lockfile && pnpm build && cd ..

# build server
pnpm build

# reload app
pm2 reload ecosystem.config.js --only payback-dev
