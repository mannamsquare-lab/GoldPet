-- Ensure 'test@goldpet.com' has location, active status, and is visible
UPDATE users
SET main_location_geom = ST_SetSRID(ST_MakePoint(127.0276, 37.4979), 4326),
    -- Gangnam Station
    is_active = true,
    has_pet = true
WHERE email = 'test@goldpet.com';
-- Ensure 'sungchuli@naver.com' has location, active status, and is visible
UPDATE users
SET main_location_geom = ST_SetSRID(ST_MakePoint(127.0280, 37.4980), 4326),
    -- Very close to Gangnam Station
    is_active = true,
    has_pet = true
WHERE email = 'sungchuli@naver.com';
-- Insert Pet for 'test@goldpet.com' if not exists
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
    '테스트멍1',
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
    5.0,
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1',
    '활발',
    NOW(),
    NOW()
FROM users
WHERE email = 'test@goldpet.com'
    AND NOT EXISTS (
        SELECT 1
        FROM pets
        WHERE owner_user_id = users.id
    );
-- Insert Pet for 'sungchuli@naver.com' if not exists
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
    '성철이멍',
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
    '2021-05-05',
    'FEMALE',
    true,
    4.0,
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e',
    '귀여움',
    NOW(),
    NOW()
FROM users
WHERE email = 'sungchuli@naver.com'
    AND NOT EXISTS (
        SELECT 1
        FROM pets
        WHERE owner_user_id = users.id
    );