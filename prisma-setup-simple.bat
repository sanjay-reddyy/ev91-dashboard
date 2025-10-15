@echo off
echo.
echo 🚀 EV91 Platform - Prisma Setup for All Services
echo =================================================

set "COMMAND=%~1"
if "%COMMAND%"=="" set "COMMAND=all"

echo Command: %COMMAND%
echo.

echo 🔧 Processing: auth-service
echo ----------------------------------------
if "%COMMAND%"=="generate" (
    echo 📦 Generating Prisma Client...
    docker exec -it auth-service npx prisma generate
) else if "%COMMAND%"=="push" (
    echo 🗄️ Pushing database schema...
    docker exec -it auth-service npx prisma db push
) else if "%COMMAND%"=="seed" (
    echo 🌱 Seeding database...
    docker exec -it auth-service npx prisma db seed
) else if "%COMMAND%"=="reset" (
    echo 🔄 Resetting database...
    docker exec -it auth-service npx prisma db reset --force
) else (
    echo 📦 Generating Prisma Client...
    docker exec -it auth-service npx prisma generate
    echo 🗄️ Pushing database schema...
    docker exec -it auth-service npx prisma db push
    echo 🌱 Seeding database...
    docker exec -it auth-service npx prisma db seed
)

echo.
echo 🔧 Processing: client-store-service
echo ----------------------------------------
if "%COMMAND%"=="generate" (
    echo 📦 Generating Prisma Client...
    docker exec -it client-store-service npx prisma generate
) else if "%COMMAND%"=="push" (
    echo 🗄️ Pushing database schema...
    docker exec -it client-store-service npx prisma db push
) else if "%COMMAND%"=="seed" (
    echo 🌱 Seeding database...
    docker exec -it client-store-service npx prisma db seed
) else if "%COMMAND%"=="reset" (
    echo 🔄 Resetting database...
    docker exec -it client-store-service npx prisma db reset --force
) else (
    echo 📦 Generating Prisma Client...
    docker exec -it client-store-service npx prisma generate
    echo 🗄️ Pushing database schema...
    docker exec -it client-store-service npx prisma db push
    echo 🌱 Seeding database...
    docker exec -it client-store-service npx prisma db seed
)

echo.
echo 🔧 Processing: rider-service
echo ----------------------------------------
if "%COMMAND%"=="generate" (
    echo 📦 Generating Prisma Client...
    docker exec -it rider-service npx prisma generate
) else if "%COMMAND%"=="push" (
    echo 🗄️ Pushing database schema...
    docker exec -it rider-service npx prisma db push
) else if "%COMMAND%"=="seed" (
    echo 🌱 Seeding database...
    docker exec -it rider-service npx prisma db seed
) else if "%COMMAND%"=="reset" (
    echo 🔄 Resetting database...
    docker exec -it rider-service npx prisma db reset --force
) else (
    echo 📦 Generating Prisma Client...
    docker exec -it rider-service npx prisma generate
    echo 🗄️ Pushing database schema...
    docker exec -it rider-service npx prisma db push
    echo 🌱 Seeding database...
    docker exec -it rider-service npx prisma db seed
)

echo.
echo 🔧 Processing: spare-parts-service
echo ----------------------------------------
if "%COMMAND%"=="generate" (
    echo 📦 Generating Prisma Client...
    docker exec -it spare-parts-service npx prisma generate
) else if "%COMMAND%"=="push" (
    echo 🗄️ Pushing database schema...
    docker exec -it spare-parts-service npx prisma db push
) else if "%COMMAND%"=="seed" (
    echo 🌱 Seeding database...
    docker exec -it spare-parts-service npx prisma db seed
) else if "%COMMAND%"=="reset" (
    echo 🔄 Resetting database...
    docker exec -it spare-parts-service npx prisma db reset --force
) else (
    echo 📦 Generating Prisma Client...
    docker exec -it spare-parts-service npx prisma generate
    echo 🗄️ Pushing database schema...
    docker exec -it spare-parts-service npx prisma db push
    echo 🌱 Seeding database...
    docker exec -it spare-parts-service npx prisma db seed
)

echo.
echo 🔧 Processing: vehicle-service
echo ----------------------------------------
if "%COMMAND%"=="generate" (
    echo 📦 Generating Prisma Client...
    docker exec -it vehicle-service npx prisma generate
) else if "%COMMAND%"=="push" (
    echo 🗄️ Pushing database schema...
    docker exec -it vehicle-service npx prisma db push
) else if "%COMMAND%"=="seed" (
    echo 🌱 Seeding database...
    docker exec -it vehicle-service npx prisma db seed
) else if "%COMMAND%"=="reset" (
    echo 🔄 Resetting database...
    docker exec -it vehicle-service npx prisma db reset --force
) else (
    echo 📦 Generating Prisma Client...
    docker exec -it vehicle-service npx prisma generate
    echo 🗄️ Pushing database schema...
    docker exec -it vehicle-service npx prisma db push
    echo 🌱 Seeding database...
    docker exec -it vehicle-service npx prisma db seed
)

echo.
echo ✅ All services processed!
echo.
echo Usage Examples:
echo   prisma-setup-all.bat              # Run all commands
echo   prisma-setup-all.bat generate     # Only generate clients
echo   prisma-setup-all.bat push         # Only push schemas  
echo   prisma-setup-all.bat seed         # Only seed databases
echo   prisma-setup-all.bat reset        # Reset all databases
pause