-- Row Level Security Policies for audio_transcript table
-- This table is completely public - all CRUD operations are allowed for all users

-- Enable RLS on the audio_transcript table
ALTER TABLE audio_transcript ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public access for ALL operations (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY audio_transcript_public_all ON audio_transcript
    FOR ALL USING (true) WITH CHECK (true);

-- Alternative individual policies (if you prefer granular control):
-- These are commented out since we're using the ALL policy above

-- CREATE POLICY audio_transcript_public_select ON audio_transcript
--     FOR SELECT USING (true);

-- CREATE POLICY audio_transcript_public_insert ON audio_transcript
--     FOR INSERT WITH CHECK (true);

-- CREATE POLICY audio_transcript_public_update ON audio_transcript
--     FOR UPDATE USING (true) WITH CHECK (true);

-- CREATE POLICY audio_transcript_public_delete ON audio_transcript
--     FOR DELETE USING (true);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON audio_transcript TO authenticated;

-- Grant permissions to anonymous users as well (if you want truly public access)
GRANT SELECT, INSERT, UPDATE, DELETE ON audio_transcript TO anon;

-- Grant usage on the sequence for ID generation
GRANT USAGE ON SEQUENCE audio_transcript_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE audio_transcript_id_seq TO anon;