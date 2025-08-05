-- Make audio recordings standalone (not tied to projects)
-- Run this in Supabase SQL Editor

-- Option 1: Make project_id nullable
ALTER TABLE audio_recordings ALTER COLUMN project_id DROP NOT NULL;

-- Option 2: Create a simple insert for standalone audio recordings
-- We'll use a special project_id value for standalone recordings
INSERT INTO projects (id, user_id, name, description, is_public, settings)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    (SELECT id FROM users WHERE email = 'roncymondllave25@gmail.com' LIMIT 1),
    'Standalone Audio Recordings',
    'Virtual project for standalone audio recordings',
    false,
    '{"type": "audio_only"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Check if the project was created
SELECT * FROM projects WHERE id = '00000000-0000-0000-0000-000000000001';