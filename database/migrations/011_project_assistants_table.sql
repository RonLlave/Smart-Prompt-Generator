-- Project Assistants Table
-- Stores AI-generated assistant prompts associated with projects

-- Create the main table
CREATE TABLE IF NOT EXISTS project_assistants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Assistant prompt storage
    assistant_type VARCHAR(50) NOT NULL CHECK (
        assistant_type IN ('manager', 'frontend', 'backend', 'database', 'uiux', 'qa')
    ),
    prompt_content TEXT NOT NULL,
    prompt_version INTEGER DEFAULT 1,

    -- Generation metadata
    generated_from_audio_ids JSONB DEFAULT '[]', -- Array of audio_transcript IDs used
    generation_model VARCHAR(100) DEFAULT 'gemini-pro-1.5',
    generation_timestamp TIMESTAMPTZ DEFAULT NOW(),

    -- Token usage tracking
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    estimated_cost DECIMAL(8,4) DEFAULT 0.0000,

    -- Status and management
    is_active BOOLEAN DEFAULT true,
    is_favorite BOOLEAN DEFAULT false,
    custom_modifications TEXT, -- User edits to generated prompts

    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    UNIQUE(project_id, assistant_type, prompt_version)
);

-- Performance indexes
CREATE INDEX idx_project_assistants_project_id ON project_assistants(project_id);
CREATE INDEX idx_project_assistants_type ON project_assistants(assistant_type);
CREATE INDEX idx_project_assistants_active ON project_assistants(is_active);
CREATE INDEX idx_project_assistants_generation ON project_assistants(generation_timestamp DESC);

-- Composite indexes for common queries
CREATE INDEX idx_project_assistants_project_type_active
    ON project_assistants(project_id, assistant_type, is_active);

-- Add comments to table and columns
COMMENT ON TABLE project_assistants IS 'Stores AI-generated assistant prompts associated with projects';
COMMENT ON COLUMN project_assistants.id IS 'Unique identifier for the assistant prompt';
COMMENT ON COLUMN project_assistants.project_id IS 'Reference to the associated project';
COMMENT ON COLUMN project_assistants.assistant_type IS 'Type of assistant (manager, frontend, backend, database, uiux, qa)';
COMMENT ON COLUMN project_assistants.prompt_content IS 'The generated prompt content for the assistant';
COMMENT ON COLUMN project_assistants.prompt_version IS 'Version number for prompt iterations';
COMMENT ON COLUMN project_assistants.generated_from_audio_ids IS 'Array of audio_transcript IDs used for generation';
COMMENT ON COLUMN project_assistants.generation_model IS 'AI model used for prompt generation';
COMMENT ON COLUMN project_assistants.generation_timestamp IS 'When the prompt was generated';
COMMENT ON COLUMN project_assistants.input_tokens IS 'Number of input tokens used in generation';
COMMENT ON COLUMN project_assistants.output_tokens IS 'Number of output tokens generated';
COMMENT ON COLUMN project_assistants.estimated_cost IS 'Estimated cost of the generation request';
COMMENT ON COLUMN project_assistants.is_active IS 'Whether this prompt version is currently active';
COMMENT ON COLUMN project_assistants.is_favorite IS 'Whether user marked this prompt as favorite';
COMMENT ON COLUMN project_assistants.custom_modifications IS 'User edits made to the generated prompt';
COMMENT ON COLUMN project_assistants.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN project_assistants.updated_at IS 'Timestamp when the record was last updated';