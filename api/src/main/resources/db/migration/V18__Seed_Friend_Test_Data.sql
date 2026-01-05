-- Seed Test Users for Friend Finder
-- Password: 'password123'
-- Location: Gangnam Station (37.4979, 127.0276)
INSERT INTO users (
        email,
        password,
        name,
        nickname,
        phone_number,
        gender,
        birth_date,
        has_pet,
        profile_image_url,
        intro,
        created_at,
        updated_at,
        oauth_provider,
        oauth_id,
        gold_balance,
        is_active,
        is_notification_enabled,
        main_location_geom
    )
VALUES (
        'test_friend1@example.com',
        '$2a$10$YourHashedPasswordHere',
        'Friend One',
        '강남멍멍이',
        '010-1111-2222',
        'MALE',
        '1995-05-05',
        true,
        'https://images.unsplash.com/photo-1543466835-00a7907e9de1',
        '강남역 산책 메이트 구해요!',
        NOW(),
        NOW(),
        'EMAIL',
        'test_friend1_id',
        0,
        true,
        true,
        ST_SetSRID(ST_MakePoint(127.0280, 37.4980), 4326)
    ),
    (
        'test_friend2@example.com',
        '$2a$10$YourHashedPasswordHere',
        'Friend Two',
        '역삼냥이',
        '010-3333-4444',
        'FEMALE',
        '1998-08-08',
        true,
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba',
        '조용한 산책이 좋아요',
        NOW(),
        NOW(),
        'EMAIL',
        'test_friend2_id',
        0,
        true,
        true,
        ST_SetSRID(ST_MakePoint(127.0320, 37.4979), 4326)
    ),
    (
        'test_friend3@example.com',
        '$2a$10$YourHashedPasswordHere',
        'Friend Three',
        '도곡리트리버',
        '010-5555-6666',
        'MALE',
        '1990-01-01',
        true,
        'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6',
        '에너지 넘치는 리트리버입니다',
        NOW(),
        NOW(),
        'EMAIL',
        'test_friend3_id',
        0,
        true,
        true,
        ST_SetSRID(ST_MakePoint(127.0160, 37.4979), 4326)
    ),
    (
        'test_friend4@example.com',
        '$2a$10$YourHashedPasswordHere',
        'Friend Four',
        '논현푸들',
        '010-7777-8888',
        'FEMALE',
        '1996-12-25',
        true,
        'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e',
        '작고 귀여운 푸들',
        NOW(),
        NOW(),
        'EMAIL',
        'test_friend4_id',
        0,
        true,
        true,
        ST_SetSRID(ST_MakePoint(127.0000, 37.5000), 4326)
    ),
    (
        'test_friend5@example.com',
        '$2a$10$YourHashedPasswordHere',
        'Friend Five',
        '서초비숑',
        '010-9999-0000',
        'MALE',
        '1992-03-14',
        true,
        'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a',
        '비숑 타임!',
        NOW(),
        NOW(),
        'EMAIL',
        'test_friend5_id',
        0,
        true,
        true,
        ST_SetSRID(ST_MakePoint(127.0800, 37.5100), 4326)
    );
-- Seed Test Pets
INSERT INTO pets (
        owner_user_id,
        name,
        species_id,
        breed_id,
        birth_date,
        gender,
        is_neutered,
        weight_kg,
        profile_image_url,
        temperament_tags,
        created_at,
        updated_at
    )
SELECT id,
    '바둑이',
    (
        SELECT id
        FROM pet_species
        WHERE code = 'DOG'
    ),
    (
        SELECT id
        FROM pet_breeds
        WHERE name = '말티즈'
    ),
    '2020-01-01',
    'MALE',
    true,
    3.5,
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1',
    '신남,활발',
    NOW(),
    NOW()
FROM users
WHERE email = 'test_friend1@example.com';
INSERT INTO pets (
        owner_user_id,
        name,
        species_id,
        breed_id,
        birth_date,
        gender,
        is_neutered,
        weight_kg,
        profile_image_url,
        temperament_tags,
        created_at,
        updated_at
    )
SELECT id,
    '야옹이',
    (
        SELECT id
        FROM pet_species
        WHERE code = 'CAT'
    ),
    NULL,
    '2021-05-05',
    'FEMALE',
    true,
    4.2,
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba',
    '조용,낯가림',
    NOW(),
    NOW()
FROM users
WHERE email = 'test_friend2@example.com';
INSERT INTO pets (
        owner_user_id,
        name,
        species_id,
        breed_id,
        birth_date,
        gender,
        is_neutered,
        weight_kg,
        profile_image_url,
        temperament_tags,
        created_at,
        updated_at
    )
SELECT id,
    '인절미',
    (
        SELECT id
        FROM pet_species
        WHERE code = 'DOG'
    ),
    (
        SELECT id
        FROM pet_breeds
        WHERE name = '말티즈'
    ),
    '2019-11-20',
    'MALE',
    true,
    28.0,
    'https://images.unsplash.com/photo-1530281700549-e82e7bf110d6',
    '달리기,수영',
    NOW(),
    NOW()
FROM users
WHERE email = 'test_friend3@example.com';
INSERT INTO pets (
        owner_user_id,
        name,
        species_id,
        breed_id,
        birth_date,
        gender,
        is_neutered,
        weight_kg,
        profile_image_url,
        temperament_tags,
        created_at,
        updated_at
    )
SELECT id,
    '초코',
    (
        SELECT id
        FROM pet_species
        WHERE code = 'DOG'
    ),
    (
        SELECT id
        FROM pet_breeds
        WHERE name = '푸들(토이)'
    ),
    '2022-02-14',
    'FEMALE',
    false,
    3.0,
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e',
    '애교,호기심',
    NOW(),
    NOW()
FROM users
WHERE email = 'test_friend4@example.com';
INSERT INTO pets (
        owner_user_id,
        name,
        species_id,
        breed_id,
        birth_date,
        gender,
        is_neutered,
        weight_kg,
        profile_image_url,
        temperament_tags,
        created_at,
        updated_at
    )
SELECT id,
    '솜사탕',
    (
        SELECT id
        FROM pet_species
        WHERE code = 'DOG'
    ),
    (
        SELECT id
        FROM pet_breeds
        WHERE name = '말티즈'
    ),
    '2021-08-01',
    'MALE',
    true,
    5.5,
    'https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a',
    '웃음,하양',
    NOW(),
    NOW()
FROM users
WHERE email = 'test_friend5@example.com';