# React 앱 설정 가이드

이 파일은 React 앱을 생성하고 설정하는 방법을 안내합니다.

## 1. React 앱 생성

```bash
# flutter 디렉토리에서
cd flutter
mkdir -p react-app
cd react-app

# Vite + React + TypeScript 프로젝트 생성
npm create vite@latest . -- --template react-ts
```

## 2. 의존성 설치

```bash
cd react-app
npm install

# 추가 패키지 설치
npm install react-router-dom @tanstack/react-query zustand axios
npm install @emotion/react @emotion/styled  # 또는 원하는 스타일링 라이브러리
```

## 3. 프로젝트 구조 생성

다음 디렉토리 구조를 생성하세요:

```
react-app/
├── src/
│   ├── bridge/
│   │   ├── nativeBridge.ts
│   │   ├── bridgeTypes.ts
│   │   └── bridgeEvents.ts
│   ├── services/
│   │   ├── api/
│   │   │   └── client.ts
│   │   └── native/
│   │       ├── location.ts
│   │       ├── camera.ts
│   │       └── photoLibrary.ts
│   ├── stores/
│   │   └── authStore.ts
│   ├── features/
│   │   ├── onboarding/
│   │   ├── auth/
│   │   └── ...
│   ├── components/
│   │   └── common/
│   ├── App.tsx
│   └── main.tsx
```

## 4. 핵심 파일 생성

아래 파일들을 참고하여 생성하세요:

- `src/bridge/nativeBridge.ts` - Bridge 클라이언트
- `src/bridge/bridgeTypes.ts` - 타입 정의
- `src/services/native/location.ts` - 위치 서비스 래퍼
- `src/services/native/camera.ts` - 카메라 서비스 래퍼

자세한 내용은 `docs/GoldPet_Hybrid_App_Architecture_v1.0.md` 문서를 참고하세요.

