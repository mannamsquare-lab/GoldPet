# GoldPet Infrastructure Guide

## 환경 구성

| 환경 | 도메인 | 용도 |
|-----|--------|------|
| **local** | localhost | 로컬 개발 |
| **dev** | {api,app,admin}.mannamsquare.com | 개발/테스트 서버 |
| **prod** | {api,app,admin}.goldpet.com | 상용 서버 |

## 1. 로컬 개발 환경 (Docker)

### 서비스 시작

```bash
cd infra
docker compose -f docker-compose.local.yml up -d
```

### 로컬 포트 매핑

| 서비스 | 포트 | 설명 |
|-------|------|------|
| PostgreSQL | 5433 | PostGIS 포함 |
| Redis | 6379 | 캐시/세션 |
| MinIO API | 9100 | S3 호환 스토리지 |
| MinIO Console | 9101 | 웹 콘솔 |

### 환경 변수 설정

```bash
cp .env.example .env
# .env 파일에서 비밀번호 설정
```

## 2. 개발/상용 서버 배포

### Docker 서비스 시작

```bash
cd infra
docker compose --env-file .env up -d
```

### 서비스 확인

```bash
docker compose ps
# goldpet-db, goldpet-redis, goldpet-minio
```

## 3. Nginx 설정

### 설정 파일

- 개발 서버: `dev-server/mannam.conf`
- 위치: `/etc/nginx/sites-available/goldpet.conf`

### 적용

```bash
sudo ln -s /etc/nginx/sites-available/goldpet.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 4. 서비스 URL

### 개발 서버 (mannamsquare.com)

| 서비스 | URL |
|-------|-----|
| Frontend | https://app.mannamsquare.com |
| Admin | https://admin.mannamsquare.com |
| API | https://api.mannamsquare.com |
| Jenkins | https://jenkins.mannamsquare.com |

### 상용 서버 (goldpet.com)

| 서비스 | URL |
|-------|-----|
| Frontend | https://app.goldpet.com |
| Admin | https://admin.goldpet.com |
| API | https://api.goldpet.com |

## 5. Jenkins CI/CD

Jenkins 파이프라인으로 배포:

- **API**: `PROFILE` 파라미터 (dev/prod)
- **Frontend**: `ENV` 파라미터 (dev/prod)
- **Admin**: `ENV` 파라미터 (dev/prod)

## 6. 문제 해결

### DB 연결 실패

```bash
docker compose logs db
docker compose exec db psql -U goldpet -d goldpet_db
```

### MinIO 접근 불가

```bash
docker compose logs minio
# 브라우저: http://localhost:9101 (로컬)
```
