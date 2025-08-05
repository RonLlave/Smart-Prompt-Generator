-- Create storage buckets for audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'audio-recordings',
    'audio-recordings',
    false,
    52428800, -- 50MB limit
    ARRAY['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/mp4', 'audio/aac']
);

-- Storage policies for audio recordings bucket
CREATE POLICY storage_audio_select ON storage.objects
    FOR SELECT USING (
        bucket_id = 'audio-recordings' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY storage_audio_insert ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'audio-recordings' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY storage_audio_update ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'audio-recordings' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY storage_audio_delete ON storage.objects
    FOR DELETE USING (
        bucket_id = 'audio-recordings' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create a function to generate secure file paths
CREATE OR REPLACE FUNCTION generate_audio_file_path(user_id UUID, project_id UUID, file_name TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN user_id::text || '/' || project_id::text || '/' || 
           extract(epoch from now())::text || '_' || file_name;
END;
$$ LANGUAGE plpgsql;

-- Create a function to clean up orphaned audio files
CREATE OR REPLACE FUNCTION cleanup_orphaned_audio_files()
RETURNS void AS $$
DECLARE
    orphaned_file RECORD;
BEGIN
    -- Find files in storage that don't have corresponding records
    FOR orphaned_file IN 
        SELECT o.name, o.id
        FROM storage.objects o
        WHERE o.bucket_id = 'audio-recordings'
        AND NOT EXISTS (
            SELECT 1 FROM audio_recordings ar
            WHERE ar.file_path = o.name
        )
        AND o.created_at < NOW() - INTERVAL '24 hours'
    LOOP
        -- Delete the orphaned file
        DELETE FROM storage.objects WHERE id = orphaned_file.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up orphaned files (requires pg_cron extension)
-- This would be set up separately in Supabase dashboard or via API