# GoldPet – Final PRD v2.0 (Flutter · Spring Boot · PostgreSQL/PostGIS · Naver Map)

> 본 문서는 지금까지 정의된 **기능, UX, ERD, 인프라**를 종합/고도화한  
> GoldPet 서비스의 최종 PRD 초안이다.  
> 특히 **위치 기반 서비스(PostGIS + Naver Map)**, **친구 매칭/채팅**, **Gold 경제 시스템**,  
> **AI 펫 프로필**, **커뮤니티**까지를 하나의 일관된 관점에서 정의한다.

---

## 0. 제품 비전 & 타깃

### 0.1 제품 비전

> “반려동물과 함께하는 모든 순간을 기록하고,  
>  그 기록을 통해 **좋은 산책 코스와 좋은 사람/펫을 연결**하는 반려 라이프 플랫폼”

- 산책 중심의 **행동 데이터(위치·시간·궤적)** +  
- 펫/사용자 성향 정보 +  
- 커뮤니티 & 매칭 기능을 결합해,  
- 단순 SNS가 아니라 **실제 만남과 산책 경험**까지 연결한다.

### 0.2 타깃 유저

- 반려견/반려묘(및 향후 조류/파충류 등)를 키우는 20~40대
- 산책과 야외 활동을 즐기는 유저
- 반려동물 친구 & 사람 친구를 함께 만들고 싶은 유저
- 귀여운 **AI 펫 프로필 이미지/영상**에 관심이 많은 유저

---

## 1. 플랫폼 & 기술 스택

### 1.1 클라이언트

- **Flutter**
  - Target: Android / iOS
  - 지도: **Naver Maps API** + `flutter_naver_map` (또는 동등 기능 플러그인)
  - 상태관리: Riverpod / Bloc / 기타(추후 결정)

### 1.2 서버

- **Java 21 + Spring Boot 3.x**
- REST API + Swagger (OpenAPI 3)
- JWT 기반 인증/인가 (Access + Refresh Token)

### 1.3 데이터베이스 & 위치

- DB: **PostgreSQL**
- 확장: **PostGIS**
  - `geometry(Point, 4326)` : 사용자 위치, Spot 위치, 앨범/코스 중심 등
  - `geometry(LineString, 4326)` : 산책 궤적
  - GIST 인덱스 기반 거리/공간 질의

### 1.4 인프라 & DevOps

- Docker / docker-compose (로컬)
- AWS ECS Fargate (prod/stage)
- AWS RDS for PostgreSQL (PostGIS 활성화)
- Redis (세션/캐시/실시간 기능 보조)
- S3 (이미지/영상/파일 저장) + CloudFront(옵션)
- GitHub Actions (CI/CD)
- 모니터링: CloudWatch + APM (예: New Relic, Datadog 등 검토)
- 에러 트래킹: Sentry 등

---

## 2. 핵심 기능 개요

1. **회원가입 & 인증**
2. **사용자 프로필 & 펫 프로필**
3. **산책 기록 (GPS/지도/앨범)**
4. **친구 찾기 & 매칭 (지도/리스트 + 필터)**
5. **채팅 (1:1 / 그룹 / AI 펫) + 파일 & 이모티콘**
6. **AI 펫 프로필 이미지/영상 생성**
7. **커뮤니티 (게시글/댓글/좋아요/신고)**
8. **Gold 경제 시스템 (충전/소모/내역)**
9. **알림/푸시 (매칭, 메시지, 댓글, AI 완료 등)**
10. **설정 & 개인정보/위치/차단 관리**
11. **운영자/Admin 기능 (기본 정의 수준)**

---

## 3. 기능 상세 (레벨 2 – 흐름 중심)

### 3.1 회원가입 & 인증

#### 3.1.1 SNS 간편가입

- 지원 채널:
  - Kakao, Naver, Google, Apple
- 플로우:
  1. 온보딩 → “SNS로 시작하기” 버튼
  2. SNS 로그인 완료 → Auth 서버에서 OAuth 토큰 검증
  3. 신규 사용자일 경우:
     - 약관/개인정보/위치 이용 동의 화면
     - 닉네임 설정, 기본 프로필 입력
  4. 기존 사용자일 경우:
     - 홈 화면으로 이동

#### 3.1.2 토큰 & 세션

- Access Token (단기) + Refresh Token (장기)
- 최소 기능:
  - 로그인 / 로그아웃
  - 토큰 재발급
  - 계정 삭제 (탈퇴)

---

### 3.2 사용자 프로필 & 펫 프로필

#### 3.2.1 사용자 프로필

- 필수: 닉네임
- 선택: 성별, 연령대(또는 출생년도), 자기소개
- 위치:
  - 주요 활동 지역 텍스트 (예: 서울시 강남구)
  - 지도에서 위치 설정 시 Naver Map + Reverse Geocoding 활용
  - `main_location_geom`에 중심 좌표 저장 (PostGIS)

#### 3.2.2 펫 프로필

- 기본 정보:
  - 이름, 종(pet_species), 품종(pet_breeds), 성별, 나이/생일, 체중, 중성화 여부
- 성격 태그:
  - 활발, 온순, 소심, 친화적 등 다중 선택
- 사진:
  - 대표 이미지 1장 + 추가 사진 (앨범)
- 확장 속성:
  - `pet_attribute_defs` + `pet_attribute_values` 구조로 설계
  - 예: 알레르기, 좋아하는 간식, 산책 스타일 등

---

### 3.3 산책 기능 (GPS + 지도 + 앨범)

#### 3.3.1 산책 시작~종료 흐름

1. 하단 “산책” 탭 → “산책 시작” 버튼
2. 위치 권한 체크 & GPS 활성화
3. 일정 주기(예: 3~5초, 거리 5~10m 이상 변화 시)로 좌표 샘플링
4. 사용자는 산책 중 사진 촬영 → Spot(위치 + 사진 + 메모) 생성
5. “일시정지/재개” 지원
6. “산책 종료” 버튼 → 거리/시간/칼로리 계산
7. 제목/메모/대표 펫/앨범 선택 후 저장
8. 저장 완료 후:
   - 산책 요약 화면 → “지도에서 보기” or “공유하기”

#### 3.3.2 산책 데이터 모델 (요약)

- `walk_records`
  - route_geom(LineString)
  - distance/duration/calorie
  - visibility(PUBLIC/FRIENDS/PRIVATE)
  - center_point (지도의 기본 카메라 위치)
- `walk_spots`
  - location_geom(Point)
  - photo_url, memo, taken_at

#### 3.3.3 산책 지도 화면 UX (요약)

- AppBar: [←] 산책 지도 / ⋮ (수정/삭제/공유)
- Naver Map:
  - Polyline: route_geom
  - 시작/끝 아이콘
  - Spot 마커: 사진 지점
  - FAB: 내 위치 / 전체 코스 보기 / 지도 타입 전환
- BottomSheet:
  - 접힘: 산책 요약 (거리, 시간, 칼로리, 펫, 날짜, 공개 범위, 공유 버튼)
  - 펼침: Spot 리스트 (사진/시간/메모)
- 상호연동:
  - Spot 카드 탭 → 지도 해당 위치로 이동
  - 마커 탭 → BottomSheet 해당 Spot 카드 포커스

#### 3.3.4 산책 앨범

- 사용자가 산책 기록들을 앨범 단위로 묶어 관리
- `walk_albums`
  - 제목, 설명, 대표 산책, 공개 범위
- 앨범 기반:
  - 나중에 “나만의 산책 코스 컬렉션”으로 확장 가능

---

### 3.4 친구 찾기 & 매칭

#### 3.4.1 추천 & 필터

- 필터 요소:
  - 펫 종/품종
  - 펫 나이/성별
  - 펫 성격 태그
  - 사용자 성별/연령대(옵션)
  - 활동 지역 (텍스트 & 좌표)
- 정렬:
  - 거리 우선
  - 최근 활동(산책 기록 최근 여부) 등

#### 3.4.2 지도 기반 친구 찾기 UX (요약)

- AppBar: `친구 지도` + 필터 아이콘
- 상단 필터 바:
  - [반경: 3km], [종: 전체], [정렬: 거리]
- Naver Map:
  - 내 위치 마커
  - 주변 추천 친구/후보 마커
    - 프로필 썸네일 or 종 아이콘
  - FAB:
    - 내 위치 이동
    - 반경 선택 (1/3/5/10km)
    - 지도 타입 전환
- BottomSheet:
  - 접힘: `근처 친구 N명 · 반경 3km` + 첫 카드
  - 펼침: 카드 리스트 (썸네일, 닉네임, 거리, 대표 펫, 성격, 활동 지역, [프로필 보기], [좋아요])
- 상호연동:
  - 마커 탭 → 해당 카드 포커스 + BottomSheet 중간까지 상승
  - 카드 탭 → 지도 카메라 해당 위치로 이동

#### 3.4.3 좋아요 & 매칭 로직

- `likes`:
  - from_user_id, to_user_id, status
- `matches`:
  - user1_id < user2_id, status
- 플로우:
  1. A가 B에게 좋아요 → likes(A→B) 생성
  2. B가 A에게 좋아요:
     - likes(B→A) 생성
     - matches(A,B) 생성
     - 알림 발송 & DIRECT 채팅방 생성
  3. 매칭 된 후:
     - 매칭 리스트에서 확인 가능
     - 1:1 채팅 시작

#### 3.4.4 안전/차단 기능 (기본 수준)

- 사용자 차단:
  - 특정 유저를 차단하면: 채팅/좋아요/친구 추천에서 제외
- 신고:
  - 부적절한 프로필/행동 신고 → Admin review queue에 적재
- 운영 정책:
  - Admin에서 신고 누적/심각도에 따라 제재

---

### 3.5 채팅 (1:1 / 그룹 / AI 펫)

#### 3.5.1 채팅방 구조

- `chat_rooms`
  - room_type: DIRECT / GROUP / AI_PET
  - DIRECT는 보통 `matches`와 1:1 매핑
- `chat_room_participants`
  - room_id, user_id, role
- `chat_messages`
  - 텍스트, 파일, 이모티콘, 이모지, 시스템 메시지

#### 3.5.2 기능

- 1:1 채팅:
  - 매칭 시 자동 생성
  - 텍스트/이미지/영상/파일/이모티콘/이모지 전송
- 그룹 채팅:
  - 산책 모임/스터디/동네 모임 등
  - 생성자: 제목/소개/지역 설정, 참여자 초대
- AI 펫 채팅:
  - 유저의 대표 펫/선택 펫의 성격 기반 말투
  - 간단한 산책/식단/건강 조언 + 귀여운 응대
  - 내부적으로 별도 AI 서비스와 연동

#### 3.5.3 파일 & 이모티콘

- `file_attachments` (공통 파일 테이블):
  - 이미지/영상/문서 모두 관리
- `emoticon_packs`, `emoticons`:
  - Gold로 구매 가능한 스티커 팩(추후 유료화)
- 채팅 UI:
  - 말풍선에 사용자 프로필 이미지 표시
  - 이모티콘은 말풍선 형태 또는 단독 이미지 형태로 노출

---

### 3.6 AI 펫 프로필 생성

#### 3.6.1 기능 개요

- 펫 정보 + 사진을 기반으로 **Pixar/애니/디즈니풍** 이미지/영상 자동 생성
- `ai_profile_jobs`:
  - 스타일, 상태, input_image, result_image, result_video, used_gold 관리

#### 3.6.2 플로우

1. “AI 펫 프로필 생성” 메뉴 → 펫 선택 or 새로 입력
2. 스타일 선택 (PIXAR/ANIME/DISNEY 등)
3. 필요 Gold 안내 → 컨펌 → Gold 차감
4. AI 서버 요청 (비동기 작업)
5. 완료 시:
   - 푸시 알림
   - 결과 이미지/영상 확인 → 펫 프로필에 적용 or 디바이스 저장

---

### 3.7 커뮤니티

- `community_posts`, `community_comments`, `community_post_likes`
- 기능:
  - 카테고리(산책, 건강, 정보, 자랑 등)별 게시글 등록
  - 이미지 첨부(파일 테이블 활용)
  - 댓글, 좋아요
  - 신고 기능 (운영자 처리)
- 노출:
  - 최신, 인기(조회수/좋아요/댓글 수 기반) 정렬

---

### 3.8 Gold 경제 시스템

- 가입 시 3,000 Gold 지급
- 인앱 결제(IAP)로 Gold 충전:
  - `iap_receipts`에 영수증 저장 & 검증
- Gold 사용:
  - AI 펫 프로필 생성
  - 추가 좋아요/부스터
  - 이모티콘 팩 구매
  - 향후 유료 기능과 연계
- `gold_transactions`:
  - CHARGE/USE/REFUND
  - amount, balance_after, reason_code, reference_id

---

### 3.9 알림 & 설정

#### 3.9.1 알림

- `notifications`:
  - MATCH, LIKE, MESSAGE, COMMENT, AI_COMPLETE, SYSTEM 등
- 푸시 카테고리:
  - 매칭/좋아요
  - 새 메시지
  - 커뮤니티 댓글/답글
  - AI 작업 완료
- 사용자는 알림 ON/OFF 설정 가능 (카테고리별)

#### 3.9.2 개인 정보 & 위치/공개 설정

- 위치 표시/숨김
- 산책 기록 기본 공개 범위 (PUBLIC/FRIENDS/PRIVATE)
- 지도 상 내 프로필 노출 여부 (가시성)
- 차단/신고 관리

---

## 4. 데이터 모델 (ERD 요약 – PostGIS 포함)

> 자세한 컬럼/타입은 별도 `GoldPet_Final_ERD_PostGIS_v1.0.md`에 정의.

### 4.1 핵심 엔티티 그룹

1. 유저/펫:
   - users, user_location_history, pet_species, pet_breeds, pets, pet_attribute_defs, pet_attribute_values
2. 산책/지도:
   - walk_albums, walk_records(route_geom, center_point), walk_spots(location_geom)
3. 매칭:
   - likes, matches
4. 채팅:
   - chat_rooms, chat_room_participants, chat_messages, file_attachments, emoticon_packs, emoticons
5. 커뮤니티:
   - community_categories, community_posts, community_comments, community_post_likes
6. Gold/과금:
   - gold_transactions, iap_receipts
7. AI:
   - ai_profile_jobs
8. 기타:
   - notifications

### 4.2 PostGIS 활용 포인트

- `users.main_location_geom`:
  - 주변 친구 추천 (친구 지도)
- `user_location_history.location_geom`:
  - 실시간/최근 위치 기반 추천(확장)
- `walk_records.route_geom` + `walk_spots.location_geom`:
  - 산책 코스 지도 표시 + 코스 근처 Spot/POI 검색
- `walk_records.center_point`:
  - 주변 산책 기록/공개 코스 탐색

---

## 5. Naver Map & 위치 기반 기능 설계

### 5.1 공통 지도 래퍼

- `GoldPetNaverMapView` (Flutter):
  - 입력:
    - center, zoom
    - List<Polyline>
    - List<MapMarker>
  - 콜백:
    - onMarkerTap, onMapTap, onCameraIdle
  - 내부 구현:
    - `flutter_naver_map` 플러그인 활용

### 5.2 산책 지도 화면

- `WalkMapPage`:
  - route_geom → Polyline
  - walk_spots → Spot 마커
  - 카메라: Polyline bounds 기준 초기 설정
  - BottomSheet: 산책 요약 + Spot 리스트

### 5.3 친구 지도 화면

- `FriendMapPage`:
  - center: 내 위치 or main_location_geom
  - 반경: 1/3/5/10km
  - 서버 API: `/friends/nearby?lat=…&lng=…&radiusKm=…`
  - Marker:
    - 사용자 프로필 썸네일
  - BottomSheet: 친구 카드 리스트 (프로필/거리/펫/좋아요)

---

## 6. 비기능 요구사항 (NFR)

### 6.1 성능 & 확장성

- 동시 접속 1만 명까지를 1차 목표로 설계
- 주요 API 응답 시간:
  - 95% < 500ms (단, 이미지/AI 작업 제외)
- 위치 기반 쿼리:
  - PostGIS + GIST 인덱스로 튜닝
- 파일/이미지:
  - 클라이언트에서 리사이즈 후 업로드 권장
  - S3 + CloudFront 캐싱

### 6.2 보안

- HTTPS 전면 적용
- OAuth 연동 보안 검증 (state 파라미터 등)
- JWT 서명키 안전 관리 (KMS/환경 변수)
- 민감 정보 암호화 저장(필요 시)
- 취약점 대응(OWASP Top 10 고려)

### 6.3 개인정보 & 위치 보호

- 위치 권한은 명시적 동의 후 사용
- 언제든지 위치 공유 OFF 옵션 제공
- 지도에서 내 위치/마커 노출 범위 제어
- 계정 삭제 시:
  - PII 최소 보관 / 익명화 정책(운영정책에 따라 설계)

### 6.4 로깅 & 모니터링

- 서버 로그:
  - API 요청/응답 요약, 오류, 주요 이벤트
- 애플리케이션 모니터링:
  - APM 도입
- Biz 이벤트:
  - 가입, 산책 시작/종료, 매칭, 결제, Gold 변동 등 로깅

---

## 7. 릴리즈 범위 (MVP 제안)

### 7.1 MVP에 포함

- SNS 로그인 (Kakao, Naver, Google 중 최소 1~2개)
- 사용자/펫 프로필
- 산책 기록 + 산책 지도(Polyline + Spot 마커)
- 친구 찾기 (리스트 + 간단 필터)
- 좋아요/매칭 + 1:1 채팅(텍스트/이미지)
- AI 펫 이미지(단일 이미지 생성 버전)
- 커뮤니티(기본 게시글/댓글)
- Gold 충전/사용 (기본 패키지)

### 7.2 이후 단계 확장

- 그룹 채팅/모임
- 고급 필터(성격/활동패턴 매칭)
- AI 펫 영상/고급 스타일
- 이모티콘 스토어
- 산책 미션/도전 과제 & 뱃지 시스템
- 공개 산책 코스 탐색/추천

---

## 8. 리스크 & 오픈 이슈 (요약)

- 위치 기반 서비스의 **법적/정책적 규제** (약관/동의/나이제한 등) 검토 필요
- 펫 메이팅 관련:
  - 표현/기능을 “산책 친구/Play Date” 중심으로 할지,  
    실제 교배/번식까지를 어떻게 취급할지에 대한 정책 필요
- AI 생성 콘텐츠:
  - 저작권/초상권 이슈 검토
- 운영자(Admin) 콘솔:
  - 신고 처리, 금지어 관리, 회원 제재 UI/기능 설계는 별도 Admin PRD 필요

---

본 PRD v2.0은 GoldPet의 **기능/UX/데이터/인프라를 통합적으로 정리한 기준 문서**이며,  
세부 API 스펙(Swagger), 테이블 DDL, 화면 디자인 시  
본 문서를 상위 참조로 사용한다.
