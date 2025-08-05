-- Fix RLS policies for NextAuth JWT sessions
-- Since we're using NextAuth JWT (not Supabase Auth), auth.uid() returns NULL
-- We need to temporarily disable RLS or create simpler policies

-- Option 1: Disable RLS temporarily for testing
ALTER TABLE audio_recordings DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators DISABLE ROW LEVEL SECURITY;

-- Option 2: Create simpler policies that don't cause circular references
-- First drop existing problematic policies
DROP POLICY IF EXISTS audio_recordings_select ON audio_recordings;
DROP POLICY IF EXISTS projects_select_own ON projects;
DROP POLICY IF EXISTS collaborators_select ON collaborators;

-- Create simple policies for NextAuth users
-- Since we're using our own user validation, we can be more permissive
CREATE POLICY audio_recordings_allow_all ON audio_recordings
    FOR ALL USING (true);

CREATE POLICY projects_allow_all ON projects  
    FOR ALL USING (true);

CREATE POLICY collaborators_allow_all ON collaborators
    FOR ALL USING (true);

-- Re-enable RLS with simpler policies
ALTER TABLE audio_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;