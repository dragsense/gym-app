# Frontend Dockerfile
FROM node:22 AS base

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY frontend/package.json frontend/pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/index.html ./
COPY frontend/vite.config.ts ./
COPY frontend/tsconfig*.json ./
COPY frontend/eslint.config.js ./

# Copy shared folder from root
COPY shared/dtos ./shared/dtos
COPY shared/enums ./shared/enums
COPY shared/interfaces ./shared/interfaces
COPY shared/lib ./shared/lib
COPY shared/types ./shared/types
COPY shared/decorators ./shared/decorators
COPY shared/index.ts ./shared/
COPY shared/package.json ./shared/

# Development stage
FROM base AS dev
EXPOSE 5173
CMD ["pnpm", "run", "dev"]

# Production build stage
FROM base AS build
RUN npm run build

# Production stage with nginx
FROM base AS prod-nginx

# Copy built files to nginx html folder
COPY --from=build /app/dist /usr/share/nginx/html/frontend

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Production stage without nginx
FROM base AS prod

# Copy built files to app folder
COPY --from=build /app/dist /app/frontend

CMD ["echo", "Nginx disabled"]
