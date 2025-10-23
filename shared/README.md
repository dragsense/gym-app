# Full-Stack Docker Setup - Shared Folder Root

This setup provides separate Docker containers for backend and frontend services, both using the shared folder as the root with live code exchange.

## File Structure

```
shared/
├── Dockerfile.backend                    # Backend Dockerfile
├── Dockerfile.frontend                   # Frontend Dockerfile
├── docker-compose.yml                   # Full-stack compose (both services)
├── docker-compose.backend.yml           # Backend-only compose
├── docker-compose.frontend.yml          # Frontend-only compose
├── docker-compose.backend.prod.yml      # Backend production
├── docker-compose.frontend.prod.yml     # Frontend production
├── docker-compose.frontend.nginx.yml    # Frontend with nginx
├── dev.sh                               # Development script
└── README.md                            # This file
```

## Quick Start

### Start Both Services
```bash
cd shared
./dev.sh start
```

### Start Services Separately
```bash
# Start only backend
./dev.sh start-backend

# Start only frontend
./dev.sh start-frontend
```

## Available Commands

| Command | Description |
|---------|-------------|
| `./dev.sh start` | Start both backend and frontend containers |
| `./dev.sh start-backend` | Start only backend container |
| `./dev.sh start-frontend` | Start only frontend container |
| `./dev.sh stop` | Stop all containers |
| `./dev.sh stop-backend` | Stop only backend container |
| `./dev.sh stop-frontend` | Stop only frontend container |
| `./dev.sh restart` | Restart all containers |
| `./dev.sh build` | Build all containers |
| `./dev.sh build-backend` | Build only backend container |
| `./dev.sh build-frontend` | Build only frontend container |
| `./dev.sh logs` | Show logs from all services |
| `./dev.sh logs-backend` | Show backend logs only |
| `./dev.sh logs-frontend` | Show frontend logs only |
| `./dev.sh clean` | Remove all containers and volumes |
| `./dev.sh prod-backend` | Start backend production |
| `./dev.sh prod-frontend` | Start frontend production |
| `./dev.sh prod-frontend-nginx` | Start frontend with nginx |
| `./dev.sh help` | Show help message |

## Services & Ports

### Development Services
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Mailpit**: http://localhost:8025
- **Redis**: localhost:6379
- **DragonflyDB**: localhost:6380

### Production Services
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:80 (nginx)
- **Redis**: localhost:6379

## Volume Mounts

Both containers use live volume mounts for immediate code reflection:

### Backend Container
- `../backend:/app/backend` - Backend source code
- `../shared:/app/shared` - Shared utilities and types

### Frontend Container
- `../frontend:/app/frontend` - Frontend source code
- `../shared:/app/shared` - Shared utilities and types

## Key Features

1. **Separate Containers**: Backend and frontend run independently
2. **Live Code Exchange**: Changes reflect immediately without rebuilding
3. **Shared Dependencies**: Common code accessible to both containers
4. **No node_modules Sync**: Each container manages its own dependencies
5. **Easy Management**: Simple commands for different scenarios
6. **Production Ready**: Optimized production configurations included

## Development Workflow

1. **Start Development Environment**:
   ```bash
   ./dev.sh start
   ```

2. **Make Code Changes**: Edit files in `backend/`, `frontend/`, or `shared/` directories

3. **Changes Reflect Automatically**: No need to rebuild containers

4. **View Logs**:
   ```bash
   ./dev.sh logs-backend
   ./dev.sh logs-frontend
   ```

5. **Stop Services**:
   ```bash
   ./dev.sh stop
   ```

## Production Deployment

```bash
# Backend production
./dev.sh prod-backend

# Frontend production
./dev.sh prod-frontend

# Frontend with nginx
./dev.sh prod-frontend-nginx
```

## Troubleshooting

### Container Won't Start
- Check if ports are already in use
- Verify environment files exist
- Check Docker daemon is running

### Changes Not Reflecting
- Ensure volume mounts are working correctly
- Check if containers are running
- Restart containers if needed: `./dev.sh restart`

### Clean Slate
```bash
./dev.sh clean
```
This removes all containers, images, and volumes for a fresh start.
