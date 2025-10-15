@echo off
echo.
echo 🚀 EV91 Platform - Docker Run All Services
echo ==========================================

echo Creating Docker network (if not exists)...
docker network create ev91-network 2>nul
echo ✅ Network ready
echo.

echo Stopping and removing existing containers...
docker stop admin-portal api-gateway auth-service client-store-service rider-service spare-parts-service vehicle-service 2>nul
docker rm admin-portal api-gateway auth-service client-store-service rider-service spare-parts-service vehicle-service 2>nul
echo ✅ Cleaned up old containers
echo.

echo Starting all services...
echo.

echo 🔧 Starting: admin-portal
echo ----------------------------------------
docker run -d --name admin-portal --network ev91-network -p 3003:3003 sanjub07/admin-portal:latest
if %errorlevel% equ 0 (
    echo ✅ admin-portal started successfully on port 3003
) else (
    echo ❌ Failed to start admin-portal
)

echo.
echo 🔧 Starting: api-gateway
echo ----------------------------------------
docker run -d --name api-gateway --network ev91-network -p 8000:8000 sanjub07/api-gateway:latest
if %errorlevel% equ 0 (
    echo ✅ api-gateway started successfully on port 8000
) else (
    echo ❌ Failed to start api-gateway
)

echo.
echo 🔧 Starting: auth-service
echo ----------------------------------------
docker run -d --name auth-service --network ev91-network -p 4001:4001 sanjub07/auth-service:latest
if %errorlevel% equ 0 (
    echo ✅ auth-service started successfully on port 4001
) else (
    echo ❌ Failed to start auth-service
)

echo.
echo 🔧 Starting: client-store-service
echo ----------------------------------------
docker run -d --name client-store-service --network ev91-network -p 3006:3006 sanjub07/client-store-service:latest
if %errorlevel% equ 0 (
    echo ✅ client-store-service started successfully on port 3006
) else (
    echo ❌ Failed to start client-store-service
)

echo.
echo 🔧 Starting: rider-service
echo ----------------------------------------
docker run -d --name rider-service --network ev91-network -p 4005:4005 sanjub07/rider-service:latest
if %errorlevel% equ 0 (
    echo ✅ rider-service started successfully on port 4005
) else (
    echo ❌ Failed to start rider-service
)

echo.
echo 🔧 Starting: spare-parts-service
echo ----------------------------------------
docker run -d --name spare-parts-service --network ev91-network -p 4010:4010 -e DATABASE_URL="postgresql://postgres:Sanju%%40123@ev91-postgres:5432/ev91platform?schema=spare_parts" -e JWT_SECRET="super-secret-jwt-key-for-ev91-platform-change-in-production-2025" sanjub07/spare-parts-service:latest
if %errorlevel% equ 0 (
    echo ✅ spare-parts-service started successfully on port 4010
) else (
    echo ❌ Failed to start spare-parts-service
)

echo.
echo 🔧 Starting: vehicle-service
echo ----------------------------------------
docker run -d --name vehicle-service --network ev91-network -p 4004:4004 -e DATABASE_URL="postgresql://postgres:Sanju%%40123@ev91-postgres:5432/ev91platform?schema=vehicle" -e JWT_SECRET="super-secret-jwt-key-for-ev91-platform-change-in-production-2025" sanjub07/vehicle-service:latest
if %errorlevel% equ 0 (
    echo ✅ vehicle-service started successfully on port 4004
) else (
    echo ❌ Failed to start vehicle-service
)

echo.
echo 📊 Services Status
echo ================================
echo Checking running containers...
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo 🎯 Service URLs:
echo   🌐 Admin Portal:      http://localhost:3003
echo   🔌 API Gateway:       http://localhost:8000
echo   🔐 Auth Service:      http://localhost:4001
echo   🏪 Client Store:      http://localhost:3006
echo   🏍️ Rider Service:     http://localhost:4005
echo   🔧 Spare Parts:       http://localhost:4010
echo   🚗 Vehicle Service:   http://localhost:4004
echo.
echo Next: Run 'prisma-setup-simple.bat' to setup all databases
echo.
pause