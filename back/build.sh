#!/bin/bash


echo ""
echo "🧹 기존 Docker 컨테이너 중단 중..."
docker-compose down --volumes

echo ""
echo "🐈 Gradle 빌드 중..."
./gradlew clean build -x test

echo ""
echo "🚀 새로운 컨테이너로 Docker 실행 중..."
docker-compose up --build

echo ""
echo "✅ 서버가 실행되었습니다."

