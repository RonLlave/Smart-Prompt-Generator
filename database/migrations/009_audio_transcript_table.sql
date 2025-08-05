-- Audio Transcript Table
-- This table stores audio transcripts independently without connections to other tables

CREATE TABLE IF NOT EXISTS audio_transcript (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audio_filename TEXT NOT NULL,
    complete_file_link TEXT NOT NULL,
    added_by_email TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_audio_transcript_email ON audio_transcript(added_by_email);
CREATE INDEX idx_audio_transcript_created_at ON audio_transcript(created_at);
CREATE INDEX idx_audio_transcript_filename ON audio_transcript(audio_filename);

-- Add comment to table
COMMENT ON TABLE audio_transcript IS 'Stores audio transcripts independently without connections to other tables';
COMMENT ON COLUMN audio_transcript.id IS 'Unique identifier for the transcript';
COMMENT ON COLUMN audio_transcript.audio_filename IS 'Name of the audio file';
COMMENT ON COLUMN audio_transcript.complete_file_link IS 'Full URL or path to the audio file';
COMMENT ON COLUMN audio_transcript.added_by_email IS 'Email of the user who added the transcript';
COMMENT ON COLUMN audio_transcript.metadata IS 'Additional metadata in JSON format';
COMMENT ON COLUMN audio_transcript.created_at IS 'Timestamp when the transcript was created';