@echo off
echo.
echo 🐳 EV91 Platform - Docker Build All Services
echo ============================================

echo Building all Docker images...
echo.

echo 🔧 Building: admin-portal
echo ----------------------------------------
cd apps\admin-portal
docker build -t sanjub07/admin-portal:latest .
if %errorlevel% equ 0 (
    echo ✅ admin-portal built successfully
) else (
    echo ❌ Failed to build admin-portal
)
cd ..\..

echo.
echo 🔧 Building: api-gateway
echo ----------------------------------------
cd apps\api-gateway
docker build -t sanjub07/api-gateway:latest .
if %errorlevel% equ 0 (
    echo ✅ api-gateway built successfully
) else (
    echo ❌ Failed to build api-gateway
)
cd ..\..

echo.
echo 🔧 Building: auth-service
echo ----------------------------------------
cd services\auth-service
docker build -t sanjub07/auth-service:latest .
if %errorlevel% equ 0 (
    echo ✅ auth-service built successfully
) else (
    echo ❌ Failed to build auth-service
)
cd ..\..

echo.
echo 🔧 Building: client-store-service
echo ----------------------------------------
cd services\client-store-service
docker build -t sanjub07/client-store-service:latest .
if %errorlevel% equ 0 (
    echo ✅ client-store-service built successfully
) else (
    echo ❌ Failed to build client-store-service
)
cd ..\..

echo.
echo 🔧 Building: rider-service
echo ----------------------------------------
cd services\rider-service
docker build -t sanjub07/rider-service:latest .
if %errorlevel% equ 0 (
    echo ✅ rider-service built successfully
) else (
    echo ❌ Failed to build rider-service
)
cd ..\..

echo.
echo 🔧 Building: spare-parts-service
echo ----------------------------------------
cd services\spare-parts-service
docker build -t sanjub07/spare-parts-service:latest .
if %errorlevel% equ 0 (
    echo ✅ spare-parts-service built successfully
) else (
    echo ❌ Failed to build spare-parts-service
)
cd ..\..

echo.
echo 🔧 Building: vehicle-service
echo ----------------------------------------
cd services\vehicle-service
docker build -t sanjub07/vehicle-service:latest .
if %errorlevel% equ 0 (
    echo ✅ vehicle-service built successfully
) else (
    echo ❌ Failed to build vehicle-service
)
cd ..\..

echo.
echo 📊 Build Summary
echo ================================
echo All Docker images have been built!
echo.
echo Built Images:
echo   📦 sanjub07/admin-portal:latest
echo   📦 sanjub07/api-gateway:latest
echo   📦 sanjub07/auth-service:latest
echo   📦 sanjub07/client-store-service:latest
echo   📦 sanjub07/rider-service:latest
echo   📦 sanjub07/spare-parts-service:latest
echo   📦 sanjub07/vehicle-service:latest
echo.
echo Next: Run 'docker-run-all.bat' to start all services
echo.
pause