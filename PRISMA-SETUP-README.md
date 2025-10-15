# Prisma Setup Scripts

This directory contains automated scripts to run Prisma commands across all microservices in the EV91 Platform.

## Available Scripts

### 1. PowerShell Script (Recommended for Windows)
**File:** `prisma-setup-all.ps1`

```powershell
# Run all Prisma operations (generate, push, seed)
.\prisma-setup-all.ps1

# Run only specific operations
.\prisma-setup-all.ps1 -Command generate
.\prisma-setup-all.ps1 -Command push  
.\prisma-setup-all.ps1 -Command seed
.\prisma-setup-all.ps1 -Command reset

# Skip seeding (useful for production)
.\prisma-setup-all.ps1 -SkipSeed
```

### 2. Batch Script (Simple Windows)
**File:** `prisma-setup-all.bat`

```batch
REM Run all Prisma operations
prisma-setup-all.bat

REM Run specific operations  
prisma-setup-all.bat generate
prisma-setup-all.bat push
prisma-setup-all.bat seed
prisma-setup-all.bat reset
```

### 3. Bash Script (Linux/macOS/WSL)
**File:** `prisma-setup-all.sh`

```bash
# Make executable (first time only)
chmod +x ./prisma-setup-all.sh

# Run all Prisma operations
./prisma-setup-all.sh

# Run specific operations
./prisma-setup-all.sh -c generate
./prisma-setup-all.sh -c push
./prisma-setup-all.sh -c seed  
./prisma-setup-all.sh -c reset

# Skip seeding
./prisma-setup-all.sh --skip-seed
```

## Services Covered

The scripts automatically process these services:
- `auth-service`
- `client-store-service`  
- `rider-service`
- `spare-parts-service`
- `vehicle-service`

## Prerequisites

1. **Docker**: All services must be running in Docker containers
2. **Service Names**: Container names must match the service names above
3. **Prisma**: Each service must have Prisma configured with `schema.prisma`

## Operations Explained

### `generate`
- Generates Prisma Client for each service
- Creates typed database access layer

### `push` 
- Pushes Prisma schema to database
- Creates/updates database tables

### `seed`
- Runs database seeding scripts
- Populates initial/test data

### `reset`
- Resets database completely
- ⚠️ **WARNING**: This deletes all data!

### `all` (default)
- Runs generate → push → seed in sequence
- Complete setup for new environments

## Example Usage Scenarios

### Fresh Environment Setup
```powershell
# Complete setup of all services
.\prisma-setup-all.ps1
```

### After Schema Changes
```powershell  
# Push new schema changes
.\prisma-setup-all.ps1 -Command push
```

### Production Deployment
```powershell
# Setup without test data
.\prisma-setup-all.ps1 -SkipSeed
```

### Development Reset
```powershell
# Reset everything and reseed
.\prisma-setup-all.ps1 -Command reset
```

## Troubleshooting

### Common Issues

1. **Container Not Found**
   - Ensure Docker containers are running
   - Check container names match service names

2. **Permission Denied (Linux/macOS)**
   ```bash
   chmod +x ./prisma-setup-all.sh
   ```

3. **PowerShell Execution Policy**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

4. **Individual Service Failure**
   - Check service logs: `docker logs <service-name>`
   - Verify database connections
   - Check Prisma schema syntax

### Manual Fallback
If scripts fail, you can run commands manually:

```bash
# For each service
docker exec -it <service-name> npx prisma generate
docker exec -it <service-name> npx prisma db push  
docker exec -it <service-name> npx prisma db seed
```

## Output

The scripts provide:
- ✅ Success indicators  
- ❌ Error indicators
- 📊 Summary statistics
- 🎯 Progress tracking
- Color-coded output (where supported)

## Support

For issues with these scripts:
1. Check Docker container status
2. Verify Prisma configuration  
3. Check database connectivity
4. Review service logs