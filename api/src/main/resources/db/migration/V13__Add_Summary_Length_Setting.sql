INSERT INTO system_settings (
        setting_key,
        setting_value,
        description,
        created_at,
        updated_at
    )
VALUES (
        'COMMUNITY_POST_PREVIEW_LENGTH',
        '100',
        '커뮤니티 목록에서 보여줄 게시글 본문 길이 제한',
        NOW(),
        NOW()
    ),
    (
        'COMMUNITY_PAGE_SIZE',
        '20',
        '커뮤니티 목록 페이징 사이즈',
        NOW(),
        NOW()
    ) ON CONFLICT (setting_key) DO
UPDATE
SET setting_value = EXCLUDED.setting_value,
    description = EXCLUDED.description,
    updated_at = NOW();