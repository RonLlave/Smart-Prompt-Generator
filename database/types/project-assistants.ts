// TypeScript types for project_assistants table

export type AssistantType = 
  | 'manager'
  | 'frontend' 
  | 'backend'
  | 'database'
  | 'uiux'
  | 'qa';

export interface ProjectAssistant {
  id: string;
  projectId: string;
  assistantType: AssistantType;
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

export interface AssistantPromptRequest {
  projectName: string;
  projectDescription: string;
  audioSummaries: string[];
  assistantTypes: AssistantType[];
}

export interface GeneratedPrompts {
  manager: string;
  frontendDeveloper: string;
  backendDeveloper: string;
  databaseEngineer: string;
  uiuxDesigner: string;
  qaEngineer: string;
}

export interface ProjectPromptStats {
  totalPrompts: number;
  totalVersions: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalEstimatedCost: number;
  latestGeneration: Date;
}

// Database function return types
export interface ProjectPromptRow {
  assistant_type: string;
  prompt_content: string;
  prompt_version: number;
  generation_timestamp: Date;
  is_active: boolean;
}

export interface LatestProjectPromptRow {
  assistant_type: string;
  prompt_content: string;
  prompt_version: number;
}

// API request/response types
export interface CreatePromptVersionRequest {
  projectId: string;
  assistantType: AssistantType;
  promptContent: string;
  generatedFromAudioIds?: string[];
  generationModel?: string;
  inputTokens?: number;
  outputTokens?: number;
  estimatedCost?: number;
}

export interface CreatePromptVersionResponse {
  id: string;
  version: number;
}

export interface GeneratePromptsRequest {
  projectId: string;
  projectName: string;
  projectDescription: string;
  selectedAudioIds: string[];
  assistantTypes: AssistantType[];
}

export interface GeneratePromptsResponse {
  success: boolean;
  prompts: Record<AssistantType, string>;
  metadata: {
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
    generationModel: string;
  };
}