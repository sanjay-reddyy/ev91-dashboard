@echo off
echo.
echo 🚀 EV91 Platform - Complete Deployment
echo ======================================
echo This script will:
echo   1. Build all Docker images
echo   2. Start all services
echo   3. Setup all Prisma databases
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul

echo.
echo 📋 Step 1: Building all Docker images...
echo =========================================
call docker-build-all.bat

echo.
echo 📋 Step 2: Starting all services...
echo ===================================
call docker-run-all.bat

echo.
echo 📋 Step 3: Setting up Prisma databases...
echo =========================================
call prisma-setup-simple.bat

echo.
echo 🎉 DEPLOYMENT COMPLETE!
echo =======================
echo All services are now running and databases are set up.
echo.
echo 🌐 Access your services:
echo   Admin Portal:    http://localhost:3003
echo   API Gateway:     http://localhost:8000
echo   Auth Service:    http://localhost:4001
echo   Client Store:    http://localhost:3006
echo   Rider Service:   http://localhost:4005
echo   Spare Parts:     http://localhost:4010
echo   Vehicle Service: http://localhost:4004
echo.
echo 📊 Check status: docker ps
echo 🛑 Stop all: docker-stop-all.bat
echo.
pause