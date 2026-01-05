-- Create Pet Attributes Table
CREATE TABLE pet_attributes (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    input_type VARCHAR(50) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    options JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_pet_attributes_code UNIQUE (code)
);
-- Seed Initial Data (Traits)
INSERT INTO pet_attributes (
        category,
        code,
        name,
        input_type,
        display_order,
        options
    )
VALUES (
        'TRAIT',
        'Activity',
        '활동성',
        'SELECT',
        1,
        '[{"label":"매우 높음","value":"VeryHigh"},{"label":"높음","value":"High"},{"label":"보통","value":"Normal"},{"label":"낮음","value":"Low"}]'
    ),
    (
        'TRAIT',
        'Friendliness',
        '친화력',
        'SELECT',
        2,
        '[{"label":"매우 높음","value":"VeryHigh"},{"label":"높음","value":"High"},{"label":"보통","value":"Normal"},{"label":"낮음","value":"Low"}]'
    ),
    (
        'TRAIT',
        'Training',
        '훈련도',
        'SELECT',
        3,
        '[{"label":"잘함","value":"Good"},{"label":"보통","value":"Average"},{"label":"미흡","value":"Poor"}]'
    ),
    (
        'TRAIT',
        'Barking',
        '짖음',
        'SELECT',
        4,
        '[{"label":"거의 없음","value":"Rare"},{"label":"가끔","value":"Occasional"},{"label":"자주","value":"Frequent"}]'
    ),
    ('TRAIT', 'Note', '특이사항', 'TEXT', 5, NULL);
-- Seed Initial Data (Interests)
INSERT INTO pet_attributes (
        category,
        code,
        name,
        input_type,
        display_order,
        options
    )
VALUES (
        'INTEREST',
        'Toy',
        '장난감 놀이',
        'SELECT',
        1,
        '[{"label":"좋아함","value":"Like"},{"label":"싫어함","value":"Dislike"}]'
    ),
    (
        'INTEREST',
        'Walk',
        '산책',
        'SELECT',
        2,
        '[{"label":"좋아함","value":"Like"},{"label":"싫어함","value":"Dislike"}]'
    ),
    (
        'INTEREST',
        'Lifespan',
        '수명',
        'SELECT',
        3,
        '[{"label":"김","value":"Long"},{"label":"짧음","value":"Short"}]'
    ),
    (
        'INTEREST',
        'Petting',
        '쓰다듬기',
        'SELECT',
        4,
        '[{"label":"좋아함","value":"Like"},{"label":"싫어함","value":"Dislike"}]'
    );
-- Seed Initial Data (Allergies)
INSERT INTO pet_attributes (
        category,
        code,
        name,
        input_type,
        display_order,
        options
    )
VALUES (
        'ALLERGY',
        'AllergyNuts',
        '견과류',
        'SELECT',
        1,
        '[{"label":"있음","value":"Yes"},{"label":"없음","value":"No"}]'
    ),
    (
        'ALLERGY',
        'AllergyShellfish',
        '갑각류',
        'SELECT',
        2,
        '[{"label":"있음","value":"Yes"},{"label":"없음","value":"No"}]'
    ),
    (
        'ALLERGY',
        'AllergyEggMeat',
        '달걀&육류',
        'SELECT',
        3,
        '[{"label":"있음","value":"Yes"},{"label":"없음","value":"No"}]'
    ),
    (
        'ALLERGY',
        'AllergyOther',
        '기타',
        'SELECT',
        4,
        '[{"label":"있음","value":"Yes"},{"label":"없음","value":"No"}]'
    );