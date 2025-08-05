-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY users_select_own ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update_own ON users
    FOR UPDATE USING (auth.uid() = id);

-- Accounts table policies
CREATE POLICY accounts_select_own ON accounts
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY accounts_insert_own ON accounts
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY accounts_update_own ON accounts
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY accounts_delete_own ON accounts
    FOR DELETE USING (user_id = auth.uid());

-- Sessions table policies
CREATE POLICY sessions_select_own ON sessions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY sessions_insert_own ON sessions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY sessions_update_own ON sessions
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY sessions_delete_own ON sessions
    FOR DELETE USING (user_id = auth.uid());

-- Projects table policies
CREATE POLICY projects_select_own ON projects
    FOR SELECT USING (
        user_id = auth.uid() 
        OR is_public = true
        OR EXISTS (
            SELECT 1 FROM collaborators 
            WHERE collaborators.project_id = projects.id 
            AND collaborators.user_id = auth.uid()
            AND collaborators.accepted_at IS NOT NULL
        )
    );

CREATE POLICY projects_insert_own ON projects
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY projects_update_own ON projects
    FOR UPDATE USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM collaborators 
            WHERE collaborators.project_id = projects.id 
            AND collaborators.user_id = auth.uid()
            AND collaborators.role IN ('editor', 'admin')
            AND collaborators.accepted_at IS NOT NULL
        )
    );

CREATE POLICY projects_delete_own ON projects
    FOR DELETE USING (user_id = auth.uid());

-- Project components table policies
CREATE POLICY project_components_select ON project_components
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_components.project_id
            AND (
                projects.user_id = auth.uid() 
                OR projects.is_public = true
                OR EXISTS (
                    SELECT 1 FROM collaborators 
                    WHERE collaborators.project_id = projects.id 
                    AND collaborators.user_id = auth.uid()
                    AND collaborators.accepted_at IS NOT NULL
                )
            )
        )
    );

CREATE POLICY project_components_insert ON project_components
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_components.project_id
            AND (
                projects.user_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM collaborators 
                    WHERE collaborators.project_id = projects.id 
                    AND collaborators.user_id = auth.uid()
                    AND collaborators.role IN ('editor', 'admin')
                    AND collaborators.accepted_at IS NOT NULL
                )
            )
        )
    );

CREATE POLICY project_components_update ON project_components
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_components.project_id
            AND (
                projects.user_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM collaborators 
                    WHERE collaborators.project_id = projects.id 
                    AND collaborators.user_id = auth.uid()
                    AND collaborators.role IN ('editor', 'admin')
                    AND collaborators.accepted_at IS NOT NULL
                )
            )
        )
    );

CREATE POLICY project_components_delete ON project_components
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_components.project_id
            AND (
                projects.user_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM collaborators 
                    WHERE collaborators.project_id = projects.id 
                    AND collaborators.user_id = auth.uid()
                    AND collaborators.role = 'admin'
                    AND collaborators.accepted_at IS NOT NULL
                )
            )
        )
    );

-- Audio recordings table policies
CREATE POLICY audio_recordings_select ON audio_recordings
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = audio_recordings.project_id
            AND (
                projects.is_public = true
                OR EXISTS (
                    SELECT 1 FROM collaborators 
                    WHERE collaborators.project_id = projects.id 
                    AND collaborators.user_id = auth.uid()
                    AND collaborators.accepted_at IS NOT NULL
                )
            )
        )
    );

CREATE POLICY audio_recordings_insert_own ON audio_recordings
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY audio_recordings_update_own ON audio_recordings
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY audio_recordings_delete_own ON audio_recordings
    FOR DELETE USING (user_id = auth.uid());

-- Prompt generations table policies
CREATE POLICY prompt_generations_select_own ON prompt_generations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY prompt_generations_insert_own ON prompt_generations
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Collaborators table policies
CREATE POLICY collaborators_select ON collaborators
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = collaborators.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY collaborators_insert ON collaborators
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = collaborators.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY collaborators_update ON collaborators
    FOR UPDATE USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = collaborators.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY collaborators_delete ON collaborators
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = collaborators.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Analytics tables policies (user_activity, api_usage)
CREATE POLICY user_activity_select_own ON user_activity
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY user_activity_insert_own ON user_activity
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY api_usage_select_own ON api_usage
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY api_usage_insert_own ON api_usage
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Error logs and performance metrics policies (admin only)
CREATE POLICY error_logs_admin_only ON error_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.email IN (
                SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
            )
        )
    );

CREATE POLICY performance_metrics_admin_only ON performance_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.email IN (
                SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
            )
        )
    );

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON verification_tokens TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON project_components TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON audio_recordings TO authenticated;
GRANT SELECT, INSERT ON prompt_generations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON collaborators TO authenticated;
GRANT SELECT, INSERT ON user_activity TO authenticated;
GRANT SELECT, INSERT ON api_usage TO authenticated;
GRANT SELECT, INSERT ON error_logs TO authenticated;
GRANT SELECT, INSERT ON performance_metrics TO authenticated;