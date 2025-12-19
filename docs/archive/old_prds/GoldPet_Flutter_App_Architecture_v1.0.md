# GoldPet – Flutter 앱 아키텍처 & 개발 가이드 v1.0

> 이 문서는 GoldPet PRD v2.0 / 위치 API / ERD를 바탕으로  
> **Flutter 앱을 어떻게 구조화하고 개발할지**에 대한 가이드이다.  
> (필수 기능, 모듈, 레이어 아키텍처, 네비게이션/상태관리, UX 구조 포함)

---

## 1. 목표 & 전제

### 1.1 목표

- iOS / Android 동시 지원 (Flutter)
- **유지보수성과 확장성**을 고려한 모듈 구조
- Naver Map, 위치 기반, 채팅, AI, 결제 등 **복잡 기능을 단계적으로 추가 가능**한 구조
- 클라이언트 레벨에서의 **UX 일관성과 성능 확보**

### 1.2 기술 전제

- Flutter (최신 stable)
- 최소 SDK:
  - Android: minSdk 23+
  - iOS: iOS 13+ (권장)
- 상태관리: **Riverpod**(StateNotifier/AsyncNotifier 기반) 권장
- 라우팅: `go_router` 또는 `auto_route` 중 택1 (여기서는 `go_router` 전제)
- DI: Riverpod Provider 기반 DI
- HTTP: `dio` + `retrofit` 스타일(또는 `chopper`) – 타입 세이프 API 클라이언트
- 로컬 스토리지: `shared_preferences` + `hive`/`isar` (필요 시)
- 지도: `flutter_naver_map`

---

## 2. 전체 구조 개요

### 2.1 레이어드 아키텍처

기본적으로 **Presentation / Application / Domain / Data** 레이어로 나눈다.

```text
lib/
 ├─ core/                # 공통 유틸, 디자인 시스템, 에러/결과 타입
 ├─ config/              # 환경 설정, 라우팅, DI 부트스트랩
 ├─ features/
 │   ├─ auth/            # 로그인/회원가입
 │   ├─ profile/         # 유저 프로필/설정
 │   ├─ pets/            # 펫 프로필
 │   ├─ walk/            # 산책 기록/지도
 │   ├─ map/             # 공통 지도 래퍼
 │   ├─ match/           # 친구 찾기/매칭
 │   ├─ chat/            # 채팅
 │   ├─ community/       # 커뮤니티
 │   ├─ gold/            # Gold/결제
 │   ├─ ai/              # AI 펫 프로필
 │   └─ notifications/   # 알림
 └─ main.dart
```

각 feature 내부는 다음과 같은 구조를 권장:

```text
features/<feature_name>/
 ├─ domain/
 │   ├─ entities/
 │   ├─ repositories/
 │   └─ usecases/      # 선택
 ├─ data/
 │   ├─ models/        # DTO, JSON <-> Entity 변환
 │   ├─ datasources/   # Remote/Local
 │   └─ repositories_impl/
 └─ presentation/
     ├─ pages/
     ├─ widgets/
     └─ controllers/   # Riverpod Notifier, ViewModel
```

---

## 3. 필수 기능별 모듈 설계

### 3.1 Auth 모듈 (features/auth)

#### 3.1.1 기능

- 온보딩 / 로그인 / 회원가입(SSO)
- Access/Refresh Token 관리
- 최초 로그인 후 온보딩 플로우(프로필/펫 등록)로 연결

#### 3.1.2 구성

- `domain/entities/user_auth.dart`
- `domain/repositories/auth_repository.dart`
- `data/models/auth_dto.dart`
- `data/datasources/auth_remote_data_source.dart`
- `data/repositories_impl/auth_repository_impl.dart`
- `presentation/controllers/auth_controller.dart` (StateNotifier)
- `presentation/pages/login_page.dart`
- `presentation/pages/onboarding_page.dart`

---

### 3.2 Profile 모듈 (features/profile)

#### 3.2.1 기능

- 내 프로필 보기/수정
- 주요 활동 지역 설정 (Naver Map 활용)
- 공개 범위/알림/위치 설정

#### 3.2.2 UX 포인트

- 프로필 편집에서 **지도 모달**을 이용해 main_location 선택
- 라벨: “주요 활동 지역 설정” → 지도에서 핀 이동 → 동/구 단위 텍스트 표기

---

### 3.3 Pets 모듈 (features/pets)

#### 3.3.1 기능

- 펫 목록 조회
- 펫 등록/수정/삭제
- 펫 속성 확장(성격 태그, 알레르기 등) – 다중 선택/커스텀 태그

#### 3.3.2 UX 포인트

- 온보딩 중 최소 1마리 펫 등록 유도
- 펫 카드 리스트 + 상세 편집 화면
- 성격 태그는 **Chip/Toggle 버튼** 형태로 구현

---

### 3.4 Map 공통 모듈 (features/map)

#### 3.4.1 역할

- `flutter_naver_map`를 래핑한 **공통 지도 위젯**
- Walk/친구 지도 등 여러 화면에서 재사용

#### 3.4.2 구조

- `map/presentation/widgets/goldpet_naver_map_view.dart`
  - props:
    - `center`, `zoom`
    - `polylines`, `markers`
    - 콜백: `onMarkerTap`, `onCameraIdle`, `onMapTap`
  - 내부에서 실제 NaverMap 컨트롤러 관리

- `map/domain/entities/map_marker.dart`
- `map/domain/entities/map_polyline.dart`

---

### 3.5 Walk 모듈 (features/walk)

#### 3.5.1 기능

- 산책 시작/종료, GPS 트래킹
- 산책 기록 저장/조회
- 산책 지도 화면 (단일 코스)
- 산책 앨범(기초)

#### 3.5.2 주요 페이지

- `WalkHomePage` (목록/요약)
- `WalkTrackingPage` (실시간 트래킹 UI)
- `WalkSummaryPage` (저장 전 요약)
- `WalkMapPage` (지도 상세)

#### 3.5.3 UX/화면 흐름

1. 탭: “산책” → `WalkHomePage`
2. “산책 시작” → `WalkTrackingPage`
   - 지도 미니뷰 + 현재 거리/시간/속도
   - 사진 촬영 버튼(Spot 생성)
3. “산책 종료” → `WalkSummaryPage`
   - 거리/시간/칼로리
   - Spot 썸네일 리스트
   - 제목/공개범위/대표 펫/앨범 선택
4. 저장 완료 → “지도에서 보기” (`WalkMapPage`) or 홈으로

---

### 3.6 Match 모듈 (features/match)

#### 3.6.1 기능

- 친구 탐색 (리스트 + 지도)
- 필터/정렬
- 좋아요/매칭 요청

#### 3.6.2 주요 페이지

- `MatchListPage` (카드/리스트 기반 친구 찾기)
- `FriendMapPage` (지도 기반 친구 찾기)

#### 3.6.3 FriendMapPage 구조

- 상단: AppBar (`친구 지도` + 필터 버튼)
- 필터 바: 반경/종/정렬 Chip
- 본문:
  - `GoldPetNaverMapView` (마커: 주변 친구)
- 우측 FAB: 내 위치 / 반경 / 지도 타입
- 하단: `DraggableScrollableSheet` – 친구 카드 리스트

---

### 3.7 Chat 모듈 (features/chat)

#### 3.7.1 기능

- 채팅방 리스트
- 1:1 채팅
- 그룹 채팅(추후)
- AI 펫 채팅

#### 3.7.2 구성

- `chat/domain/entities/chat_room.dart`
- `chat/domain/entities/chat_message.dart`
- `chat/data/...` (REST 기반 또는 WebSocket 기반 실시간 추가)
- `chat/presentation/pages/chat_list_page.dart`
- `chat/presentation/pages/chat_room_page.dart`

#### 3.7.3 UX 포인트

- 채팅방 리스트:
  - 최근 메시지, 읽지 않은 수 표시
- 채팅방:
  - 상단: 상대 프로필 썸네일 + 닉네임
  - 메시지 버블:
    - 좌측: 상대 메시지 + 프로필 이미지
    - 우측: 내 메시지
  - 하단:
    - 텍스트 입력창 + 이모티콘 버튼 + 파일 버튼

---

### 3.8 Community, Gold, AI, Notifications 모듈

#### Community (features/community)

- 기본 SNS 스타일:
  - 피드형 리스트 (`CommunityFeedPage`)
  - 상세 (`CommunityPostDetailPage`)
- 게시글 작성/수정, 이미지 업로드

#### Gold (features/gold)

- Gold 잔액/내역 페이지
- 결제(IAP) 호출 및 결과 처리 (플랫폼 채널/플러그인)

#### AI (features/ai)

- `AiPetProfilePage`:
  - 펫 선택
  - 스타일 선택
  - Gold 사용 컨펌
  - 진행 상태 표시 (로딩/완료/실패)

#### Notifications (features/notifications)

- 알림 리스트
- 각 알림 → 관련 화면으로 이동 (매칭/채팅/커뮤니티/AI 결과 등)

---

## 4. 네비게이션 구조 (UX Flow 관점)

### 4.1 메인 탭 구조

```text
BottomNavigationBar (예시)
1. 홈(Home)        – 요약/피드/추천
2. 산책(Walk)      – 산책 기록/시작
3. 친구(Friends)   – 친구 리스트/지도
4. 채팅(Chat)      – 채팅방 리스트
5. 마이(My)        – 프로필/설정/펫/Gold
```

- 각 탭은 자체 네비게이션 스택을 가질 수 있음 (go_router ShellRoute 활용)

### 4.2 상위 라우트 예시 (go_router)

```dart
final router = GoRouter(
  routes: [
    GoRoute(
      path: '/login',
      name: 'login',
      builder: (context, state) => const LoginPage(),
    ),
    ShellRoute(
      builder: (context, state, child) => MainScaffold(child: child),
      routes: [
        GoRoute(
          path: '/home',
          name: 'home',
          builder: (context, state) => const HomePage(),
        ),
        GoRoute(
          path: '/walk',
          name: 'walk',
          builder: (context, state) => const WalkHomePage(),
        ),
        GoRoute(
          path: '/friends',
          name: 'friends',
          builder: (context, state) => const MatchListPage(),
        },
        GoRoute(
          path: '/chat',
          name: 'chat',
          builder: (context, state) => const ChatListPage(),
        ),
        GoRoute(
          path: '/my',
          name: 'my',
          builder: (context, state) => const MyPage(),
        ),
      ],
    ),
    // 상세 페이지들
    GoRoute(
      path: '/walk/:id/map',
      name: 'walkMap',
      builder: (context, state) => WalkMapPage(
        walkId: int.parse(state.params['id']!),
      ),
    ),
    GoRoute(
      path: '/friends/map',
      name: 'friendMap',
      builder: (context, state) => const FriendMapPage(),
    ),
  ],
);
```

---

## 5. 상태관리 & 응답 처리 (Riverpod 기준)

### 5.1 패턴

- API 호출 결과는 `AsyncValue<T>`로 표현
- 예시: 근처 친구

```dart
final nearbyFriendsProvider =
    StateNotifierProvider<NearbyFriendsController, AsyncValue<List<FriendNearby>>>(
  (ref) => NearbyFriendsController(ref.read),
);

class NearbyFriendsController extends StateNotifier<AsyncValue<List<FriendNearby>>> {
  NearbyFriendsController(this._read) : super(const AsyncValue.loading());

  final Reader _read;

  Future<void> fetch({
    required double lat,
    required double lng,
    double radiusKm = 3,
  }) async {
    state = const AsyncValue.loading();
    try {
      final result = await _read(friendRepositoryProvider)
          .getNearbyFriends(lat: lat, lng: lng, radiusKm: radiusKm);
      state = AsyncValue.data(result);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }
}
```

- UI에서는 `ref.watch(nearbyFriendsProvider)`로 상태 구독:
  - `when(data: ..., loading: ..., error: ...)` 패턴

---

## 6. 디자인 시스템 & 공통 컴포넌트

### 6.1 디자인 시스템 방향

- 전체 톤: **따뜻한 파스텔 계열 + 펫 친화적인 라운디드 UI**
- 공통 요소:
  - Primary Color: GoldPet 브랜드 컬러 (예: 골드 + 코랄)
  - Rounded Button (8~16dp radius)
  - 카드형 레이아웃
  - 그림자(Shadow)는 과하지 않게 사용

### 6.2 공통 위젯 예시

- `GoldPetAppBar`
- `PrimaryButton`, `SecondaryButton`
- `PetAvatar`, `UserAvatar`
- `EmptyState` (데이터 없음 표시)
- `ErrorState` (에러/재시도 UI)
- `LoadingOverlay`

---

## 7. 지도 UX 정리 (WalkMap & FriendMap)

### 7.1 WalkMapPage

- 사용목적:
  - 한 번의 산책 기록을 지도에서 다시 보는 화면
- UX 핵심:
  - Polyline + Spot 마커 + BottomSheet(요약/Spot 리스트)
  - FAB: 내 위치 / 전체 코스 / 지도 타입

### 7.2 FriendMapPage

- 사용목적:
  - 내 주변 산책 친구를 시각적으로 탐색
- UX 핵심:
  - 내 위치 + 주변 친구 마커
  - 상단: 반경/종/정렬 요약 바
  - 하단: 친구 카드 리스트 BottomSheet
  - 마커 ↔ 카드 상호 연동

---

## 8. 개발 우선순위 (MVP 관점)

### 8.1 1단계 – Core & Skeleton

- Auth 플로우 (로그인/토큰 관리)
- 메인 탭/라우팅 구조
- 프로필/펫 등록 화면
- API 클라이언트/에러처리/디자인 시스템 뼈대

### 8.2 2단계 – 산책 + 지도

- WalkTrackingPage(기본)
- WalkSummary + WalkMapPage
- Naver Map 연동 및 Polyline/Marker 기능

### 8.3 3단계 – 친구 찾기 + 매칭

- MatchListPage + FriendMapPage
- /friends/nearby API 연동
- 좋아요/매칭 플로우

### 8.4 4단계 – 채팅/커뮤니티/AI/Gold

- 채팅 리스트 + 1:1 채팅
- 커뮤니티 피드/상세/작성
- AI 펫 프로필 생성 플로우
- Gold 잔액/충전/사용

---

## 9. 품질 & 테스트 전략

- Unit Test:
  - Repository / UseCase / Controller 단위
- Widget Test:
  - 주요 페이지(로그인, WalkMap, FriendMap 등)
- Integration Test:
  - 핵심 플로우(로그인 → 온보딩 → 산책 기록 → 지도 보기)
- Analytics:
  - Firebase Analytics 등으로 핵심 이벤트 추적
  - 예: 가입, 산책 시작/종료, 매칭, 채팅 시작, Gold 사용

---

이 문서(v1.0)는 **GoldPet Flutter 앱을 어떻게 구조화하고 구현할지**에 대한  
상위 아키텍처 & UX 가이드이다.  
실제 개발에서는 각 모듈별로 세부 위젯 트리, 상태 흐름, API 매핑을  
이 문서를 기준으로 세분화해 나간다.
