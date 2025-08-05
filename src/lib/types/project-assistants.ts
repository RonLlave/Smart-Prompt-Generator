// Types for project_assistants table and related functionality

export type AssistantType = 
  | "manager"
  | "frontend" 
  | "backend"
  | "database"
  | "uiux"
  | "qa"

export interface ProjectAssistant {
  id: string
  projectId: string
  assistantType: AssistantType
  promptContent: string
  promptVersion: number
  generatedFromAudioIds: string[]
  generationModel: string
  generationTimestamp: Date
  inputTokens: number
  outputTokens: number
  estimatedCost: number
  isActive: boolean
  isFavorite: boolean
  customModifications?: string
  createdAt: Date
  updatedAt: Date
}

export interface ProjectAssistantDB {
  id: string
  project_id: string
  assistant_type: AssistantType
  prompt_content: string
  prompt_version: number
  generated_from_audio_ids: string[]
  generation_model: string
  generation_timestamp: string
  input_tokens: number
  output_tokens: number
  estimated_cost: number
  is_active: boolean
  is_favorite: boolean
  custom_modifications?: string
  created_at: string
  updated_at: string
}

// API Request/Response types
export interface AssistantPromptRequest {
  projectName: string
  projectDescription: string
  audioSummaries: string[]
  assistantTypes: AssistantType[]
}

export interface GeneratedPrompts {
  manager?: string
  frontend?: string
  backend?: string
  database?: string
  uiux?: string
  qa?: string
}

export interface PromptGenerationResult {
  assistantType: AssistantType
  promptContent: string
  inputTokens: number
  outputTokens: number
  estimatedCost: number
}

export interface CreateProjectWithPromptsRequest {
  projectName: string
  projectDescription: string
  selectedAudioIds: string[]
  assistantTypes: AssistantType[]
}

export interface CreateProjectWithPromptsResponse {
  projectId: string
  prompts: PromptGenerationResult[]
}

// Audio transcript selection types
export interface AudioTranscriptForSelection {
  id: string
  title: string | null
  description: string | null
  audio_filename: string | null
  duration: number
  created_at: string
  ai_summary: string | null
  raw_transcript: string | null
}

// Project prompt statistics
export interface ProjectPromptStats {
  totalPrompts: number
  totalVersions: number
  totalInputTokens: number
  totalOutputTokens: number
  totalEstimatedCost: number
  latestGeneration: Date | null
}

// Component props types
export interface AudioSelectionComponentProps {
  selectedAudioIds: string[]
  onSelectionChange: (audioIds: string[]) => void
  maxSelections?: number
}

export interface PromptDisplayProps {
  prompts: Record<AssistantType, string>
  isLoading: boolean
  onRegenerate: (assistantType?: AssistantType) => void
  onCopy: (assistantType: AssistantType) => void
}

export interface AssistantTypeConfig {
  type: AssistantType
  label: string
  description: string
  icon: string
  color: string
}

// Assistant type configurations
export const ASSISTANT_TYPE_CONFIGS: Record<AssistantType, AssistantTypeConfig> = {
  manager: {
    type: "manager",
    label: "Project Manager",
    description: "Oversees project coordination, task delegation, and team alignment",
    icon: "Users",
    color: "blue"
  },
  frontend: {
    type: "frontend", 
    label: "Frontend Developer",
    description: "Handles UI/UX implementation, component development, and client-side logic",
    icon: "Monitor",
    color: "green"
  },
  backend: {
    type: "backend",
    label: "Backend Developer", 
    description: "Manages server-side logic, APIs, and system architecture",
    icon: "Server",
    color: "purple"
  },
  database: {
    type: "database",
    label: "Database Engineer",
    description: "Designs schemas, optimizes queries, and manages data integrity",
    icon: "Database",
    color: "orange"
  },
  uiux: {
    type: "uiux",
    label: "UI/UX Designer",
    description: "Creates user interfaces, design systems, and user experience flows",
    icon: "Palette",
    color: "pink"
  },
  qa: {
    type: "qa", 
    label: "QA Engineer",
    description: "Ensures quality through testing, validation, and bug identification",
    icon: "CheckCircle",
    color: "red"
  }
}

// Helper functions
export function transformProjectAssistantFromDB(dbRecord: ProjectAssistantDB): ProjectAssistant {
  return {
    id: dbRecord.id,
    projectId: dbRecord.project_id,
    assistantType: dbRecord.assistant_type,
    promptContent: dbRecord.prompt_content,
    promptVersion: dbRecord.prompt_version,
    generatedFromAudioIds: dbRecord.generated_from_audio_ids,
    generationModel: dbRecord.generation_model,
    generationTimestamp: new Date(dbRecord.generation_timestamp),
    inputTokens: dbRecord.input_tokens,
    outputTokens: dbRecord.output_tokens,
    estimatedCost: dbRecord.estimated_cost,
    isActive: dbRecord.is_active,
    isFavorite: dbRecord.is_favorite,
    customModifications: dbRecord.custom_modifications,
    createdAt: new Date(dbRecord.created_at),
    updatedAt: new Date(dbRecord.updated_at)
  }
}

export function transformProjectAssistantToDB(record: Omit<ProjectAssistant, 'id' | 'createdAt' | 'updatedAt'>): Omit<ProjectAssistantDB, 'id' | 'created_at' | 'updated_at'> {
  return {
    project_id: record.projectId,
    assistant_type: record.assistantType,
    prompt_content: record.promptContent,
    prompt_version: record.promptVersion,
    generated_from_audio_ids: record.generatedFromAudioIds,
    generation_model: record.generationModel,
    generation_timestamp: record.generationTimestamp.toISOString(),
    input_tokens: record.inputTokens,
    output_tokens: record.outputTokens,
    estimated_cost: record.estimatedCost,
    is_active: record.isActive,
    is_favorite: record.isFavorite,
    custom_modifications: record.customModifications
  }
}