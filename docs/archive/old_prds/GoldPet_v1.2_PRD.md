# GoldPet_v1.2_PRD.md

# 📘 GoldPet – PRD v1.2 (Features + DevOps + ERD + API + Flutter 구조)

이 문서는 GoldPet 서비스의 **기능 스펙(Level 2)**, **DevOps & Docker**, **AWS 인프라**,  
그리고 추가로 **ERD, API 설계서, Flutter 프로젝트 구조**까지 포함한 통합 PRD 문서이다.

---

# 1. 프로젝트 개요
GoldPet은 반려동물의 산책, 프로필 관리, AI 프로필 생성, 친구 매칭, 커뮤니티 등 반려동물 중심 서비스를 제공하는 모바일 앱이다.  
Flutter 기반으로 Android/iOS 앱을 출시하며, 백엔드는 Spring Boot + PostgreSQL + Redis + AI 서버(Python) 구조로 구성된다.

---

# 2. 주요 기능 요약

## 2.1 회원가입 & 프로필
- SNS 간편가입(카카오, 네이버, 구글, 애플 등)
- 사용자 프로필 설정(닉네임, 성별, 나이 옵션)
- 반려동물 프로필 등록(여러 마리)
- 위치 정보(주소/주요 활동 지역) 설정

## 2.2 산책 기능
- GPS 기반 산책 시작/종료
- 산책 궤적 저장
- 사진 Spot + 메모
- 거리/시간/칼로리(사용자·반려동물) 기록
- 산책 히스토리 보기

## 2.3 친구 찾기 & 매칭
- 필터(종, 품종, 나이, 성별, 성격, 활동 지역 등)를 통한 친구 추천
- “좋아요” 기반 매칭
- 상호 좋아요 시 매칭 → 1:1 채팅방 자동 생성

## 2.4 채팅
- 1:1 채팅
- 그룹 채팅(산책 모임 단체방)
- AI 펫 챗봇과의 대화

## 2.5 AI 펫 프로필 생성
- 반려동물 정보 + 사진 기반
- Pixar/애니/디즈니 스타일 이미지 또는 짧은 영상 생성
- Gold 소모 기능

## 2.6 커뮤니티
- 카테고리 기반 게시글 작성
- 사진 업로드
- 좋아요/댓글/신고
- 인기글(조회수/반응 기반) 정렬

## 2.7 Gold 시스템
- 가입 시 3,000 Gold 지급
- 인앱 결제를 통한 Gold 충전
- AI 생성, 추가 좋아요, 프로필 부스터 등에서 소모

---

# 3. 기능 상세 스펙 (Level 2 – 흐름 중심)

## 3.1 회원가입 흐름
1. 앱 실행 → 온보딩 화면에서 “SNS로 시작하기” 선택
2. SNS 로그인 성공 후 서비스 약관/개인정보 동의 화면 표시
3. 필수 동의 후 기본 프로필 입력(닉네임, 연령대, 선택적 정보)
4. 위치 권한 요청 → 허용 시 현재 위치 기반 주요 활동 지역 추천
5. 최초 반려동물 등록 화면으로 이동
6. 반려동물 등록 완료 후, 홈 화면 진입 + 3,000 Gold 자동 지급

## 3.2 산책 기록 흐름
1. 하단 탭에서 “산책” 선택 → “산책 시작” 버튼 클릭
2. GPS 활성화 및 이동 궤적 기록 시작
3. 사용자가 사진을 찍으면 해당 위치에 Spot 생성(사진+메모)
4. 산책 도중 일시정지/재개 가능
5. “산책 종료” 시, 전체 이동 거리/시간/칼로리 계산
6. 사용자가 산책 제목/메모 입력 후 저장
7. 저장된 기록은 “산책 히스토리” 목록에서 조회 가능

## 3.3 친구 찾기 & 매칭 흐름
1. “친구 찾기” 탭에서 기본 추천 리스트 로딩(거리+반려동물 조건 기반)
2. 필터(종/성별/나이/중성화/성격/활동지역 등) 옵션으로 검색 범위 조정
3. 프로필 상세 화면에서 반려동물 정보, 산책 스타일, 커뮤니티 활동 내역 확인
4. 마음에 들 경우 “좋아요” 클릭(일일 무료 횟수 초과 시 Gold 사용 안내)
5. 상대가 나에게 이미 좋아요를 눌렀다면 즉시 매칭 성립
6. 양방향 좋아요 시 알림 발송 + 1:1 채팅방 자동 생성

## 3.4 채팅 흐름
- 1:1 채팅
  1. 매칭 성립 시 “새로운 매칭이 생겼어요!” 알림
  2. 알림 또는 매칭 목록에서 해당 대화방으로 이동
  3. 텍스트/이모지/사진/산책 기록 공유 가능
  4. 필요 시 차단/신고 기능 제공
- 그룹 채팅
  1. 사용자가 “산책 모임 만들기” 선택
  2. 모임 이름, 지역, 산책 시간대 입력
  3. 친구 목록/매칭 사용자 초대 → 그룹 채팅방 생성
  4. 그룹 내 공지, 모임 일정 공유 가능
- AI 펫 챗봇
  1. “AI 펫과 대화하기” 메뉴 선택
  2. 사용자의 대표 반려동물 프로필 로딩
  3. 반려동물 성격에 맞는 말투로 응답
  4. 산책/식단/건강 관련 조언 및 귀여운 말투로 상호작용

## 3.5 AI 펫 프로필 생성 흐름
1. “AI 프로필 생성” 메뉴 선택
2. 반려동물 선택 또는 새로 정보 입력
3. 사진 업로드(선택) + 색깔/특징/성격 태그 선택
4. 스타일 옵션(Pixar/애니/디즈니풍) 선택
5. 필요한 Gold 수량 안내 → 사용 확인
6. AI 서버로 생성 요청
7. 생성 완료 후, 사용자에게 결과 이미지/영상 표시
8. 반려동물 프로필 이미지로 적용하거나 기기에 저장/공유 가능

## 3.6 커뮤니티 흐름
1. “커뮤니티” 탭에서 카테고리(산책, 건강, 정보, 자랑 등) 선택
2. 게시글 목록 조회(최신/인기 정렬)
3. 게시글 상세 화면에서 사진·내용·댓글 확인
4. 새 글 작성 시
   - 카테고리 선택
   - 텍스트 작성
   - 사진 최대 10장 업로드
   - 해시태그 입력
5. 게시글 등록 후 피드 상단에 노출
6. 신고 기능을 통해 부적절한 콘텐츠 필터링

## 3.7 Gold 사용/충전 흐름
1. “내 Gold” 메뉴에서 잔액 확인
2. “충전하기” 클릭 → 패키지 선택(1,000 / 5,000 / 10,000 / 30,000+보너스)
3. 스토어(IAP) 결제 → 결제 성공 시 서버에서 영수증 검증
4. 금액에 따른 Gold 지급, GoldTransaction 기록
5. Gold 소모 시(예: 추가 좋아요, AI 생성 등) 사용 내역 기록

---

# 4. 데이터 모델(요약)

- User  
- Pet  
- WalkRecord  
- WalkSpot  
- Match  
- ChatRoom  
- ChatParticipant  
- ChatMessage  
- CommunityPost  
- CommunityComment  
- GoldTransaction  
- Notification  

---

# 5. DevOps & Docker 구성 (요약)

- Docker 기반 로컬 개발환경
- docker-compose로 API/AI/PostgreSQL/Redis/Nginx 구성
- GitHub Actions 기반 CI/CD 파이프라인
- AWS ECS Fargate + RDS + ElastiCache 기반 인프라

(상세 내용은 v1.1에서 정의한 내용과 동일하며, 여기서는 ERD/API/Flutter 구조 추가에 집중)

---

# 6. ERD 설계

## 6.1 주요 엔티티 및 속성

### User
| 필드명         | 타입        | 설명                |
|----------------|-------------|---------------------|
| id             | BIGINT PK   | 사용자 ID           |
| email          | VARCHAR     | 이메일(옵션, SNS만 사용 가능) |
| oauth_provider | VARCHAR     | SNS 종류            |
| oauth_id       | VARCHAR     | SNS 고유 ID         |
| nickname       | VARCHAR     | 닉네임              |
| gender         | VARCHAR     | 성별(옵션)          |
| birth_year     | INT         | 출생 연도(옵션)     |
| main_location  | VARCHAR     | 주요 활동 지역      |
| gold_balance   | INT         | 보유 Gold           |
| created_at     | TIMESTAMP   | 생성일              |
| updated_at     | TIMESTAMP   | 수정일              |

### Pet
| 필드명       | 타입        | 설명                |
|--------------|-------------|---------------------|
| id           | BIGINT PK   | 반려동물 ID         |
| user_id      | BIGINT FK   | 소유자 User FK      |
| name         | VARCHAR     | 이름                |
| species      | VARCHAR     | 종(개/고양이)       |
| breed        | VARCHAR     | 품종                |
| gender       | VARCHAR     | 성별                |
| birth_date   | DATE        | 생일(또는 나이)     |
| weight_kg    | DECIMAL     | 체중                |
| neutered     | BOOLEAN     | 중성화 여부         |
| personality  | JSON / TEXT | 성격 태그 리스트    |
| avatar_url   | VARCHAR     | 프로필 이미지 URL   |
| created_at   | TIMESTAMP   | 생성일              |

### WalkRecord
| 필드명        | 타입        | 설명                 |
|---------------|-------------|----------------------|
| id            | BIGINT PK   | 산책 기록 ID         |
| user_id       | BIGINT FK   | 사용자 ID            |
| pet_id        | BIGINT FK   | 주요 반려동물 ID     |
| title         | VARCHAR     | 산책 제목            |
| distance_m    | INT         | 이동 거리(m)         |
| duration_sec  | INT         | 산책 시간(초)        |
| user_calorie  | INT         | 사용자 칼로리        |
| pet_calorie   | INT         | 반려동물 칼로리      |
| started_at    | TIMESTAMP   | 시작 시각            |
| ended_at      | TIMESTAMP   | 종료 시각            |
| route_geojson | JSON        | 궤적 정보(GeoJSON 등)|
| created_at    | TIMESTAMP   | 생성일               |

### WalkSpot
| 필드명       | 타입        | 설명                    |
|--------------|-------------|-------------------------|
| id           | BIGINT PK   | Spot ID                 |
| walk_id      | BIGINT FK   | WalkRecord FK           |
| latitude     | DECIMAL     | 위도                    |
| longitude    | DECIMAL     | 경도                    |
| photo_url    | VARCHAR     | 사진 URL                |
| memo         | TEXT        | 메모                    |
| taken_at     | TIMESTAMP   | 촬영 시각               |

### Match
| 필드명           | 타입        | 설명                       |
|------------------|-------------|----------------------------|
| id               | BIGINT PK   | 매칭 ID                    |
| user_id          | BIGINT FK   | 요청자                     |
| target_user_id   | BIGINT FK   | 대상 사용자                |
| status           | VARCHAR     | 요청/수락/거절/매칭완료 등 |
| created_at       | TIMESTAMP   | 생성일                     |
| updated_at       | TIMESTAMP   | 상태 변경일                |

### ChatRoom
| 필드명       | 타입        | 설명                       |
|--------------|-------------|----------------------------|
| id           | BIGINT PK   | 채팅방 ID                  |
| type         | VARCHAR     | single/group/ai 등         |
| title        | VARCHAR     | 그룹방 이름(옵션)          |
| created_by   | BIGINT FK   | 방 생성자                  |
| created_at   | TIMESTAMP   | 생성일                     |

### ChatParticipant
| 필드명       | 타입        | 설명                  |
|--------------|-------------|-----------------------|
| id           | BIGINT PK   | 참여자 ID             |
| chatroom_id  | BIGINT FK   | 채팅방 FK             |
| user_id      | BIGINT FK   | 사용자 FK             |
| joined_at    | TIMESTAMP   | 참여 시작 일자        |
| role         | VARCHAR     | owner/member 등       |

### ChatMessage
| 필드명       | 타입        | 설명                  |
|--------------|-------------|-----------------------|
| id           | BIGINT PK   | 메시지 ID             |
| chatroom_id  | BIGINT FK   | 채팅방 FK             |
| sender_id    | BIGINT FK   | 발신자 User FK        |
| message_type | VARCHAR     | text/image/system 등  |
| content      | TEXT        | 내용 또는 메타 정보   |
| created_at   | TIMESTAMP   | 전송 시각             |

### CommunityPost
| 필드명       | 타입        | 설명                       |
|--------------|-------------|----------------------------|
| id           | BIGINT PK   | 게시글 ID                  |
| user_id      | BIGINT FK   | 작성자                     |
| category     | VARCHAR     | 산책/건강/정보/자랑 등     |
| title        | VARCHAR     | 제목                       |
| content      | TEXT        | 내용                       |
| image_urls   | JSON/TEXT   | 이미지 URL 리스트          |
| tags         | JSON/TEXT   | 해시태그                   |
| like_count   | INT         | 좋아요 수                  |
| view_count   | INT         | 조회 수                    |
| created_at   | TIMESTAMP   | 생성일                     |

### CommunityComment
| 필드명       | 타입        | 설명                    |
|--------------|-------------|-------------------------|
| id           | BIGINT PK   | 댓글 ID                 |
| post_id      | BIGINT FK   | 게시글 FK               |
| user_id      | BIGINT FK   | 작성자                   |
| content      | TEXT        | 내용                    |
| created_at   | TIMESTAMP   | 생성일                  |

### GoldTransaction
| 필드명       | 타입        | 설명                                 |
|--------------|-------------|--------------------------------------|
| id           | BIGINT PK   | 트랜잭션 ID                          |
| user_id      | BIGINT FK   | 사용자 FK                            |
| type         | VARCHAR     | CHARGE / USE                         |
| amount       | INT         | 변화량                               |
| balance_after| INT         | 거래 후 잔액                         |
| reason       | VARCHAR     | 사유(AI_PROFILE, LIKE_BOOST 등)      |
| created_at   | TIMESTAMP   | 생성일                               |

### Notification
| 필드명       | 타입        | 설명                    |
|--------------|-------------|-------------------------|
| id           | BIGINT PK   | 알림 ID                 |
| user_id      | BIGINT FK   | 대상 사용자             |
| type         | VARCHAR     | MATCH, MESSAGE, SYSTEM 등|
| payload      | JSON        | 알림 관련 데이터        |
| read         | BOOLEAN     | 읽음 여부               |
| created_at   | TIMESTAMP   | 생성일                  |

## 6.2 관계(관계도 개념)

- User 1 ── * Pet  
- User 1 ── * WalkRecord  
- WalkRecord 1 ── * WalkSpot  
- User 1 ── * CommunityPost  
- CommunityPost 1 ── * CommunityComment  
- User 1 ── * GoldTransaction  
- User 1 ── * Notification  
- User 1 ── * Match (user_id, target_user_id 쌍)  
- ChatRoom 1 ── * ChatParticipant ── * User  
- ChatRoom 1 ── * ChatMessage  

---

# 7. API 설계서 (요약)

(실제 구현 시 Swagger/OpenAPI로 확장 가능)

## 7.1 인증/회원

### POST /api/v1/auth/oauth/login
- 설명: SNS 토큰 기반 로그인/회원가입 통합 처리
- 요청: provider, accessToken
- 응답: JWT 액세스 토큰, 리프레시 토큰, 사용자 기본 정보

### GET /api/v1/users/me
- 설명: 내 정보 조회
- 인증: 필요(JWT)
- 응답: User 프로필 + 기본 설정

### PUT /api/v1/users/me
- 설명: 내 프로필 수정
- 인증: 필요
- 요청: nickname, mainLocation, 기타 옵션 필드

---

## 7.2 반려동물(Pet)

### GET /api/v1/pets
- 설명: 내 반려동물 목록 조회
- 인증: 필요

### POST /api/v1/pets
- 설명: 반려동물 등록
- 요청: name, species, breed, gender, birthDate, weightKg, neutered, personality 등

### PUT /api/v1/pets/{petId}
- 설명: 반려동물 정보 수정

### DELETE /api/v1/pets/{petId}
- 설명: 반려동물 삭제

---

## 7.3 산책(Walk)

### POST /api/v1/walks
- 설명: 산책 기록 저장
- 요청: petId, distanceM, durationSec, userCalorie, petCalorie, routeGeoJson, startedAt, endedAt

### GET /api/v1/walks
- 설명: 내 산책 기록 목록 조회(기간/정렬 옵션)

### GET /api/v1/walks/{walkId}
- 설명: 특정 산책 기록 상세 조회(Spot 포함)

### POST /api/v1/walks/{walkId}/spots
- 설명: 산책 중 Spot(사진+메모) 추가

---

## 7.4 친구 찾기 & 매칭

### GET /api/v1/match/recommendations
- 설명: 필터 기반 추천 사용자 목록
- 쿼리: species, location, ageRange, personality, distance 등

### POST /api/v1/match/like
- 설명: 특정 사용자에게 좋아요 요청
- 요청: targetUserId

### GET /api/v1/match/list
- 설명: 매칭 상태별 목록(보낸 요청, 받은 요청, 매칭 완료 등)

### POST /api/v1/match/{matchId}/accept
- 설명: 매칭 수락 → 채팅방 생성 트리거

---

## 7.5 채팅

### GET /api/v1/chat/rooms
- 설명: 내 채팅방 목록 조회

### POST /api/v1/chat/rooms
- 설명: 그룹 채팅방 생성
- 요청: title, participantUserIds[]

### GET /api/v1/chat/rooms/{roomId}/messages
- 설명: 과거 메시지 페이지 조회

### WebSocket /ws/chat
- 설명: 실시간 채팅 송/수신

---

## 7.6 커뮤니티

### GET /api/v1/community/posts
- 설명: 게시글 목록 조회(카테고리/정렬 필터)

### POST /api/v1/community/posts
- 설명: 게시글 작성
- 요청: category, title, content, imageUrls[], tags[]

### GET /api/v1/community/posts/{postId}
- 설명: 게시글 상세 조회

### POST /api/v1/community/posts/{postId}/comments
- 설명: 댓글 작성

### POST /api/v1/community/posts/{postId}/like
- 설명: 좋아요 토글

### POST /api/v1/community/posts/{postId}/report
- 설명: 신고하기

---

## 7.7 AI 프로필 생성

### POST /api/v1/ai/pet-profile
- 설명: AI 펫 프로필 생성 요청
- 요청: petId, styleType, 옵션으로 이미지 파일 업로드
- 응답: 생성 요청 ID(비동기 처리 가능)

### GET /api/v1/ai/pet-profile/{requestId}
- 설명: 생성 결과 조회(완료 시 이미지/영상 URL)

---

## 7.8 Gold

### GET /api/v1/gold/balance
- 설명: 내 Gold 잔액 조회

### GET /api/v1/gold/transactions
- 설명: 거래 내역 조회

### POST /api/v1/gold/use
- 설명: 기능 사용에 따른 Gold 차감
- 요청: amount, reason

(인앱 결제는 클라이언트→스토어→서버 검증 구조로 별도 Webhook/검증 API 추가 가능)

---

## 7.9 알림

### GET /api/v1/notifications
- 설명: 내 알림 목록 조회

### POST /api/v1/notifications/{notificationId}/read
- 설명: 단일 알림 읽음 처리

---

# 8. Flutter 프로젝트 구조 설계

## 8.1 기본 구조(Feature-first + Layer 분리)

```text
lib/
  main.dart
  app/
    app.dart              // MaterialApp, 라우팅 설정
    routes.dart           // GoRouter / Route 설정
    di.dart               // 의존성 주입 설정(GetIt 등)
  core/
    config/
      env.dart            // 환경설정(dev/prod)
    constants/
      colors.dart
      dimens.dart
      strings.dart
    theme/
      app_theme.dart
    utils/
      validators.dart
      formatters.dart
      logger.dart
   /network/
      api_client.dart
      dio_interceptor.dart
   /error/
      exceptions.dart
      failure.dart
  common/
    widgets/
      primary_button.dart
      text_field.dart
      avatar.dart
      pet_tag.dart
    mixins/
      form_mixin.dart
  features/
    auth/
      data/
        models/
          user_dto.dart
        datasources/
          auth_remote_data_source.dart
        repositories/
          auth_repository_impl.dart
      domain/
        entities/
          user.dart
        repositories/
          auth_repository.dart
        usecases/
          login_with_oauth.dart
      presentation/
        pages/
          login_page.dart
          onboarding_page.dart
        blocs_or_providers/
          auth_cubit.dart (또는 Riverpod Notifier)
    profile/
      presentation/
        pages/
          profile_page.dart
          edit_profile_page.dart
        state/
          profile_notifier.dart
      data/
        ...
    pet/
      presentation/
        pages/
          pet_list_page.dart
          pet_detail_page.dart
          pet_edit_page.dart
        state/
          pet_notifier.dart
      data/
        models/
          pet_dto.dart
        datasources/
          pet_remote_data_source.dart
        repositories/
          pet_repository_impl.dart
      domain/
        entities/
          pet.dart
        usecases/
          get_pets.dart
          create_pet.dart
    walk/
      presentation/
        pages/
          walk_home_page.dart
          walk_tracking_page.dart
          walk_history_page.dart
        widgets/
          walk_map_view.dart
      data/
        models/
          walk_record_dto.dart
        datasources/
          walk_remote_data_source.dart
      domain/
        entities/
          walk_record.dart
    match/
      presentation/
        pages/
          match_discover_page.dart
          match_filter_page.dart
        state/
          match_notifier.dart
    chat/
      presentation/
        pages/
          chat_list_page.dart
          chat_room_page.dart
        widgets/
          chat_message_bubble.dart
      data/
        services/
          chat_websocket_service.dart
    community/
      presentation/
        pages/
          community_feed_page.dart
          community_post_detail_page.dart
          community_post_edit_page.dart
        state/
          community_notifier.dart
    gold/
      presentation/
        pages/
          gold_wallet_page.dart
          gold_charge_page.dart
    notification/
      presentation/
        pages/
          notification_list_page.dart
  localization/
    l10n.dart
    arb/...
```

## 8.2 상태관리 제안
- Riverpod / Bloc 중 택 1
- 공통 원칙:
  - 각 feature는 자신의 state 관리(예: `AuthNotifier`, `WalkNotifier`)
  - 공통 네트워크 에러/로딩 핸들링은 core 레벨에서 정의

## 8.3 환경별 설정
- `lib/core/config/env.dart` 에서:
  - API base URL (dev/stage/prod)
  - AI 서버 URL
  - 로그 레벨

- 빌드 시:
  - `--dart-define=ENV=dev` 식으로 분기

---

# 9. 향후 작업 제안

- ERD 기반 실제 DB 마이그레이션 스크립트 설계(Flyway, Liquibase 등)
- OpenAPI(Swagger) 스펙 자동화
- Flutter용 API 클라이언트 코드 생성(dart build_runner 사용)
- E2E 플로우 다이어그램 작성(온보딩 → 매칭 → 채팅 → 커뮤니티)

---

# ✔ 요약

이 v1.2 문서는 다음을 모두 포함한다:

1. 기능 상세 흐름(Level 2)  
2. DevOps & Docker & AWS 인프라 개략  
3. ERD(주요 테이블 및 관계)  
4. API 설계서(요약 엔드포인트 리스트)  
5. Flutter 프로젝트 구조(Feature-first + Clean-ish Architecture)

