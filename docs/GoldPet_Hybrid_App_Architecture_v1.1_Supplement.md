# GoldPet 하이브리드 앱 아키텍처 보완 문서 v1.1

> 본 문서는 `GoldPet_Hybrid_App_Architecture_v1.0.md`의 보완 문서로,  
> PRD v2.1 및 관련 문서들을 반영한 추가 고려사항을 정리합니다.

---

## 1. Naver Map 통합 상세

### 1.1 Naver Map Web API vs 네이티브 SDK

**선택: Naver Map Web API (JavaScript)**

- React에서 직접 사용 가능
- 네이티브 SDK 대비 구현 복잡도 낮음
- 클러스터링, 커스텀 마커 등 기능 제공

**고려사항:**
- Web API 사용 시 라이선스 정책 확인 필요
- 네이티브 SDK 대비 성능 차이 (대부분의 경우 무시 가능)
- 오프라인 지원 제한적 (네이티브 SDK는 오프라인 타일 지원)

### 1.2 지도 성능 최적화 전략

#### 마커 클러스터링 (핫플레이스 대응)

```typescript
// @navermaps/marker-clustering 사용
import { MarkerClustering } from '@navermaps/marker-clustering';

const setupClustering = (markers: naver.maps.Marker[]) => {
  const clusterer = new MarkerClustering({
    minClusterSize: 2,
    maxZoom: 15,
    gridSize: 60,
    icons: [
      { content: '<div class="cluster-marker">2+</div>', size: new naver.maps.Size(40, 40) },
      { content: '<div class="cluster-marker">10+</div>', size: new naver.maps.Size(50, 50) },
    ],
  });
  
  clusterer.addMarkers(markers);
  return clusterer;
};
```

#### Polyline 간소화 (산책 경로)

```typescript
// 서버에서 간소화된 경로 제공 또는 클라이언트에서 간소화
import simplify from 'simplify-js';

const simplifyPolyline = (coordinates: number[][], tolerance: number = 0.0001) => {
  const points = coordinates.map(([lng, lat]) => ({ x: lng, y: lat }));
  const simplified = simplify(points, tolerance);
  return simplified.map(p => [p.x, p.y]);
};
```

---

## 2. 게이미피케이션 기능 구현

### 2.1 뱃지 시스템

#### 뱃지 획득 조건 체크

```typescript
// src/features/gamification/badgeChecker.ts
export class BadgeChecker {
  async checkWalkBadges(walkData: WalkRecord) {
    const badges = await api.get('/badges/check', {
      params: {
        type: 'walk',
        distance: walkData.distanceM,
        date: walkData.startedAt,
      },
    });
    
    if (badges.newBadges.length > 0) {
      // 네이티브 푸시 알림
      await nativeBridge.callMethod('showNotification', {
        title: '새로운 뱃지를 획득했어요! 🎉',
        body: `${badges.newBadges[0].name} 뱃지를 획득했습니다.`,
        data: {
          type: 'badge_earned',
          badgeId: badges.newBadges[0].id,
        },
      });
      
      // UI에 뱃지 획득 모달 표시
      showBadgeEarnedModal(badges.newBadges[0]);
    }
  }
}
```

### 2.2 챌린지 진행 상황 추적

```typescript
// 챌린지 진행 상황 실시간 업데이트
export const useChallengeProgress = (challengeId: number) => {
  const { data: challenge } = useQuery({
    queryKey: ['challenge', challengeId],
    queryFn: () => api.get(`/challenges/${challengeId}`),
  });
  
  // 산책 완료 시 챌린지 진행 상황 업데이트
  const updateProgress = useMutation({
    mutationFn: (progress: number) =>
      api.post(`/challenges/${challengeId}/progress`, { progress }),
    onSuccess: () => {
      queryClient.invalidateQueries(['challenge', challengeId]);
    },
  });
  
  return { challenge, updateProgress };
};
```

### 2.3 장소 체크인 (지오펜싱)

#### 네이티브 지오펜싱 서비스

```dart
// lib/core/services/geofencing_service.dart
import 'package:geofence_service/geofence_service.dart';

class GeofencingService {
  final JavaScriptBridge bridge;
  
  Future<void> startMonitoringPlaces(List<Place> places) async {
    final geofenceList = places.map((place) {
      return Geofence(
        id: place.id.toString(),
        latitude: place.lat,
        longitude: place.lng,
        radius: [
          GeofenceRadius(id: 'radius_50', length: 50),
        ],
      );
    }).toList();
    
    GeofenceService.initialize();
    
    GeofenceService.startGeofenceService(
      geofenceList: geofenceList,
      callback: (GeofenceResult result) {
        if (result.event == GeofenceEvent.enter) {
          bridge.sendEventToReact('geofenceEntered', {
            'placeId': int.parse(result.id),
            'placeName': places.firstWhere((p) => p.id.toString() == result.id).name,
          });
        }
      },
    );
  }
}
```

---

## 3. 어뷰징 방지 전략

### 3.1 산책 속도 검증

```dart
// lib/core/services/walk_validation_service.dart
class WalkValidationService {
  static const double MAX_WALK_SPEED_KMH = 15.0; // 15km/h
  
  bool validateWalkSpeed(List<Position> positions) {
    if (positions.length < 2) return true;
    
    int highSpeedCount = 0;
    
    for (int i = 1; i < positions.length; i++) {
      final prev = positions[i - 1];
      final curr = positions[i];
      
      final distance = Geolocator.distanceBetween(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude,
      );
      
      final timeDiff = curr.timestamp.difference(prev.timestamp).inSeconds;
      if (timeDiff == 0) continue;
      
      final speedKmh = (distance / timeDiff) * 3.6;
      
      if (speedKmh > MAX_WALK_SPEED_KMH) {
        highSpeedCount++;
      }
    }
    
    // 전체 구간의 30% 이상이 고속이면 무효
    final highSpeedRatio = highSpeedCount / positions.length;
    return highSpeedRatio < 0.3;
  }
  
  List<Position> filterInvalidPositions(List<Position> positions) {
    return positions.where((pos, index) {
      if (index == 0) return true;
      
      final prev = positions[index - 1];
      final distance = Geolocator.distanceBetween(
        prev.latitude,
        prev.longitude,
        pos.latitude,
        pos.longitude,
      );
      
      final timeDiff = pos.timestamp.difference(prev.timestamp).inSeconds;
      if (timeDiff == 0) return false;
      
      final speedKmh = (distance / timeDiff) * 3.6;
      return speedKmh <= MAX_WALK_SPEED_KMH;
    }).toList();
  }
}
```

### 3.2 GPS 조작 감지

```dart
// Mock Location 감지 (Android)
Future<bool> isMockLocationEnabled() async {
  if (Platform.isAndroid) {
    final location = await Geolocator.getCurrentPosition(
      desiredAccuracy: LocationAccuracy.high,
    );
    // Android에서는 isMocked 속성으로 확인 가능
    return location.isMocked ?? false;
  }
  return false;
}
```

---

## 4. Gold 시스템 상세

### 4.1 유료/무료 Gold 구분

```typescript
// src/features/gold/goldStore.ts
interface GoldBalance {
  paidGold: number;      // 유료 Gold (환불 가능, 유효기간 없음)
  freeGold: number;       // 무료 Gold (환불 불가, 유효기간 있음)
  totalGold: number;
  freeGoldExpiresAt?: Date; // 무료 Gold 만료일
}

export const useGoldStore = create<GoldBalance>((set) => ({
  paidGold: 0,
  freeGold: 0,
  totalGold: 0,
  
  async fetchBalance() {
    const balance = await api.get('/gold/balance');
    set({
      paidGold: balance.paidGold,
      freeGold: balance.freeGold,
      totalGold: balance.totalGold,
      freeGoldExpiresAt: balance.freeGoldExpiresAt,
    });
  },
  
  async useGold(amount: number, purpose: string) {
    // 서버에서 무료 Gold 우선 차감 로직 처리
    await api.post('/gold/use', { amount, purpose });
    await this.fetchBalance();
  },
}));
```

### 4.2 IAP (In-App Purchase) 통합

```dart
// lib/core/services/iap_service.dart
import 'package:in_app_purchase/in_app_purchase.dart';

class IAPService {
  final InAppPurchase _iap = InAppPurchase.instance;
  
  Future<PurchaseResult> purchaseGoldPackage(String packageId) async {
    final productDetails = await _iap.queryProductDetails({packageId});
    
    if (productDetails.productDetails.isEmpty) {
      throw Exception('Product not found');
    }
    
    final purchaseParam = PurchaseParam(
      productDetails: productDetails.productDetails.first,
    );
    
    final success = await _iap.buyNonConsumable(purchaseParam: purchaseParam);
    
    if (success) {
      // 구매 완료 후 서버에 검증 요청
      return PurchaseResult.success;
    } else {
      return PurchaseResult.failed;
    }
  }
}
```

---

## 5. 온보딩 플로우 상세

### 5.1 온보딩 상태 관리

```typescript
// src/features/onboarding/onboardingStore.ts
interface OnboardingState {
  currentStep: 'onboarding' | 'login' | 'profile' | 'location' | 'pet';
  profileData?: {
    nickname: string;
    gender?: string;
    birthYear?: number;
  };
  locationData?: {
    lat: number;
    lng: number;
    address: string;
  };
  petData?: {
    speciesId: number;
    breedId: number;
    name: string;
    // ... 기타 펫 정보
  };
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: 'onboarding',
  
  setProfileData(data) {
    set({ profileData: data });
  },
  
  setLocationData(data) {
    set({ locationData: data });
  },
  
  setPetData(data) {
    set({ petData: data });
  },
  
  async completeOnboarding() {
    // 모든 데이터를 서버에 전송
    await api.post('/onboarding/complete', {
      profile: this.profileData,
      location: this.locationData,
      pet: this.petData,
    });
    
    // 홈으로 이동
    navigate('/home');
  },
}));
```

### 5.2 위치 설정 화면 (Naver Map 통합)

```typescript
// src/features/onboarding/LocationSelectPage.tsx
export const LocationSelectPage = () => {
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<string>('');
  
  useEffect(() => {
    // 현재 위치 가져오기
    locationService.getCurrentLocation().then(location => {
      setCenter({ lat: location.latitude, lng: location.longitude });
      // 역지오코딩으로 주소 가져오기
      reverseGeocode(location.latitude, location.longitude).then(setAddress);
    });
  }, []);
  
  const handleMapClick = async (lat: number, lng: number) => {
    setCenter({ lat, lng });
    const addr = await reverseGeocode(lat, lng);
    setAddress(addr);
  };
  
  return (
    <div>
      <NaverMap
        center={center}
        onMapClick={handleMapClick}
        markers={center ? [{ position: center }] : []}
      />
      <div>
        <p>선택한 위치: {address}</p>
        <button onClick={() => saveLocation()}>이 위치로 설정</button>
      </div>
    </div>
  );
};
```

---

## 6. 테스트 전략 보강

### 6.1 Bridge 통신 테스트

```typescript
// src/bridge/__tests__/nativeBridge.test.ts
describe('NativeBridge', () => {
  beforeEach(() => {
    // Mock NativeBridge channel
    (window as any).NativeBridge = {
      postMessage: jest.fn(),
    };
  });
  
  test('callMethod sends correct message format', async () => {
    const promise = nativeBridge.callMethod('getCurrentLocation');
    
    // Simulate response
    (window as any).nativeBridge.handleResponse({
      id: expect.any(String),
      success: true,
      data: { latitude: 37.5, longitude: 127.0 },
    });
    
    const result = await promise;
    expect(result).toEqual({ latitude: 37.5, longitude: 127.0 });
  });
  
  test('callMethod handles errors', async () => {
    const promise = nativeBridge.callMethod('invalidMethod');
    
    (window as any).nativeBridge.handleResponse({
      id: expect.any(String),
      success: false,
      error: { message: 'Method not found' },
    });
    
    await expect(promise).rejects.toThrow('Method not found');
  });
});
```

### 6.2 네이티브 서비스 테스트

```dart
// test/services/location_service_test.dart
void main() {
  group('LocationService', () {
    test('getCurrentLocation returns valid location', () async {
      final service = LocationService();
      final location = await service.getCurrentLocation();
      
      expect(location['latitude'], isNotNull);
      expect(location['longitude'], isNotNull);
      expect(location['latitude'], isA<double>());
      expect(location['longitude'], isA<double>());
    });
    
    test('startTracking emits location updates', () async {
      final service = LocationService();
      final locations = <Map<String, dynamic>>[];
      
      service.startTracking((location) {
        locations.add(location);
      });
      
      await Future.delayed(Duration(seconds: 2));
      
      expect(locations.length, greaterThan(0));
    });
  });
}
```

### 6.3 E2E 테스트 (Playwright)

```typescript
// e2e/walk-flow.spec.ts
import { test, expect } from '@playwright/test';

test('산책 시작 및 기록 저장', async ({ page }) => {
  // 로그인
  await page.goto('/login');
  await page.click('button:has-text("카카오로 시작하기")');
  
  // 산책 시작
  await page.goto('/walk');
  await page.click('button:has-text("산책 시작")');
  
  // 위치 권한 허용 (모의)
  await page.context().grantPermissions(['geolocation']);
  
  // 산책 종료
  await page.click('button:has-text("산책 종료")');
  
  // 기록 저장
  await page.fill('input[name="title"]', '저녁 산책');
  await page.click('button:has-text("저장")');
  
  // 저장 완료 확인
  await expect(page.locator('text=산책 기록이 저장되었습니다')).toBeVisible();
});
```

---

## 7. 모니터링 및 분석

### 7.1 성능 모니터링

```typescript
// src/utils/performance.ts
export const trackPerformance = {
  measureBridgeCall(method: string, duration: number) {
    // Bridge 호출 시간 추적
    analytics.track('bridge_call', {
      method,
      duration,
      timestamp: Date.now(),
    });
  },
  
  measureMapRender(markerCount: number, renderTime: number) {
    // 지도 렌더링 성능 추적
    analytics.track('map_render', {
      markerCount,
      renderTime,
    });
  },
};
```

### 7.2 에러 추적

```typescript
// src/utils/errorTracking.ts
export const trackError = (error: Error, context?: Record<string, any>) => {
  // Sentry 또는 다른 에러 추적 서비스에 전송
  Sentry.captureException(error, {
    extra: context,
    tags: {
      platform: 'hybrid',
      layer: 'react',
    },
  });
};

// Bridge 에러 추적
nativeBridge.onEvent('bridgeError', (error) => {
  trackError(new Error(error.message), {
    method: error.method,
    params: error.params,
  });
});
```

---

**문서 버전**: v1.1  
**작성일**: 2024  
**참조 문서**: 
- GoldPet_v2.1_Final_PRD.md
- GoldPet_v2.1_Supplement.md
- GoldPet_Location_APIs_v1.0.md
- GoldPet_Friend_Map_UX_v1.md
- GoldPet_Walk_Map_UX_v1.md

