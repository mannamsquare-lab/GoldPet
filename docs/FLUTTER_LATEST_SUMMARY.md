### 최신 Flutter (안정 채널 기준, 2024 Q4~2025 Q1) 요약

- **런타임/렌더링**
  - Impeller가 iOS에 이어 Android(Vulkan)에서도 기본 활성화되어 프레임 레이턴시가 크게 줄었으며, 필요 시 `--enable-impeller=false`로 스키아로 롤백 가능.
  - 광색역(wide-gamut) 대응을 위해 `Color.withOpacity` 대신 `withValues`/`ColorSpace` 기반 API가 추가·확장됨. `Color` 구현체는 새 `a/r/g/b` 게터를 구현해야 함. (docs: `release/breaking-changes/wide-gamut-framework`)

- **디자인 & 위젯**
  - Material 3가 기본 테마 경로로 고도화돼 `NavigationBar`, `SegmentedButton`, `DatePicker` 등에서 토큰/애니메이션이 최신 스펙으로 정비.
  - 고정/반복 애니메이션 골든 테스트는 `AnimationSheetBuilder.collate()`(20프레임 등)로 단순화되어 레이아웃 없이 시트만 생성 가능. (docs: `release/breaking-changes/animation-sheet-builder-display`)

- **패키징/플랫폼**
  - iOS 네이티브 의존성은 Swift Package Manager로 관리 가능(`flutter config --enable-swift-package-manager`, `Swift Packages` 탭에서 추가). Podspec 공유 소스(`sharedDarwinSource`) 시 iOS 13+/macOS 10.15+ 타깃 명시 필요. (docs: `packages-and-plugins/developing-packages`)
  - 데스크톱은 `flutter create --platforms=windows,macos,linux`가 기본이며, `flutter build macos/windows/linux`로 릴리스 번들을 바로 생성.

- **네이티브 연동**
  - FFI 플러그인 템플릿(`flutter create --template=plugin_ffi`)이 정식화되어 C/C++/Swift/Kotlin 브리지를 쉽게 구성 가능.
  - Android 앱 번들은 Play Integrity/Play Feature Delivery 흐름과 맞춰 deferred components를 권장(필요 기능만 온디맨드 다운로드).

- **테스트/디버그**
  - 스크롤/레이아웃 디버깅 시 DevTools inspector와 `debugPaintSizeEnabled`의 시각화가 개선돼 경계/패딩을 바로 확인 가능.
  - `golden` 업데이트 시 새 애니메이션 시트 API와 `flutter test --update-goldens` 조합을 사용하면 플릭 없이 비교 가능.

- **마이그레이션 체크리스트 (깨지기 쉬운 변경)**
  - 색상: `Color.withOpacity` 호출을 `withValues(alpha: …)`로 교체하고 커스텀 `Color` 구현에 새 게터 추가.
  - Dialog: `showDialog(child: …)`는 완전히 삭제되어 `builder: (context) => …`만 허용. (docs: `release/breaking-changes/1-22-deprecations`)
  - 텍스트 입력: Scribble 대응을 위해 `TextInputClient` 구현에 `showToolbar`/`insertTextPlaceholder`/`removeTextPlaceholder`가 필요. (docs: `release/breaking-changes/scribble-text-input-client`)
  - 텍스트 테마: 구 `TextTheme.display4/title/subhead` 등은 `headline1/6/subtitle1` 등으로 교체해야 경고 제거. (docs: `release/breaking-changes/2-2-deprecations`)
