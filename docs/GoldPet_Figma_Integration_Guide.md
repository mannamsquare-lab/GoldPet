# GoldPet Figma 통합 가이드

> Figma 디자인을 React 컴포넌트로 변환하는 상세 가이드

---

## 1. 개요

GoldPet 프로젝트는 Figma에서 디자인을 관리하며, Figma MCP(Model Context Protocol)를 통해 디자인을 코드로 변환합니다.

**Figma 파일**: [GoldPet-Local](https://www.figma.com/design/VIjCdyPTnywcM9HzpoOqlh/GoldPet-Local)

---

## 2. Figma MCP 워크플로우

### 2.1 필수 작업 순서

Figma 디자인을 구현할 때는 다음 순서를 **반드시** 따라야 합니다:

1. **디자인 컨텍스트 가져오기**
   ```typescript
   // get_design_context(nodeId) 호출
   // 구조화된 디자인 정보 가져오기
   ```

2. **메타데이터 확인** (필요 시)
   ```typescript
   // 응답이 너무 크거나 잘린 경우
   // get_metadata(nodeId)로 전체 구조 확인 후
   // 필요한 노드만 다시 get_design_context 호출
   ```

3. **스크린샷 가져오기**
   ```typescript
   // get_screenshot(nodeId) 호출
   // 시각적 참조용 이미지
   ```

4. **에셋 다운로드**
   ```typescript
   // 필요한 이미지/아이콘 다운로드
   // fetch_mcp_resource() 사용
   ```

5. **구현 시작**
   ```typescript
   // 위 단계 완료 후에만 코드 작성 시작
   ```

### 2.2 Node ID 추출 방법

Figma URL에서 Node ID 추출:
```
https://www.figma.com/design/VIjCdyPTnywcM9HzpoOqlh/GoldPet-Local?node-id=4017-21056&m=dev
                                                                    ^^^^^^^^^^^^
                                                                    이 부분이 Node ID
```

Node ID 형식 변환:
- URL 형식: `4017-21056`
- MCP 형식: `4017:21056` (하이픈을 콜론으로 변경)

---

## 3. 화면별 구현 가이드

### 3.1 Onboarding 화면

#### Onboarding Screen 1
- **Figma 링크**: [링크](https://www.figma.com/design/VIjCdyPTnywcM9HzpoOqlh/GoldPet-Local?node-id=4017-20145&m=dev)
- **Node ID**: `4017:20145`
- **구현 위치**: `src/features/onboarding/components/OnboardingScreen1.tsx`

```typescript
// 구현 예시
import { useOnboardingStore } from '../stores/onboardingStore';

export const OnboardingScreen1 = () => {
  const { nextStep } = useOnboardingStore();
  
  return (
    <div className="onboarding-screen">
      {/* Figma 디자인 구조 반영 */}
      <img src="/assets/onboarding/onboarding-1.png" alt="온보딩 1" />
      <h1>내 펫의 산책과 추억을 한 번에 기록</h1>
      <p>산책 경로, 사진, 메모를 한 곳에서 관리하세요</p>
      <button onClick={nextStep}>다음</button>
    </div>
  );
};
```

#### Onboarding Screen 2-4
- 동일한 패턴으로 구현
- 각 화면별 고유한 콘텐츠 반영

### 3.2 로그인 화면

- **Figma 링크**: [링크](https://www.figma.com/design/VIjCdyPTnywcM9HzpoOqlh/GoldPet-Local?node-id=4017-22523&m=dev)
- **Node ID**: `4017:22523`
- **구현 위치**: `src/features/auth/components/LoginPage.tsx`

```typescript
export const LoginPage = () => {
  const handleSocialLogin = async (provider: 'kakao' | 'naver' | 'google' | 'apple') => {
    // SNS 로그인 처리
    await api.post('/auth/oauth/login', { provider });
  };
  
  return (
    <div className="login-page">
      <h1>GoldPet에 오신 걸 환영합니다</h1>
      <button onClick={() => handleSocialLogin('kakao')}>
        카카오로 시작하기
      </button>
      {/* 기타 SNS 로그인 버튼 */}
    </div>
  );
};
```

### 3.3 홈 화면

- **Figma 링크**: [링크](https://www.figma.com/design/VIjCdyPTnywcM9HzpoOqlh/GoldPet-Local?node-id=4017-21066&m=dev)
- **Node ID**: `4017:21066`
- **구현 위치**: `src/features/home/components/HomePage.tsx`

```typescript
export const HomePage = () => {
  const { data: walks } = useQuery({
    queryKey: ['walks', 'recent'],
    queryFn: () => api.get('/walks/recent'),
  });
  
  return (
    <div className="home-page">
      {/* 오늘의 산책 요약 */}
      {/* 추천 친구 */}
      {/* 최근 산책 기록 */}
    </div>
  );
};
```

### 3.4 친구찾기 화면

- **기본 화면**: [링크](https://www.figma.com/design/VIjCdyPTnywcM9HzpoOqlh/GoldPet-Local?node-id=4017-23041&m=dev)
- **필터 화면**: [링크](https://www.figma.com/design/VIjCdyPTnywcM9HzpoOqlh/GoldPet-Local?node-id=4017-23133&m=dev)
- **구현 위치**: `src/features/friends/components/FriendSearchPage.tsx`

```typescript
export const FriendSearchPage = () => {
  const [filters, setFilters] = useState<FriendFilters>({});
  const { data: friends } = useQuery({
    queryKey: ['friends', 'nearby', filters],
    queryFn: () => api.get('/friends/nearby', { params: filters }),
  });
  
  return (
    <div className="friend-search-page">
      <FilterBar filters={filters} onChange={setFilters} />
      <FriendList friends={friends} />
    </div>
  );
};
```

### 3.5 채팅 화면

- **채팅 리스트**: [링크](https://www.figma.com/design/VIjCdyPTnywcM9HzpoOqlh/GoldPet-Local?node-id=4017-22019&m=dev)
- **채팅 대화창**: [링크](https://www.figma.com/design/VIjCdyPTnywcM9HzpoOqlh/GoldPet-Local?node-id=4017-22317&m=dev)
- **구현 위치**: `src/features/chat/components/`

```typescript
// 채팅 리스트
export const ChatListPage = () => {
  const { data: chatRooms } = useQuery({
    queryKey: ['chat', 'rooms'],
    queryFn: () => api.get('/chat/rooms'),
  });
  
  return (
    <div className="chat-list-page">
      {chatRooms?.map(room => (
        <ChatRoomCard key={room.id} room={room} />
      ))}
    </div>
  );
};

// 채팅 대화창
export const ChatRoomPage = ({ roomId }: { roomId: number }) => {
  const { data: messages } = useQuery({
    queryKey: ['chat', 'messages', roomId],
    queryFn: () => api.get(`/chat/rooms/${roomId}/messages`),
  });
  
  return (
    <div className="chat-room-page">
      <MessageList messages={messages} />
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
};
```

### 3.6 산책 화면

- **기본 화면**: [링크](https://www.figma.com/design/VIjCdyPTnywcM9HzpoOqlh/GoldPet-Local?node-id=4017-21396&m=dev)
- **산책 시작**: [링크](https://www.figma.com/design/VIjCdyPTnywcM9HzpoOqlh/GoldPet-Local?node-id=4017-21598&m=dev)
- **기록 상세**: [링크](https://www.figma.com/design/VIjCdyPTnywcM9HzpoOqlh/GoldPet-Local?node-id=4017-21673&m=dev)
- **구현 위치**: `src/features/walk/components/`

```typescript
// 산책 시작 화면 (네이티브 GPS 연동)
export const WalkStartPage = () => {
  const locationService = useLocationService();
  const [isTracking, setIsTracking] = useState(false);
  
  const handleStartWalk = async () => {
    await locationService.startTracking((location) => {
      // 위치 업데이트 처리
    });
    setIsTracking(true);
  };
  
  return (
    <div className="walk-start-page">
      {isTracking ? (
        <WalkTrackingView />
      ) : (
        <button onClick={handleStartWalk}>산책 시작</button>
      )}
    </div>
  );
};
```

---

## 4. 디자인 시스템 통합

### 4.1 색상 토큰

Figma에서 추출한 색상을 프로젝트 테마에 반영:

```typescript
// src/theme/colors.ts
export const colors = {
  primary: {
    main: '#614108',      // 골드펫 브랜드 컬러
    light: '#FFF7E6',     // 배경색
  },
  // Figma 디자인에서 추가 색상 추출
};
```

### 4.2 타이포그래피

```typescript
// src/theme/typography.ts
export const typography = {
  fontFamily: 'Pretendard, -apple-system, sans-serif',
  // Figma 디자인에서 폰트 스타일 추출
};
```

### 4.3 컴포넌트 스타일

```typescript
// src/components/common/Button/Button.tsx
import { colors, typography } from '@/theme';

export const Button = styled.button`
  font-family: ${typography.fontFamily};
  background-color: ${colors.primary.main};
  color: white;
  /* Figma 디자인 스펙 반영 */
`;
```

---

## 5. 검증 및 테스트

### 5.1 시각적 검증

각 화면 구현 후:

1. **Figma 스크린샷과 비교**
   - 레이아웃 일치도 확인
   - 색상/폰트 일치도 확인
   - 간격/여백 확인

2. **인터랙션 테스트**
   - 모든 버튼/링크 동작 확인
   - 폼 입력/검증 확인
   - 상태 변화 확인

3. **반응형 테스트**
   - 다양한 화면 크기에서 확인
   - 터치 영역 확인

### 5.2 접근성 검증

- 스크린 리더 테스트
- 키보드 네비게이션 테스트
- 색상 대비 확인

---

## 6. 자주 묻는 질문

### Q: Figma 디자인이 업데이트되면 어떻게 하나요?

A: 해당 화면의 Node ID로 다시 `get_design_context`와 `get_screenshot`을 호출하여 변경사항을 확인하고 코드를 업데이트합니다.

### Q: Figma에 없는 화면은 어떻게 하나요?

A: 기존 디자인 시스템과 컴포넌트를 재사용하여 일관성 있게 구현합니다. 필요 시 디자이너와 협의하여 Figma에 추가합니다.

### Q: 네이티브 기능이 필요한 화면은?

A: React 컴포넌트에서 `nativeBridge`를 통해 네이티브 기능을 호출합니다. 예: 카메라, 위치, 푸시 알림 등.

---

**참고 문서**:
- [하이브리드 앱 아키텍처](./GoldPet_Hybrid_App_Architecture_v1.0.md)
- [Figma 디자인 링크](./GoldPet_FIGMA_v1.0.md)

