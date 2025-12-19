# GoldPet_v1.4_PRD.md

# 📘 GoldPet – PRD v1.4  
**(Features + DevOps + ERD 개정 + 지도/산책코스/마커 + Chat 확장 + Walk 앨범/공개 범위 + Flutter 구조)**

v1.4에서는 v1.3 내용을 기반으로, **지도(Map)를 활용한 산책 코스 표시 및 마커 정책**을 명확히 추가했다.

- 지도 상에서 산책 코스를 확인할 수 있음
- 사용자가 산책한 궤적(폴리라인)이 지도에 표시됨
- 산책 중 사진을 찍은 Spot이 지도에서 마커로 표시됨
- 친구(다른 사용자/펫)가 거리/지역 기준으로 지도에 마커로 표시됨

---

# 1. 프로젝트 개요

GoldPet은 반려동물의 산책, 프로필 관리, AI 프로필 생성, 친구 매칭, 커뮤니티 등 반려동물 중심 서비스를 제공하는 모바일 앱이다.  
Flutter 기반으로 Android/iOS 앱을 출시하며, 백엔드는 Spring Boot + PostgreSQL + Redis + AI 서버(Python) 구조로 구성된다.

---

# 2. 주요 기능 요약

## 2.1 회원가입 & 프로필
- SNS 간편가입(카카오, 네이버, 구글, 애플 등)
- 사용자 프로필 설정(닉네임, 성별, 나이 옵션, 프로필 이미지)
- 반려동물 프로필 등록(여러 마리)
- 위치 정보(주소/주요 활동 지역) 설정

## 2.2 산책 기능 (지도 기능 포함)
- GPS 기반 산책 시작/종료
- 산책 궤적(Polyline) 기록 및 저장
- **지도 기반 산책 코스 보기**
  - 내가 산책한 경로가 지도 위에 궤적으로 표시
  - 산책 중 찍은 사진 Spot이 지도 위 마커로 표시
- 사진 Spot + 메모 기록
- 거리/시간/칼로리(사용자·반려동물) 기록
- 산책 히스토리 및 앨범 보기
- **지도 기반 친구 위치 보기**
  - 설정된 공개 범위/지역 기준으로 인근 친구들이 지도 위 마커로 표시

## 2.3 친구 찾기 & 매칭
- 필터(종, 품종, 나이, 성별, 성격, 활동 지역 등)를 통한 친구 추천
- “좋아요” 기반 매칭
- 상호 좋아요 시 매칭 → 1:1 채팅방 자동 생성
- (확장) 지도에서 인근 친구 확인 후 프로필 진입

## 2.4 채팅
- 1:1 채팅
- 그룹 채팅(산책 모임 단체방)
- AI 펫 챗봇과의 대화
- 텍스트, 파일(이미지/영상/문서 등), 이모티콘/스티커, 이모지 지원
- 채팅 목록 및 말풍선에 사용자 프로필 이미지 노출

## 2.5 AI 펫 프로필 생성
- 반려동물 정보 + 사진 기반
- Pixar/애니/디즈니 스타일 이미지 또는 짧은 영상 생성
- Gold 소모 기능

## 2.6 커뮤니티
- 카테고리 기반 게시글 작성
- 이미지 첨부
- 좋아요/댓글/신고
- 인기글(조회수/반응 기반) 정렬

## 2.7 Gold 시스템
- 가입 시 3,000 Gold 지급
- 인앱 결제를 통한 Gold 충전
- AI 생성, 추가 좋아요, 프로필 부스터, 이모티콘 패키지 등에서 소모

---

# 3. 기능 상세 스펙 (Level 2 – 흐름 중심)

## 3.1 회원가입 흐름
1. 앱 실행 → 온보딩 화면에서 “SNS로 시작하기” 선택
2. SNS 로그인 성공 후 서비스 약관/개인정보 동의 화면 표시
3. 필수 동의 후 기본 프로필 입력(닉네임, 연령대, 선택적 정보)
4. 위치 권한 요청 → 허용 시 현재 위치 기반 주요 활동 지역 추천
5. 최초 반려동물 등록 화면으로 이동
6. 반려동물 등록 완료 후, 홈 화면 진입 + 3,000 Gold 자동 지급

## 3.2 산책 기록 & 지도 표시 흐름

1. 하단 탭에서 “산책” 선택 → “산책 시작” 버튼 클릭
2. GPS 활성화 및 이동 궤적 기록 시작
3. 사용자가 사진을 찍으면 해당 위치에 Spot 생성(사진+메모)  
   → **WalkSpot에 위/경도 저장, 향후 지도 마커로 사용**
4. 산책 도중 일시정지/재개 가능
5. “산책 종료” 시, 전체 이동 거리/시간/칼로리 계산
6. 사용자가 산책 제목/메모 입력 후 저장
7. 저장된 기록은 “산책 히스토리” 및 “산책 앨범”에서 조회 가능
8. **지도 화면에서 산책 코스 상세 보기**
   - 선택한 산책 기록에 대해:
     - 지도 위에 이동 경로(Polyline) 표시 (WalkRecord.route_geojson 기반)
     - WalkSpot 별로 마커 표시 (사진이 있을 경우 썸네일/아이콘 표시)
9. **지도에서 친구 마커 표시**
   - 내 주요 활동 지역 기준 또는 현재 위치 기준 반경 내 친구(사용자+펫)를 불러옴
   - 각 친구 위치를 마커로 표현 (프로필 대표 아이콘/사진)
   - 마커 선택 시 간단한 툴팁(닉네임/펫 정보) + 친구 상세 프로필 화면으로 이동

## 3.3 친구 찾기 & 매칭 흐름
1. “친구 찾기” 탭에서 기본 추천 리스트 로딩(거리+반려동물 조건 기반)
2. 필터(종/성별/나이/중성화/성격/활동지역 등) 옵션으로 검색 범위 조정
3. 프로필 상세 화면에서 반려동물 정보, 산책 스타일, 최근 산책 앨범 내용 확인
4. 마음에 들 경우 “좋아요” 클릭(일일 무료 횟수 초과 시 Gold 사용 안내)
5. 상대가 나에게 이미 좋아요를 눌렀다면 즉시 매칭 성립
6. 양방향 좋아요 시 알림 발송 + 1:1 채팅방 자동 생성
7. (선택) 지도 화면에서 친구 마커 선택 → 프로필 상세 → 좋아요 발송

## 3.4 채팅 흐름
- 1:1 채팅
  1. 매칭 성립 시 “새로운 매칭이 생겼어요!” 알림
  2. 알림 또는 매칭 목록에서 해당 대화방으로 이동
  3. 텍스트/이모지/이모티콘/사진/산책 기록 공유 가능
  4. 필요 시 차단/신고 기능 제공
- 그룹 채팅
  1. 사용자가 “산책 모임 만들기” 선택
  2. 모임 이름, 지역, 산책 시간대 입력
  3. 친구 목록/매칭 사용자 초대 → 그룹 채팅방 생성
  4. 그룹 내 공지, 모임 일정 공유 가능
- AI 펫 챗봇
  1. “AI 펫과 대화하기” 메뉴 선택
  2. 사용자의 대표 반려동물 프로필 로딩
  3. 반려동물 성격에 맞는 말투로 응답
  4. 산책/식단/건강 관련 조언 및 귀여운 말투로 상호작용

## 3.5 AI 펫 프로필 생성 흐름
1. “AI 프로필 생성” 메뉴 선택
2. 반려동물 선택 또는 새로 정보 입력
3. 사진 업로드(선택) + 색깔/특징/성격 태그 선택
4. 스타일 옵션(Pixar/애니/디즈니풍) 선택
5. 필요한 Gold 수량 안내 → 사용 확인
6. AI 서버로 생성 요청
7. 생성 완료 후, 사용자에게 결과 이미지/영상 표시
8. 반려동물 프로필 이미지로 적용하거나 기기에 저장/공유 가능

## 3.6 커뮤니티 흐름
1. “커뮤니티” 탭에서 카테고리(산책, 건강, 정보, 자랑 등) 선택
2. 게시글 목록 조회(최신/인기 정렬)
3. 게시글 상세 화면에서 사진·내용·댓글 확인
4. 새 글 작성 시
   - 카테고리 선택
   - 텍스트 작성
   - 사진 최대 10장 업로드
   - 해시태그 입력
5. 게시글 등록 후 피드 상단에 노출
6. 신고 기능을 통해 부적절한 콘텐츠 필터링

## 3.7 Gold 사용/충전 흐름
1. “내 Gold” 메뉴에서 잔액 확인
2. “충전하기” 클릭 → 패키지 선택(1,000 / 5,000 / 10,000 / 30,000+보너스)
3. 스토어(IAP) 결제 → 결제 성공 시 서버에서 영수증 검증
4. 금액에 따른 Gold 지급, GoldTransaction 기록
5. Gold 소모 시(예: 추가 좋아요, AI 생성, 이모티콘 패키지 구매 등) 사용 내역 기록

---

# 4. DevOps & Docker 구성 (요약)

- Docker 기반 로컬 개발환경
- docker-compose로 API/AI/PostgreSQL/Redis/Nginx 구성
- GitHub Actions 기반 CI/CD 파이프라인
- AWS ECS Fargate + RDS + ElastiCache + S3 기반 인프라

(v1.3 내용과 동일, 지도/마커 기능은 주로 어플리케이션 레벨 변경이라 인프라 구조 변경 없음)

---

# 5. ERD 설계 (v1.4 – 지도/마커 고려 포함)

기본 ERD 구조는 v1.3과 동일하며, 지도/마커 기능을 위한 위치 필드를 명시적으로 활용한다.

## 5.1 주요 엔티티 및 속성 (요약)

### User
- 주요 변경: `profile_image_url` 필드로 채팅/지도 마커(친구 아이콘) 등에 사용 가능

| 필드명           | 타입        | 설명                                 |
|------------------|-------------|--------------------------------------|
| id               | BIGINT PK   | 사용자 ID                            |
| email            | VARCHAR     | 이메일                               |
| oauth_provider   | VARCHAR     | SNS 종류                             |
| oauth_id         | VARCHAR     | SNS 고유 ID                          |
| nickname         | VARCHAR     | 닉네임                               |
| gender           | VARCHAR     | 성별(옵션)                           |
| birth_year       | INT         | 출생 연도(옵션)                      |
| main_location    | VARCHAR     | 주요 활동 지역(지도 중심 좌표와 매핑)|
| profile_image_url| VARCHAR     | 프로필 이미지 URL                    |
| gold_balance     | INT         | 보유 Gold                            |
| created_at       | TIMESTAMP   | 생성일                               |
| updated_at       | TIMESTAMP   | 수정일                               |

(필요 시, 사용자의 대표 위치 좌표를 위한 latitude/longitude 필드를 추가로 고려할 수 있다.)

---

### WalkRecord (산책 기록 – 궤적 + 공개 범위 + 앨범)
| 필드명        | 타입        | 설명                                         |
|---------------|-------------|----------------------------------------------|
| id            | BIGINT PK   | 산책 기록 ID                                 |
| user_id       | BIGINT FK   | 사용자 ID                                    |
| pet_id        | BIGINT FK   | 대표 반려동물 ID                             |
| album_id      | BIGINT FK   | WalkAlbum FK (옵션)                          |
| title         | VARCHAR     | 산책 제목                                    |
| distance_m    | INT         | 이동 거리(m)                                 |
| duration_sec  | INT         | 산책 시간(초)                                |
| user_calorie  | INT         | 사용자 칼로리                                |
| pet_calorie   | INT         | 반려동물 칼로리                              |
| started_at    | TIMESTAMP   | 시작 시각                                    |
| ended_at      | TIMESTAMP   | 종료 시각                                    |
| route_geojson | JSON        | **지도상의 궤적 정보(GeoJSON LineString 등)**|
| visibility    | VARCHAR     | PUBLIC / FRIENDS / PRIVATE                  |
| created_at    | TIMESTAMP   | 생성일                                       |
| updated_at    | TIMESTAMP   | 수정일                                       |

> `route_geojson` 은 지도 SDK(예: Google Maps, Naver Maps 등)에 Polyline으로 표시하기 위한 좌표 리스트를 포함.

---

### WalkSpot (산책 중 사진 Spot – 마커 기반)
| 필드명       | 타입        | 설명                                        |
|--------------|-------------|---------------------------------------------|
| id           | BIGINT PK   | Spot ID                                     |
| walk_id      | BIGINT FK   | WalkRecord FK                               |
| latitude     | DECIMAL     | **Spot 위도(지도 마커 위치)**               |
| longitude    | DECIMAL     | **Spot 경도(지도 마커 위치)**               |
| photo_url    | VARCHAR     | 사진 URL                                    |
| memo         | TEXT        | 메모                                        |
| taken_at     | TIMESTAMP   | 촬영 시각                                   |

> 클라이언트에서는 WalkRecord 상세 지도 화면에서,  
> `WalkRecord.route_geojson`을 Polyline으로 그리고,  
> `WalkSpot` 리스트를 각각 마커 아이콘으로 표시한다.

---

### (선택) FriendLocation / UserLocationHistory (향후 확장용)

지금 버전(v1.4)에서는 **User.main_location** 및 실시간 위치는 클라이언트에서 주로 사용하지만,  
향후 **실시간/주기적 위치 기반 추천**이 필요해질 경우 아래와 같은 구조를 추가할 수 있다.

| 필드명       | 타입        | 설명                                        |
|--------------|-------------|---------------------------------------------|
| id           | BIGINT PK   | 위치 ID                                     |
| user_id      | BIGINT FK   | 사용자 FK                                   |
| latitude     | DECIMAL     | 위도                                        |
| longitude    | DECIMAL     | 경도                                        |
| accuracy     | DECIMAL     | 정확도(옵션)                                |
| created_at   | TIMESTAMP   | 기록 시각                                   |

현재 PRD에서는 구조만 염두해두고, 실제 도입은 추후 버전에서 결정.

---

### FileAttachment, EmoticonPack, Emoticon, Match, ChatRoom, ChatMessage, WalkAlbum, CommunityPost 등

- v1.3 설계와 동일하게 유지.
- 지도/마커 기능으로 인한 스키마 변경은 필요 없음.

---

## 5.2 관계

- User 1 ── * WalkAlbum  
- WalkAlbum 1 ── * WalkRecord  
- WalkRecord 1 ── * WalkSpot  
- User 1 ── * Match (친구 관계/매칭 목록)  
- 지도 상의 친구 마커는:
  - User.main_location (또는 UserLocationHistory)와 Match/추천 결과를 조합하여 표현

---

# 6. 지도 & 위치 기반 기능 명세 (신규 섹션)

## 6.1 지도 SDK

- 클라이언트(Flutter)에서 다음 중 하나를 사용 (예: 구체 구현 시점에 결정):
  - Google Maps
  - Naver Maps
  - Kakao Maps
- 공통 요구사항:
  - Polyline 표시 지원
  - Custom Marker/Icon 지원
  - OnTap 이벤트(마커 클릭) 콜백 지원

## 6.2 산책 코스 지도 보기

### 기능 설명
- 사용자가 특정 산책 기록을 선택하면, “지도 보기” 버튼 또는 탭에서:
  - 산책의 시작~끝까지 이동한 궤적을 Polyline으로 표시
  - Spot(사진이 있는 지점)을 마커로 표시
  - Spot 마커를 탭하면 사진/메모가 팝업(툴팁/BottomSheet)으로 표시

### UX 요구사항
- 화면 진입 시:
  - Polyline 전체가 화면 안에 들어오도록 자동 줌/센터 조정
- Spot이 여러 개일 경우:
  - 마커가 겹칠 수 있으므로 클러스터링 또는 레벨 별 표시 고려 (후속 버전에서)
- 산책 코스 공유/공개:
  - PUBLIC 또는 FRIENDS 설정의 산책 코스를 공유할 경우,  
    상대 사용자가 지도 화면에서 동일하게 확인 가능

## 6.3 친구 지도 보기

### 기능 설명
- “친구 찾기” 탭 또는 별도 “지도 보기” 탭에서:
  - 내 주요 활동 지역 또는 현재 위치를 중심으로 지도 표시
  - 일정 반경(예: 1km, 3km 등) 이내의 추천 친구/매칭 후보들을 마커로 표시

### 마커 정보
- 마커 아이콘:
  - 사용자 프로필 이미지가 있을 경우 원형 썸네일 형태로 사용 (또는 펫 아이콘)
- 마커 클릭 시:
  - 사용자 닉네임
  - 대표 펫 이름/종/간단 성격
  - “프로필 보기” 버튼 → 친구 상세 프로필 페이지로 이동

### 필터 & 거리 옵션
- 거리(반경) 필터:
  - 1km / 3km / 5km / 10km…
- 종/품종 필터:
  - 지도 상에서 특정 종(예: 개만, 고양이만) 필터링

---

# 7. Flutter 프로젝트 구조 (지도 관련 고려)

기본 구조는 v1.3에서 정의한 `features/walk`, `features/match`, `features/walk_album` 등을 유지하며,  
지도 관련 코드는 다음과 같이 모듈화한다.

## 7.1 지도 전용 공통 위젯/레이어

`lib/features/map/` 예시:

- `widgets/`
  - `goldpet_map_view.dart`  
    - 내부에서 사용하는 지도 SDK 캡슐화 (Google/Naver/Kakao 중 선택)
    - 공통 속성: center, zoom, markers, polylines
  - `user_marker.dart`
  - `walk_spot_marker.dart`
- `models/`
  - `map_marker.dart` (공통 마커 모델: id, type, lat, lng, payload)
  - `map_polyline.dart`

## 7.2 Walk 지도 화면

- `features/walk/presentation/pages/walk_map_page.dart`
  - 입력: `WalkRecordDetail` (routeGeoJson + spots)
  - 내부:
    - `GoldPetMapView`에 polyline + spot 마커 주입
    - Spot 마커 클릭 시 BottomSheet로 사진/메모 표시

## 7.3 친구 지도 화면

- `features/match/presentation/pages/friend_map_page.dart`
  - 입력: 내 위치 + 주변 추천 친구 리스트
  - 내부:
    - `GoldPetMapView`에 친구 마커 리스트 전달
    - 마커 클릭 → 친구 카드/BottomSheet + 프로필 이동

---

# 8. 정리

v1.4에서 새로 추가된 핵심 사항은 다음과 같다:

1. **지도 기반 산책 코스 표시**
   - WalkRecord.route_geojson을 사용해 Polyline으로 궤적 표현
   - WalkSpot 리스트를 사용해 사진 Spot을 마커로 표시

2. **지도 기반 친구 마커 표시**
   - 사용자/펫의 활동 지역/위치를 기반으로 친구를 지도에서 시각화
   - 마커 클릭 → 프로필 및 매칭으로 연결되는 UX 설계

3. **ERD에는 이미 존재하던 위치 정보 필드(WalkSpot.latitude/longitude, route_geojson 등)를  
   지도 기능에 어떻게 활용하는지 명확히 정의**

4. **Flutter 구조 관점에서 지도 공통 레이어를 분리하여,  
   산책/친구 찾기/추후 커뮤니티 등 다양한 기능에서 재사용 가능하도록 설계**

이 문서는 GoldPet의 **지도/산책코스/친구 마커 기능까지 포함한 PRD v1.4 기준 문서**이다.
