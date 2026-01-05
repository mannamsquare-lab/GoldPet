-- 1. Schema Change: Add 'category' column
ALTER TABLE pet_breeds
ADD COLUMN category VARCHAR(100);
-- 2. Data Migration:
--    Since we are replacing the entire classification system,
--    we effectively clear existing mapping (by setting breed_id to NULL on pets)
--    and then restart the breed data.
-- Detach existing pets from breeds (to avoid FK violation when clearing)
UPDATE pets
SET breed_id = NULL;
-- Dependencies: if there are other tables referencing pet_breeds
-- (Check user_badges, challenges? No strict FK to breed_id except pets table check)
-- If strictly enforcing, we might need to be careful, but currently only pets.breed_id references it.
-- Clear all existing breeds and species to restart ID sequence or just clear content
TRUNCATE TABLE pet_breeds RESTART IDENTITY CASCADE;
TRUNCATE TABLE pet_species RESTART IDENTITY CASCADE;
-- 3. Seed New Data
-- (1) SPECIES
INSERT INTO pet_species (id, code, name, description)
VALUES (1, 'DOG', '강아지', '대표 반려동물 개'),
    (2, 'CAT', '고양이', '대표 반려동물 고양이'),
    (3, 'BIRD', '새/조류', '앵무새 등 조류'),
    (4, 'REPTILE', '파충류', '도마뱀, 뱀, 거북 등'),
    (5, 'OTHER', '기타', '소형 포유류, 양서류, 관상어 등');
-- (2) BREEDS with Categories
-- ============ 1. DOG (id=1) ============
-- 소형견
INSERT INTO pet_breeds (species_id, category, name, description)
VALUES (1, '소형견', '푸들(토이)', NULL),
    (1, '소형견', '말티즈', NULL),
    (1, '소형견', '포메라니안', NULL),
    (1, '소형견', '치와와', NULL),
    (1, '소형견', '시츄', NULL),
    (1, '소형견', '요크셔테리어', NULL),
    (1, '소형견', '비숑 프리제', NULL);
-- 중형견
INSERT INTO pet_breeds (species_id, category, name, description)
VALUES (1, '중형견', '웰시코기', NULL),
    (1, '중형견', '비글', NULL),
    (1, '중형견', '코카 스파니엘', NULL),
    (1, '중형견', '불독', NULL),
    (1, '중형견', '시바견', NULL),
    (1, '중형견', '스피츠', NULL),
    (1, '중형견', '푸들(미니어처)', NULL);
-- 대형견
INSERT INTO pet_breeds (species_id, category, name, description)
VALUES (1, '대형견', '골든 리트리버', NULL),
    (1, '대형견', '래브라도 리트리버', NULL),
    (1, '대형견', '저먼 셰퍼드', NULL),
    (1, '대형견', '사모예드', NULL),
    (1, '대형견', '허스키', NULL),
    (1, '대형견', '도베르만', NULL);
-- 국내 견종
INSERT INTO pet_breeds (species_id, category, name, description)
VALUES (1, '국내 견종', '진돗개', NULL),
    (1, '국내 견종', '삽살개', NULL),
    (1, '국내 견종', '풍산개', NULL);
-- 기타 (믹스 등) -> Top Priority for UX usually handled by sorting, here just inserting
INSERT INTO pet_breeds (species_id, category, name, description)
VALUES (1, '기타', '믹스견', '품종을 정할 수 없거나 혼합된 경우'),
    (1, '기타', '기타(직접 입력)', '목록에 없는 경우');
-- ============ 2. CAT (id=2) ============
-- 단모종
INSERT INTO pet_breeds (species_id, category, name, description)
VALUES (2, '단모종', '코리안 숏헤어', NULL),
    (2, '단모종', '러시안 블루', NULL),
    (2, '단모종', '샴', NULL),
    (2, '단모종', '아비시니안', NULL),
    (2, '단모종', '브리티시 숏헤어', NULL),
    (2, '단모종', '뱅갈', NULL),
    (2, '단모종', '스코티시 폴드', NULL);
-- 장모종
INSERT INTO pet_breeds (species_id, category, name, description)
VALUES (2, '장모종', '페르시안', NULL),
    (2, '장모종', '렉돌', NULL),
    (2, '장모종', '메인쿤', NULL),
    (2, '장모종', '노르웨이 숲', NULL),
    (2, '장모종', '터키쉬 앙고라', NULL),
    (2, '장모종', '셀커크 렉스', NULL);
-- 특이종
INSERT INTO pet_breeds (species_id, category, name, description)
VALUES (2, '특이종', '스핑크스(무모)', NULL),
    (2, '특이종', '먼치킨(짧은 다리)', NULL);
-- 기타
INSERT INTO pet_breeds (species_id, category, name, description)
VALUES (2, '기타', '믹스묘', '품종을 정할 수 없거나 혼합된 경우'),
    (2, '기타', '기타(직접 입력)', '목록에 없는 경우');
-- ============ 3. BIRD (id=3) ============
-- 소형 앵무
INSERT INTO pet_breeds (species_id, category, name, description)
VALUES (3, '소형 앵무', '사랑앵무(잉꼬)', NULL),
    (3, '소형 앵무', '모란앵무', NULL),
    (3, '소형 앵무', '문조', NULL),
    (3, '소형 앵무', '카나리아', NULL),
    (3, '소형 앵무', '십자매', NULL);
-- 중형 앵무
INSERT INTO pet_breeds (species_id, category, name, description)
VALUES (3, '중형 앵무', '왕관앵무', NULL),
    (3, '중형 앵무', '코뉴어', NULL),
    (3, '중형 앵무', '퀘이커', NULL),
    (3, '중형 앵무', '카이큐', NULL);
-- 대형 앵무
INSERT INTO pet_breeds (species_id, category, name, description)
VALUES (3, '대형 앵무', '금강앵무(마카우)', NULL),
    (3, '대형 앵무', '유황앵무(코카투)', NULL),
    (3, '대형 앵무', '회색앵무', NULL),
    (3, '대형 앵무', '아마존앵무', NULL);
-- 기타
INSERT INTO pet_breeds (species_id, category, name, description)
VALUES (3, '기타', '닭', NULL),
    (3, '기타', '메추리', NULL),
    (3, '기타', '오리', NULL),
    (3, '기타', '기타(직접 입력)', NULL);
-- ============ 4. REPTILE (id=4) ============
-- 도마뱀
INSERT INTO pet_breeds (species_id, category, name, description)
VALUES (4, '도마뱀', '크레스티드 게코', NULL),
    (4, '도마뱀', '레오파드 게코', NULL),
    (4, '도마뱀', '비어디 드래곤', NULL),
    (4, '도마뱀', '블루텅 스킨크', NULL),
    (4, '도마뱀', '이구아나', NULL),
    (4, '도마뱀', '모니터', NULL);
-- 뱀
INSERT INTO pet_breeds (species_id, category, name, description)
VALUES (4, '뱀', '볼 파이톤', NULL),
    (4, '뱀', '콘 스네이크', NULL),
    (4, '뱀', '킹 스네이크', NULL),
    (4, '뱀', '밀크 스네이크', NULL);
-- 거북
INSERT INTO pet_breeds (species_id, category, name, description)
VALUES (4, '거북', '육지거북(레오파드, 설카타)', NULL),
    (4, '거북', '수생거북(남생이, 테라핀, 슬라이더)', NULL);
-- 기타
INSERT INTO pet_breeds (species_id, category, name, description)
VALUES (4, '기타', '카멜레온', NULL),
    (4, '기타', '기타(직접 입력)', NULL);
-- ============ 5. OTHER (id=5) ============
-- 소형 포유류
INSERT INTO pet_breeds (species_id, category, name, description)
VALUES (5, '소형 포유류', '햄스터(드워프, 골든)', NULL),
    (5, '소형 포유류', '토끼', NULL),
    (5, '소형 포유류', '기니피그', NULL),
    (5, '소형 포유류', '페럿', NULL),
    (5, '소형 포유류', '친칠라', NULL),
    (5, '소형 포유류', '다람쥐', NULL),
    (5, '소형 포유류', '고슴도치', NULL);
-- 양서류
INSERT INTO pet_breeds (species_id, category, name, description)
VALUES (5, '양서류', '팩맨 개구리', NULL),
    (5, '양서류', '화이트 트리 프로그', NULL),
    (5, '양서류', '우파루파(액솔로틀)', NULL),
    (5, '양서류', '뉴트', NULL);
-- 절지동물
INSERT INTO pet_breeds (species_id, category, name, description)
VALUES (5, '절지동물', '타란툴라', NULL),
    (5, '절지동물', '전갈', NULL),
    (5, '절지동물', '지네', NULL),
    (5, '절지동물', '사슴벌레', NULL),
    (5, '절지동물', '장수풍뎅이', NULL);
-- 관상어
INSERT INTO pet_breeds (species_id, category, name, description)
VALUES (5, '관상어', '구피', NULL),
    (5, '관상어', '베타', NULL),
    (5, '관상어', '금붕어', NULL),
    (5, '관상어', '디스커스', NULL),
    (5, '관상어', '해수어', NULL);