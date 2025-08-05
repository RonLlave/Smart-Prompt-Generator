-- Function to get user's project statistics
CREATE OR REPLACE FUNCTION get_user_project_stats(user_uuid UUID)
RETURNS TABLE (
    total_projects BIGINT,
    total_components BIGINT,
    total_audio_files BIGINT,
    total_prompts BIGINT,
    total_collaborations BIGINT,
    storage_used_bytes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT p.id) AS total_projects,
        COUNT(DISTINCT pc.id) AS total_components,
        COUNT(DISTINCT ar.id) AS total_audio_files,
        COUNT(DISTINCT pg.id) AS total_prompts,
        COUNT(DISTINCT c.id) AS total_collaborations,
        COALESCE(SUM(ar.file_size), 0) AS storage_used_bytes
    FROM projects p
    LEFT JOIN project_components pc ON p.id = pc.project_id
    LEFT JOIN audio_recordings ar ON p.id = ar.project_id
    LEFT JOIN prompt_generations pg ON p.id = pg.project_id
    LEFT JOIN collaborators c ON p.id = c.project_id
    WHERE p.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate monthly API usage costs
CREATE OR REPLACE FUNCTION get_monthly_api_costs(user_uuid UUID, month_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    month DATE,
    total_tokens BIGINT,
    total_cost_usd DECIMAL(10,2),
    api_call_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE_TRUNC('month', month_date)::DATE AS month,
        COALESCE(SUM(tokens_used), 0) AS total_tokens,
        COALESCE(SUM(cost_usd), 0) AS total_cost_usd,
        COUNT(*) AS api_call_count
    FROM api_usage
    WHERE user_id = user_uuid
    AND created_at >= DATE_TRUNC('month', month_date)
    AND created_at < DATE_TRUNC('month', month_date) + INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can create more projects (quota check)
CREATE OR REPLACE FUNCTION check_project_quota(user_uuid UUID, max_projects INTEGER DEFAULT 10)
RETURNS BOOLEAN AS $$
DECLARE
    project_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO project_count
    FROM projects
    WHERE user_id = user_uuid;
    
    RETURN project_count < max_projects;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to soft delete a project and all related data
CREATE OR REPLACE FUNCTION soft_delete_project(project_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_owner BOOLEAN;
BEGIN
    -- Check if user owns the project
    SELECT EXISTS (
        SELECT 1 FROM projects 
        WHERE id = project_uuid AND user_id = user_uuid
    ) INTO is_owner;
    
    IF NOT is_owner THEN
        RETURN FALSE;
    END IF;
    
    -- Mark project as deleted (soft delete)
    UPDATE projects 
    SET 
        name = name || ' (deleted ' || NOW()::TEXT || ')',
        updated_at = NOW()
    WHERE id = project_uuid;
    
    -- Remove all collaborators
    DELETE FROM collaborators WHERE project_id = project_uuid;
    
    -- Mark audio files for deletion
    UPDATE audio_recordings 
    SET metadata = jsonb_set(metadata, '{marked_for_deletion}', 'true')
    WHERE project_id = project_uuid;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to duplicate a project
CREATE OR REPLACE FUNCTION duplicate_project(
    source_project_id UUID,
    user_uuid UUID,
    new_name TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    new_project_id UUID;
    source_project RECORD;
BEGIN
    -- Get source project details
    SELECT * INTO source_project
    FROM projects
    WHERE id = source_project_id
    AND (user_id = user_uuid OR is_public = true OR EXISTS (
        SELECT 1 FROM collaborators 
        WHERE project_id = source_project_id 
        AND user_id = user_uuid
    ));
    
    IF source_project IS NULL THEN
        RAISE EXCEPTION 'Project not found or access denied';
    END IF;
    
    -- Create new project
    INSERT INTO projects (user_id, name, description, settings)
    VALUES (
        user_uuid,
        COALESCE(new_name, source_project.name || ' (Copy)'),
        source_project.description,
        source_project.settings
    )
    RETURNING id INTO new_project_id;
    
    -- Copy project components
    INSERT INTO project_components (
        project_id, component_type, position_x, position_y, 
        width, height, z_index, properties
    )
    SELECT 
        new_project_id, component_type, position_x, position_y,
        width, height, z_index, properties
    FROM project_components
    WHERE project_id = source_project_id;
    
    RETURN new_project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to log user activity
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_activity (user_id, activity_type, activity_data)
    VALUES (
        auth.uid(),
        TG_ARGV[0], -- Activity type passed as argument
        jsonb_build_object(
            'table_name', TG_TABLE_NAME,
            'operation', TG_OP,
            'record_id', CASE 
                WHEN TG_OP = 'DELETE' THEN OLD.id 
                ELSE NEW.id 
            END
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply activity logging triggers to key tables
CREATE TRIGGER log_project_activity
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION log_user_activity('project_operation');

CREATE TRIGGER log_audio_activity
    AFTER INSERT OR DELETE ON audio_recordings
    FOR EACH ROW EXECUTE FUNCTION log_user_activity('audio_operation');

CREATE TRIGGER log_prompt_activity
    AFTER INSERT ON prompt_generations
    FOR EACH ROW EXECUTE FUNCTION log_user_activity('prompt_generation');