# Backend Dockerfile
FROM node:22 AS base

WORKDIR /app

# Install pnpm and NestJS CLI
RUN npm install -g pnpm @nestjs/cli

# Copy package files
COPY backend/package.json backend/pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY backend/src ./src
# Copy shared folder from root
COPY shared/dtos ./shared/dtos
COPY shared/enums ./shared/enums
COPY shared/interfaces ./shared/interfaces
COPY shared/lib ./shared/lib
COPY shared/types ./shared/types
COPY shared/decorators ./shared/decorators
COPY shared/index.ts ./shared/
COPY shared/package.json ./shared/
COPY backend/nest-cli.json backend/tsconfig*.json ./

# Development stage
FROM base AS dev
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Production build stage
FROM base AS build
RUN npm run build

# Production stage
FROM node:22 AS prod
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY backend/package.json backend/pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod

# Copy built application
COPY --from=build /app/dist ./dist
COPY --from=build /app/shared ./shared

# Copy built frontend files from frontend image
COPY --from=frontend-build:latest /app/dist ./public/frontend

# Copy environment files
COPY backend/.env backend/.env
COPY backend/.env.production backend/.env.production

EXPOSE 3000
CMD ["npm", "run", "start"]
