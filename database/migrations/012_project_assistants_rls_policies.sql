-- Row Level Security Policies for project_assistants table
-- Users can only access prompts for their own projects

-- Enable RLS on the project_assistants table
ALTER TABLE project_assistants ENABLE ROW LEVEL SECURITY;

-- Policy: Users can select prompts for their own projects
CREATE POLICY project_assistants_select_own ON project_assistants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE id = project_assistants.project_id
            AND user_id = auth.uid()
        )
    );

-- Policy: Users can insert prompts for their own projects
CREATE POLICY project_assistants_insert_own ON project_assistants
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE id = project_assistants.project_id
            AND user_id = auth.uid()
        )
    );

-- Policy: Users can update prompts for their own projects
CREATE POLICY project_assistants_update_own ON project_assistants
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE id = project_assistants.project_id
            AND user_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE id = project_assistants.project_id
            AND user_id = auth.uid()
        )
    );

-- Policy: Users can delete prompts for their own projects
CREATE POLICY project_assistants_delete_own ON project_assistants
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE id = project_assistants.project_id
            AND user_id = auth.uid()
        )
    );

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON project_assistants TO authenticated;

-- Revoke permissions from anonymous users for security
REVOKE ALL ON project_assistants FROM anon;