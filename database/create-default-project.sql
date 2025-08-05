-- Create default project for audio recordings
-- Run this in Supabase SQL Editor

-- Insert default project if it doesn't exist
INSERT INTO projects (id, user_id, name, description, is_public, settings)
SELECT 
    'default-audio-project'::uuid,
    u.id,
    'Audio Recordings',
    'Default project for audio recordings',
    false,
    '{}'::jsonb
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM projects WHERE id = 'default-audio-project'::uuid
)
AND u.email = 'roncymondllave25@gmail.com'  -- Replace with your email
ON CONFLICT (id) DO NOTHING;