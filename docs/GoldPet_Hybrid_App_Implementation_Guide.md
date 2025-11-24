# GoldPet 하이브리드 앱 구현 가이드

> React 19 + Flutter WebView 하이브리드 앱 구현을 위한 단계별 가이드

---

## 1. 프로젝트 초기 설정

### 1.1 React 앱 생성

```bash
# 프로젝트 루트에서
cd flutter/goldpet_app
mkdir -p ../react-app
cd ../react-app

# Vite + React + TypeScript 프로젝트 생성
npm create vite@latest . -- --template react-ts

# 의존성 설치
npm install
npm install react-router-dom @tanstack/react-query zustand axios
npm install @emotion/react @emotion/styled  # 스타일링 (또는 Tailwind CSS)
```

### 1.2 Flutter 패키지 추가

```bash
cd flutter/goldpet_app

# pubspec.yaml에 추가할 패키지들
flutter pub add webview_flutter
flutter pub add firebase_messaging
flutter pub add geolocator
flutter pub add permission_handler
flutter pub add image_picker
flutter pub add path_provider
flutter pub add shared_preferences
flutter pub add http
```

---

## 2. 기본 구조 생성

### 2.1 Flutter Bridge 구조

```
lib/core/
├── bridge/
│   ├── javascript_bridge.dart
│   ├── bridge_controller.dart
│   └── bridge_protocol.dart
├── services/
│   ├── push_notification_service.dart
│   ├── location_service.dart
│   ├── camera_service.dart
│   └── photo_library_service.dart
└── webview/
    ├── webview_wrapper.dart
    └── webview_controller.dart
```

### 2.2 React Bridge 구조

```
src/
├── bridge/
│   ├── nativeBridge.ts
│   ├── bridgeTypes.ts
│   └── bridgeEvents.ts
└── services/
    └── native/
        ├── pushNotification.ts
        ├── location.ts
        ├── camera.ts
        └── photoLibrary.ts
```

---

## 3. 개발 워크플로우

### 3.1 로컬 개발

#### 터미널 1: React 개발 서버
```bash
cd react-app
npm run dev
# http://localhost:5173 에서 실행
```

#### 터미널 2: Flutter 앱 실행
```bash
cd flutter/goldpet_app
flutter run
# WebView가 http://localhost:5173 로드
```

### 3.2 디버깅

#### React 앱 디버깅
- Chrome DevTools 사용 (WebView Inspector)
- React DevTools 확장 프로그램
- 콘솔 로그 확인

#### Flutter 네이티브 디버깅
- Flutter DevTools
- 네이티브 로그 확인
- Bridge 메시지 로깅

---

## 4. 빌드 및 배포

### 4.1 프로덕션 빌드

```bash
# 1. React 앱 빌드
cd react-app
npm run build

# 2. 빌드 결과물을 Flutter assets로 복사
cp -r dist/* ../goldpet_app/assets/web/

# 3. Flutter 앱 빌드
cd ../goldpet_app
flutter build apk --release
flutter build ios --release
```

### 4.2 환경 변수 관리

#### React (.env)
```env
VITE_API_BASE_URL=https://api.goldpet.com
VITE_ENV=production
```

#### Flutter (환경별 설정)
```dart
// lib/config/env.dart
class Env {
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:8080',
  );
  
  static const String reactAppUrl = String.fromEnvironment(
    'REACT_APP_URL',
    defaultValue: 'http://localhost:5173',
  );
}
```

---

## 5. 일반적인 문제 해결

### 5.1 WebView가 React 앱을 로드하지 못함

**문제**: WebView에서 localhost 접근 불가 (Android)

**해결**:
```dart
// Android: AndroidManifest.xml에 추가
<application android:usesCleartextTraffic="true">
```

또는 개발 중에는 실제 IP 주소 사용:
```dart
const reactAppUrl = 'http://192.168.1.100:5173';
```

### 5.2 Bridge 통신이 작동하지 않음

**문제**: JavaScript Channel이 호출되지 않음

**해결**:
1. WebView JavaScript 모드 확인
2. Bridge 스크립트 주입 타이밍 확인
3. 콘솔에서 에러 확인

### 5.3 네이티브 권한 요청 실패

**문제**: 권한 요청이 작동하지 않음

**해결**:
1. AndroidManifest.xml / Info.plist 권한 설정 확인
2. 런타임 권한 요청 코드 확인
3. 사용자에게 권한 필요 이유 설명

---

## 6. 테스트 전략

### 6.1 단위 테스트

#### React 컴포넌트 테스트
```typescript
// src/components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

test('renders button', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

#### Flutter 서비스 테스트
```dart
// test/services/location_service_test.dart
void main() {
  test('getCurrentLocation returns valid location', () async {
    final service = LocationService(mockBridge);
    final location = await service.getCurrentLocation();
    expect(location['latitude'], isNotNull);
  });
}
```

### 6.2 통합 테스트

#### Bridge 통신 테스트
```typescript
// src/bridge/__tests__/nativeBridge.test.ts
test('callMethod returns response', async () => {
  const result = await nativeBridge.callMethod('getAppVersion');
  expect(result).toHaveProperty('version');
});
```

---

## 7. 성능 모니터링

### 7.1 메트릭 수집

- WebView 로딩 시간
- Bridge 호출 응답 시간
- 메모리 사용량
- 네이티브 서비스 호출 빈도

### 7.2 최적화 포인트

1. **React 앱 번들 크기**: 코드 스플리팅, Tree shaking
2. **이미지 최적화**: WebP, lazy loading
3. **Bridge 호출 최소화**: 배치 처리, 캐싱
4. **WebView 재사용**: 싱글톤 패턴

---

## 8. 다음 단계

1. ✅ 기본 구조 설정
2. ⏳ Bridge 통신 구현
3. ⏳ 첫 번째 화면 이전 (온보딩)
4. ⏳ 네이티브 서비스 통합
5. ⏳ 전체 기능 이전

---

**참고 문서**: `GoldPet_Hybrid_App_Architecture_v1.0.md`

