# Single Container Dockerfile - Both Frontend and Backend
FROM node:22 AS base

# Create app directory and set proper permissions
RUN mkdir -p /app && chown -R node:node /app

WORKDIR /app

# Install pnpm, NestJS CLI, and Git
RUN npm install -g pnpm @nestjs/cli

# Install Git and SSH client
RUN apt-get update && apt-get install -y git openssh-client && rm -rf /var/lib/apt/lists/*

# Create SSH directory and set permissions
RUN mkdir -p /root/.ssh && chmod 700 /root/.ssh

# Copy package files from all services
COPY backend/package.json ./backend/
COPY backend/pnpm-lock.yaml ./backend/
COPY frontend/package.json ./frontend/
COPY frontend/pnpm-lock.yaml ./frontend/
COPY shared/package.json ./shared/
COPY shared/pnpm-lock.yaml ./shared/

# Add GitHub to known hosts
RUN ssh-keyscan github.com >> /root/.ssh/known_hosts

# Install shared dependencies first
WORKDIR /app/shared
RUN pnpm install

# Install backend dependencies
WORKDIR /app/backend
RUN pnpm install

# Install frontend dependencies
WORKDIR /app/frontend
RUN pnpm install

WORKDIR /app

# Copy shared code
COPY shared/ ./shared/

# Copy backend code
COPY backend/ ./backend/

# Copy frontend code
COPY frontend/ ./frontend/

# Development stage
FROM base AS dev
WORKDIR /app
# Expose ports for both services
EXPOSE 3000 5173

# Default command - just keep container running
CMD ["sleep", "infinity"]

# Production build stage
FROM base AS build
WORKDIR /app/backend
RUN pnpm run build

WORKDIR /app/frontend
RUN pnpm run build

# Production stage
FROM node:22 AS prod
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy built backend
COPY --from=build /app/backend/dist ./backend/dist
COPY --from=build /app/backend/package.json ./backend/package.json
COPY --from=build /app/shared ./shared

# Install production dependencies
WORKDIR /app/backend
RUN pnpm install --prod

# Copy built frontend
COPY --from=build /app/frontend/dist ./frontend/dist

EXPOSE 3000
CMD ["npm", "run", "start"]
