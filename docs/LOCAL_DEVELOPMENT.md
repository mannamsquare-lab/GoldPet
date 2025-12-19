# Local Development Guide (로컬 개발 가이드)

이 문서는 로컬 환경(내 컴퓨터)에서 GoldPet 프로젝트를 개발하고 테스트하는 방법을 안내합니다.
실서버 배포 환경(`infra/docker-compose.yml`)과 달리, 로컬 개발 시에는 **백엔드/프론트엔드 코드를 직접 실행**하여 빠른 디버깅과 Hot Reload 기능을 활용합니다.

## 1. 사전 준비 (Prerequisites)

*   **Docker Desktop**: 데이터베이스(Postgres), 캐시(Redis), 스토리지(MinIO) 실행용.
*   **Java 21 (JDK)**: 백엔드 빌드 및 실행용.
*   **Node.js (v20 이상) & npm**: 프론트엔드 실행용.
*   **Flutter SDK**: 모바일 앱 실행용.

## 2. 인프라 실행 (Database, Redis, MinIO)

로컬 개발 시 DB나 Redis를 직접 설치할 필요 없이 Docker를 통해 실행합니다.
포트 충돌 방지를 위해 로컬 개발용 포트는 기본 포트와 다르게 설정되어 있습니다 (application.yml 기준).

*   **PostgreSQL**: `localhost:5432`
*   **Redis**: `localhost:6379`
*   **MinIO**: `localhost:9000` (API), `9001` (Console)

### 실행 방법
터미널에서 다음 스크립트를 실행하여 인프라 컨테이너만 띄웁니다.

```bash
# 프로젝트 루트에서 실행
./scripts/dev_infra_up.sh
```

또는 수동으로 실행:
```bash
docker compose -f infra/docker-compose.local.yml up -d
```

## 3. 백엔드 (API) 실행

IntelliJ IDEA 또는 터미널에서 실행합니다.

*   **위치**: `api/`
*   **설정 파일**: `api/src/main/resources/application.yml` (기본 profile: local)
*   **실행 확인**: `http://localhost:8080`

```bash
cd api
./gradlew bootRun
```

## 4. 프론트엔드 (React) 실행

웹 브라우저에서 개발하기 위해 실행합니다.

*   **위치**: `frontend/`
*   **실행 확인**: `http://localhost:5173` (Vite 기본 포트)

```bash
cd frontend
npm install
npm run dev
```

## 5. 모바일 앱 (Flutter) 실행

iOS 시뮬레이터 또는 Android 에뮬레이터에서 실행합니다.

*   **위치**: `app/`

```bash
cd app
flutter pub get
flutter run
```

---

## 💡 자주 묻는 질문 (FAQ)

### Q: DB 데이터를 초기화하고 싶어요.
A: Docker 볼륨을 삭제하고 재시작하면 됩니다.
```bash
docker compose -f infra/docker-compose.local.yml down -v
./scripts/dev_infra_up.sh
```

### Q: 포트 5432가 이미 사용 중이라고 떠요.
A: 만약 로컬에 이미 Postgres가 실행 중이라면 포트 충돌이 발생할 수 있습니다. 이미 실행 중인 Postgres를 끄거나, 충돌이 발생하면 `infra/docker-compose.local.yml`에서 포트를 변경해주세요.
