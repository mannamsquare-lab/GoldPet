# GoldPet_v1.1_PRD.md

# 📘 GoldPet – PRD v1.1 (with DevOps & Docker)

이 문서는 기존 v1.0 PRD에 **Docker 기반 개발환경, DevOps, AWS 인프라 아키텍처**를 추가한 업데이트 버전입니다.

---

# 1. 프로젝트 개요
GoldPet은 반려동물의 산책, 프로필 관리, AI 프로필 생성, 친구 매칭, 커뮤니티 등 반려동물 중심 서비스를 제공하는 모바일 앱이다. Flutter 기반으로 Android/iOS 앱을 출시한다.

---

# 2. 주요 기능
(※ v1.0과 동일 — 기능 상세 스펙 Level 2 포함)

## 2.1 회원가입 & 프로필
- SNS 간편가입  
- 기본 프로필 설정  
- 반려동물 프로필 등록  
- 위치 설정  

## 2.2 산책 기능
- GPS 기반 산책 추적  
- 궤적 기록  
- Spot(사진+메모) 저장  
- 칼로리 계산  
- 산책 기록 히스토리  

## 2.3 친구 찾기 & 매칭
- 반려동물 필터 기반 프로필 추천  
- “좋아요” 기반 매칭  
- 매칭 시 1:1 채팅방 생성  

## 2.4 채팅
- 1:1 매칭 채팅  
- 그룹 채팅  
- AI 펫 챗봇  

## 2.5 AI 프로필 생성
- Pixar / 애니 / 디즈니 스타일 이미지  
- 단일 이미지 또는 3~5초 영상 생성  

## 2.6 커뮤니티
- 게시글 작성  
- 사진 업로드  
- 좋아요 / 댓글 / 신고  
- 인기글 피드  

## 2.7 Gold 시스템
- 가입 시 3,000 Gold 지급  
- Gold 충전 (IAP)  
- Gold 사용처: AI 생성, 추가 좋아요, 부스터 등  

---

# 3. 기능 상세 스펙 (레벨 2 – 기능 흐름 중심)

## 3.1 회원가입 흐름
1. SNS 선택  
2. 약관 동의  
3. 사용자 정보 입력  
4. 위치 권한 요청  
5. 반려동물 등록  
6. 3,000 Gold 지급  

## 3.2 산책 기록 흐름
1. 산책 시작  
2. GPS 추적  
3. 사진 Spot 기록  
4. 종료 → 통계 계산  
5. 기록 저장  

## 3.3 매칭 흐름
1. 추천 사용자 노출  
2. 좋아요 클릭 시 알림 전송  
3. 상대도 좋아요 → 매칭  
4. 채팅방 자동 생성  

## 3.4 AI 프로필 생성 흐름
1. 반려동물 정보 입력/사진 선택  
2. 스타일 선택  
3. Gold 사용 여부 안내  
4. AI 서버 처리  
5. 이미지/동영상 출력  

---

# 4. 데이터 모델 (요약)
- User  
- Pet  
- WalkRecord  
- WalkSpot  
- Match  
- ChatRoom  
- ChatMessage  
- CommunityPost  
- CommunityComment  
- GoldTransaction  
- Notification  

---

# 5. DevOps & Docker 구성 (v1.1 신규 추가)

GoldPet의 실제 개발·배포를 위한 **DevOps 아키텍처 및 Docker 개발환경 구성**을 포함한다.

---

# 6. Docker 기반 전체 시스템 아키텍처

```
Flutter App
   │
   ▼
Backend API Server (Spring Boot)
   │
   ├── PostgreSQL
   ├── Redis
   └── AI Image/Video Server (FastAPI)

Nginx Gateway (SSL/TLS, Routing)
```

---

# 7. Dockerfile 구성

## 7.1 Backend Dockerfile

```dockerfile
FROM gradle:8-jdk21 AS builder
WORKDIR /app
COPY . .
RUN gradle clean build -x test

FROM eclipse-temurin:21-jdk-alpine
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

---

## 7.2 AI Server Dockerfile

```dockerfile
FROM python:3.10-slim
WORKDIR /app

RUN apt-get update && apt-get install -y git

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 7.3 Nginx Dockerfile

```dockerfile
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY certs/* /etc/nginx/certs/

EXPOSE 80
EXPOSE 443
```

---

# 8. docker-compose.yml (로컬 개발환경)

```yaml
version: "3.9"

services:
  api:
    build: ./backend
    container_name: goldpet-api
    ports:
      - "8080:8080"
    environment:
      SPRING_PROFILES_ACTIVE: dev
      DB_HOST: postgres
      REDIS_HOST: redis
    depends_on:
      - postgres
      - redis

  ai:
    build: ./ai-server
    container_name: goldpet-ai
    ports:
      - "8000:8000"

  postgres:
    image: postgres:15
    container_name: goldpet-postgres
    environment:
      POSTGRES_DB: goldpet
      POSTGRES_USER: goldpet
      POSTGRES_PASSWORD: goldpet123
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:alpine
    container_name: goldpet-redis
    ports:
      - "6379:6379"

  nginx:
    build: ./nginx
    container_name: goldpet-nginx
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - api
      - ai

volumes:
  pgdata:
```

---

# 9. CI/CD (GitHub Actions 기반)

다음은 Backend API의 자동 빌드 & 배포 파이프라인 예시이다.

```yaml
name: Backend CI/CD

on:
  push:
    branches: [ "main" ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up JDK
        uses: actions/setup-java@v3
        with:
          java-version: "21"

      - name: Build JAR
        run: |
          cd backend
          ./gradlew build -x test

      - name: Build Docker Image
        run: |
          docker build -t goldpet-api ./backend

      - name: Login to AWS
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_KEY }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET }}
          aws-region: ap-northeast-2

      - name: Push to ECR
        run: |
          aws ecr get-login-password --region ap-northeast-2 | docker login --username AWS --password-stdin <ECR_URL>
          docker tag goldpet-api <ECR_URL>:latest
          docker push <ECR_URL>:latest
```

---

# 10. AWS 인프라 아키텍처

```
Route53
   │
   ▼
ALB(HTTPS, WAF 가능)
   │
   ├── ECS Fargate (API Server)
   └── ECS Fargate (AI Server)

RDS PostgreSQL
ElastiCache Redis
S3 (이미지/영상 스토리지)
```

---

# 11. 환경 변수 / 시크릿 관리 전략

| 환경 | 방식 |
|------|-------|
| Local | .env 파일 |
| Dev / Staging / Prod | AWS Parameter Store / Secrets Manager |
| Flutter App | Flutter .env 파일 + secure storage |

---

# 12. 향후 DevOps 확장 로드맵
- Kubernetes(EKS) 전환  
- AI 서버 GPU 환경 구성  
- CloudWatch 기반 전체 로그/메트릭 모니터링  
- Grafana/Prometheus 추가  
- Zero-downtime 배포 (Blue/Green 또는 Canary)  

---

# ✔ 완료
이 문서는 GoldPet 서비스의 기능 + DevOps + Docker + AWS 구성 요소까지 모두 포함된 **v1.1 완전 문서**입니다.
