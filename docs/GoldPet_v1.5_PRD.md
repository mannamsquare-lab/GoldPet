# GoldPet_v1.5_PRD.md

# 📘 GoldPet – PRD v1.5  
**(Features + DevOps + ERD 개정 + Naver 지도/산책코스/마커 + Chat 확장 + Walk 앨범/공개 범위 + Flutter 구조)**

v1.5에서는 v1.4 내용을 기반으로, **지도 SDK를 Naver Maps API로 확정**하고,  
이를 반영한 기술/구현 방향을 명시한다.

- Flutter 클라이언트는 **Naver Maps API**(Android/iOS용)를 사용
- 산책 코스(Polyline), Spot 마커, 친구 마커는 모두 Naver Map 상에 렌더링
- Naver Cloud Platform 계정 및 API Key/Client ID/Secret 관리 전략을 포함

---

# 1. 프로젝트 개요

GoldPet은 반려동물의 산책, 프로필 관리, AI 프로필 생성, 친구 매칭, 커뮤니티 등 반려동물 중심 서비스를 제공하는 모바일 앱이다.  
Flutter 기반으로 Android/iOS 앱을 출시하며, 백엔드는 Spring Boot + PostgreSQL + Redis + AI 서버(Python) 구조로 구성된다.

**지도 서비스:**  
- 대한민국 사용자를 주요 타깃으로 하며, 지도/길찾기/좌표 변환 등의 품질을 고려해  
  **Naver Maps API**를 공식 지도 SDK로 사용한다.

---

# 2. 주요 기능 요약

## 2.1 회원가입 & 프로필
- SNS 간편가입(카카오, 네이버, 구글, 애플 등)
- 사용자 프로필 설정(닉네임, 성별, 나이 옵션, 프로필 이미지)
- 반려동물 프로필 등록(여러 마리)
- 위치 정보(주소/주요 활동 지역) 설정

## 2.2 산책 기능 (Naver 지도 기반)
- GPS 기반 산책 시작/종료
- 산책 궤적(Polyline) 기록 및 저장
- **Naver 지도 기반 산책 코스 보기**
  - 내가 산책한 경로가 Naver Map 위에 Polyline(궤적)으로 표시
  - 산책 중 찍은 사진 Spot이 지도 위 마커로 표시
- 사진 Spot + 메모 기록
- 거리/시간/칼로리(사용자·반려동물) 기록
- 산책 히스토리 및 앨범 보기
- **Naver 지도에서 친구 위치 보기**
  - 설정된 공개 범위/지역 기준으로 인근 친구들이 지도 위 마커로 표시

## 2.3 친구 찾기 & 매칭
- 필터(종, 품종, 나이, 성별, 성격, 활동 지역 등)를 통한 친구 추천
- “좋아요” 기반 매칭
- 상호 좋아요 시 매칭 → 1:1 채팅방 자동 생성
- (확장) Naver 지도에서 인근 친구 확인 후 프로필 진입

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

# 3. 기능 상세 스펙 (Level 2 – 흐름 중심) 요약

(기본 흐름은 v1.4와 동일하며, Naver 지도 사용을 전제로 하는 부분만 강조)

## 3.1 회원가입 흐름
- 온보딩 → SNS 로그인 → 프로필 설정 → 위치 설정(Naver 지도 기반) → 펫 등록 → 홈 진입

## 3.2 산책 기록 & Naver 지도 표시 흐름

1. 하단 탭에서 “산책” 선택 → “산책 시작” 버튼 클릭
2. GPS 활성화 및 이동 궤적 기록 시작
3. 사용자가 사진을 찍으면 해당 위치에 Spot 생성(사진+메모)  
   → WalkSpot(latitude, longitude, photo_url) 저장
4. “산책 종료” 시, 전체 이동 거리/시간/칼로리 계산
5. 산책 기록 저장 후, “지도에서 보기” 기능 제공
6. Naver Map 화면에서:
   - WalkRecord.route_geojson 을 기반으로 Polyline 렌더링
   - WalkSpot 리스트를 마커로 표출
   - 마커 탭 시 사진/메모 툴팁 또는 BottomSheet 표시

## 3.3 친구 찾기 & 매칭 + 지도 연동 흐름

1. “친구 찾기” 탭에서 리스트/카드 기반 추천
2. 추가로 “지도 보기” 기능에서:
   - 현재 위치 또는 main_location을 중심으로 Naver Map 로딩
   - 일정 반경 내 추천 친구를 마커로 표시
   - 마커 탭 시 미니 카드 → 친구 프로필 상세 이동
3. 좋아요/매칭 로직은 기존과 동일

---

# 4. DevOps & Docker 구성 (요약 + Naver Maps 설정)

## 4.1 기본 인프라 (변경 없음)
- Docker 기반 로컬 개발환경
- docker-compose로 API/AI/PostgreSQL/Redis/Nginx 구성
- GitHub Actions 기반 CI/CD 파이프라인
- AWS ECS Fargate + RDS + ElastiCache + S3 기반 인프라

## 4.2 Naver Maps API Key 관리

### Naver Cloud Platform 설정
- Naver Cloud Platform 콘솔에서:
  - Maps → Map API 사용 설정
  - Android / iOS 앱 등록
  - Client ID / Client Secret 발급

### 보안 & 환경 변수 전략
- 모바일 앱(Flutter):
  - Android: `AndroidManifest.xml` / gradle 속성에 Naver Map Client ID 설정
  - iOS: `Info.plist`에 Naver Map Client ID 설정
- 빌드 시점:
  - 환경별(dev/stage/prod) Client ID 분리 가능
- 서버:
  - 서버에서 Naver Maps 서버 API(Reverse Geocoding 등)를 사용할 경우  
    Spring Boot 환경 변수로 Client ID/Secret 관리 (`NAVER_MAP_CLIENT_ID`, `NAVER_MAP_CLIENT_SECRET`)

---

# 5. ERD 설계 (v1.5 – Naver 지도 활용 전제)

기본 ERD 구조는 v1.3/v1.4와 동일하며, 위치/지도 관련 필드는 Naver 지도 좌표 체계를 전제로 사용한다.

## 5.1 WalkRecord (산책 기록 – 궤적 + 공개 범위 + 앨범)

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
| route_geojson | JSON        | Naver 지도 상에서 사용할 수 있는 LineString 좌표 리스트 |
| visibility    | VARCHAR     | PUBLIC / FRIENDS / PRIVATE                  |
| created_at    | TIMESTAMP   | 생성일                                       |
| updated_at    | TIMESTAMP   | 수정일                                       |

> route_geojson 구조 예시:  
> `{ "type": "LineString", "coordinates": [[lng, lat], [lng, lat], ...] }`  
> (Naver Map SDK에서 Polyline으로 변환 가능)

---

## 5.2 WalkSpot (산책 중 사진 Spot – Naver Map 마커)

| 필드명       | 타입        | 설명                                        |
|--------------|-------------|---------------------------------------------|
| id           | BIGINT PK   | Spot ID                                     |
| walk_id      | BIGINT FK   | WalkRecord FK                               |
| latitude     | DECIMAL     | Spot 위도 (Naver Map 좌표)                  |
| longitude    | DECIMAL     | Spot 경도 (Naver Map 좌표)                  |
| photo_url    | VARCHAR     | 사진 URL                                    |
| memo         | TEXT        | 메모                                        |
| taken_at     | TIMESTAMP   | 촬영 시각                                   |

---

## 5.3 친구 위치 표현(마커) – 설계 방향

현재 버전에서는 **서버에 실시간 위치를 저장하지 않고**,  
다음 두 가지 방식 중 하나를 사용한다:

1. **main_location 기반 대표 좌표**
   - 사용자가 설정한 주요 활동 지역(main_location)을  
     서버 또는 클라이언트에서 좌표로 변환(Reverse Geocoding)하여  
     친구 마커의 중심 위치로 활용
2. **옵션: UserLocationHistory 추가 (추후 버전)**
   - 정기적으로 사용자의 최근 위치를 저장하여  
     보다 정확한 지도 표시/추천에 활용

ERD에는 추후 확장을 위해 아래와 같은 구조를 도입 가능:

| 필드명     | 타입        | 설명                                 |
|------------|-------------|--------------------------------------|
| id         | BIGINT PK   | 기록 ID                              |
| user_id    | BIGINT FK   | 사용자 ID                            |
| latitude   | DECIMAL     | 위도                                 |
| longitude  | DECIMAL     | 경도                                 |
| created_at | TIMESTAMP   | 기록 시각                            |

---

# 6. 지도 & 위치 기반 기능 명세 (Naver Maps 기준)

## 6.1 Naver Maps Flutter 연동

### 플러터 라이브러리 후보
- `flutter_naver_map` (또는 동등 기능 플러그인)
- 주요 요구사항:
  - Polyline 지원
  - Custom Marker 지원 (이미지/위젯 기반 아이콘)
  - OnMarkerTapped, OnMapTapped 콜백
  - 카메라 이동/줌 제어 API

### 플랫폼 설정
- Android:
  - `AndroidManifest.xml`에 `com.naver.maps.map.CLIENT_ID` 메타데이터 등록
  - Min SDK / Target SDK Naver Maps 권장 설정 확인
- iOS:
  - `Info.plist`에 Naver Map Client ID 설정
  - iOS 11+ 지원 기준으로 설정

---

## 6.2 산책 코스 지도 보기 (Naver Map)

### 화면 동작

1. 사용자가 산책 기록 상세 페이지에서 “지도에서 보기” 탭 선택
2. `WalkMapPage` 진입:
   - Naver Map 초기화
   - `route_geojson` → Polyline으로 변환 후 지도에 추가
   - `WalkSpot` 리스트 → 마커로 추가
3. 카메라:
   - Polyline 전체가 화면에 들어오도록 bounds 계산 후 카메라 위치/줌 설정
4. 마커 탭 시:
   - 사진 썸네일 + 메모를 담은 BottomSheet 또는 Tooltip 표시
   - “사진 크게 보기” 클릭 시 풀스크린 뷰어로 이동

---

## 6.3 친구 지도 보기 (Naver Map)

### 화면 동작

1. “친구 찾기” 또는 별도 “지도” 탭에서 진입
2. 중심 좌표:
   - 현재 GPS 위치 또는 `User.main_location` 좌표 사용
3. 서버에서 주변 친구 리스트 조회:
   - 요청 파라미터: 중심 좌표(lat, lng), 반경(distanceKm), 필터(species, gender 등)
4. 클라이언트:
   - 각 친구를 `Marker`로 등록
   - 마커 아이콘은:
     - 사용자 프로필 이미지 썸네일 또는
     - 종(개/고양이 등)에 따른 기본 아이콘
5. 마커 탭 시:
   - 친구 미니 카드(닉네임, 대표 펫 정보, 거리)
   - “프로필 보기” 버튼 → 프로필 상세 페이지로 이동

---

# 7. Flutter 프로젝트 구조 (지도 관련)

기본 구조는 v1.3/1.4와 동일하나, Naver Maps를 기준으로 아래 모듈을 사용한다.

## 7.1 지도 공통 모듈

`lib/features/map/`:

- `goldpet_naver_map_view.dart`
  - 내부에서 `flutter_naver_map`을 래핑한 공통 지도 위젯
  - props:
    - `LatLng center`
    - `double zoom`
    - `List<Polyline>` polylines
    - `List<MapMarker>` markers
    - 콜백(onMarkerTap, onMapTap 등)
- `map_marker.dart`
  - id, type (WALK_SPOT, FRIEND, PLACE 등), position, payload
- `map_polyline.dart`

## 7.2 산책 지도 화면

- `features/walk/presentation/pages/walk_map_page.dart`
  - 입력: `WalkRecordDetail` (routeGeoJson + spots)
  - 로직:
    - `routeGeoJson` → Polyline 변환
    - `spots` → Marker 리스트 변환
    - `GoldPetNaverMapView`에 전달

## 7.3 친구 지도 화면

- `features/match/presentation/pages/friend_map_page.dart`
  - 입력: 내 위치 + 추천 친구 리스트
  - 로직:
    - 친구 리스트 → Marker 리스트 변환
    - 마커 탭 → 프로필/매칭 플로우로 연결

---

# 8. 정리

v1.5에서 확정된 사항:

1. **지도 SDK를 Naver Maps API로 확정**
   - 지도, Polyline, Marker, 좌표 관련 설계는 모두 Naver 기준
2. **산책 코스 & Spot & 친구 마커가 Naver 지도 위에서 일관되게 동작**
   - WalkRecord.route_geojson → Polyline
   - WalkSpot(latitude, longitude) → Spot 마커
   - 친구(사용자/펫) → 주변 마커
3. **Flutter 구조 상, Naver Map을 래핑한 공통 컴포넌트 계층 설계**
   - Walk/Match/향후 커뮤니티 지도 기능에서 재사용 가능
4. **DevOps 레벨에서 Naver Cloud API Key 관리 전략 반영**
   - 환경별 분리 및 보안 관리 명시

이 문서는 GoldPet의 **Naver 지도 기반 산책/친구 기능까지 포함한 공식 PRD v1.5 기준 문서**이다.
