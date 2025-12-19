# GoldPet – Flutter 온보딩 → 펫 등록 → 홈 UI 플로우 설계 (v1)

## 1. 전체 상태 & 라우팅 개념

앱 실행 시 분기 조건:

1. **로그인 여부**
   - `isAuthenticated == false` → 온보딩 + 로그인 플로우
2. **프로필/펫 등록 여부**
   - `isAuthenticated == true && hasPet == false` → 펫 등록 플로우
3. **모두 완료**
   - `isAuthenticated == true && hasPet == true` → 메인 홈

```dart
enum LaunchState {
  firstLaunchUnauthenticated, // 온보딩 + 로그인
  authenticatedNoPet,         // 펫 등록 플로우
  readyToHome,                // 홈으로
}
```

`LaunchState`는
- 로컬(SecureStorage/SharedPreferences)에서 `seenOnboarding`,
- 백엔드에서 `user.me` + `pets` 조회를 바탕으로 결정.

---

## 2. 화면 흐름(UI Flow) 전체

### 2.1 전체 플로우

```text
Splash
  ↓
(Onboarding 본 적 있냐? / 로그인 여부 확인)

[케이스 1: 첫 실행 + 미로그인]
  OnboardingCarousel
    ↓ "시작하기"
  SocialLoginPage (SNS 로그인)
    ↓ 로그인 성공
  ProfileSetupPage (닉네임 등)
    ↓
  LocationPermissionPage
    ↓
  LocationSelectPage (주요 활동 지역 설정)
    ↓
  PetIntroPage ("펫 정보를 알려주세요!")
    ↓
  PetBasicInfoPage (종/품종/이름/성별 등)
    ↓
  PetDetailInfoPage (체중, 중성화, 성격 태그 등)
    ↓
  PetPhotoPage (사진 촬영/업로드)
    ↓
  CongratsPage (3,000 Gold 안내 + 홈으로)
    ↓
  HomeShell (Bottom Tab: 홈/산책/친구찾기/커뮤니티/마이)

[케이스 2: 로그인 O, 펫 없음]
  바로 PetIntroPage ~ CongratsPage → HomeShell

[케이스 3: 로그인 O, 펫 있음]
  Splash → HomeShell
```

---

## 3. 화면별 역할 & UI 구조

### 3.1 SplashScreen

**역할**
- 토큰 유효성 검증
- `seenOnboarding`, `hasPet` 확인 후 다음 플로우로 라우팅

**UI**
- 앱 로고 + 로딩 인디케이터
- 1~2초 유지 후 자동 이동

---

### 3.2 OnboardingCarouselPage

**역할**
- 앱의 핵심 가치 간단 소개  
  - 화면1: “내 펫의 산책과 추억을 한 번에 기록”  
  - 화면2: “가까운 친구들과 함께 산책”  
  - 화면3: “AI로 예쁜 펫 프로필까지!”

**UI 구조**
- 상단: Skip 버튼
- 중앙:
  - Illustration 이미지(펫+산책/친구/AI)
  - 제목, 부제
- 하단:
  - Page indicator
  - “시작하기” 버튼 (마지막 페이지에서 활성)

---

### 3.3 SocialLoginPage

**역할**
- 카카오/네이버/구글/애플 로그인 버튼
- 버튼 클릭 시 백엔드 `/auth/oauth/login` 호출 → 토큰 저장

**UI**
- 상단: GoldPet 로고
- 중간: “GoldPet에 오신 걸 환영합니다”
- 아래:
  - “카카오로 시작하기”
  - “네이버로 시작하기”
  - “구글로 시작하기”
  - “애플로 시작하기”

---

### 3.4 ProfileSetupPage

**역할**
- 로그인 직후 사용자 기본 정보 입력  
  (닉네임, 연령대, 성별(선택), 알림 동의 등)

**주요 필드**
- 닉네임 (필수)
- 연령대 선택 (예: 10대, 20대, 30대…)
- 성별 (선택)
- 프로필 이미지(선택, 건너뛰기 가능)

**하단 버튼**
- “다음(위치 설정으로)”

---

### 3.5 LocationPermissionPage

**역할**
- 위치정보 권한 설명 + OS 권한 요청

**UI**
- 일러스트(지도/핀)
- 설명: “주요 산책 코스를 추천해 드리려면 위치 정보가 필요해요”
- 버튼:
  - “위치 권한 허용하기”
  - “나중에 설정할게요” (권한 거부 시 수동 지역 설정으로 이동)

---

### 3.6 LocationSelectPage

**역할**
- 실제 “주요 활동 지역” 설정
- GPS 허용 시 현재 위치 기반 동네 추천
- 직접 주소 검색도 가능

**UI 구조**
- 상단 검색창: 지번/도로명/동 검색
- 중앙 지도 + 현재 위치 마커
- 하단:
  - “현재 위치 사용하기”
  - 또는 “이 위치로 설정하기”

**완료 후**
- `User.mainLocation` 업데이트
- 다음 페이지: PetIntroPage

---

### 3.7 PetIntroPage

**역할**
- “이제 펫 정보를 등록해볼까요?” 안내

**UI**
- 일러스트: 강아지/고양이
- 텍스트:
  - “GoldPet은 펫을 중심으로 서비스가 구성돼요.”
  - “펫 프로필을 등록하면 산책 기록, AI 프로필 생성 등을 사용할 수 있어요.”
- 버튼:
  - “펫 등록하기”

---

### 3.8 PetBasicInfoPage

**역할**
- 펫의 기본 정보 입력

**필드**
- 종 선택(PetSpecies): 개, 고양이, 조류, 파충류 등
- 품종 선택(PetBreed): 종 선택 후 활성화
- 이름
- 성별
- 생일 / 나이 (둘 중 하나)

**UI**
- 상단: Step indicator (“1/3 단계”)
- 하단: “다음(세부 정보)” 버튼

---

### 3.9 PetDetailInfoPage

**역할**
- 펫의 세부 정보 입력 (성격, 체형, 건강 등)

**필드**
- 체중
- 중성화 여부 토글
- 성격 태그 (Chip 형태)
  - 예: “활발해요”, “조용해요”, “친화적이에요”, “예민해요”
- 건강 특이사항(자유 텍스트)

**하단**
- “다음(사진 등록)” 버튼

---

### 3.10 PetPhotoPage

**역할**
- 펫 대표 사진 촬영 또는 갤러리에서 선택

**UI**
- 중앙: 큰 원형 프리뷰 프레임
- 버튼:
  - “사진 찍기”
  - “앨범에서 선택”
- 안내:
  - “이 사진은 친구 찾기, 채팅, AI 프로필 등에 사용돼요”

**하단**
- “건너뛰기” (선택)
- “완료” → 펫 생성 API 호출 후 성공 시 다음

---

### 3.11 CongratsPage

**역할**
- 가입 + 펫 등록 완료 축하 및 초기 Gold 안내

**UI**
- 축하 일러스트
- 텍스트:
  - “환영해요, {닉네임}님!”
  - “3,000 Gold가 지급되었어요 🎉”
- 버튼:
  - “GoldPet 시작하기” → HomeShell

---

### 3.12 HomeShell (메인 탭)

**역할**
- 전체 앱의 루트(하단 탭 네비게이션)

**탭 구성 예시**
1. 홈  
   - 오늘의 산책/추천/커뮤니티 요약
2. 산책  
   - 산책 시작, 히스토리, 앨범
3. 친구 찾기  
   - 매칭 추천, 필터
4. 커뮤니티  
   - 게시글 피드
5. 마이  
   - 내 프로필, 펫 관리, 설정, Gold 관리

---

## 4. Flutter 라우트 구조 예시 (GoRouter 기준)

```dart
final router = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      name: 'splash',
      builder: (context, state) => SplashPage(),
    ),
    GoRoute(
      path: '/onboarding',
      name: 'onboarding',
      builder: (context, state) => OnboardingCarouselPage(),
    ),
    GoRoute(
      path: '/login',
      name: 'login',
      builder: (context, state) => SocialLoginPage(),
    ),
    GoRoute(
      path: '/profile/setup',
      name: 'profileSetup',
      builder: (context, state) => ProfileSetupPage(),
    ),
    GoRoute(
      path: '/location/permission',
      name: 'locationPermission',
      builder: (context, state) => LocationPermissionPage(),
    ),
    GoRoute(
      path: '/location/select',
      name: 'locationSelect',
      builder: (context, state) => LocationSelectPage(),
    ),
    GoRoute(
      path: '/pet/intro',
      name: 'petIntro',
      builder: (context, state) => PetIntroPage(),
    ),
    GoRoute(
      path: '/pet/basic',
      name: 'petBasic',
      builder: (context, state) => PetBasicInfoPage(),
    ),
    GoRoute(
      path: '/pet/detail',
      name: 'petDetail',
      builder: (context, state) => PetDetailInfoPage(),
    ),
    GoRoute(
      path: '/pet/photo',
      name: 'petPhoto',
      builder: (context, state) => PetPhotoPage(),
    ),
    GoRoute(
      path: '/congrats',
      name: 'congrats',
      builder: (context, state) => CongratsPage(),
    ),
    GoRoute(
      path: '/home',
      name: 'home',
      builder: (context, state) => HomeShellPage(),
    ),
  ],
);
```

> Splash에서 `LaunchState`를 계산한 뒤  
> `context.go('/onboarding')`, `'/pet/intro'`, `'/home'` 중 하나로 분기.

---

## 5. 상태 관리 설계 (요약)

온보딩 → 펫 등록 → 홈까지 크게 3개의 상태로 나눔:

1. **AuthState**
   - `isAuthenticated`, `user` 정보
2. **UserProfileState**
   - 닉네임, mainLocation, profileImageUrl 등
3. **PetOnboardingState**
   - 종/품종/이름/성별/생일/체중/중성화/성격 태그/사진 등  
   - 여러 Step 페이지에서 임시로 누적 → 마지막에 `POST /pets`로 한번에 등록

예시 (Riverpod 등에서 사용할 수 있는 상태 모델):

```dart
class PetOnboardingState {
  final int? speciesId;
  final int? breedId;
  final String? name;
  final String? gender;
  final DateTime? birthDate;
  final double? weight;
  final bool? neutered;
  final List<String> temperamentTags;
  final XFile? photo;

  // copyWith, constructor 등 추가
}
```

각 단계 페이지에서 이 상태를 업데이트하고,  
`PetPhotoPage`에서 “완료” 클릭 시 서버에 등록 → 성공 시 `hasPet = true` 저장 후 `/congrats`.

---

## 6. 확장성 고려 포인트

- LocationSelectPage / Walk UI는 차후:
  - “산책 코스 공유”
  - “공개/비공개/친구만 공개”
  - “산책 앨범 뷰”  
  등으로 확장될 수 있도록 **재사용 가능한 지도 + 리스트 컴포넌트**로 설계.

- PetBasicInfo / PetDetailInfo에서 받은 정보는:
  - 매칭 필터
  - AI 펫 프로필 생성
  - AI 펫 챗봇의 말투/추천 로직  
  등에서 재사용되므로, 도메인 모델과 API 설계와 잘 매핑되도록 유지.

- HomeShell의 Home 탭은:
  - “오늘의 추천 산책 코스”
  - “내 최신 산책 앨범 썸네일”
  - “새 매칭/새 알림”  
  등을 한눈에 보여주는 대시보드 역할로 발전 가능.
