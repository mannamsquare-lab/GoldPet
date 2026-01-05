-- Migrate Pet Attributes Schema to V2 (Overhaul)
-- 1. Clear existing attributes (We will re-seed completely)
DELETE FROM pet_attributes;
-- 2. Seed Personality (TRAIT)
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
        '[{"label":"에너자이저 (지치지 않음)","value":"ENERGIZER"},{"label":"활발함 (호기심 많음)","value":"ACTIVE"},{"label":"보통 (적당한 활동)","value":"NORMAL"},{"label":"얌전함 (차분함)","value":"CALM"},{"label":"매우 정적 (주로 휴식)","value":"STATIC"}]'
    ),
    (
        'TRAIT',
        'Friendliness',
        '사회성/친화력',
        'SELECT',
        2,
        '[{"label":"모두의 친구","value":"SOCIAL"},{"label":"사람 중심","value":"PEOPLE_ONLY"},{"label":"선택적 친화력","value":"SELECTIVE"},{"label":"낯가림 있음","value":"SHY"},{"label":"독립적 (혼자 즐김)","value":"INDEPENDENT"}]'
    ),
    (
        'TRAIT',
        'Training',
        '훈련 상태',
        'SELECT',
        3,
        '[{"label":"전문 교육 수료","value":"PROFESSIONAL"},{"label":"기본 매너 숙지","value":"BASIC"},{"label":"현재 교육 중","value":"TRAINING"},{"label":"자유로운 영혼","value":"FREE_SPIRIT"}]'
    ),
    (
        'TRAIT',
        'Barking',
        '소음(짖음) 수준',
        'SELECT',
        4,
        '[{"label":"표현이 풍부함","value":"VOCAL"},{"label":"필요할 때만","value":"NECESSARY"},{"label":"거의 없음","value":"QUIET"}]'
    ),
    ('TRAIT', 'Note', '특이사항', 'TEXT', 5, NULL);
-- 3. Seed Interests (INTEREST)
-- Toy, Walk, Petting, Friendship (Replaces Lifespan)
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
        '[{"label":"장난감 마니아","value":"MANIA"},{"label":"즐겨 노는 편","value":"LIKE"},{"label":"보통","value":"NORMAL"},{"label":"관심 낮음","value":"DISLIKE"}]'
    ),
    (
        'INTEREST',
        'Walk',
        '야외 활동 (산책)',
        'SELECT',
        2,
        '[{"label":"산책 중독","value":"ADDICTED"},{"label":"산책을 즐김","value":"ENJOY"},{"label":"적당히 즐김","value":"MODERATE"},{"label":"실내파","value":"INDOOR"}]'
    ),
    (
        'INTEREST',
        'Petting',
        '스킨십',
        'SELECT',
        3,
        '[{"label":"애교쟁이","value":"LOVER"},{"label":"스킨십 선호","value":"LIKE"},{"label":"적당히 수용","value":"ACCEPT"},{"label":"개인 공간 중시","value":"PRIVATE"}]'
    ),
    (
        'INTEREST',
        'Friendship',
        '친구 관계',
        'SELECT',
        4,
        '[{"label":"적극적인 사교가","value":"SOCIAL"},{"label":"매너 있는 관계","value":"MANNER"},{"label":"조심스러운 만남","value":"CAREFUL"},{"label":"외골수","value":"LONER"}]'
    );
-- 4. Seed Allergies (ALLERGY)
-- Meat, DairyEgg, Grain, Other
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
        'AllergyMeat',
        '육류 (닭/소/돼지 등)',
        'SELECT',
        1,
        '[{"label":"있음","value":"YES"},{"label":"없음","value":"NO"},{"label":"모름","value":"UNKNOWN"}]'
    ),
    (
        'ALLERGY',
        'AllergyDairyEgg',
        '유제품/알',
        'SELECT',
        2,
        '[{"label":"있음","value":"YES"},{"label":"없음","value":"NO"},{"label":"모름","value":"UNKNOWN"}]'
    ),
    (
        'ALLERGY',
        'AllergyGrain',
        '곡물 (밀가루/콩 등)',
        'SELECT',
        3,
        '[{"label":"있음","value":"YES"},{"label":"없음","value":"NO"},{"label":"모름","value":"UNKNOWN"}]'
    ),
    (
        'ALLERGY',
        'AllergyOther',
        '기타 (견과류/과일 등)',
        'SELECT',
        4,
        '[{"label":"있음","value":"YES"},{"label":"없음","value":"NO"},{"label":"모름","value":"UNKNOWN"}]'
    );