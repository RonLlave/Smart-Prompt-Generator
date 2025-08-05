# Implementation Tasks - AI Assistant Prompt Generation System

## Status: 📋 Ready for Implementation

Based on user requirements analysis, here are the detailed implementation prompts for the development team:

---

## 1. Developer Assistant Implementation Prompt

### **Feature: AI-Powered Assistant Prompt Generation System**

**Overview**: Transform the project creation flow to generate customized AI assistant prompts based on audio meeting summaries using Google Gemini Pro 2.5 pro.

### **Requirements**

#### **Enhanced Project Creation Form**

1. **Existing Fields** (keep as-is):

   - Project Name (text input)
   - Project Description (textarea)

2. **New Audio Selection Component**:
   - Fetch and display all audio recordings from `audio_transcript` table
   - Show recording metadata: filename, date, duration, AI summary preview
   - Multi-select interface allowing users to choose relevant recordings
   - Display selected recordings with their AI summaries
   - Include search/filter functionality by date or keywords

#### **AI Assistant Prompt Generation Engine**

3. **Gemini Integration Service**:

   ```typescript
   interface AssistantPromptRequest {
     projectName: string;
     projectDescription: string;
     audioSummaries: string[];
     assistantTypes: string[];
   }

   interface GeneratedPrompts {
     manager: string;
     frontendDeveloper: string;
     backendDeveloper: string;
     databaseEngineer: string;
     uiuxDesigner: string;
     qaEngineer: string;
   }
   ```

4. **Prompt Generation Logic**:
   - Send combined audio summaries + project details to Gemini Pro 1.5
   - Request generation of role-specific prompts based on meeting content
   - Generate contextual prompts that reference specific requirements from audio
   - Include project scope, technical requirements, and deliverable expectations
   - Format prompts as copy-paste ready instructions for each assistant type

#### **User Interface Components**

5. **Prompt Display & Management**:

   - Tabbed interface showing different assistant role prompts
   - Copy-to-clipboard functionality for each prompt
   - "Regenerate All Prompts" button
   - "Regenerate Individual Prompt" option
   - Loading states during generation
   - Error handling with retry mechanisms

6. **Remove Existing Features**:
   - Remove sample project templates
   - Disconnect from current Builder page integration
   - Focus on standalone project creation with prompt generation

#### **Technical Implementation Details**

7. **API Endpoints**:

   ```typescript
   // New endpoints to create
   POST /api/projects/generate-prompts
   GET /api/audio-transcripts (with pagination/search)
   POST /api/projects/create-with-prompts
   ```

8. **Database Integration**:

   - Fetch audio recordings with AI summaries
   - Store generated prompts in new `project_assistants` table
   - Associate prompts with project ID
   - Enable prompt versioning/regeneration

9. **Error Handling**:
   - Handle Gemini API failures gracefully
   - Provide fallback prompt templates
   - Validate audio summary quality before generation
   - Rate limiting for API calls

#### **Success Criteria**

- Users can select multiple audio recordings during project creation
- AI generates contextual, role-specific assistant prompts
- Prompts are immediately copy-paste ready
- Regeneration works smoothly with updated content
- No dependency on existing Builder page functionality

---

## 2. Database Assistant Implementation Prompt

### **Feature: Project Assistants Table Creation**

**Overview**: Create a new database table to store AI-generated assistant prompts associated with projects.

### **Table Schema Requirements**

#### **Table: `project_assistants`**

```sql
CREATE TABLE project_assistants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Assistant prompt storage
  assistant_type VARCHAR(50) NOT NULL, -- 'manager', 'frontend', 'backend', 'database', 'uiux', 'qa'
  prompt_content TEXT NOT NULL,
  prompt_version INTEGER DEFAULT 1,

  -- Generation metadata
  generated_from_audio_ids JSONB DEFAULT '[]', -- Array of audio_transcript IDs used
  generation_model VARCHAR(100) DEFAULT 'gemini-pro-1.5',
  generation_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Token usage tracking
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  estimated_cost DECIMAL(8,4) DEFAULT 0.0000,

  -- Status and management
  is_active BOOLEAN DEFAULT true,
  is_favorite BOOLEAN DEFAULT false,
  custom_modifications TEXT, -- User edits to generated prompts

  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  UNIQUE(project_id, assistant_type, prompt_version)
);
```

#### **Indexes & Performance**

```sql
-- Performance indexes
CREATE INDEX idx_project_assistants_project_id ON project_assistants(project_id);
CREATE INDEX idx_project_assistants_type ON project_assistants(assistant_type);
CREATE INDEX idx_project_assistants_active ON project_assistants(is_active);
CREATE INDEX idx_project_assistants_generation ON project_assistants(generation_timestamp DESC);

-- Composite indexes for common queries
CREATE INDEX idx_project_assistants_project_type_active
  ON project_assistants(project_id, assistant_type, is_active);
```

#### **Row Level Security (RLS)**

```sql
-- Enable RLS
ALTER TABLE project_assistants ENABLE ROW LEVEL SECURITY;

-- Users can only access prompts for their own projects
CREATE POLICY "Users can manage own project assistants" ON project_assistants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_assistants.project_id
      AND user_id = auth.uid()
    )
  );
```

#### **Helper Functions**

```sql
-- Function to get all prompts for a project
CREATE OR REPLACE FUNCTION get_project_prompts(project_uuid UUID)
RETURNS TABLE (
  assistant_type VARCHAR,
  prompt_content TEXT,
  prompt_version INTEGER,
  generation_timestamp TIMESTAMP WITH TIME ZONE,
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
```

#### **Integration Requirements**

1. **Foreign Key Relationships**:

   - Link to existing `projects` table
   - Ensure cascading deletes when projects are removed

2. **Data Migration**:

   - No existing data to migrate (new feature)
   - Consider adding sample prompts for testing

3. **TypeScript Types**:
   ```typescript
   interface ProjectAssistant {
     id: string;
     projectId: string;
     assistantType:
       | "manager"
       | "frontend"
       | "backend"
       | "database"
       | "uiux"
       | "qa";
     promptContent: string;
     promptVersion: number;
     generatedFromAudioIds: string[];
     generationModel: string;
     generationTimestamp: Date;
     inputTokens: number;
     outputTokens: number;
     estimatedCost: number;
     isActive: boolean;
     isFavorite: boolean;
     customModifications?: string;
     createdAt: Date;
     updatedAt: Date;
   }
   ```

#### **Success Criteria**

- Table created with proper relationships and constraints
- RLS policies ensure user data isolation
- Helper functions enable efficient prompt retrieval
- Indexes optimize common query patterns
- TypeScript types generated for frontend integration

---

## Implementation Priority

1. **Database Assistant**: Create `project_assistants` table first
2. **Developer Assistant**: Implement enhanced project creation flow
3. **Testing**: Verify audio selection and prompt generation workflow
4. **Integration**: Connect with existing project management system

## Notes

- This feature represents a significant enhancement to the project creation workflow
- Removes dependency on static templates in favor of dynamic AI generation
- Leverages existing audio transcription system for contextual prompt creation
- Provides foundation for future AI-assisted project management features
