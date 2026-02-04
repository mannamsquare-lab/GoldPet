#!/bin/bash

# API 서버 배포 스크립트 (개발 서버용)
# Usage: sudo ./deploy-dev/scripts/deploy-api.sh

set -e

DEPLOY_PATH="/home/dev/www/mannam/goldpet/api"
JAR_NAME="goldpet-api.jar"

echo "🚀 Deploying GoldPet API to dev server..."

# JAR 빌드
cd "$(dirname "$0")/../../api"
./gradlew clean bootJar

# 백업
if [ -f "$DEPLOY_PATH/$JAR_NAME" ]; then
    BACKUP_NAME="${JAR_NAME}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$DEPLOY_PATH/$JAR_NAME" "$DEPLOY_PATH/$BACKUP_NAME"
    echo "📦 Backed up to $BACKUP_NAME"
fi

# 서비스 중지
sudo systemctl stop goldpet-api || true

# JAR 복사
cp build/libs/*.jar "$DEPLOY_PATH/$JAR_NAME"

# 서비스 시작
sudo systemctl start goldpet-api

echo "✅ API deployed successfully!"
echo "   Check status: sudo systemctl status goldpet-api"
