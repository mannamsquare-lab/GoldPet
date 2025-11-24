# GoldPet 하이브리드 UI 구현 상태 보고서

\u003e **날짜**: 2025-11-24  
\u003e **아키텍처**: Flutter (네이티브) + React 19 (UI)  
\u003e **분석 대상**: Flutter 앱 + React 앱 소스코드

---

## 📊 구현 상태 요약

### ✅ 완료된 항목

#### 1. **하이브리드 아키텍처 기반 구조** (100%)
- Flutter WebView 컨테이너 구현 완료
- React 19 기반 UI 레이어 구현 완료
- JavaScript Bridge 양방향 통신 구현 완료

#### 2. **Flutter 네이티브 레이어** (80%)
- ✅ WebView Wrapper: 완료
- ✅ JavaScript Bridge: 완료
- ✅ Bridge Controller: 완료
- ✅ Location Service: 완료
- ✅ Splash Screen (Native): 완료
- ✅ Onboarding Screens (Native): 4개 화면 완료
- ✅ Benefits Screen (Native): 완료
- ✅ Permissions Screen (Native): 완료

#### 3. **React UI 레이어** (70%)
- ✅ 라우팅 시스템: React Router v7 구성 완료
- ✅ 상태 관리: Zustand + React Query 설정 완료
- ✅ Native Bridge 클라이언트: 완료
- ✅ Auth 페이지들: 완료
  - Login Page
  - Sign Up Page (일반/SNS)
  - Terms Agreement Page
  - Terms Detail Page
  - Find Username Page
  - Reset Password Page
  - Signup Complete Page
- ✅ Splash Page: 완료
- ✅ Onboarding Page: 완료
- ✅ Permissions Page: 완료
- ✅ Benefits Page: 완료
- ✅ 테마/컬러 시스템: Figma 디자인 기반 색상 정의

---

## 🏗️ 아키텍처 분석

### Flutter ↔ React 연동 구조

```
┌─────────────────────────────────────────────────────┐
│           Flutter Container (main.dart)             │
│  ┌───────────────────────────────────────────────┐  │
│  │  App (app.dart)                               │  │
│  │  - 초기화 로직 (2초 딜레이)                   │  │
│  │  - Splash Screen 표시                         │  │
│  │  - WebView로 React 앱 로드                     │  │
│  │    • Dev: http://localhost:5173               │  │
│  │    • Prod: assets/web/index.html              │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │  WebViewWrapper                               │  │
│  │  - webview_flutter 패키지 사용                │  │
│  │  - JavaScript Channel 설정                     │  │
│  │  - Bridge 초기화                               │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │  Bridge Layer                                 │  │
│  │  - JavaScriptBridge                           │  │
│  │  - BridgeController                           │  │
│  │  - BridgeProtocol (메시지 정의)               │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │  Services                                     │  │
│  │  - LocationService (GPS)                      │  │
│  │  - (CameraService - 구현 예정)                │  │
│  │  - (PushNotificationService - 구현 예정)     │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         ↕
           JavaScript Channel (양방향 통신)
                         ↕
┌─────────────────────────────────────────────────────┐
│         React 19 App (Vite + TypeScript)            │
│  ┌───────────────────────────────────────────────┐  │
│  │  App.tsx (Main Router)                        │  │
│  │  - BrowserRouter                              │  │
│  │  - QueryClientProvider                        │  │
│  │  - 라우트 정의 (13개 경로)                     │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │  Bridge (bridge/)                             │  │
│  │  - nativeBridge.ts (클라이언트)               │  │
│  │  - bridgeTypes.ts (타입 정의)                 │  │
│  │  - callMethod(), onEvent()                    │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │  State Management                             │  │
│  │  - authStore (Zustand)                        │  │
│  │  - React Query (API 캐싱)                     │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │  Features (구현된 화면들)                      │  │
│  │  - auth/ (8개 페이지)                         │  │
│  │  - splash/                                    │  │
│  │  - onboarding/                                │  │
│  │  - permissions/                               │  │
│  │  - benefits/                                  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 📱 구현된 화면 목록

### Flutter 네이티브 화면 (7개)

| 화면명 | 파일 | 상태 | 비고 |
|-------|------|------|------|
| Splash | `splash_screen.dart` | ✅ 완료 | 베이지 배경 + 로고 |
| Onboarding 1-4 | `onboarding/onboarding_screen_*.dart` | ✅ 완료 | 4개 화면 모두 구현 |
| Benefits | `benefits_screen.dart` | ✅ 완료 | 골드펫 혜택 안내 |
| Permissions | `permissions_screen.dart` | ✅ 완료 | 권한 요청 안내 |

### React UI 화면 (13개 라우트)

| 라우트 | 컴포넌트 | 상태 | Figma 노드 | 비고 |
|--------|---------|------|-----------|------|
| `/splash` | SplashPage | ✅ 완료 | - | React 버전 Splash |
| `/onboarding` | OnboardingPage | ✅ 완료 | 4017:20145 | 4개 화면 스와이프 |
| `/permissions` | PermissionsPage | ✅ 완료 | - | 권한 안내 |
| `/benefits` | BenefitsPage | ✅ 완료 | 4017:20935 | 혜택 안내 |
| `/login` | LoginPage | ✅ 완료 | 4017:22523 | 로그인 (일반/SNS) |
| `/signup` | TermsAgreementPage | ✅ 완료 | 4017:22778 | 약관 동의 |
| `/signup/form` | SignupPage | ✅ 완료 | 4017:22718 | 일반 회원가입 폼 |
| `/signup/sns` | SnsSignupPage | ✅ 완료 | 4017:22842 | SNS 추가정보 |
| `/signup/complete` | SignupCompletePage | ✅ 완료 | 4017:22854 | 가입 완료 |
| `/terms/:type` | TermsDetailPage | ✅ 완료 | - | 약관 상세 |
| `/find-username` | FindUsernamePage | ✅ 완료 | 4017:22571 | 아이디 찾기 |
| `/reset-password` | ResetPasswordPage | ✅ 완료 | 4017:22631 | 비밀번호 변경 |
| `/home` | HomePage | ⚠️ 준비중 | 4017:21066 | 임시 페이지 |

---

## 🔧 기술 스택 상세

### Flutter (Native Layer)

**pubspec.yaml 주요 의존성:**
```yaml
dependencies:
  flutter_svg: 2.2.2              # SVG 이미지
  google_fonts: 6.3.2             # 폰트
  permission_handler: 12.0.1      # 권한 관리
  webview_flutter: ^4.9.0         # WebView
  geolocator: ^13.0.0             # GPS
  image_picker: ^1.1.2            # 카메라/갤러리
  path_provider: ^2.1.2           # 파일 시스템
  shared_preferences: ^2.3.2      # 로컬 스토리지
  http: ^1.2.2                    # HTTP 클라이언트
```

**폰트:**
- Pretendard 폰트 100~900 weight 전체 포함

**디렉토리 구조:**
```
lib/
├── main.dart
├── app.dart
├── splash_screen.dart
├── benefits_screen.dart
├── permissions_screen.dart
├── onboarding/
│   ├── onboarding_page.dart
│   └── onboarding_screen_*.dart (1-4)
└── core/
    ├── bridge/
    │   ├── bridge_controller.dart
    │   ├── bridge_protocol.dart
    │   └── javascript_bridge.dart
    ├── services/
    │   └── location_service.dart
    └── webview/
        └── webview_wrapper.dart
```

### React (UI Layer)

**package.json 주요 의존성:**
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^7.9.6",
  "@tanstack/react-query": "^5.90.10",
  "zustand": "^5.0.8",
  "axios": "^1.13.2"
}
```

**디렉토리 구조:**
```
src/
├── App.tsx                      # 메인 라우터
├── main.tsx                     # 엔트리 포인트
├── bridge/
│   ├── nativeBridge.ts         # Native 통신 클라이언트
│   └── bridgeTypes.ts          # 타입 정의
├── features/
│   ├── auth/ (16 파일)         # 회원 관련 8개 페이지
│   ├── splash/
│   ├── onboarding/
│   ├── permissions/
│   └── benefits/
├── services/
│   └── api/
│       └── client.ts            # Axios 인스턴스
├── stores/
│   └── authStore.ts             # 인증 상태 (Zustand)
└── theme/
    └── colors.ts                # Figma 색상 팔레트
```

---

## 🎨 디자인 시스템 적용

### Figma 색상 팔레트 (구현됨)

**colors.ts:**
```typescript
{
  primary: {
    main: '#614108',      // 골드펫 브라운
    light: '#FFF7E6',     // 베이지 배경
    dark: '#4A3206',
  },
  secondary: {
    main: '#FF6B6B',
    light: '#FFE5E5',
  },
  text: {
    primary: '#1A1A1A',
    secondary: '#666666',
    disabled: '#CCCCCC',
  },
  background: {
    default: '#FFFFFF',
    paper: '#FFF7E6',     // Figma와 동일
  }
}
```

### Figma 노드 ID 매핑

코드에 `data-node-id` 속성으로 Figma 노드 연결:
```tsx
\u003cdiv className="login-page" data-node-id="4017:22523"\u003e
  ...
\u003c/div\u003e
```

---

## 🔄 Bridge 통신 구현 상태

### JavaScript Bridge 프로토콜

**메시지 구조:**
```typescript
interface BridgeMessage {
  id: string;                    // 요청 ID
  method: string;                // 메서드 이름
  params?: Record<string, any>;  // 파라미터
  timestamp: number;
}

interface BridgeResponse {
  id: string;                    // 요청 ID
  success: boolean;
  data?: any;
  error?: { code: string; message: string; };
  timestamp: number;
}
```

### 지원 메서드 (현재 구현됨)

**LocationService (완료):**
- `getCurrentLocation()`: 현재 위치 조회
- `startTracking()`: 위치 추적 시작
- `stopTracking()`: 위치 추적 중지

**미구현 (계획):**
- Camera Service
- Push Notification Service
- File Service

### 사용 예시 (React 측)

```typescript
import { nativeBridge } from '@/bridge/nativeBridge';

// 위치 정보 조회
const location = await nativeBridge.callMethod('getCurrentLocation');
console.log(location); // { latitude, longitude, accuracy, ... }

// 네이티브 이벤트 리스닝
nativeBridge.onEvent('locationUpdated', (data) => {
  console.log('Location updated:', data);
});
```

---

## ⚠️ 미구현 항목

### 1. 주요 기능 화면 (React)

| 화면 | 상태 | Figma 노드 | 우선순위 |
|------|------|-----------|---------|
| Home | ⚠️ 임시 | 4017:21066 | 🔴 높음 |
| 친구찾기 (지도/리스트) | ❌ 없음 | 4017:23041 | 🔴 높음 |
| 산책 | ❌ 없음 | 4017:21396 | 🔴 높음 |
| 채팅 | ❌ 없음 | 4017:22019 | 🟡 중간 |
| 커뮤니티 | ❌ 없음 | 4017:22890 | 🟡 중간 |
| 프로필 | ❌ 없음 | 4017:21766 | 🟡 중간 |
| Settings | ❌ 없음 | - | 🟢 낮음 |

### 2. Native Services (Flutter)

| 서비스 | 상태 | 필요성 |
|--------|------|--------|
| CameraService | ❌ 없음 | 🔴 필수 (프로필, 산책 Spot) |
| PushNotificationService | ❌ 없음 | 🔴 필수 (매칭, 채팅) |
| FileService | ❌ 없음 | 🟡 필요 (파일 업로드) |

### 3. Backend API 연동

**현재 상태:**
- ✅ Axios 클라이언트 설정 완료 (`services/api/client.ts`)
- ⚠️ API 엔드포인트 미정의 (더미 호출만 있음)
- ❌ 실제 백엔드 서버 없음

**필요 작업:**
- Spring Boot API 서버 구현
- API 명세 기반 엔드포인트 구현
- JWT 인증 플로우 구현

---

## 🚀 다음 단계 제안

### Phase 1: 핵심 기능 UI 구현 (1-2주)

1. **Home 화면**
   - Figma 디자인(4017:21066) 기반 구현
   - 네비게이션 바 추가
   - 친구 추천 카드 UI

2. **산책 화면**
   - Naver Map 연동
   - GPS 트래킹 UI
   - 산책 기록 표시

3. **친구찾기 화면**
   - 지도 기반 친구 표시
   - 필터 기능
   - 좋아요/매칭 UI

### Phase 2: Native Services 확장 (1주)

1. **CameraService 구현**
   - image_picker 기반
   - 카메라/갤러리 접근
   - 사진 업로드 플로우

2. **PushNotificationService 구현**
   - Firebase Cloud Messaging 연동
   - 알림 권한 요청
   - 알림 수신/표시

### Phase 3: Backend 연동 (2주)

1. **Spring Boot API 개발**
   - 인증 API (SNS 로그인 포함)
   - 사용자/펫 프로필 API
   - 산책 기록 API

2. **React → Backend 연결**
   - API 클라이언트 구현
   - React Query 훅 생성
   - 에러 핸들링

### Phase 4: 추가 기능 (진행 중)

- 채팅
- 커뮤니티
- AI 펫 프로필
- Gold 시스템

---

## 💡 개발 관련 참고사항

### 로컬 개발 실행 방법

**1. React 앱 실행 (Vite 개발 서버):**
```bash
cd flutter/react-app
npm install
npm run dev
# http://localhost:5173 에서 실행됨
```

**2. Flutter 앱 실행:**
```bash
cd flutter/goldpet_app
flutter pub get
flutter run
# app.dart에서 localhost:5173 을 WebView로 로드
```

### 주의사항

1. **초기 로딩 딜레이**
   - `app.dart`에서 2초 딜레이 설정됨
   - 실제 초기화 로직으로 교체 필요

2. **WebView CORS 이슈**
   - 개발 서버 사용 시 문제 없음
   - 프로덕션 빌드 시 `assets/web/` 경로 확인 필요

3. **이미지 에셋**
   - Figma에서 localhost:3845 서버 사용
   - 실제 프로젝트에서는 `assets/images/` 로 복사 필요
   - LoginPage 등에서 onError 핸들러로 이미지 로드 실패 대응됨

---

## 📊 구현 진척도 요약

| 카테고리 | 완료 | 진행중 | 미착수 | 진척률 |
|---------|------|--------|--------|--------|
| 하이브리드 아키텍처 | ✅ | - | - | 100% |
| Flutter Native | ✅ 7개 화면 | - | 2개 서비스 | 80% |
| React Auth Flow | ✅ 8개 페이지 | - | - | 100% |
| React 주요 기능 | - | - | 6개 화면 | 0% |
| Bridge 통신 | ✅ 기본 | - | 2개 서비스 | 30% |
| Backend API | - | - | 전체 | 0% |
| **전체** | - | - | - | **약 45%** |

---

## ✅ 결론

**잘 구현된 부분:**
- 하이브리드 아키텍처 기반 구조가 잘 갖춰져 있음
- Auth 플로우가 완전히 구현되어 있음  
- JavaScript Bridge 통신이 구조화되어 있음
- Figma 디자인 시스템이 코드에 적용됨

**다음 우선순위:**
1. 🔴 **Home, 산책, 친구찾기** 핵심 화면 구현
2. 🔴 **Camera, Push Notification** Native Service 추가
3. 🟡 **Backend API** 개발 및 연동
4. 🟢 채팅, 커뮤니티 등 부가 기능

**기술 부채:**
- Naver Map 연동 필요
- PostGIS 공간 쿼리 백엔드 로직 필요
- 이미지 에셋 관리 체계화 필요
