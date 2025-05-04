#!/bin/bash

echo ""
echo "🔨 백엔드 빌드 중..."
(cd back && ./gradlew clean build -x test)

echo ""
echo "🧹 기존 Docker 컨테이너 중단 중..."
docker-compose down

echo ""
echo "🏗️ Docker 이미지 재빌드 중 (캐시 사용 안 함)..."
docker-compose build --no-cache

echo ""
echo "🚀 새로운 컨테이너로 Docker 실행 중..."
docker-compose up -d

echo ""
echo "✅ 배포 완료! 서버가 실행되었습니다."


echo ""
echo "📚 로그도 저장되었습니다."
# 로그 저장 부분을 삭제하거나 주석 처리하는 것이 좋을 수 있습니다.
# -f 옵션으로 실행하면 스크립트가 끝나지 않을 수 있습니다.
# 필요하다면 나중에 수동으로 로그를 확인하세요.
# docker logs -f backend-container > spring-start-log.txt