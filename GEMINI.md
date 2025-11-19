# GoldPet 프로젝트 Gemini 요약 (v2.1 Final)

이 문서는 Gemini가 GoldPet 프로젝트를 이해하고 개발 계획을 수립하기 위해 사용하는 내부 요약 문서입니다. **v2.0 최종 PRD**와 **PostGIS 기반 최종 ERD**, 그리고 **추가된 UX 문서와 기능 강화 아이디어**를 종합하여 작성되었습니다.

## 1. 프로젝트 개요

- **프로젝트명:** GoldPet
- **비전:** 반려동물과의 모든 순간을 기록하고, 그 기록을 통해 좋은 산책 코스와 좋은 사람/펫을 연결하는 라이프 플랫폼.
- **클라이언트:** Flutter (Android/iOS)
- **백엔드:** Spring Boot (Java 21), Python (AI), PostgreSQL, Redis
- **인프라:** AWS (ECS, RDS, S3 등), Docker, Nginx
- **로컬 스토리지:** MinIO (S3 호환)
- **지도 SDK:** **Naver Maps API**

## 2. 핵심 기능 및 요구사항 (v2.1 강화안)

1.  **회원가입 & 인증:** SNS 간편가입 및 JWT 기반 인증.
2.  **사용자 & 펫 프로필:** 상세화된 사용자 및 펫 정보 관리.
3.  **산책 기록 (GPS/지도/앨범):** PostGIS `LineString`을 활용한 궤적 저장 및 Naver Map 시각화.
4.  **친구 찾기 & 매칭 (지도/리스트 + 필터):** PostGIS `Point` 및 공간 쿼리를 활용한 주변 친구 추천.
5.  **채팅:** 1:1, 그룹, AI 펫 채팅 기능 및 파일/이모티콘 전송.
6.  **AI 펫 프로필:** 펫 사진 기반 AI 이미지/영상 생성.
7.  **커뮤니티:** 카테고리 기반 게시글, 댓글, 좋아요 기능.
    - **(신규) 게시글 타입 세분화:** '일반글', '질문글', '정보글' 타입 및 '답변 채택' 기능 추가.
8.  **Gold 경제 시스템:** 인앱 결제(IAP)를 통한 재화 충전 및 기능 사용.
9.  **알림:** 매칭, 메시지, 댓글 등 주요 이벤트에 대한 푸시 알림.
10. **설정:** 개인정보, 위치, 공개 범위, 차단 관리.
11. **(신규) 게이미피케이션:**
    - **뱃지 및 업적:** 특정 목표 달성(예: 10일 연속 산책) 시 뱃지 부여.
    - **주간/월간 챌린지:** "이번 달 총 30km 걷기"와 같은 챌린지 기능.
12. **(신규) 장소 체크인:**
    - 산책 중 주요 장소(펫 프렌들리 카페, 공원 등)에 '체크인'하여 기록.

## 3. 아키텍처 및 기술 스택

- **컨테이너화:** Docker 및 `docker-compose`를 사용한 로컬 개발 환경.
- **데이터베이스:** **PostgreSQL + PostGIS 확장**.
    - `geometry(Point, 4326)`: 사용자/Spot/체크인 위치.
    - `geometry(LineString, 4326)`: 산책 궤적.
    - GIST 공간 인덱스를 통한 효율적인 거리 기반 쿼리.
- **CI/CD:** GitHub Actions를 통한 자동화.
- **배포:** AWS ECS (Fargate).
- **API 명세:** `open_api.yml` (OpenAPI 3.0) 기반.

## 4. 데이터 모델 (GoldPet_Final_ERD_PostGIS_v1.0 + 신규 제안)

- **기존 최종 ERD 기반:** `GoldPet_Final_ERD_PostGIS_v1.0.md`의 구조를 따름.
- **신규 테이블 제안:**
    - **`badges`**: 뱃지 정보 (id, code, name, description, image_url).
    - **`user_badges`**: 사용자가 획득한 뱃지 (id, user_id, badge_id, created_at).
    - **`challenges`**: 챌린지 정보 (id, title, description, goal_type, goal_value, start_date, end_date).
    - **`user_challenge_progress`**: 사용자 챌린지 진행 상태 (id, user_id, challenge_id, current_value, status).
    - **`places`**: 장소 정보 (id, name, category, location_geom).
    - **`check_ins`**: 체크인 기록 (id, user_id, place_id, created_at).
- **기존 테이블 수정 제안:**
    - **`community_posts`**: `post_type` (VARCHAR), `is_answered` (BOOLEAN) 컬럼 추가.

## 5. 구현 계획 반영사항

- **DB 리셋 및 재구성:** 데이터베이스 볼륨을 완전히 삭제하고, **새로운 기능(뱃지, 챌린지 등)이 포함된 최종 ERD**에 맞춰 새로운 Flyway 마이그레이션 스크립트를 작성하여 재구성해야 함.
- **초기 데이터(Seed Data) 추가:** `pet_species`, `pet_breeds`, `badges`, `community_categories` 등 핵심 테이블에 초기 데이터를 삽입하는 마이그레이션 스크립트(`V2__Seed_Data.sql`) 추가 필요.
- **API 구현 우선순위:**
    1.  최종 ERD 기반 DB 스키마 재구성 및 초기 데이터 삽입.
    2.  상세화된 온보딩/펫 등록 플로우 API 구현.
    3.  PostGIS 공간 쿼리를 활용한 위치 기반 친구 추천 API 구현.
    4.  산책 기록 및 Spot 저장/조회 API 구현.
    5.  게이미피케이션(뱃지/챌린지) 관련 로직 및 API 구현.
- **Flutter 구현:** `flutter_naver_map` 라이브러리를 사용하여 지도 공통 모듈을 만들고, 이를 '산책 지도', '친구 지도', '장소 체크인' 화면에서 재사용하는 구조로 개발.