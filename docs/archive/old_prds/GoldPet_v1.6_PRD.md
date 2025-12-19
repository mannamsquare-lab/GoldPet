# GoldPet – PRD v1.6 (Naver Map + Walk/친구 지도 UX 통합)

> 본 문서는 GoldPet 서비스의 기능/아키텍처 개요 및  
> **Naver 지도 기반 산책 지도 & 친구 지도 UX 상세**를 통합한 PRD v1.6이다.

---

## 1. 프로젝트 개요

GoldPet은 반려동물의 산책, 프로필 관리, AI 펫 프로필 생성, 친구 매칭, 커뮤니티 기능을 제공하는 모바일 앱이다.  
Flutter 기반으로 Android / iOS 앱을 출시하며, 백엔드는 Spring Boot + PostgreSQL + Redis + AI 서버(Python) 구조로 구성한다.

- **클라이언트**: Flutter
- **백엔드**: Java 21 + Spring Boot 3.x
- **DB**: PostgreSQL
- **Cache**: Redis
- **Message Queue (옵션)**: RabbitMQ
- **AI 서버**: Python 기반 이미지/영상 생성
- **지도 SDK**: **Naver Maps API** (Android/iOS, flutter_naver_map 등 활용)

---

## 2. 주요 기능 요약

### 2.1 회원가입 & 프로필

- SNS 간편가입(카카오, 네이버, 구글, 애플 등)
- 사용자 프로필 설정(닉네임, 성별/연령대 옵션, 프로필 이미지)
- 반려동물 프로필(여러 마리) 등록
- 주요 활동 지역/주소 설정

### 2.2 산책 기능 (Naver 지도 기반)

- GPS 기반 산책 시작/종료
- 산책 궤적(Polyline) 기록 및 저장
- 산책 중 사진 Spot(위치 + 사진 + 메모) 기록
- 산책 히스토리 및 앨범
- **Naver Map에서 산책 코스(궤적 + Spot 마커) 상세 보기**

### 2.3 친구 찾기 & 매칭

- 필터(종, 품종, 나이, 성별, 성격, 활동 지역 등)를 통한 추천
- “좋아요” 기반 양방향 매칭
- 매칭 시 1:1 채팅방 자동 생성
- **Naver Map에서 내 주변 친구/후보를 마커로 시각화**

### 2.4 채팅

- 1:1 채팅
- 그룹 채팅(산책 모임)
- AI 펫 챗봇과의 대화
- 텍스트, 이미지, 동영상, 문서 파일 전송
- 이모티콘/스티커, 이모지 표현 (추후 유료 모델 가능)
- 채팅창에 사용자 프로필 이미지 노출

### 2.5 AI 펫 프로필 생성

- 반려동물 정보 + 사진 기반
- Pixar/애니/디즈니풍 이미지 또는 짧은 영상 생성
- Gold 소모 기능

### 2.6 커뮤니티

- 카테고리 기반 게시글 작성
- 반려동물 건강 정보, 산책 정보 공유
- 이미지 첨부, 좋아요, 댓글, 신고, 인기 게시글

### 2.7 Gold 시스템

- 가입 시 3,000 Gold 무료 지급
- 인앱 결제(IAP)를 통한 Gold 충전
- AI 생성, 추가 좋아요, 이모티콘 패키지 등에서 Gold 소모

---

## 3. 주요 플로우 (요약)

### 3.1 회원가입 / 온보딩

1. 앱 실행 → 온보딩
2. SNS 로그인
3. 약관/개인정보 동의
4. 기본 프로필 설정
5. 위치 권한 허용 및 주요 활동 지역 설정 (Naver 지도/Reverse Geocoding 활용)
6. 반려동물 등록(기본 정보 → 상세 정보 → 사진)
7. 홈 진입 + 3,000 Gold 지급

### 3.2 산책 기록 & 지도

1. “산책” 탭 → “산책 시작”
2. GPS→ 이동 궤적 기록
3. 사진 촬영 시 Spot(위도/경도/사진/메모) 생성
4. “산책 종료” → 거리/시간/칼로리 계산 → 저장
5. 히스토리/앨범에서 특정 산책 선택 → **“지도에서 보기”** 화면 진입
6. Naver Map에서 Polyline + Spot 마커 기반 코스 확인

### 3.3 친구 찾기 & 지도

1. “친구 찾기” 탭 → 리스트 기반 추천
2. 상단에서 “지도 보기” 선택 → **친구 지도 화면**
3. 내 위치/주요 활동 지역 중심 Naver Map 로딩
4. 반경 내 추천 친구 마커 표시
5. 마커 또는 카드 선택 → 상세 프로필/좋아요/매칭 플로우

---

## 4. DevOps & Docker (요약)

- Docker 기반 로컬 개발 환경
- `docker-compose`:
  - api (Spring Boot)
  - db (PostgreSQL)
  - redis
  - ai-service (Python)
  - nginx (reverse proxy)
- CI/CD:
  - GitHub Actions로 빌드/테스트/도커 이미지 푸시
  - AWS ECS Fargate 배포
- 인프라:
  - ECS(Fargate) + RDS(PostgreSQL) + ElastiCache(Redis) + S3(이미지/동영상) + CloudFront(옵션)
- Naver Cloud:
  - Naver Maps API 사용 설정
  - Android/iOS 앱 등록, Client ID/Secret 발급
  - 모바일: Manifest/Info.plist에 ID 설정
  - 서버에서 Reverse Geocoding 등 필요 시 환경 변수로 관리

---

## 5. ERD (지도/산책/친구 관련 주요 테이블)

### 5.1 WalkRecord (산책 기록)

| 필드명        | 타입        | 설명                                                             |
|---------------|-------------|------------------------------------------------------------------|
| id            | BIGINT PK   | 산책 기록 ID                                                     |
| user_id       | BIGINT FK   | 사용자 ID                                                        |
| pet_id        | BIGINT FK   | 대표 반려동물 ID                                                 |
| album_id      | BIGINT FK   | WalkAlbum FK (옵션)                                              |
| title         | VARCHAR     | 산책 제목                                                        |
| distance_m    | INT         | 이동 거리(m)                                                     |
| duration_sec  | INT         | 산책 시간(초)                                                    |
| user_calorie  | INT         | 사용자 칼로리                                                    |
| pet_calorie   | INT         | 반려동물 칼로리                                                  |
| started_at    | TIMESTAMP   | 시작 시각                                                        |
| ended_at      | TIMESTAMP   | 종료 시각                                                        |
| route_geojson | JSON        | Naver Map Polyline용 LineString (`[[lng,lat], [lng,lat], ...]`) |
| visibility    | VARCHAR     | PUBLIC / FRIENDS / PRIVATE                                       |
| created_at    | TIMESTAMP   | 생성일                                                           |
| updated_at    | TIMESTAMP   | 수정일                                                           |

### 5.2 WalkSpot (산책 중 사진 Spot)

| 필드명       | 타입        | 설명                                  |
|--------------|-------------|---------------------------------------|
| id           | BIGINT PK   | Spot ID                               |
| walk_id      | BIGINT FK   | WalkRecord FK                         |
| latitude     | DECIMAL     | Spot 위도 (Naver Map 좌표)           |
| longitude    | DECIMAL     | Spot 경도 (Naver Map 좌표)           |
| photo_url    | VARCHAR     | 사진 URL                              |
| memo         | TEXT        | 메모                                  |
| taken_at     | TIMESTAMP   | 촬영 시각                             |

### 5.3 친구/매칭 관련 (요약)

- `User`:
  - `nickname`, `main_location`, `profile_image_url`, `gender`, `birth_year` 등
- `Pet` / `PetSpecies` / `PetBreed`:
  - 종/품종/성격 태그 등
- `Match`:
  - user1_id, user2_id, status(PENDING/MATCHED/BLOCKED 등), created_at

지도에서 친구 마커로 사용할 좌표는:
- 우선은 `main_location`을 좌표로 변환한 값 또는
- 추후 `UserLocationHistory` 테이블 도입 후 최근 위치 활용

---

## 6. 지도 & 위치 기반 기능 (Naver Maps 기준 개요)

### 6.1 공통 요구사항

- Polyline 표시 (산책 궤적)
- Marker 표시 (Spot / 친구 / 이벤트)
- Marker 클릭 이벤트
- 카메라 이동/줌 제어
- 지도 타입 전환 (일반/위성 등)

### 6.2 Flutter 연동

- 라이브러리 후보: `flutter_naver_map`
- 플랫폼 설정:
  - Android: `AndroidManifest.xml`에 Client ID
  - iOS: `Info.plist`에 Client ID
- `GoldPetNaverMapView`라는 공통 래퍼 위젯을 만들어 기능 캡슐화

---

## 7. UX 상세 – 산책 지도 화면 (Walk Map)

> 단일 산책 기록을 Naver Map에서 시각화하는 화면

### 7.1 화면 목적 & 진입 경로

- 목적:
  - 한 번의 산책에 대해 **전체 경로(Polyline)** 와  
    **사진 Spot 마커**를 한눈에 보고, 추억/정보를 다시 떠올리는 것
- 진입 경로:
  1. 산책 히스토리 → 산책 상세 → “지도에서 보기”
  2. 산책 종료 직후 완료 화면 → “지도 보기”
  3. 산책 앨범 → 특정 산책 선택 → 지도 보기

### 7.2 레이아웃 개요

```text
┌────────────────────────────────┐
│  [←] 산책 지도             ⋮  │  AppBar
├────────────────────────────────┤
│          NAVER MAP VIEW        │
│   - 산책 Polyline              │
│   - 시작/끝 포인트             │
│   - 사진 Spot 마커             │
│                                │
│     (우측 FAB)                 │
│     ○ 내 위치                  │
│     ○ 전체 코스 보기           │
│     ○ 지도 타입 전환           │
├────────────────────────────────┤
│  BottomSheet (산책 요약/Spot) │
└────────────────────────────────┘
```

### 7.3 지도 요소

- **Polyline**
  - `route_geojson` 기반
  - 시작점(초록)/끝점(빨강) 아이콘 표시
- **Spot 마커**
  - 사진이 있는 지점에 카메라/썸네일 마커
  - 마커 탭 → Spot 상세(사진/메모) 표시
- **FAB 버튼**
  - 내 위치 이동
  - 전체 코스 bounds fit
  - 지도 타입(일반/위성) 전환

### 7.4 Bottom Sheet 설계

- **접힌 상태 (요약)**

```text
┌────────────────────────────────┐
│  오늘의 산책 · 🐶 쿠키        │
│  3.2km · 45분 · 210kcal(나)   │
│  펫 120kcal · 2025.11.18 19:03│
│  [공개범위: 친구만]    [공유] │
└────────────────────────────────┘
```

- **펼친 상태 (Spot 리스트)**

```text
┌────────────────────────────────┐
│  오늘의 산책 · 🐶 쿠키        │
│  ...                          │
├────────────────────────────────┤
│ [사진썸네일] 19:12            │
│ 강아지가 물 마시는 곳        │
│ 메모: 여기 물이 깨끗함       │
├────────────────────────────────┤
│ [사진썸네일] 19:28            │
│ 노을 포인트                   │
│ 메모: 하늘 색깔 미쳤다       │
└────────────────────────────────┘
```

- 인터랙션:
  - Spot 카드 탭 → 지도 카메라 해당 Spot 위치로 이동 + 마커 강조
  - 지도 마커 탭 → BottomSheet가 해당 Spot 카드 위치로 스크롤 및 하이라이트

### 7.5 Flutter 구조 (개략)

- `WalkMapPage`
  - 상단: `AppBar`
  - 본문: `Stack`
    - `GoldPetNaverMapView`
    - 우측 FAB들
    - `DraggableScrollableSheet` (WalkBottomSheet)
- 상태:
  - `WalkRecordDetail` (API 응답)
  - `polylines`, `markers`
  - `selectedSpotId`

---

## 8. UX 상세 – 친구 지도 화면 (Friend Map)

> 내 주변 반려인/펫을 Naver Map에 마커로 표시하고,  
> 카드/마커 인터랙션으로 친구 찾기/좋아요/매칭을 유도하는 화면.

### 8.1 화면 목적 & 진입 경로

- 목적:
  - 내 주변(반경 n km) 친구/후보들을 **지도 기반으로 직관적으로 탐색**
- 진입 경로:
  1. “친구 찾기” 탭 → 상단에서 “지도 보기” 선택
  2. 별도 “지도” 탭 (추후 확장)
  3. 프로필/마이 페이지에서 “근처 친구 보기”

### 8.2 레이아웃 개요

```text
┌────────────────────────────────┐
│ [←] 친구 지도           🔍⚙   │ AppBar (필터/설정)
├────────────────────────────────┤
│ [반경 3km] [종: 전체] [정렬:거리]│ 필터/반경 요약 바
├────────────────────────────────┤
│         NAVER MAP VIEW         │
│   - 내 위치 마커               │
│   - 친구/후보 마커들           │
│                                │
│   (우측 FAB)                   │
│   ○ 내 위치                    │
│   ○ 반경 변경                  │
│   ○ 지도 타입                  │
├────────────────────────────────┤
│ BottomSheet (친구 카드 리스트)│
└────────────────────────────────┘
```

### 8.3 지도 요소

- **내 위치 마커**
  - 파란 점 또는 “나” 아이콘
- **친구/후보 마커**
  - 프로필 이미지 기반 원형 썸네일 또는 종별 기본 아이콘
  - 선택 시 마커 강조
- **많은 마커 처리**
  - 1차 버전: 위치를 약간 랜덤 오프셋
  - 추후: 클러스터링 마커 고려
- **FAB 버튼**
  - 내 위치 이동
  - 반경 선택(1/3/5/10km)
  - 지도 타입 전환

### 8.4 Bottom Sheet – 친구 카드 리스트

- **접힌 상태 (요약)**

```text
┌────────────────────────────────┐
│ 근처 친구 5명 · 반경 3km       │
│ [썸네일] 지오 (1.2km)          │
│  🐶 쿠키 · 활발/친화적         │
│  [프로필 보기]  [♡ 좋아요]     │
└────────────────────────────────┘
```

- **펼친 상태 (스크롤 리스트)**

각 카드:

- 프로필 썸네일
- 닉네임
- 거리 (예: `1.2km`)
- 대표 펫 정보(종/이름/나이/성격 태그)
- 주요 활동 지역
- 버튼: “프로필 보기”, “♡ 좋아요”

### 8.5 지도 ↔ 카드 연동

- 마커 탭:
  - 해당 사용자를 BottomSheet 리스트에서 찾고 스크롤/강조
  - BottomSheet를 최소 중간 높이까지 올림
- 카드 탭:
  - 지도 카메라를 해당 사용자 위치로 이동
  - 마커를 강조 표시

### 8.6 좋아요 & 매칭

- 좋아요 버튼 클릭:
  - UI에서 즉시 하트 상태 변경
  - 서버에 “좋아요” API 호출
- 상대가 이미 좋아요를 한 상태면:
  - “매칭 성공” 안내(토스트/다이얼로그)
  - 1:1 채팅방 생성 및 이동 옵션 제공

### 8.7 Flutter 구조 (개략)

- `FriendMapPage`
  - `AppBar` (필터 아이콘 포함)
  - `Stack`:
    - `Column`:
      - 필터/반경 요약 바
      - `Expanded(GoldPetNaverMapView)`
    - 우측 FAB 3개
    - `DraggableScrollableSheet(FriendMapBottomSheet)`

- 상태:
  - `centerLat`, `centerLng`, `radiusKm`
  - 필터 상태(종, 정렬 등)
  - nearby 친구 리스트
  - 선택된 사용자 ID
  - 지도/카드 sync 상태

---

## 9. Flutter 지도 공통 모듈 구조

- `lib/features/map/`
  - `goldpet_naver_map_view.dart`
    - 내부에서 `flutter_naver_map` 래핑
    - 입력: center, zoom, markers, polylines, 콜백
  - `map_marker.dart`
    - id, type(WALK_SPOT/FRIEND/OTHERS), lat, lng, payload
  - `map_polyline.dart`
- `lib/features/walk/presentation/pages/walk_map_page.dart`
- `lib/features/match/presentation/pages/friend_map_page.dart`

두 화면(산책 지도, 친구 지도)은 모두  
`GoldPetNaverMapView`를 기반으로 Polyline/Marker만 다르게 주입하는 구조를 사용한다.

---

이 문서(v1.6)는:

- GoldPet의 핵심 기능 및 아키텍처 개요,
- Naver 지도 기반 산책 코스/친구 지도 기능의 기술적 제약 및 설계,
- 그리고 **산책 지도 화면 UX**, **친구 지도 화면 UX**를  
  하나의 PRD로 통합 정리한 버전이다.
