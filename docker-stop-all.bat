@echo off
echo.
echo 🛑 EV91 Platform - Stop All Services
echo ====================================

echo Stopping all running containers...
echo.

echo 🔧 Stopping: admin-portal
docker stop admin-portal 2>nul
if %errorlevel% equ 0 (
    echo ✅ admin-portal stopped
) else (
    echo ⚠️ admin-portal was not running
)

echo 🔧 Stopping: api-gateway
docker stop api-gateway 2>nul
if %errorlevel% equ 0 (
    echo ✅ api-gateway stopped
) else (
    echo ⚠️ api-gateway was not running
)

echo 🔧 Stopping: auth-service
docker stop auth-service 2>nul
if %errorlevel% equ 0 (
    echo ✅ auth-service stopped
) else (
    echo ⚠️ auth-service was not running
)

echo 🔧 Stopping: client-store-service
docker stop client-store-service 2>nul
if %errorlevel% equ 0 (
    echo ✅ client-store-service stopped
) else (
    echo ⚠️ client-store-service was not running
)

echo 🔧 Stopping: rider-service
docker stop rider-service 2>nul
if %errorlevel% equ 0 (
    echo ✅ rider-service stopped
) else (
    echo ⚠️ rider-service was not running
)

echo 🔧 Stopping: spare-parts-service
docker stop spare-parts-service 2>nul
if %errorlevel% equ 0 (
    echo ✅ spare-parts-service stopped
) else (
    echo ⚠️ spare-parts-service was not running
)

echo 🔧 Stopping: vehicle-service
docker stop vehicle-service 2>nul
if %errorlevel% equ 0 (
    echo ✅ vehicle-service stopped
) else (
    echo ⚠️ vehicle-service was not running
)

echo.
echo 🧹 Removing stopped containers...
docker rm admin-portal api-gateway auth-service client-store-service rider-service spare-parts-service vehicle-service 2>nul

echo.
echo ✅ All services stopped and cleaned up!
echo.
pause