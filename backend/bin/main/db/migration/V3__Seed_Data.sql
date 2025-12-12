-- V2__Seed_Data.sql
-- This file contains the initial data for the GoldPet service.

-- 1. Pet Species
INSERT INTO pet_species (code, name, description) VALUES
('DOG', '개', '모든 종류의 개'),
('CAT', '고양이', '모든 종류의 고양이'),
('BIRD', '조류', '모든 종류의 새'),
('REPTILE', '파충류', '모든 종류의 파충류'),
('OTHER', '기타', '기타 반려동물');

-- 2. Pet Breeds (Example Data)
-- Dogs
INSERT INTO pet_breeds (species_id, name) VALUES
((SELECT id FROM pet_species WHERE code = 'DOG'), '골든 리트리버'),
((SELECT id FROM pet_species WHERE code = 'DOG'), '시바견'),
((SELECT id FROM pet_species WHERE code = 'DOG'), '푸들'),
((SELECT id FROM pet_species WHERE code = 'DOG'), '포메라니안'),
((SELECT id FROM pet_species WHERE code = 'DOG'), '믹스견');

-- Cats
INSERT INTO pet_breeds (species_id, name) VALUES
((SELECT id FROM pet_species WHERE code = 'CAT'), '코리안 숏헤어'),
((SELECT id FROM pet_species WHERE code = 'CAT'), '러시안 블루'),
((SELECT id FROM pet_species WHERE code = 'CAT'), '페르시안'),
((SELECT id FROM pet_species WHERE code = 'CAT'), '샴');

-- 3. Community Categories
INSERT INTO community_categories (code, name) VALUES
('WALK', '산책 자랑'),
('HEALTH', '건강 정보'),
('INFO', '정보 공유'),
('QUESTION', '질문 있어요'),
('SHOWOFF', '내새꾸 자랑');

-- 4. Badges (Example Data)
INSERT INTO badges (code, name, description, image_url) VALUES
('FIRST_WALK', '첫 산책의 감동', '첫 산책 기록을 완료하여 획득하는 뱃지입니다.', 'https://example.com/badges/first_walk.png'),
('WALK_10KM', '지구력 짱', '누적 산책 거리 10km를 달성하여 획득하는 뱃지입니다.', 'https://example.com/badges/walk_10km.png'),
('FIRST_FRIEND', '첫 친구', '첫 친구 매칭에 성공하여 획득하는 뱃지입니다.', 'https://example.com/badges/first_friend.png'),
('COMMUNITY_STAR', '커뮤니티 스타', '첫 커뮤니티 게시글을 작성하여 획득하는 뱃지입니다.', 'https://example.com/badges/community_star.png');

-- 5. Challenges (Example Data)
INSERT INTO challenges (title, description, goal_type, goal_value, reward_gold, start_date, end_date) VALUES
('WEEKLY_WALK_3DAYS', '주 3일 산책 챌린지', 'WALK_DAY_COUNT', 3, 100, '2025-01-01 00:00:00', '2099-12-31 23:59:59'),
('MONTHLY_DISTANCE_50KM', '월간 50km 걷기', 'WALK_DISTANCE_TOTAL', 50000, 500, '2025-01-01 00:00:00', '2099-12-31 23:59:59');

-- 6. Places (Example Data)
INSERT INTO places (name, category, address, location_geom) VALUES
('서울숲', 'PARK', '서울 성동구 뚝섬로 273', ST_SetSRID(ST_MakePoint(127.0374, 37.5443), 4326)),
('올림픽공원', 'PARK', '서울 송파구 올림픽로 424', ST_SetSRID(ST_MakePoint(127.1213, 37.5213), 4326));
