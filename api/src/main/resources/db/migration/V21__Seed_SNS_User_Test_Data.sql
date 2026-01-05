-- Give all users a default location (Gangnam Station) if they don't have one
UPDATE users
SET main_location_geom = ST_SetSRID(ST_MakePoint(127.0276, 37.4979), 4326),
    has_pet = true
WHERE main_location_geom IS NULL;
-- Insert a default pet for any user who doesn't have a pet yet
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
SELECT u.id,
    '테스트멍',
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
    -- Assuming '말티즈' exists from V18 or seeds
    '2022-01-01',
    'MALE',
    true,
    5.0,
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1',
    '테스트,활발',
    NOW(),
    NOW()
FROM users u
WHERE NOT EXISTS (
        SELECT 1
        FROM pets p
        WHERE p.owner_user_id = u.id
    );