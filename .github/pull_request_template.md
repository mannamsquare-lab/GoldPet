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
<!-- REQUIRED when changing API DTO/controller signature. Jenkins verifyOpenApiSpec gate blocks merge if mismatched.
     enum 추가/제거도 DTO 노출 시 spec 변경 — N/A 판단 시 신중. -->
- [ ] N/A — API DTO/controller/enum 시그니처 변경 없음
- [ ] `cd api && ./gradlew generateOpenApiDocs` 실행 후 `api/openapi.json` 재생성 commit
- [ ] `cd frontend && npm run generate:api` 실행 후 `frontend/src/api/schema.d.ts` 재생성 commit
- [ ] `cd admin && npm run generate:api` 실행 후 `admin/src/api/schema.d.ts` 재생성 commit
- [ ] (선택) drift 발생 시 `cd api && ./gradlew verifyOpenApiSpec` 로컬 통과 확인

## Enum/Sealed 변경 시 clean build 체크
<!-- enum 값 추가/제거 또는 sealed class 변경 시 incremental compile 이 사용처 재컴파일을 skip 할 수 있음.
     로컬 ./gradlew compileKotlin 통과해도 Jenkins clean build 에서 "when 표현식 must be exhaustive" 위반으로 차단되는 회귀 사례.
     교훈: 2026-05-26 V68 ReportActionType.HIDE_CHAT 추가 후 AdminReportService.executeAction:150 when 위반 — Jenkins 1차 실패. -->
- [ ] N/A — enum/sealed 변경 없음
- [ ] `cd api && ./gradlew clean compileKotlin` 통과 확인 (incremental cache 회피)
- [ ] 새 enum 값을 사용하는 모든 `when` 표현식에 분기 추가 또는 `else` 추가 확인
- [ ] `cd api && ./gradlew verifyOpenApiSpec` 통과 (enum 이 DTO 에 노출 시 spec drift 발생)
