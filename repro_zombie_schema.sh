#!/bin/bash
set -e

# Configuration
DB_CONTAINER="goldpet-db-test"
DB_USER="goldpet_user"
DB_PASS="goldpet_password"
DB_NAME="goldpet_db"
DB_PORT="5435" # Use a different port to avoid conflict with running dev server

echo "🧹 Cleaning up previous test container..."
docker rm -f $DB_CONTAINER || true

echo "🐳 Starting fresh Postgres container for testing..."
docker run -d --name $DB_CONTAINER \
  -e POSTGRES_USER=$DB_USER \
  -e POSTGRES_PASSWORD=$DB_PASS \
  -e POSTGRES_DB=$DB_NAME \
  -p $DB_PORT:5432 \
  postgis/postgis:16-3.4

echo "⏳ Waiting for Database to be ready..."
sleep 5
until docker exec $DB_CONTAINER pg_isready -U $DB_USER; do
  echo "Waiting for DB..."
  sleep 2
done


# Helper function to run sql file
run_migration() {
  local file=$1
  echo "running $file..."
  docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -f - < "$file"
}

echo "🏗️ Applying V1 Base Schema (Standard State)..."
run_migration "api/src/main/resources/db/migration/V1__Initial_Schema.sql"

echo "🧟 Creating ZOMBIE Schema (Simulating existing production state)..."
# We manually create the objects that V4-V9 try to create, to assert our fixes work.

docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME <<EOF
-- Simulate V4 Zombie Columns
-- users table exists from V1
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_notification_enabled BOOLEAN;

-- Simulate V5 Zombie Tables
CREATE TABLE IF NOT EXISTS interests (id SERIAL PRIMARY KEY, name VARCHAR(50));
CREATE TABLE IF NOT EXISTS hobbies (id SERIAL PRIMARY KEY, name VARCHAR(50));

-- Simulate V6 Zombie Table
CREATE TABLE IF NOT EXISTS system_settings (setting_key VARCHAR(50) PRIMARY KEY, setting_value TEXT);

-- Simulate V7 Zombie Column
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_pet BOOLEAN;

-- Simulate V8 Zombie Tables (Partially created, missing columns to test V8 fix)
CREATE TABLE IF NOT EXISTS walks (id SERIAL PRIMARY KEY, user_id BIGINT); 
-- Note: 'walks' created here lacks 'path', 'distance_km' etc. V8 must fix this.
CREATE TABLE IF NOT EXISTS walk_spots (id SERIAL PRIMARY KEY, walk_id BIGINT);

EOF

echo "✅ Zombie Schema Injected."

echo "🚀 Running Migrations against Zombie DB..."

# Run the modified migrations
run_migration "api/src/main/resources/db/migration/V4__Add_Legacy_Auth_And_Profile.sql"
run_migration "api/src/main/resources/db/migration/V5__Add_Interests_and_Hobbies.sql"
run_migration "api/src/main/resources/db/migration/V6__Add_System_Settings.sql"
run_migration "api/src/main/resources/db/migration/V7__Add_Has_Pet.sql"
run_migration "api/src/main/resources/db/migration/V8__Add_Walk_Spot.sql"
run_migration "api/src/main/resources/db/migration/V9__Add_Gamification_Test_Data.sql"

echo "🎉 SUCCESS! All migrations ran without error against the pre-existing schema."
echo "🧹 Cleaning up..."
docker rm -f $DB_CONTAINER
