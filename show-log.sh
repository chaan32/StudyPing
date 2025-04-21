#!/bin/bash


echo ""
echo "📚 현재 작성된 로그가 저장되었습니다."
docker logs -f backend-container > spring-exec-log.txt