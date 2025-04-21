#!/bin/bash

echo ""
echo "🛠  Gradle 빌드 중... (테스트는 제외됨)"
./gradlew clean build -x test

echo ""
echo "🧹 기존 Docker 컨테이너 중단 중..."
docker-compose down

echo ""
echo "🚀 새로운 컨테이너로 Docker 실행 중..."
docker-compose up --build -d

echo ""
echo "✅ 배포 완료! 서버가 실행되었습니다."


echo ""
echo "📚 로그도 저장되었습니다."
docker logs -f backend-container > spring-start-log.txt