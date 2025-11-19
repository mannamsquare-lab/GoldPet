# GoldPet_v1.3_PRD.md

# 📘 GoldPet – PRD v1.3  
**(Features + DevOps + ERD 개정 + Chat 확장 + Walk 앨범/공개 범위 + Flutter 구조)**

v1.3에서는 특히 **ERD와 도메인 모델을 확장성 있게 재설계**했다.

- 펫 정보 구조 개선 (향후 조류/파충류 등 확장 대비)
- 채팅 메시지 구조 확장 (파일, 이모티콘/이모지, 유료 모델 대비)
- Walk(산책) → 앨범/공개범위/공유 기능을 고려한 스키마 개선
- User 프로필 이미지가 채팅창에 노출될 수 있도록 필드 확장

---

# 1. 프로젝트 개요

GoldPet은 반려동물의 산책, 프로필 관리, AI 프로필 생성, 친구 매칭, 커뮤니티 등 반려동물 중심 서비스를 제공하는 모바일 앱이다.  
Flutter 기반으로 Android/iOS 앱을 출시하며, 백엔드는 Spring Boot + PostgreSQL + Redis + AI 서버(Python) 구조로 구성된다.

---

# 2. 주요 기능 요약 (변경 없음, v1.2와 동일)

- 회원가입 & 프로필 / 반려동물 등록
- 산책 기록 및 추천
- 친구 찾기 & 매칭
- 1:1/그룹/AI 펫 채팅
- AI 펫 프로필 생성
- 커뮤니티
- Gold 경제 시스템

---

# 3. 기능 상세 스펙 (Level 2 – 흐름 중심, v1.2와 동일)

※ 기존 v1.2의 기능 흐름(회원가입, 산책, 매칭, 채팅, AI, 커뮤니티, Gold 사용/충전 등)은 동일하게 유지하며,  
아래 ERD 및 API 설계에서 **확장/변경된 포인트**만 반영한다.

---

# 4. DevOps & Docker 구성 (요약, 변경 없음)

- Docker 기반 로컬 개발환경: backend, ai-server, postgres, redis, nginx
- GitHub Actions 기반 CI/CD
- AWS ECS Fargate + RDS + ElastiCache + S3 인프라 구성

---

# 5. ERD 설계 (v1.3 개정)

## 5.1 핵심 변경 포인트 정리

1. **Pet 구조 분리 및 확장성 확보**
   - 종(Species) 테이블 분리 → 향후 개/고양이 외에 조류, 파충류 등 확장 대비
   - Breed(품종) 테이블 분리
   - 펫의 다양한 속성(색, 패턴, 특이사항 등)을 위한 확장 테이블/속성 구조 고려

2. **Chat 구조 확장**
   - 파일 첨부(이미지/영상/문서/기타) 엔터티 추가
   - 이모티콘/스티커/이모지 구조 설계 (추후 유료 모델 대비)
   - ChatMessage가 파일, 이모티콘, 일반 텍스트 모두 표현 가능하도록 필드 확장
   - User 프로필 이미지가 채팅창에서 노출될 수 있도록 User에 이미지 필드 추가

3. **Walk(산책) → 앨범 & 공개 범위**
   - WalkAlbum 엔터티 추가 (개인별 앨범)
   - WalkRecord에 공개 범위 필드(visibility) 추가: PUBLIC / FRIENDS / PRIVATE
   - 특정 산책 기록 및 사진을 앨범 단위로 공유/공개할 수 있도록 구조 설계

---

## 5.2 주요 엔티티 및 속성 (개정 버전)

### User
| 필드명           | 타입        | 설명                                 |
|------------------|-------------|--------------------------------------|
| id               | BIGINT PK   | 사용자 ID                            |
| email            | VARCHAR     | 이메일 (옵션, SNS만 사용하는 경우 null) |
| oauth_provider   | VARCHAR     | SNS 종류(kakao/google/apple 등)      |
| oauth_id         | VARCHAR     | SNS 고유 ID                          |
| nickname         | VARCHAR     | 닉네임                               |
| gender           | VARCHAR     | 성별(옵션)                           |
| birth_year       | INT         | 출생 연도(옵션)                      |
| main_location    | VARCHAR     | 주요 활동 지역                       |
| profile_image_url| VARCHAR     | **사용자 프로필 이미지 URL (채팅 등에서 노출)** |
| gold_balance     | INT         | 보유 Gold                            |
| created_at       | TIMESTAMP   | 생성일                               |
| updated_at       | TIMESTAMP   | 수정일                               |

---

### PetSpecies (펫 종 – 개/고양이/조류/파충류 등)
| 필드명       | 타입        | 설명                           |
|--------------|-------------|--------------------------------|
| id           | BIGINT PK   | Species ID                     |
| code         | VARCHAR     | DOG/CAT/BIRD/REPTILE 등 코드   |
| name         | VARCHAR     | 종 이름(개, 고양이, 앵무새 등) |
| description  | TEXT        | 설명(옵션)                     |
| is_active    | BOOLEAN     | 사용 여부                      |

---

### PetBreed (품종)
| 필드명       | 타입        | 설명                                     |
|--------------|-------------|------------------------------------------|
| id           | BIGINT PK   | Breed ID                                 |
| species_id   | BIGINT FK   | PetSpecies FK                            |
| name         | VARCHAR     | 품종 이름(리트리버, 시바, 코뉴어 등)     |
| description  | TEXT        | 설명(옵션)                               |
| is_active    | BOOLEAN     | 사용 여부                                |

---

### Pet (기본 펫 정보)
| 필드명       | 타입        | 설명                               |
|--------------|-------------|------------------------------------|
| id           | BIGINT PK   | 반려동물 ID                        |
| user_id      | BIGINT FK   | 소유자 User FK                     |
| species_id   | BIGINT FK   | 종(PetSpecies)                     |
| breed_id     | BIGINT FK   | 품종(PetBreed, 없으면 null 가능)   |
| name         | VARCHAR     | 이름                               |
| gender       | VARCHAR     | 성별                               |
| birth_date   | DATE        | 생일/추정일                        |
| main_photo_url | VARCHAR   | 대표 사진 URL                      |
| is_active    | BOOLEAN     | 활성 여부                          |
| created_at   | TIMESTAMP   | 생성일                             |
| updated_at   | TIMESTAMP   | 수정일                             |

---

### PetProfileDetail (펫 상세 프로필 – 자주 쓰는 공통 속성)
| 필드명         | 타입        | 설명                        |
|----------------|-------------|-----------------------------|
| id             | BIGINT PK   | 상세 ID                     |
| pet_id         | BIGINT FK   | Pet FK                      |
| weight_kg      | DECIMAL     | 체중                        |
| neutered       | BOOLEAN     | 중성화 여부                 |
| color          | VARCHAR     | 털/피부 색 정보             |
| pattern        | VARCHAR     | 무늬 정보(줄무늬, 점박이 등)|
| temperament    | VARCHAR     | 성격 요약                   |
| medical_notes  | TEXT        | 건강 특이사항               |
| microchip_id   | VARCHAR     | 마이크로칩 ID(있을 경우)    |
| adoption_date  | DATE        | 입양일(옵션)                |

> 💡 추가적으로 각 종/품종마다 다른 필드를 더 세밀하게 관리해야 할 경우,  
> 향후 **PetAttributeDefinition / PetAttributeValue** 구조를 추가하여 확장 가능하도록 열어둔다.

---

### WalkAlbum (산책 앨범 – 개인별/테마별 그룹)
| 필드명         | 타입        | 설명                                         |
|----------------|-------------|----------------------------------------------|
| id             | BIGINT PK   | 앨범 ID                                      |
| user_id        | BIGINT FK   | 앨범 소유자                                  |
| title          | VARCHAR     | 앨범 제목                                    |
| description    | TEXT        | 앨범 설명                                    |
| cover_photo_url| VARCHAR     | 앨범 커버 사진(대표 사진)                   |
| visibility     | VARCHAR     | PUBLIC / FRIENDS / PRIVATE                  |
| created_at     | TIMESTAMP   | 생성일                                       |
| updated_at     | TIMESTAMP   | 수정일                                       |

※ FRIENDS 는 **현재 매칭된 사용자 또는 향후 친구 관계**를 의미하도록 정의.

---

### WalkRecord (산책 기록, 앨범/공개 범위 포함)
| 필드명        | 타입        | 설명                                         |
|---------------|-------------|----------------------------------------------|
| id            | BIGINT PK   | 산책 기록 ID                                 |
| user_id       | BIGINT FK   | 사용자 ID                                    |
| pet_id        | BIGINT FK   | 대표 반려동물 ID                             |
| album_id      | BIGINT FK   | 포함된 앨범(WalkAlbum) ID, 없으면 null      |
| title         | VARCHAR     | 산책 제목                                    |
| distance_m    | INT         | 이동 거리(m)                                 |
| duration_sec  | INT         | 산책 시간(초)                                |
| user_calorie  | INT         | 사용자 칼로리                                |
| pet_calorie   | INT         | 반려동물 칼로리                              |
| started_at    | TIMESTAMP   | 시작 시각                                    |
| ended_at      | TIMESTAMP   | 종료 시각                                    |
| route_geojson | JSON        | 경로 데이터(GeoJSON 등)                      |
| visibility    | VARCHAR     | PUBLIC / FRIENDS / PRIVATE                  |
| created_at    | TIMESTAMP   | 생성일                                       |
| updated_at    | TIMESTAMP   | 수정일                                       |

---

### WalkSpot (산책 중 Spot – 사진/메모)
| 필드명       | 타입        | 설명                    |
|--------------|-------------|-------------------------|
| id           | BIGINT PK   | Spot ID                 |
| walk_id      | BIGINT FK   | WalkRecord FK           |
| latitude     | DECIMAL     | 위도                    |
| longitude    | DECIMAL     | 경도                    |
| photo_url    | VARCHAR     | 사진 URL                |
| memo         | TEXT        | 메모                    |
| taken_at     | TIMESTAMP   | 촬영 시각               |

---

### FileAttachment (채팅/커뮤니티/산책 등에서 공통 사용 가능한 파일)
| 필드명        | 타입        | 설명                                       |
|---------------|-------------|--------------------------------------------|
| id            | BIGINT PK   | 파일 ID                                    |
| uploader_id   | BIGINT FK   | 업로더 User FK                             |
| file_type     | VARCHAR     | IMAGE / VIDEO / DOCUMENT / AUDIO / OTHER   |
| mime_type     | VARCHAR     | MIME 타입                                  |
| url           | VARCHAR     | 실제 파일 URL(S3 등)                        |
| thumbnail_url | VARCHAR     | 썸네일 URL(이미지/영상일 경우)             |
| size_bytes    | BIGINT      | 파일 크기                                  |
| created_at    | TIMESTAMP   | 업로드 일자                                |

> 이 엔티티는 채팅 메시지 뿐 아니라, 커뮤니티 게시글 이미지, 산책 앨범 커버 등에도 재사용 가능.

---

### EmoticonPack (이모티콘/스티커 패키지)
| 필드명        | 타입        | 설명                         |
|---------------|-------------|------------------------------|
| id            | BIGINT PK   | 패키지 ID                    |
| name          | VARCHAR     | 패키지 이름                  |
| description   | TEXT        | 설명                         |
| is_premium    | BOOLEAN     | 유료 여부                    |
| price_gold    | INT         | 유료일 경우 Gold 가격        |
| created_at    | TIMESTAMP   | 생성일                       |

### Emoticon
| 필드명        | 타입        | 설명                          |
|---------------|-------------|-------------------------------|
| id            | BIGINT PK   | 이모티콘 ID                   |
| pack_id       | BIGINT FK   | EmoticonPack FK               |
| code          | VARCHAR     | 식별 코드                     |
| image_url     | VARCHAR     | 이미지 URL                    |
| is_animated   | BOOLEAN     | 애니메이션 여부(GIF/Lottie 등)|
| created_at    | TIMESTAMP   | 생성일                        |

> 추후, 유료 이모티콘/스티커 상점에 활용 가능.

---

### Match (변경 없음, 개략)
| 필드명           | 타입        | 설명                           |
|------------------|-------------|--------------------------------|
| id               | BIGINT PK   | 매칭 ID                        |
| user_id          | BIGINT FK   | 요청자                         |
| target_user_id   | BIGINT FK   | 대상 사용자                    |
| status           | VARCHAR     | REQUESTED / ACCEPTED / REJECTED|
| created_at       | TIMESTAMP   | 생성일                         |
| updated_at       | TIMESTAMP   | 수정일                         |

---

### ChatRoom / ChatParticipant (변경 없음)

---

### ChatMessage (파일/이모티콘/이모지 확장 포함)
| 필드명           | 타입        | 설명                                              |
|------------------|-------------|---------------------------------------------------|
| id               | BIGINT PK   | 메시지 ID                                         |
| chatroom_id      | BIGINT FK   | 채팅방 FK                                         |
| sender_id        | BIGINT FK   | 발신자 User FK                                    |
| message_type     | VARCHAR     | TEXT / FILE / EMOTICON / SYSTEM 등                |
| content          | TEXT        | 텍스트 내용 또는 시스템 메시지 내용               |
| file_attachment_id | BIGINT FK | FileAttachment FK (파일이 있는 경우)             |
| emoticon_id      | BIGINT FK   | Emoticon FK(스티커/이모티콘일 경우)              |
| emoji_unicode    | VARCHAR     | 일반 이모지(유니코드) 표현                       |
| reply_to_message_id | BIGINT FK| 답장 대상 메시지 ID(선택)                         |
| created_at       | TIMESTAMP   | 전송 시각                                         |

> 채팅 UI에서 각 메시지 좌측에 `User.profile_image_url`을 사용해 프로필 이미지 노출 가능.

---

### CommunityPost / CommunityComment / GoldTransaction / Notification

- 기본 구조는 v1.2와 동일하되,  
  CommunityPost의 이미지 역시 `FileAttachment`를 활용하도록 설계 가능.

---

## 5.3 관계(개선된 관계)

- User 1 ── * Pet  
- Pet 1 ── 1 PetProfileDetail  
- PetSpecies 1 ── * PetBreed  
- PetSpecies 1 ── * Pet  
- User 1 ── * WalkAlbum  
- WalkAlbum 1 ── * WalkRecord  
- WalkRecord 1 ── * WalkSpot  
- User 1 ── * FileAttachment  
- FileAttachment 1 ── * ChatMessage (optional, 참조 형태)  
- EmoticonPack 1 ── * Emoticon  
- ChatRoom 1 ── * ChatParticipant ── * User  
- ChatRoom 1 ── * ChatMessage  
- User 1 ── * CommunityPost  
- CommunityPost 1 ── * CommunityComment  
- User 1 ── * GoldTransaction  
- User 1 ── * Notification  

---

# 6. API 설계서 변경/추가 (v1.3 반영)

## 6.1 Walk & 앨범 공개 범위 관련

### POST /api/v1/walk-albums
- 설명: 산책 앨범 생성
- 요청:
  - title
  - description
  - coverPhotoFileId (옵션, FileAttachment ID)
  - visibility: PUBLIC / FRIENDS / PRIVATE
- 응답: 생성된 WalkAlbum 정보

### GET /api/v1/walk-albums
- 설명: 내 앨범 목록 조회

### GET /api/v1/walk-albums/{albumId}
- 설명: 앨범 상세 조회 (앨범에 포함된 WalkRecord 목록 포함)

---

### POST /api/v1/walks
- 설명: 산책 기록 생성
- 요청:
  - petId
  - albumId (옵션, 앨범에 포함할 경우)
  - title
  - distanceM
  - durationSec
  - userCalorie
  - petCalorie
  - routeGeoJson
  - startedAt
  - endedAt
  - visibility: PUBLIC / FRIENDS / PRIVATE
- 응답: WalkRecord 정보

### PUT /api/v1/walks/{walkId}
- 설명: 산책 기록 수정(특히 visibility, title, albumId 변경 가능)

### GET /api/v1/walks/public
- 설명: 공개(PUBLIC)된 산책 코스/앨범 중 일부를 추천/검색 용으로 조회

---

## 6.2 파일 업로드 (채팅/커뮤니티/앨범 공용)

### POST /api/v1/files/upload
- 설명: 단일 파일 업로드 (이미지, 동영상, 문서 등)
- 요청: multipart/form-data
  - file
  - type(optional): IMAGE / VIDEO / DOCUMENT / AUDIO / OTHER
- 응답:
  - id (FileAttachment ID)
  - url
  - thumbnailUrl (있다면)
  - fileType, mimeType, sizeBytes

> 이후 ChatMessage, CommunityPost, WalkAlbum 등에 `fileAttachmentId` 또는 `imageAttachmentIds`로 연결.

---

## 6.3 채팅 API 확장

### POST /api/v1/chat/rooms/{roomId}/messages
- 설명: 채팅 메시지 전송
- 요청:
  - messageType: TEXT / FILE / EMOTICON / SYSTEM
  - content: 텍스트 내용(텍스트/시스템일 때)
  - fileAttachmentId: 파일 메시지인 경우
  - emoticonId: 이모티콘 메시지인 경우
  - emojiUnicode: 단일 이모지(유니코드)인 경우
  - replyToMessageId: 답장 대상 메시지가 있을 경우

> WebSocket으로도 같은 payload 구조를 사용해 송/수신.

---

## 6.4 이모티콘 관련(향후 유료 모델 대비)

### GET /api/v1/emoticon/packs
- 설명: 사용 가능한 이모티콘 패키지 목록 조회

### GET /api/v1/emoticon/packs/{packId}
- 설명: 해당 패키지에 포함된 이모티콘 목록 조회

### POST /api/v1/emoticon/packs/{packId}/purchase
- 설명: Gold를 소모하여 유료 이모티콘 패키지 구매
- 요청: 없음
- 응답: 구매 성공 여부 및 사용자 잔액

> 구매한 패키지는 클라이언트에서 로컬 캐싱 후 채팅 입력 UI에 노출.

---

## 6.5 User 프로필 이미지 관련

### PUT /api/v1/users/me/profile-image
- 설명: 사용자 프로필 이미지 설정/변경
- 요청:
  - fileId (FileAttachment ID)
- 응답:
  - profileImageUrl

> 채팅, 커뮤니티, 친구찾기 리스트 등에서 `User.profile_image_url`을 사용해 노출.

---

# 7. Flutter 프로젝트 구조 (변경 포인트)

기본 구조는 v1.2와 동일하나, 다음과 같은 **도메인/기능 추가를 반영한다.**

## 7.1 새 Feature 모듈 제안

### `features/walk_album/`
- pages:
  - `walk_album_list_page.dart`
  - `walk_album_detail_page.dart`
  - `walk_album_edit_page.dart`
- state:
  - `walk_album_notifier.dart`
- domain:
  - `entities/walk_album.dart`
  - `usecases/get_walk_albums.dart`, `create_walk_album.dart`
- data:
  - `walk_album_remote_data_source.dart`
  - `walk_album_repository_impl.dart`

### `features/files/`
- `file_upload_service.dart`
- `file_picker_helper.dart`
- `file_attachment_model.dart`

### `features/emoticon/`
- pages:
  - `emoticon_store_page.dart` (이모티콘 상점, 추후)
- state:
  - `emoticon_store_notifier.dart`
- data:
  - `emoticon_remote_data_source.dart`

### 채팅 UI 확장
- `chat_message_bubble.dart`에서:
  - 텍스트 / 파일 / 이모티콘 / 이모지 타입에 따라 다른 위젯 렌더링
  - 좌측에 `User.profileImageUrl`을 CircleAvatar로 표시
- 파일 메시지:
  - 이미지/영상은 썸네일 미리보기
  - 문서는 아이콘 + 파일명

---

# 8. 정리

이번 v1.3에서 특히 중요하게 반영된 부분:

1. **펫 도메인의 확장성**  
   - 종/품종을 별도 테이블로 분리  
   - 펫 상세 정보 분리 및 향후 속성 확장 가능 구조

2. **채팅 경험 강화**  
   - 파일 주고받기 구조 설계 (이미지/영상/문서 등)  
   - 이모티콘/스티커/이모지 지원 → 추후 유료 모델로 확장 가능한 구조  
   - User 프로필 이미지가 채팅 UI에서 활용되도록 User 필드 확장

3. **산책 기록의 소셜/콘텐츠화**  
   - WalkAlbum 개념 추가 → 앨범 단위로 코스, 사진, 기록을 모으고  
   - 각 앨범/산책에 공개 범위(공개/친구만/비공개) 설정 가능  
   - 이후 앨범/산책 공유, 추천 피드, 친구끼리 코스 공유 등으로 자연스럽게 확장 가능

---

이 파일은 **GoldPet의 v1.3 ERD/도메인 구조 기준 문서**로 삼을 수 있다.  
(실제 DB 마이그레이션, OpenAPI, Flutter 코드 생성 시 기준 스펙으로 사용 가능)
