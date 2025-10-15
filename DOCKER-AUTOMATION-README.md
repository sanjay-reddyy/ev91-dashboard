# Docker Automation Scripts

This directory contains automated scripts to build, run, and manage all Docker services in the EV91 Platform.

## 🚀 Quick Start

### One-Command Complete Deployment
```batch
deploy-complete.bat
```
This runs everything: build → run → prisma setup

## 📋 Available Scripts

### 1. **Build All Images** 
**File:** `docker-build-all.bat`
```batch
docker-build-all.bat
```
- Builds all 7 Docker images
- Navigates to correct directories automatically
- Shows build status for each service
- Tags with `sanjub07/[service]:latest`

### 2. **Run All Services**
**File:** `docker-run-all.bat`
```batch
docker-run-all.bat
```
- Creates Docker network
- Stops/removes old containers
- Starts all services with correct ports
- Shows service URLs and status

### 3. **Stop All Services**
**File:** `docker-stop-all.bat`
```batch
docker-stop-all.bat
```
- Stops all running containers
- Removes stopped containers
- Clean shutdown of entire platform

### 4. **Setup Prisma Databases**
**File:** `prisma-setup-simple.bat`
```batch
prisma-setup-simple.bat
```
- Generates Prisma clients
- Pushes database schemas
- Seeds initial data

### 5. **Complete Deployment**
**File:** `deploy-complete.bat`
```batch
deploy-complete.bat
```
- Runs all scripts in sequence
- Complete platform deployment

## 🎯 Services & Ports

| Service | Port | Image |
|---------|------|-------|
| Admin Portal | 3003 | `sanjub07/admin-portal:latest` |
| API Gateway | 8000 | `sanjub07/api-gateway:latest` |
| Auth Service | 4001 | `sanjub07/auth-service:latest` |
| Client Store | 3006 | `sanjub07/client-store-service:latest` |
| Rider Service | 4005 | `sanjub07/rider-service:latest` |
| Spare Parts | 4010 | `sanjub07/spare-parts-service:latest` |
| Vehicle Service | 4004 | `sanjub07/vehicle-service:latest` |

## 🔄 Common Workflows

### Fresh Development Setup
```batch
REM Build and deploy everything
deploy-complete.bat
```

### Code Changes (Rebuild & Redeploy)
```batch
REM Stop services
docker-stop-all.bat

REM Rebuild images
docker-build-all.bat

REM Start services
docker-run-all.bat

REM Setup databases (if needed)
prisma-setup-simple.bat
```

### Database Reset
```batch
REM Reset and reseed databases
prisma-setup-simple.bat reset
```

### Quick Restart
```batch
REM Stop and restart services
docker-stop-all.bat
docker-run-all.bat
```

## 📊 Monitoring

### Check Status
```batch
docker ps
```

### View Logs
```batch
docker logs <service-name>
REM Example: docker logs auth-service
```

### Access Services
- **Admin Portal**: http://localhost:3003
- **API Gateway**: http://localhost:8000  
- **Auth Service**: http://localhost:4001
- **Client Store**: http://localhost:3006
- **Rider Service**: http://localhost:4005
- **Spare Parts**: http://localhost:4010
- **Vehicle Service**: http://localhost:4004

## 🛠️ Troubleshooting

### Build Failures
1. Check Dockerfile in each service directory
2. Ensure all dependencies are installed
3. Verify file paths in build context

### Container Start Failures
1. Check if ports are already in use
2. Verify environment variables
3. Check Docker network status

### Database Connection Issues
1. Ensure PostgreSQL container is running
2. Check database URLs in environment variables
3. Verify network connectivity

### Common Commands
```batch
REM View all containers
docker ps -a

REM Remove all stopped containers
docker container prune

REM Remove unused images
docker image prune

REM Restart Docker network
docker network rm ev91-network
docker network create ev91-network
```

## 🔧 Environment Variables

Default environment variables used:
```
DATABASE_URL=postgresql://postgres:Sanju%40123@ev91-postgres:5432/ev91platform
JWT_SECRET=super-secret-jwt-key-for-ev91-platform-change-in-production-2025
```

## 📂 Directory Structure

```
dashboard-latest-code/
├── docker-build-all.bat        # Build all images
├── docker-run-all.bat          # Run all services  
├── docker-stop-all.bat         # Stop all services
├── deploy-complete.bat         # Complete deployment
├── prisma-setup-simple.bat     # Database setup
├── apps/
│   ├── admin-portal/
│   └── api-gateway/
└── services/
    ├── auth-service/
    ├── client-store-service/
    ├── rider-service/
    ├── spare-parts-service/
    └── vehicle-service/
```

## 🎯 Benefits

✅ **Time Saving**: One command vs 15+ individual commands  
✅ **Reliability**: Consistent deployment process  
✅ **Flexibility**: Individual scripts for specific needs  
✅ **Error Handling**: Clear success/failure indicators  
✅ **Documentation**: Built-in help and status messages  

## 🚀 Next Steps

After deployment:
1. Access Admin Portal at http://localhost:3003
2. Test API endpoints via API Gateway at http://localhost:8000
3. Check service health and logs
4. Begin development work