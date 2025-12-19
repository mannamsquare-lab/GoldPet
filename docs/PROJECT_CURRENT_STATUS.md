# GoldPet 프로젝트 현황 종합 분석 (2025-11-24)

\u003e 본 문서는 GoldPet 프로젝트의 PRD 문서, 기술 문서, 현재 소스코드를 종합 분석한 현황 보고서입니다.

---

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [문서 변천사 분석](#문서-변천사-분석)
3. [최종 기술 스펙](#최종-기술-스펙)
4. [현재 구현 상태](#현재-구현-상태)
5. [핵심 기능 상세](#핵심-기능-상세)
6. [아키텍처 및 설계](#아키텍처-및-설계)
7. [데이터 모델 (ERD)](#데이터-모델-erd)
8. [구현 우선순위 및 향후 계획](#구현-우선순위-및-향후-계획)
9. [리스크 및 오픈 이슈](#리스크-및-오픈-이슈)

---

## 🎯 프로젝트 개요

### 비전
**"반려동물과 함께하는 모든 순간을 기록하고, 그 기록을 통해 좋은 산책 코스와 좋은 사람/펫을 연결하며, 지속적인 동기를 부여하는 반려 라이프 플랫폼"**

### 핵심 가치
- 산책 중심의 행동 데이터(위치·시간·궤적) + 펫/사용자 성향 정보
- 커뮤니티 & 매칭 기능을 결합
- 게이미피케이션(뱃지/챌린지) 요소를 통한 사용자 참여 유도
- 실제 만남과 즐거운 산책 경험 연결

### 타겟 유저
- 반려견/반려묘를 키우는 20~40대
- 산책과 야외 활동을 즐기는 유저
- 반려동물 친구 & 사람 친구를 함께 만들고 싶은 유저
- AI 펫 프로필 이미지/영상에 관심이 많은 유저
- 자신의 활동에 대한 성취감과 보상을 중요하게 생각하는 유저

---

## 📚 문서 변천사 분석

### PRD 문서 버전별 주요 변경사항

#### v1.0 (기본 개념)
- **핵심 기능 정의**: 회원가입, 펫 프로필, 산책 기록, 친구 매칭, 채팅, AI 프로필 생성, 커뮤니티, Gold 시스템
- **기술 스택**: Flutter, Spring Boot, PostgreSQL, Redis
- **초기 데이터 모델**: User, Pet, WalkRecord, ChatRoom, CommunityPost 등 기본 엔티티

#### v1.1 (DevOps 추가)
- **Docker 기반 개발환경** 구성 추가
- **AWS 인프라 아키텍처** 정의 (ECS Fargate, RDS, ElastiCache)
- **CI/CD 파이프라인** 설계 (GitHub Actions)

#### v1.2 (ERD/API/Flutter 구조)
- **상세 ERD 설계** 추가
- **API 엔드포인트 설계서** 추가
- **Flutter 프로젝트 구조** (Feature-first + Clean Architecture) 정의

#### v1.3 (펫 도메인 & 채팅 확장)
- **펫 정보 구조 개선**: 종/품종 테이블 분리로 확장성 확보
- **채팅 기능 강화**: 파일(이미지/영상/문서), 이모티콘/스티커 지원 추가
- **산책 앨범 & 공개 범위**: WalkAlbum 엔티티 추가, visibility(PUBLIC/FRIENDS/PRIVATE) 설정

#### v1.4 (지도 기능 추가)
- **지도 기반 산책 코스 표시**: Polyline(궤적) + Spot 마커
- **지도 기반 친구 찾기**: 위치 기반 친구 마커 표시
- **지도 UX 명세**: 산책 지도, 친구 지도 화면 설계

#### v1.5 (Naver Maps 확정)
- **지도 SDK 결정**: **Naver Maps API** 공식 채택
- **플랫폼 설정**: Android/iOS용 Client ID 설정 방법 정의
- **PostGIS 활용 전제**: 좌표 체계 및 공간 쿼리 설계

#### v1.6 (UX 통합)
- **산책 지도 화면 UX** 상세 정의
- **친구 지도 화면 UX** 상세 정의
- **지도-카드 연동** 인터랙션 설계

#### v2.0 Final (최종 통합)
- **PostGIS 기반 ERD** 확정
- **모든 기능 통합 정리**: 인증, 프로필, 산책, 친구, 채팅, AI, 커뮤니티, Gold, 알림, 설정
- **MVP 범위 정의**: 초기 출시 기능과 추후 확장 기능 분리
- **비기능 요구사항**: 성능, 보안, 개인정보 보호, 모니터링

#### v2.1 Final (게이미피케이션 & 소셜+)
- **(신규) 뱃지 & 업적 시스템**: 사용자 활동 기반 뱃지 부여
- **(신규) 챌린지 시스템**: 주간/월간 목표 제공 및 보상
- **(신규) 장소 체크인**: 펫 프렌들리 카페, 공원 등 장소 기록
- **커뮤니티 강화**: 게시글 타입(일반/질문/정보) 및 답변 채택 기능
- **신규 테이블**: badges, user_badges, challenges, user_challenge_progress, places, check_ins

### 기타 주요 문서

#### `GoldPet_Final_ERD_PostGIS_v1.0.md`
- **PostgreSQL + PostGIS** 기반 최종 데이터 모델
- **공간 타입**: `geometry(Point, 4326)`, `geometry(LineString, 4326)`
- **핵심 테이블**: users, pets, walk_records, walk_spots, matches, chat_rooms, community_posts 등

#### `GoldPet_Hybrid_App_Architecture_v1.0.md`
- **Flutter + React 19 하이브리드 아키텍처**
- Flutter는 네이티브 기능(GPS, 카메라, 푸시 알림) 담당
- React 19는 모든 UI 레이어 담당
- JavaScript Bridge를 통한 양방향 통신

#### 기타 UX 문서
- `GoldPet_Walk_Map_UX_v1.md`: 산책 지도 화면 상세
- `GoldPet_Friend_Map_UX_v1.md`: 친구 지도 화면 상세
- `GoldPet_Flutter_Onboarding_Flow_v1.md`: 온보딩 플로우
- `GoldPet_Flutter_App_Architecture_v1.0.md`: Flutter 앱 아키텍처

---

## 🛠️ 최종 기술 스펙

### 클라이언트
- **Flutter** (Android / iOS)
- **지도**: Naver Maps API + `flutter_naver_map` 플러그인
- **상태관리**: Riverpod / Bloc (추후 팀 결정)
- **(대안) React 19**: 하이브리드 아키텍처 적용 시 UI 레이어로 사용

### 서버
- **Java 21 + Spring Boot 3.x**
- REST API + Swagger (OpenAPI 3)
- JWT 기반 인증/인가 (Access + Refresh Token)
- **Python AI 서버**: AI 펫 프로필 이미지/영상 생성

### 데이터베이스
- **PostgreSQL** (주 데이터베이스)
- **PostGIS 확장**
  - `geometry(Point, 4326)`: 사용자/Spot/장소 위치
  - `geometry(LineString, 4326)`: 산책 궤적
  - GIST 인덱스 기반 공간 쿼리
- **Redis**: 세션, 캐시, 실시간 기능 보조

### 인프라 & DevOps
- **로컬**: Docker / docker-compose
- **프로덕션**: AWS ECS Fargate, RDS (PostgreSQL + PostGIS), ElastiCache (Redis), S3 (파일), CloudFront (옵션)
- **CI/CD**: GitHub Actions
- **모니터링**: CloudWatch + APM
- **에러 트래킹**: Sentry 등

### 지도 & 위치
- **Naver Maps API** 공식 채택
- **Naver Cloud Platform**: Client ID/Secret 발급 및 관리
- **Flutter 플러그인**: `flutter_naver_map`

---

## 🔍 현재 구현 상태

### 백엔드 (Spring Boot)

#### 확인된 구성
```
backend/
├── Dockerfile
├── build.gradle.kts
├── settings.gradle.kts
└── src/
    └── main/
        └── resources/
            ├── application.yml      # Spring Boot 설정
            └── db/                  # 데이터베이스 관련
```

#### 주요 설정 (`application.yml` 기반 추정)
- Spring Boot 기본 설정 존재
- 데이터베이스 연결 설정 가능성
- Flyway 마이그레이션 스크립트 디렉토리 구조 확인

#### 구현 상태 평가
- **기본 프로젝트 구조**: ✅ 설정됨
- **도커화**: ✅ Dockerfile 존재
- **데이터베이스 마이그레이션**: ⚠️ db 디렉토리 존재, 스키마 확인 필요
- **API 구현**: ❌ 소스코드 확인 필요 (java 디렉토리 미확인)

### 프론트엔드 (Flutter)

#### 확인된 구성
```
flutter/
├── goldpet_app/          # 메인 Flutter 앱 (174개 파일)
├── react-app/            # React 앱 (100개 파일) - 하이브리드 구조
├── react-app-setup.md    # React 설정 가이드
└── react-app-templates/  # React 템플릿
```

#### 하이브리드 아키텍처
- **Flutter**: 네이티브 기능 레이어
- **React 19**: UI 레이어
- JavaScript Bridge를 통한 통신

#### 구현 상태 평가
- **Flutter 프로젝트**: ✅ 기본 구조 생성됨 (174개 파일)
- **React 프로젝트**: ✅ 기본 구조 생성됨 (100개 파일)
- **하이브리드 통합**: ⚠️ 아키텍처 설계 완료, 구현 상태 확인 필요

### 데이터베이스

#### Flyway 마이그레이션
- `src/main/resources/db/` 디렉토리 존재 확인
- **필요 작업**: v2.1 ERD 기반 마이그레이션 스크립트 작성
  - V1: 기본 스키마 (PostGIS 포함)
  - V2: 초기 데이터 (Seed Data)
  - V3: 게이미피케이션 테이블 (badges, challenges, places 등)

#### PostGIS 설정
- PostgreSQL + PostGIS 확장 필요
- docker-compose.yml에서 PostGIS 이미지 사용 확인 필요

---

## 💎 핵심 기능 상세

### 1. 회원가입 & 인증
- **SNS 간편가입**: Kakao, Naver, Google, Apple
- **JWT 토큰**: Access Token (단기) + Refresh Token (장기)
- **온보딩 플로우**: SNS 로그인 → 약관 동의 → 프로필 설정 → 위치 설정 → 펫 등록

### 2. 사용자 & 펫 프로필
- **사용자**: 닉네임, 성별, 연령대, 주요 활동 지역(`main_location_geom` Point), 프로필 이미지
- **펫**: 이름, 종(pet_species), 품종(pet_breeds), 성별, 나이, 체중, 중성화 여부, 성격 태그, 프로필 이미지
- **확장 속성**: `pet_attribute_defs` + `pet_attribute_values`로 추가 정보 관리

### 3. 산책 기능 (GPS + 지도 + 앨범)
- **산책 기록**: GPS 기반 실시간 추적, 궤적(LineString) 저장
- **Spot**: 사진 촬영 지점(Point) + 사진 + 메모
- **산책 지도**: Naver Map에 Polyline(궤적) + Spot 마커 표시
- **앨범**: 산책 기록을 앨범 단위로 그룹화
- **공개 범위**: PUBLIC / FRIENDS / PRIVATE
- **체크인**: 특정 장소(places) 방문 시 체크인 기록

### 4. 친구 찾기 & 매칭
- **추천 로직**: 거리, 펫 종/품종, 성격, 활동 지역, 공통 장소 방문 등
- **친구 지도**: Naver Map에 주변 친구 마커 표시
- **좋아요 & 매칭**: 양방향 좋아요 시 매칭 성립 → 1:1 채팅방 자동 생성
- **필터**: 종, 품종, 나이, 성별, 성격, 거리 등

### 5. 채팅
- **1:1 채팅**: 매칭 시 자동 생성
- **그룹 채팅**: 산책 모임 등
- **AI 펫 챗봇**: 펫 성격 기반 말투, 산책/식단/건강 조언
- **메시지 타입**: 텍스트, 이미지, 영상, 파일, 이모티콘, 이모지, 시스템 메시지

### 6. AI 펫 프로필 생성
- **입력**: 펫 정보 + 사진
- **스타일**: PIXAR, ANIME, DISNEY 등
- **출력**: 이미지 또는 3~5초 영상
- **Gold 소모**: 생성 시 Gold 차감
- **비동기 처리**: 작업 큐를 통한 백그라운드 처리

### 7. 커뮤니티
- **카테고리**: 산책, 건강, 정보, 자랑 등
- **게시글 타입**: 일반글, 질문글, 정보글
- **답변 채택**: 질문글의 경우 댓글 중 하나를 답변으로 채택
- **기능**: 좋아요, 댓글, 신고
- **정렬**: 최신, 인기(조회수/좋아요/댓글 수)

### 8. Gold 경제 시스템
- **초기 지급**: 가입 시 3,000 Gold
- **충전**: 인앱 결제(IAP) - Google Play / App Store
- **사용처**: AI 프로필 생성, 추가 좋아요, 이모티콘 팩, 프로필 부스터 등
- **거래 내역**: `gold_transactions` 테이블에 모든 변동 기록

### 9. 알림 & 푸시
- **알림 타입**: MATCH, LIKE, MESSAGE, COMMENT, AI_COMPLETE, BADGE_EARNED, CHALLENGE_PROGRESS, SYSTEM
- **푸시 알림**: Firebase Cloud Messaging (FCM)
- **설정**: 카테고리별 ON/OFF

### 10. 게이미피케이션 (v2.1 신규)
#### 뱃지 & 업적
- **뱃지 종류 예시**:
  - 산책: 첫 산책, 누적 거리 100km, 10일 연속 산책
  - 소셜: 첫 친구 매칭, 5명의 친구와 채팅
  - 수집: 펫 3마리 등록, 5종류의 뱃지 수집
- **대표 뱃지**: 프로필에 노출

#### 챌린지
- **주간**: 이번 주에 5일 이상 산책하기, 총 20km 걷기
- **월간**: 이번 달에 새로운 친구 3명 만들기
- **이벤트**: 특정 기간 동안 지정된 장소 3곳 체크인
- **보상**: Gold 또는 특별 뱃지

### 11. 장소 체크인 (v2.1 신규)
- **장소 데이터**: 펫 프렌들리 카페, 공원, 식당 등
- **초기 데이터**: 운영자가 `places` 테이블에 등록
- **체크인**: 사용자가 장소 근처에서 체크인
- **활용**: 뱃지 획득 조건, 추천 로직에 반영

---

## 🏗️ 아키텍처 및 설계

### 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Flutter App (Android/iOS)                        │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Native Services (GPS, Camera, Push, etc.)  │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  React 19 WebView (UI Layer) - 옵션         │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │  Naver Maps (지도 기능)                     │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────┐
│                    API Gateway Layer                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Nginx (Reverse Proxy, SSL Termination)          │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Spring Boot API (Java 21)                        │  │
│  │  - REST API (OpenAPI 3.0)                         │  │
│  │  - JWT 인증/인가                                  │  │
│  │  - 비즈니스 로직                                  │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  AI Server (Python)                               │  │
│  │  - 이미지/영상 생성                               │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │  PostgreSQL + PostGIS                             │  │
│  │  - 주 데이터베이스                                │  │
│  │  - 공간 쿼리                                      │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Redis                                            │  │
│  │  - 세션, 캐시                                     │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  AWS S3                                           │  │
│  │  - 이미지, 영상, 파일                             │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Flutter 프로젝트 구조 (Feature-first)

```
lib/
├── main.dart
├── app.dart
├── core/
│   ├── config/         # 환경 설정
│   ├── constants/      # 상수
│   ├── theme/          # 테마
│   ├── utils/          # 유틸리티
│   ├── network/        # API 클라이언트
│   └── error/          # 에러 처리
├── common/
│   ├── widgets/        # 공통 위젯
│   └── mixins/         # Mixin
├── features/
│   ├── auth/           # 인증
│   ├── profile/        # 프로필
│   ├── pet/            # 펫 관리
│   ├── walk/           # 산책
│   ├── map/            # 지도 공통
│   ├── match/          # 친구 찾기 & 매칭
│   ├── chat/           # 채팅
│   ├── ai/             # AI 프로필
│   ├── community/      # 커뮤니티
│   ├── gold/           # Gold 시스템
│   ├── gamification/   # 뱃지 & 챌린지
│   └── notification/   # 알림
└── localization/       # 다국어
```

---

## 📊 데이터 모델 (ERD)

### 핵심 엔티티 그룹

#### 1. 유저/펫
- `users`: 사용자 기본 정보 + `main_location_geom` (Point)
- `user_location_history`: 최근 위치 기록 (옵션)
- `pet_species`: 펫 종 (개, 고양이 등)
- `pet_breeds`: 펫 품종 (리트리버, 코숏 등)
- `pets`: 펫 기본 정보
- `pet_attribute_defs`: 펫 속성 정의 (확장성)
- `pet_attribute_values`: 펫 속성 값

#### 2. 산책/지도
- `walk_albums`: 산책 앨범
- `walk_records`: 산책 기록 + `route_geom` (LineString) + `center_point` (Point)
- `walk_spots`: 산책 중 Spot + `location_geom` (Point)

#### 3. 매칭/친구
- `likes`: 단방향 좋아요
- `matches`: 양방향 매칭

#### 4. 채팅
- `chat_rooms`: 채팅방 (DIRECT, GROUP, AI_PET)
- `chat_room_participants`: 참가자
- `chat_messages`: 메시지
- `file_attachments`: 파일 (공통)
- `emoticon_packs`, `emoticons`: 이모티콘

#### 5. 커뮤니티
- `community_categories`: 카테고리
- `community_posts`: 게시글 + `post_type` (v2.1), `adopted_comment_id` (v2.1)
- `community_comments`: 댓글
- `community_post_likes`: 좋아요

#### 6. Gold/과금
- `gold_transactions`: Gold 거래 내역
- `iap_receipts`: 인앱 결제 영수증

#### 7. AI
- `ai_profile_jobs`: AI 프로필 생성 작업

#### 8. 알림
- `notifications`: 알림

#### 9. 게이미피케이션 (v2.1 신규)
- `badges`: 뱃지 마스터
- `user_badges`: 사용자 뱃지 획득 기록
- `challenges`: 챌린지 마스터
- `user_challenge_progress`: 사용자 챌린지 진행 상태

#### 10. 장소 (v2.1 신규)
- `places`: 장소 정보 + `location_geom` (Point)
- `check_ins`: 체크인 기록

### PostGIS 활용 포인트

| 컬럼명                      | 타입                       | 용도                              |
|----------------------------|----------------------------|-----------------------------------|
| `users.main_location_geom` | `geometry(Point, 4326)`    | 주변 친구 추천                    |
| `user_location_history.location_geom` | `geometry(Point, 4326)` | 실시간 위치 기반 추천 (확장)     |
| `walk_records.route_geom`  | `geometry(LineString, 4326)` | 산책 궤적 (Polyline)             |
| `walk_records.center_point` | `geometry(Point, 4326)`   | 주변 코스 탐색                    |
| `walk_spots.location_geom` | `geometry(Point, 4326)`    | Spot 마커 위치                    |
| `places.location_geom`     | `geometry(Point, 4326)`    | 장소 위치                         |

### 공간 쿼리 예시

```sql
-- 내 주변 3km 이내 친구 찾기
SELECT u.id, u.nickname, 
       ST_Distance(u.main_location_geom, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) as distance
FROM users u
WHERE ST_DWithin(
  u.main_location_geom::geography, 
  ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, 
  3000  -- 3km in meters
)
ORDER BY distance;

-- 특정 산책 코스 주변 Spot 찾기
SELECT s.id, s.photo_url, s.memo
FROM walk_spots s
WHERE ST_DWithin(
  s.location_geom::geography,
  (SELECT route_geom FROM walk_records WHERE id = ?)::geography,
  100  -- 100m
);
```

---

## 📅 구현 우선순위 및 향후 계획

### Phase 1: MVP (v2.1 기준)

#### 우선순위 1 (필수 기능)
1. **DB 스키마 재구성**
   - Flyway 마이그레이션 스크립트 작성 (v2.1 ERD 기반)
   - PostGIS 확장 활성화
   - 초기 데이터(Seed Data) 삽입
     - `pet_species`, `pet_breeds`
     - `community_categories`
     - `badges` (기본 뱃지 5~10종)
     - `places` (초기 장소 목록)

2. **인증 & 프로필**
   - SNS 간편가입 (Kakao, Naver, Google 중 1~2개)
   - JWT 토큰 발급/갱신
   - 사용자/펫 프로필 CRUD
   - 상세 온보딩 플로우

3. **산책 기능 (핵심)**
   - GPS 기반 산책 시작/종료
   - 궤적(LineString) 저장
   - Spot(Point) 저장
   - 산책 지도 보기 (Naver Map + Polyline + Spot 마커)

4. **친구 찾기 & 매칭**
   - PostGIS 공간 쿼리를 활용한 주변 친구 추천
   - 리스트 기반 추천 + 기본 필터
   - 좋아요/매칭 로직
   - 1:1 채팅 (텍스트/이미지)

#### 우선순위 2 (중요 기능)
5. **커뮤니티 (기본)**
   - 게시글 작성/읽기
   - 댓글, 좋아요

6. **Gold 시스템 (기본)**
   - Gold 충전 (IAP)
   - Gold 사용 (기본 기능)

7. **AI 펫 프로필 (기본)**
   - 단일 이미지 생성 (기본 스타일)

#### 우선순위 3 (게이미피케이션)
8. **뱃지 시스템**
   - 뱃지 획득 로직
   - 마이페이지에 뱃지 표시

9. **장소 체크인**
   - 운영자 등록 장소 대상 체크인
   - 체크인 기록 저장

### Phase 2: Post-MVP (향후 확장)

1. **그룹 채팅**
2. **챌린지 시스템** (주간/월간)
3. **커뮤니티 고급 기능** (질문/답변, 답변 채택)
4. **AI 영상 생성**
5. **이모티콘 스토어**
6. **고급 추천 로직** (공통 장소 방문, 비슷한 활동 패턴 등)
7. **산책 코스 공유/추천**
8. **사용자 제보 장소 등록**

---

## ⚠️ 리스크 및 오픈 이슈

### 1. 데이터베이스 관련
- **현재 상태**: DB 스키마 미구축
- **리스크**: v2.1 ERD와 실제 DB 간 불일치 가능성
- **대응 방안**:
  - DB 볼륨 완전 삭제 후 재구성
  - Flyway 기반 마이그레이션 스크립트 새로 작성
  - V1: 기본 스키마 + PostGIS
  - V2: Seed Data
  - V3: 게이미피케이션 테이블 (v2.1 추가 기능)

### 2. 백엔드 구현 상태
- **현재 상태**: Java 소스코드 디렉토리 미확인
- **리스크**: API 구현 진행도 불명확
- **대응 방안**:
  - 백엔드 소스코드 재확인 필요
  - API 명세서(`open_api.yml`) 기반 최소 API 우선 구현
  - PostGIS 공간 쿼리 로직 개발 및 테스트

### 3. Flutter vs React 선택
- **현재 상태**: Flutter와 React 모두 프로젝트 존재
- **리스크**: 개발 리소스 분산, 유지보수 복잡도 증가
- **대응 방안**:
  - **순수 Flutter 접근**: Figma 디자인을 Flutter로 직접 구현 (권장)
  - **하이브리드 접근**: Flutter(네이티브) + React(UI) 분리 (복잡도 높음)
  - 팀 역량과 일정을 고려하여 선택

### 4. 위치 기반 서비스 법적/정책 규제
- **리스크**: 위치 정보 수집/이용 관련 법적 요구사항
- **대응 방안**:
  - 명시적 동의 절차 구현
  - 위치 공유 ON/OFF 옵션 제공
  - 개인정보 처리방침 명확히 작성

### 5. AI 생성 콘텐츠 저작권/초상권
- **리스크**: AI 생성 이미지/영상의 법적 이슈
- **대응 방안**:
  - 이용 약관에 명시
  - 생성된 콘텐츠의 소유권 정책 수립

### 6. 게이미피케이션 어뷰징
- **리스크**: 뱃지/챌린지 보상을 노린 GPS 조작 등 비정상적 활동
- **대응 방안**:
  - GPS 정확도 검증
  - 이상 패턴 탐지 알고리즘
  - 신고 기능 및 운영 정책

### 7. 장소 데이터 관리
- **리스크**: 장소 정보의 정확성 유지 및 업데이트
- **대응 방안**:
  - 운영자 관리 도구 개발
  - 사용자 제보 기능 (Post-MVP)

---

## 📌 주요 참고 문서

- **PRD**:
  - `docs/GoldPet_v2.1_Final_PRD.md` (최신 최종 버전)
  - `docs/GoldPet_v2.0_Final_PRD.md`
  - 과거 버전: v1.0 ~ v1.6

- **ERD**:
  - `docs/GoldPet_Final_ERD_PostGIS_v1.0.md` (최종 데이터 모델)

- **아키텍처**:
  - `docs/GoldPet_Hybrid_App_Architecture_v1.0.md` (하이브리드 아키텍처)
  - `docs/GoldPet_Flutter_App_Architecture_v1.0.md` (Flutter 아키텍처)

- **UX**:
  - `docs/GoldPet_Walk_Map_UX_v1.md` (산책 지도)
  - `docs/GoldPet_Friend_Map_UX_v1.md` (친구 지도)
  - `docs/GoldPet_Flutter_Onboarding_Flow_v1.md` (온보딩)

- **API**:
  - `docs/open_api.yml` (OpenAPI 3.0 스펙)

- **기타**:
  - `GEMINI.md` (Gemini 내부 요약)
  - `README.md` (프로젝트 소개)

---

## 🎯 다음 단계 제안

### 즉시 진행 가능한 작업

1. **백엔드 소스코드 재확인**
   - `backend/src/main/java/` 디렉토리 구조 확인
   - 기존 구현 상태 파악
   - 누락된 API 파악

2. **데이터베이스 스키마 재구성**
   - Flyway 마이그레이션 스크립트 작성 (V1, V2, V3)
   - docker-compose.yml에서 PostGIS 이미지 확인
   - 로컬 환경에서 DB 초기화 및 테스트

3. **최소 API 구현**
   - 인증 API (SNS 로그인, JWT)
   - 사용자/펫 프로필 CRUD
   - 산책 기록 저장/조회 (PostGIS 쿼리 포함)

4. **Flutter UI 우선순위 결정**
   - 순수 Flutter vs 하이브리드 최종 결정
   - 지도 공통 모듈 개발 (`flutter_naver_map` 래퍼)
   - 온보딩 플로우 구현

5. **기술 검증 (PoC)**
   - PostGIS 공간 쿼리 성능 테스트
   - Naver Maps API 연동 테스트
   - JWT 인증 플로우 테스트

---

\u003e **작성일**: 2025-11-24  
\u003e **작성자**: Antigravity AI Assistant  
\u003e **버전**: 1.0  
\u003e **기반 PRD**: GoldPet v2.1 Final PRD
