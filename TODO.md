# GoldPet 프로젝트 TODO 리스트

> 현재 프로젝트의 진행 상황과 앞으로의 개발 계획을 관리합니다.

---

## 🚀 완료된 작업 (Completed)

-   [x] **프로젝트 기획 확정**
    -   [x] `v2.1 Final PRD` 기반 기능, UX, 아키텍처 최종 확정
    -   [x] 게이미피케이션(뱃지, 챌린지), 장소 체크인 기능 명세 추가

-   [x] **개발 환경 구성**
    -   [x] `docker-compose`를 이용한 전체 서비스(api, ai, postgres, redis, minio, nginx) 환경 구축
    -   [x] `healthcheck`를 적용하여 서비스 시작 순서 및 의존성 문제 해결
    -   [x] `gradlew` 래퍼 생성 및 로컬 빌드 환경 구성
    -   [x] `bootRun`을 이용한 백엔드 로컬 개발 환경 설정 및 사용법 안내

-   [x] **데이터베이스**
    -   [x] PostGIS를 사용하는 최종 ERD 기반 스키마 설계 (`V1__Initial_Schema.sql`)
    -   [x] 서비스 운영에 필요한 초기 데이터(펫 종류, 카테고리 등) 삽입 (`V2__Seed_Data.sql`)

-   [x] **백엔드 - 도메인 모델링**
    -   [x] PostGIS 지원을 위한 `hibernate-spatial` 의존성 및 `application.yml` 설정
    -   [x] `User`, `Pet`, `PetSpecies`, `PetBreed` 등 핵심 엔티티 및 리포지토리 구현

-   [x] **백엔드 - API 구현 (1차)**
    -   [x] 사용자 프로필 API (`GET /api/v1/users/me`, `PUT /api/v1/users/me`) 구현
    -   [x] `curl`을 이용한 사용자 프로필 API 기능 검증 완료
-   [x] **반려동물 프로필 관리 API 구현 (`/api/v1/pets`)**
    -   [x] `Pet` 관련 DTO (Request/Response) 생성
    -   [x] `PetService` 비즈니스 로직 구현 (생성, 조회, 수정, 삭제)
    -   [x] `PetController` 엔드포인트 구현
    -   [x] `curl`을 이용한 API 기능 테스트 및 예외 처리 완료
-   [x] **인증 & 인가**
    -   [x] OAuth2 로그인/회원가입 로직 통합
    -   [x] JWT 발급, 재발급, 검증을 위한 필터 및 로직 구현

-   [x] **산책:** 산책 기록(GPS 궤적) 및 Spot 저장/조회 API
-   [x] **지도:** 산책 코스 및 친구 위치 시각화를 위한 공간 쿼리 API

---

## 🚧 진행 중인 작업 (In Progress)

-   현재 진행 중인 작업 없음. '다음 작업'을 시작할 예정입니다.

---

## 📝 다음 작업 (Up Next)

-   [x] **매칭 & 채팅:** 친구 '좋아요' 및 매칭
-   [x] **매칭 & 채팅:** 실시간 채팅(WebSocket) API

### 코드 품질 및 테스트
-   [x] 주요 기능에 대한 단위/통합 테스트 코드 작성
-   [x] API 문서 자동화 (Swagger) 설정 고도화
-   [x] CI/CD 파이프라인 고도화
