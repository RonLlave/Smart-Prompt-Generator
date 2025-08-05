-- Helper Functions for project_assistants table

-- Function to get all prompts for a project
CREATE OR REPLACE FUNCTION get_project_prompts(project_uuid UUID)
RETURNS TABLE (
    assistant_type VARCHAR,
    prompt_content TEXT,
    prompt_version INTEGER,
    generation_timestamp TIMESTAMPTZ,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        pa.assistant_type,
        pa.prompt_content,
        pa.prompt_version,
        pa.generation_timestamp,
        pa.is_active
    FROM project_assistants pa
    WHERE pa.project_id = project_uuid
    AND pa.is_active = true
    ORDER BY pa.assistant_type, pa.prompt_version DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get latest prompt version for each assistant type
CREATE OR REPLACE FUNCTION get_latest_project_prompts(project_uuid UUID)
RETURNS TABLE (
    assistant_type VARCHAR,
    prompt_content TEXT,
    prompt_version INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (pa.assistant_type)
        pa.assistant_type,
        pa.prompt_content,
        pa.prompt_version
    FROM project_assistants pa
    WHERE pa.project_id = project_uuid
    AND pa.is_active = true
    ORDER BY pa.assistant_type, pa.prompt_version DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create new prompt version (increments version automatically)
CREATE OR REPLACE FUNCTION create_new_prompt_version(
    p_project_id UUID,
    p_assistant_type VARCHAR,
    p_prompt_content TEXT,
    p_generated_from_audio_ids JSONB DEFAULT '[]',
    p_generation_model VARCHAR DEFAULT 'gemini-pro-1.5',
    p_input_tokens INTEGER DEFAULT 0,
    p_output_tokens INTEGER DEFAULT 0,
    p_estimated_cost DECIMAL DEFAULT 0.0000
)
RETURNS UUID AS $$
DECLARE
    new_version INTEGER;
    new_id UUID;
BEGIN
    -- Get the next version number
    SELECT COALESCE(MAX(prompt_version), 0) + 1
    INTO new_version
    FROM project_assistants
    WHERE project_id = p_project_id
    AND assistant_type = p_assistant_type;

    -- Insert new prompt version
    INSERT INTO project_assistants (
        project_id,
        assistant_type,
        prompt_content,
        prompt_version,
        generated_from_audio_ids,
        generation_model,
        input_tokens,
        output_tokens,
        estimated_cost
    ) VALUES (
        p_project_id,
        p_assistant_type,
        p_prompt_content,
        new_version,
        p_generated_from_audio_ids,
        p_generation_model,
        p_input_tokens,
        p_output_tokens,
        p_estimated_cost
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deactivate old prompt versions (keep only latest)
CREATE OR REPLACE FUNCTION deactivate_old_prompt_versions(
    p_project_id UUID,
    p_assistant_type VARCHAR DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    rows_updated INTEGER;
BEGIN
    IF p_assistant_type IS NULL THEN
        -- Deactivate all but the latest version for each assistant type
        WITH latest_versions AS (
            SELECT DISTINCT ON (assistant_type)
                id,
                assistant_type,
                prompt_version
            FROM project_assistants
            WHERE project_id = p_project_id
            AND is_active = true
            ORDER BY assistant_type, prompt_version DESC
        )
        UPDATE project_assistants
        SET is_active = false, updated_at = NOW()
        WHERE project_id = p_project_id
        AND is_active = true
        AND id NOT IN (SELECT id FROM latest_versions);
    ELSE
        -- Deactivate all but the latest version for specific assistant type
        WITH latest_version AS (
            SELECT id
            FROM project_assistants
            WHERE project_id = p_project_id
            AND assistant_type = p_assistant_type
            AND is_active = true
            ORDER BY prompt_version DESC
            LIMIT 1
        )
        UPDATE project_assistants
        SET is_active = false, updated_at = NOW()
        WHERE project_id = p_project_id
        AND assistant_type = p_assistant_type
        AND is_active = true
        AND id NOT IN (SELECT id FROM latest_version);
    END IF;

    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    RETURN rows_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get prompt generation statistics for a project
CREATE OR REPLACE FUNCTION get_project_prompt_stats(project_uuid UUID)
RETURNS TABLE (
    total_prompts INTEGER,
    total_versions INTEGER,
    total_input_tokens BIGINT,
    total_output_tokens BIGINT,
    total_estimated_cost DECIMAL,
    latest_generation TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(DISTINCT assistant_type)::INTEGER as total_prompts,
        COUNT(*)::INTEGER as total_versions,
        SUM(input_tokens)::BIGINT as total_input_tokens,
        SUM(output_tokens)::BIGINT as total_output_tokens,
        SUM(estimated_cost)::DECIMAL as total_estimated_cost,
        MAX(generation_timestamp) as latest_generation
    FROM project_assistants
    WHERE project_id = project_uuid
    AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments to functions
COMMENT ON FUNCTION get_project_prompts(UUID) IS 'Returns all active prompts for a project';
COMMENT ON FUNCTION get_latest_project_prompts(UUID) IS 'Returns the latest version of each assistant type prompt';
COMMENT ON FUNCTION create_new_prompt_version(UUID, VARCHAR, TEXT, JSONB, VARCHAR, INTEGER, INTEGER, DECIMAL) IS 'Creates a new prompt version with auto-incremented version number';
COMMENT ON FUNCTION deactivate_old_prompt_versions(UUID, VARCHAR) IS 'Deactivates old prompt versions, keeping only the latest';
COMMENT ON FUNCTION get_project_prompt_stats(UUID) IS 'Returns generation statistics for a project';