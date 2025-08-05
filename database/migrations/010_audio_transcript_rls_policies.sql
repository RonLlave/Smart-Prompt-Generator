-- Row Level Security Policies for audio_transcript table
-- Secure access: Users can only access their own audio transcripts

-- Enable RLS on the audio_transcript table
ALTER TABLE audio_transcript ENABLE ROW LEVEL SECURITY;

-- Drop existing public policy if it exists
DROP POLICY IF EXISTS audio_transcript_public_all ON audio_transcript;

-- Policy: Allow users to read their own audio transcripts
-- Uses email matching with authenticated user's email from auth.users
CREATE POLICY audio_transcript_select_own ON audio_transcript
    FOR SELECT USING (
        auth.uid() IS NOT NULL 
        AND added_by_email = auth.email()
    );

-- Policy: Allow users to insert audio transcripts with their own email
CREATE POLICY audio_transcript_insert_own ON audio_transcript
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL 
        AND added_by_email = auth.email()
    );

-- Policy: Allow users to update their own audio transcripts
CREATE POLICY audio_transcript_update_own ON audio_transcript
    FOR UPDATE USING (
        auth.uid() IS NOT NULL 
        AND added_by_email = auth.email()
    ) WITH CHECK (
        auth.uid() IS NOT NULL 
        AND added_by_email = auth.email()
    );

-- Policy: Allow users to delete their own audio transcripts
CREATE POLICY audio_transcript_delete_own ON audio_transcript
    FOR DELETE USING (
        auth.uid() IS NOT NULL 
        AND added_by_email = auth.email()
    );

-- Grant necessary permissions to authenticated users only
GRANT SELECT, INSERT, UPDATE, DELETE ON audio_transcript TO authenticated;

-- Revoke permissions from anonymous users for security
REVOKE ALL ON audio_transcript FROM anon;

-- Note: No sequence grants needed as table uses uuid_generate_v4() for primary key