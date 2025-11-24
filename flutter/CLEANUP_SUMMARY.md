# Flutter 폴더 정리 요약

\u003e **정리 날짜**: 2025-11-24  
\u003e **목적**: 하이브리드 아키텍처(Flutter + React)에서 불필요한 파일 제거 및 구조 최적화

---

## 🗑️ 제거된 항목

### 1. 불필요한 플랫폼 폴더
- ❌ `goldpet_app/linux/` - Linux 데스크톱 빌드 (미사용)
- ❌ `goldpet_app/macos/` - macOS 데스크톱 빌드 (미사용)
- ❌ `goldpet_app/windows/` - Windows 데스크톱 빌드 (미사용)
- ❌ `goldpet_app/web/` - 웹 빌드 (React 앱이 대체)

**이유**: 이 프로젝트는 모바일 전용(Android/iOS)이며, 웹은 React 앱으로 별도 관리됨

### 2. 템플릿 폴더
- ❌ `react-app-templates/` - React 템플릿 파일들

**이유**: 이미 react-app에 구현되어 있어 템플릿 불필요

### 3. Flutter 네이티브 화면
- ❌ `goldpet_app/lib/onboarding/` - 온보딩 화면 5개 파일
- ❌ `goldpet_app/lib/benefits_screen.dart` - 혜택 안내 화면
- ❌ `goldpet_app/lib/permissions_screen.dart` - 권한 안내 화면

**이유**: 하이브리드 구조에서 모든 UI는 React가 담당. Flutter는 WebView 컨테이너와 네이티브 브릿지만 담당

### 4. 이미지 Assets
- ❌ `assets/images/onboarding/` - 온보딩 이미지들
- ❌ `assets/images/benefits/` - 혜택 안내 이미지들

**이유**: React 앱에서 자체 assets 관리

### 5. 기타 파일
- ❌ `.DS_Store` 파일들 (macOS 시스템 파일)
- ❌ `goldpet_app/README.md` (기본 템플릿 README)

---

## ✅ 유지된 항목

### Flutter 네이티브 레이어 (최소 구성)

```
flutter/
├── goldpet_app/
│   ├── android/                    # Android 빌드 설정
│   ├── ios/                        # iOS 빌드 설정
│   ├── assets/
│   │   ├── images/
│   │   │   ├── splash/            # Splash 화면 이미지
│   │   │   └── common/            # 공통 이미지
│   │   └── fonts/
│   │       └── Pretendard/        # Pretendard 폰트 (전체 weight)
│   ├── lib/
│   │   ├── main.dart              # 앱 엔트리 포인트
│   │   ├── app.dart               # 앱 초기화 및 WebView 로딩
│   │   ├── splash_screen.dart     # 네이티브 Splash (초기 로딩용)
│   │   └── core/
│   │       ├── bridge/            # JavaScript Bridge 통신
│   │       │   ├── bridge_controller.dart
│   │       │   ├── bridge_protocol.dart
│   │       │   └── javascript_bridge.dart
│   │       ├── services/          # 네이티브 서비스
│   │       │   └── location_service.dart
│   │       └── webview/          # WebView 래퍼
│   │           └── webview_wrapper.dart
│   ├── pubspec.yaml              # Flutter 의존성
│   └── ...
├── react-app/                     # React UI 레이어 (유지)
└── react-app-setup.md            # React 설정 가이드 (유지)
```

### 핵심 유지 이유

1. **main.dart, app.dart**: 앱 실행 및 초기화
2. **splash_screen.dart**: 앱 시작 시 네이티브 스플래시 (React 로드 전)
3. **core/bridge/**: Flutter ↔ React 통신 핵심 로직
4. **core/services/**: GPS, 카메라 등 네이티브 기능 접근
5. **core/webview/**: React 앱을 로드하는 WebView 컨테이너
6. **android/, ios/**: 모바일 플랫폼별 빌드 설정

---

## 📊 정리 전후 비교

| 항목 | 정리 전 | 정리 후 | 변화 |
|------|--------|--------|------|
| 플랫폼 폴더 | 6개 | 2개 | -4 (Android, iOS만) |
| lib 파일 수 | 17개 | 7개 | -10 |
| Flutter UI 화면 | 7개 | 1개 | -6 (Splash만) |
| 템플릿 폴더 | 1개 | 0개 | -1 |
| 전체 파일 수 | ~174개 | ~120개 | -30% |

---

## 🎯 정리 후 아키텍처

### 명확한 책임 분리

```
┌──────────────────────────────────────┐
│   Flutter (네이티브 레이어)          │
│   ✅ WebView 컨테이너                │
│   ✅ JavaScript Bridge               │
│   ✅ GPS/Camera/Push 등 네이티브 기능 │
│   ✅ 초기 Splash만                   │
└──────────────────────────────────────┘
              ↕ Bridge
┌──────────────────────────────────────┐
│   React 19 (UI 레이어)               │
│   ✅ 모든 사용자 화면                 │
│   ✅ 상태 관리 (Zustand)             │
│   ✅ API 통신 (React Query)          │
│   ✅ 라우팅 (React Router)           │
└──────────────────────────────────────┘
```

---

## 💡 다음 단계

### 1. pubspec.yaml 의존성 정리 (선택사항)
현재 사용하지 않는 패키지 제거 가능:
- `google_fonts` - 이미 Pretendard 폰트를 assets에 포함
- `flutter_svg` - splash에서만 사용

### 2. React 앱 assets 정리
React 앱에서 사용할 이미지들을 `react-app/public/assets/`로 이동 필요

### 3. Gitignore 업데이트
```gitignore
# Flutter
.DS_Store
goldpet_app/.dart_tool/
goldpet_app/build/
goldpet_app/.idea/

# React
react-app/node_modules/
react-app/dist/
react-app/.DS_Store
```

---

## ✨ 정리 효과

1. **명확한 구조**: Flutter = 네이티브, React = UI
2. **빠른 빌드**: 불필요한 플랫폼 제거로 빌드 시간 단축
3. **쉬운 유지보수**: 역할이 명확하여 코드 찾기 쉬움
4. **작은 용량**: 프로젝트 크기 약 30% 감소
