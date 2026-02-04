# 로컬 개발 인프라

로컬 개발 환경에서 사용하는 Docker 서비스 설정입니다.

## 서비스 구성

| 서비스 | 포트 | 설명 |
|-------|------|------|
| PostgreSQL | **5433** | PostGIS 16 포함 |
| Redis | 6379 | 캐시/세션 |
| MinIO API | **9100** | S3 호환 스토리지 |
| MinIO Console | **9101** | 웹 콘솔 |

## 사용법

### 서비스 시작

```bash
cd infra
docker compose up -d
```

### 서비스 중지

```bash
docker compose down
```

### 데이터 초기화 (볼륨 삭제)

```bash
docker compose down -v
```

## 기본 접속 정보

| 서비스 | 접속 정보 |
|-------|----------|
| PostgreSQL | `localhost:5433` / goldpet / goldpet123 |
| Redis | `localhost:6379` / password: goldpet123 |
| MinIO | http://localhost:9101 / goldpet-s3-access-key / goldpet-s3-secret-key |

## 파일 구조

```
infra/
├── docker-compose.yml      # Docker 서비스 정의
└── config/
    └── postgres/
        └── postgresql.conf # PostgreSQL 최적화 설정
```

## 관련 문서

- 서버 배포 설정: [deploy/](../deploy/)
- 개발 가이드: [docs/LOCAL_DEVELOPMENT.md](../docs/LOCAL_DEVELOPMENT.md)
