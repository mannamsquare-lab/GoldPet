#!/bin/bash

# Script to start local development infrastructure (DB, Redis, MinIO)
# Usage: ./scripts/dev_infra_up.sh

echo "🚀 Starting GoldPet Local Infrastructure (DB, Redis, MinIO)..."

# Ensure we are at the project root
cd "$(dirname "$0")/.."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Error: Docker is not running. Please start Docker Desktop and try again."
  exit 1
fi

# Run Docker Compose with local config
docker compose -f infra/docker-compose.local.yml up -d

echo ""
echo "✅ Local Infrastructure is UP!"
echo "   - Postgres: localhost:5432 (User: goldpet / Pass: goldpet123)"
echo "   - Redis:    localhost:6379 (Pass: goldpet123)"
echo "   - MinIO:    localhost:9000 (Console: http://localhost:9001)"
echo ""
echo "👉 Now you can run 'api', 'frontend', or 'app' locally."
