# StudyPing

StudyPing은 스터디 그룹 매칭 및 실시간 채팅 기능을 제공하는 웹 애플리케이션입니다.

## ✨ 주요 기능

- **사용자 인증**: 회원가입 및 로그인 기능
- **스터디 검색 및 필터링**: 다양한 카테고리(프로그래밍, 외국어, 취업 준비, 자격증, 독서, 기타)별 스터디 검색
- **실시간 채팅**: WebSocket을 이용한 스터디 그룹 내 실시간 채팅 기능
- **스터디 관리**: 스터디 생성, 참여, 관리 기능 (예상)

## 🛠️ 기술 스택

**Frontend (Next.js - `front2` 디렉토리)**

- Next.js
- React
- TypeScript
- Tailwind CSS (가정, 일반적인 Next.js 프로젝트 구성)
- StompJS & SockJS (WebSocket 클라이언트)

**Backend (Spring Boot - `back` 디렉토리)**

- Java
- Spring Boot
- Spring Security (JWT 인증)
- Spring Data JPA
- Spring WebSocket (STOMP)
- H2 Database / MySQL / PostgreSQL (구체적인 DB는 명시되지 않았으나 일반적인 Spring Boot 구성)

## 📂 프로젝트 구조

```
StudyPing/
├── back/         # Spring Boot 백엔드 애플리케이션
├── front2/       # Next.js 프론트엔드 애플리케이션
└── README.md
```

## 🚀 설정 및 실행 방법

### Backend (Spring Boot)

1.  `back` 디렉토리로 이동합니다.
    ```bash
    cd back
    ```
2.  프로젝트를 빌드합니다.
    ```bash
    ./gradlew build
    ```
3.  애플리케이션을 실행합니다. (일반적으로 `build/libs` 디렉토리에 생성된 jar 파일을 실행)
    ```bash
    java -jar build/libs/StudyPing-0.0.1-SNAPSHOT.jar 
    # 또는 IDE에서 Spring Boot Application 직접 실행
    ```
    백엔드 서버는 기본적으로 `http://localhost:8080`에서 실행됩니다.

### Frontend (Next.js)

1.  `front2` 디렉토리로 이동합니다.
    ```bash
    cd front2
    ```
2.  필요한 패키지를 설치합니다.
    ```bash
    npm install
    # 또는 yarn install
    ```
3.  개발 서버를 실행합니다.
    ```bash
    npm run dev
    # 또는 yarn dev
    ```
    프론트엔드 개발 서버는 `http://localhost:3000`에서 실행되며, API 요청은 `next.config.mjs`의 `rewrites` 설정을 통해 `http://localhost:8080`으로 프록시됩니다.

## 📝 API 엔드포인트 (주요)

- `POST /api/member/create`: 회원가입
- `POST /api/member/Login`: 로그인
- `GET /api/study/find/category/{CATEGORY}`: 카테고리별 스터디 조회
- WebSocket Endpoint: `/ws` (STOMP 사용)

## ⚙️ 주요 설정

- **API 프록시**: 프론트엔드(`front2/next.config.mjs`)에서 `/api`로 시작하는 요청을 백엔드(`http://localhost:8080`)로 전달합니다.
- **WebSocket 인증**: 클라이언트는 WebSocket 연결 시 `Authorization` 헤더에 `Bearer {token}` 형식으로 JWT 토큰을 전송해야 합니다.
- **JSON 직렬화**: 백엔드(`WebConfig.java`)에서 `JavaTimeModule`을 `ObjectMapper`에 등록하여 Java 8 날짜/시간 타입(예: `LocalDateTime`)을 올바르게 처리합니다.

## 🤝 기여


