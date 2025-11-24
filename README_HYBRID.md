# GoldPet 하이브리드 앱 개발 가이드

> Flutter 네이티브 기능 + React 19 WebView 기반 하이브리드 앱 개발을 위한 빠른 시작 가이드

## 📋 개요

이 프로젝트는 다음과 같은 하이브리드 아키텍처를 사용합니다:

- **Flutter**: 네이티브 기능만 담당 (푸시 알림, GPS, 카메라, 사진 라이브러리)
- **React 19**: 모든 UI 및 비즈니스 로직 담당
- **JavaScript Bridge**: Flutter와 React 간 양방향 통신

## 🚀 빠른 시작

### 1. Flutter 패키지 설치

```bash
cd flutter/goldpet_app
flutter pub get
```

### 2. React 앱 생성 및 설정

```bash
# 프로젝트 루트에서
cd flutter
mkdir -p react-app
cd react-app

# Vite + React + TypeScript 프로젝트 생성
npm create vite@latest . -- --template react-ts

# 의존성 설치
npm install
npm install react-router-dom @tanstack/react-query zustand axios
```

### 3. 개발 서버 실행

#### 터미널 1: React 개발 서버
```bash
cd flutter/react-app
npm run dev
# http://localhost:5173 에서 실행
```

#### 터미널 2: Flutter 앱 실행
```bash
cd flutter/goldpet_app
flutter run
# WebView가 http://localhost:5173 로드
```

## 📁 프로젝트 구조

```
flutter/goldpet_app/
├── lib/
│   ├── core/
│   │   ├── bridge/              # JavaScript Bridge
│   │   │   ├── bridge_protocol.dart
│   │   │   ├── javascript_bridge.dart
│   │   │   └── bridge_controller.dart
│   │   ├── services/            # 네이티브 서비스
│   │   │   ├── location_service.dart
│   │   │   ├── camera_service.dart
│   │   │   └── push_notification_service.dart
│   │   └── webview/
│   │       └── webview_wrapper.dart
│   ├── app.dart                 # 메인 앱 (WebView 로드)
│   └── main.dart
│
flutter/react-app/              # React 앱 (생성 필요)
├── src/
│   ├── bridge/                  # Bridge 클라이언트
│   ├── services/                # API 및 네이티브 서비스 래퍼
│   ├── features/                # 기능별 페이지
│   └── components/              # 공통 컴포넌트
```

## 🔧 주요 기능

### 네이티브 기능 (Flutter)

- ✅ 위치 서비스 (GPS 추적)
- ✅ 카메라 및 사진 라이브러리
- ✅ 푸시 알림 (Firebase 설정 필요)
- ✅ 권한 관리

### JavaScript Bridge

React에서 네이티브 기능을 호출하는 방법:

```typescript
import { nativeBridge } from '@/bridge/nativeBridge';

// 위치 가져오기
const location = await nativeBridge.callMethod('getCurrentLocation');

// 카메라 열기
const image = await nativeBridge.callMethod('openCamera');

// 위치 추적 시작
await nativeBridge.callMethod('startLocationTracking', {
  interval: 1000
});
```

## 📚 문서

- [하이브리드 앱 아키텍처 설계](./docs/GoldPet_Hybrid_App_Architecture_v1.0.md)
- [구현 가이드](./docs/GoldPet_Hybrid_App_Implementation_Guide.md)

## ⚠️ 주의사항

### 개발 환경

- **Android**: `AndroidManifest.xml`에 `android:usesCleartextTraffic="true"` 추가 필요 (localhost 접근용)
- **iOS**: Info.plist에 필요한 권한 추가 필요

### 프로덕션 빌드

1. React 앱 빌드: `npm run build`
2. 빌드 결과물을 `flutter/goldpet_app/assets/web/`에 복사
3. Flutter 앱 빌드: `flutter build apk` 또는 `flutter build ios`

## 🐛 문제 해결

### WebView가 React 앱을 로드하지 못함

- Android: `AndroidManifest.xml`에 `usesCleartextTraffic="true"` 추가
- 개발 중에는 실제 IP 주소 사용: `http://192.168.1.100:5173`

### Bridge 통신이 작동하지 않음

- WebView JavaScript 모드 확인
- Bridge 스크립트 주입 타이밍 확인
- 브라우저 콘솔에서 에러 확인

## 📝 다음 단계

1. ✅ 기본 구조 설정 완료
2. ⏳ React 앱 기본 구조 생성
3. ⏳ Bridge 통신 테스트
4. ⏳ 첫 번째 화면 이전 (온보딩)
5. ⏳ 네이티브 서비스 통합 테스트

## 🤝 기여

이 프로젝트는 하이브리드 앱 아키텍처의 실험적 구현입니다. 
문제가 발견되거나 개선 사항이 있으면 이슈를 등록해주세요.

