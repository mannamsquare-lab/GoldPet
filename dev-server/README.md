# 개발 서버 설정 파일

이 폴더는 mannamsquare.com 개발 서버의 설정 파일들을 포함합니다.

## 폴더 구조

```
dev-server/
├── nginx/
│   ├── nginx.conf                    # Nginx 메인 설정
│   ├── sites-available/
│   │   ├── mannam.conf               # mannamsquare.com 도메인 설정
│   │   └── jenkins.mannamsquare.com  # Jenkins 설정
│   └── ssl/
│       └── ssl-params.conf           # SSL/TLS 공통 설정
├── systemd/
│   └── services/
│       └── goldpet-api.service       # Spring Boot API 서비스
├── logrotate-goldpet-api             # API 로그 로테이션
└── logrotate-goldpet-nginx           # Nginx 로그 로테이션
```

## 도메인 구성

| 도메인 | 서비스 | 포트 |
|-------|--------|------|
| mannamsquare.com | Next.js 웹사이트 | 443 |
| api.mannamsquare.com | Spring Boot API | 8081 |
| app.mannamsquare.com | React Frontend | 443 (정적) |
| admin.mannamsquare.com | React Admin | 443 (정적) |
| jenkins.mannamsquare.com | Jenkins CI/CD | 8080 |

## 서버 적용 방법

### 1. Nginx 설정

```bash
# 설정 파일 복사
sudo cp nginx/nginx.conf /etc/nginx/nginx.conf
sudo cp nginx/sites-available/* /etc/nginx/sites-available/
sudo cp nginx/ssl/ssl-params.conf /etc/nginx/ssl/

# 사이트 활성화
sudo ln -sf /etc/nginx/sites-available/mannam.conf /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/jenkins.mannamsquare.com /etc/nginx/sites-enabled/

# 설정 테스트 및 재로드
sudo nginx -t && sudo systemctl reload nginx
```

### 2. Systemd 서비스

```bash
# 서비스 파일 복사
sudo cp systemd/services/goldpet-api.service /etc/systemd/system/

# 서비스 활성화
sudo systemctl daemon-reload
sudo systemctl enable goldpet-api
sudo systemctl start goldpet-api
```

### 3. 로그 로테이션

```bash
sudo cp logrotate-goldpet-* /etc/logrotate.d/
```

## 환경별 도메인

| 환경 | 도메인 |
|-----|--------|
| **dev** | *.mannamsquare.com |
| **prod** | *.goldpet.com |
