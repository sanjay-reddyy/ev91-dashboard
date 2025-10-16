#!/bin/sh
echo "🌱 Running Prisma migrations + seeds..."

# auth-service
docker-compose exec -T auth-service sh -c "
  npx prisma db push &&
  npx prisma db seed &&
  npx tsx prisma/seed
"

# client-store-service
docker-compose exec -T client-store-service sh -c "
  npx prisma db push &&
  npx prisma db seed &&
  npx tsx prisma/seed
"

# spare-parts-service
docker-compose exec -T spare-parts-service sh -c "
  npx prisma db push &&
  npx prisma db seed &&
  npx tsx prisma/seed
"

# vehicle-service
docker-compose exec -T vehicle-service sh -c "
  npx prisma db push &&
  npx prisma db seed &&
  npx tsx prisma/seed
"

# rider-service
docker-compose exec -T rider-service sh -c "
  npx prisma db push &&
  npx prisma db seed &&
"

echo "✅ All seeds completed successfully!"
