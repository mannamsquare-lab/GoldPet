## Summary
<!-- one-line -->

## Walk-Photo Memory Attestation
<!-- REQUIRED for PRs touching frontend/src/features/walk/viewer/** or api/.../walk/** or api/.../file/** -->

- [ ] N/A — this PR does not touch walk-photo or file pipeline
- [ ] **iPhone SE 2020 (or iPhone 12/13 proxy)**: attached Xcode Instruments screenshot showing RSS < 300 MB after 100+ photo rapid swipe
- [ ] **Real device test evidence**: <attach screenshot or link>

## Test Plan
- [ ] `cd frontend && npm run lint && npm run test` passed
- [ ] `cd api && ./gradlew build` passed
- [ ] Manual real-device swipe: no freeze after 50+ photos

## Checklist
- [ ] No new use of `photo.imageUrl` as `<img src>` without `imageUrlViewer` fallback
- [ ] No `WINDOW_HALF > 1` in viewer
- [ ] No regression of Vitest EXACTLY-3 assertion

## data-testid 체크 (Playwright 안정성)
- [ ] 신규 React 컴포넌트에 `data-testid` 부여
- [ ] 기존 컴포넌트 수정 시 `data-testid` 보존
- [ ] selector drift 발생 시 24h 내 spec 수정 SLA

## OpenAPI drift 체크
<!-- REQUIRED when changing API DTO/controller signature. Jenkins verifyOpenApiSpec gate blocks merge if mismatched. -->
- [ ] N/A — API DTO/controller 시그니처 변경 없음
- [ ] `cd api && ./gradlew generateOpenApiDocs` 실행 후 `api/openapi.json` 재생성 commit
- [ ] `cd frontend && npm run generate:api` 실행 후 `frontend/src/api/schema.d.ts` 재생성 commit
- [ ] `cd admin && npm run generate:api` 실행 후 `admin/src/api/schema.d.ts` 재생성 commit
- [ ] (선택) drift 발생 시 `cd api && ./gradlew verifyOpenApiSpec` 로컬 통과 확인
