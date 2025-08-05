import { createClient } from './client'
import { 
  ProjectAssistant, 
  AssistantType, 
  ProjectPromptStats,
  AudioTranscriptForSelection,
  transformProjectAssistantFromDB 
} from '@/lib/types/project-assistants'

const supabase = createClient()

/**
 * Get all active project assistants for a project
 */
export async function getProjectAssistants(projectId: string): Promise<ProjectAssistant[]> {
  console.log('🔍 Fetching project assistants for project:', projectId)
  
  const { data, error } = await supabase
    .from('project_assistants')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_active', true)
    .order('assistant_type', { ascending: true })
    .order('prompt_version', { ascending: false })

  if (error) {
    console.error('❌ Error fetching project assistants:', error)
    throw new Error(`Failed to fetch project assistants: ${error.message}`)
  }

  console.log('✅ Fetched project assistants:', data?.length || 0)
  return (data || []).map(transformProjectAssistantFromDB)
}

/**
 * Get the latest prompt for each assistant type
 */
export async function getLatestProjectPrompts(projectId: string): Promise<Record<AssistantType, string>> {
  console.log('🔍 Fetching latest project prompts for project:', projectId)
  
  const { data, error } = await supabase
    .rpc('get_latest_project_prompts', { project_uuid: projectId })

  if (error) {
    console.error('❌ Error fetching latest prompts:', error)
    throw new Error(`Failed to fetch latest prompts: ${error.message}`)
  }

  // Transform array result to object with assistant types as keys
  const prompts: Partial<Record<AssistantType, string>> = {}
  data?.forEach((row: any) => {
    prompts[row.assistant_type as AssistantType] = row.prompt_content
  })

  console.log('✅ Fetched latest prompts for types:', Object.keys(prompts))
  return prompts as Record<AssistantType, string>
}

/**
 * Create a new prompt version
 */
export async function createPromptVersion(
  projectId: string,
  assistantType: AssistantType,
  promptContent: string,
  generatedFromAudioIds: string[] = [],
  generationModel: string = 'gemini-2.5-pro',
  inputTokens: number = 0,
  outputTokens: number = 0,
  estimatedCost: number = 0
): Promise<string> {
  console.log('📝 Creating new prompt version:', {
    projectId,
    assistantType,
    generationModel,
    inputTokens,
    outputTokens,
    estimatedCost
  })

  const { data, error } = await supabase
    .rpc('create_new_prompt_version', {
      p_project_id: projectId,
      p_assistant_type: assistantType,
      p_prompt_content: promptContent,
      p_generated_from_audio_ids: JSON.stringify(generatedFromAudioIds),
      p_generation_model: generationModel,
      p_input_tokens: inputTokens,
      p_output_tokens: outputTokens,
      p_estimated_cost: estimatedCost
    })

  if (error) {
    console.error('❌ Error creating prompt version:', error)
    throw new Error(`Failed to create prompt version: ${error.message}`)
  }

  console.log('✅ Created prompt version with ID:', data)
  return data
}

/**
 * Create multiple prompt versions at once
 */
export async function createMultiplePromptVersions(
  projectId: string,
  prompts: Array<{
    assistantType: AssistantType
    promptContent: string
    inputTokens: number
    outputTokens: number
    estimatedCost: number
  }>,
  generatedFromAudioIds: string[] = [],
  generationModel: string = 'gemini-2.5-pro'
): Promise<string[]> {
  console.log('📝 Creating multiple prompt versions:', {
    projectId,
    promptCount: prompts.length,
    assistantTypes: prompts.map(p => p.assistantType)
  })

  const promptIds: string[] = []
  
  for (const prompt of prompts) {
    try {
      const promptId = await createPromptVersion(
        projectId,
        prompt.assistantType,
        prompt.promptContent,
        generatedFromAudioIds,
        generationModel,
        prompt.inputTokens,
        prompt.outputTokens,
        prompt.estimatedCost
      )
      promptIds.push(promptId)
    } catch (error) {
      console.error(`❌ Failed to create prompt for ${prompt.assistantType}:`, error)
      // Continue with other prompts even if one fails
    }
  }

  console.log('✅ Created prompt versions:', promptIds.length)
  return promptIds
}

/**
 * Deactivate old prompt versions (keep only latest)
 */
export async function deactivateOldPromptVersions(
  projectId: string,
  assistantType?: AssistantType
): Promise<number> {
  console.log('🗑️ Deactivating old prompt versions:', { projectId, assistantType })

  const { data, error } = await supabase
    .rpc('deactivate_old_prompt_versions', {
      p_project_id: projectId,
      p_assistant_type: assistantType || null
    })

  if (error) {
    console.error('❌ Error deactivating old versions:', error)
    throw new Error(`Failed to deactivate old versions: ${error.message}`)
  }

  console.log('✅ Deactivated old versions:', data)
  return data
}

/**
 * Get project prompt statistics
 */
export async function getProjectPromptStats(projectId: string): Promise<ProjectPromptStats> {
  console.log('📊 Fetching project prompt stats for:', projectId)

  const { data, error } = await supabase
    .rpc('get_project_prompt_stats', { project_uuid: projectId })

  if (error) {
    console.error('❌ Error fetching prompt stats:', error)
    throw new Error(`Failed to fetch prompt stats: ${error.message}`)
  }

  const stats = data?.[0] || {
    total_prompts: 0,
    total_versions: 0,
    total_input_tokens: 0,
    total_output_tokens: 0,
    total_estimated_cost: 0,
    latest_generation: null
  }

  console.log('✅ Fetched prompt stats:', stats)
  
  return {
    totalPrompts: stats.total_prompts,
    totalVersions: stats.total_versions,
    totalInputTokens: stats.total_input_tokens,
    totalOutputTokens: stats.total_output_tokens,
    totalEstimatedCost: parseFloat(stats.total_estimated_cost || '0'),
    latestGeneration: stats.latest_generation ? new Date(stats.latest_generation) : null
  }
}

/**
 * Update prompt content (create new version with custom modifications)
 */
export async function updatePromptContent(
  projectId: string,
  assistantType: AssistantType,
  newContent: string,
  customModifications?: string
): Promise<string> {
  console.log('✏️ Updating prompt content:', { projectId, assistantType })

  // Get current prompt to preserve metadata
  const currentPrompts = await getProjectAssistants(projectId)
  const currentPrompt = currentPrompts.find(p => p.assistantType === assistantType)

  if (!currentPrompt) {
    throw new Error(`No existing prompt found for assistant type: ${assistantType}`)
  }

  // Create new version with updated content
  const insertData = {
    project_id: projectId,
    assistant_type: assistantType,
    prompt_content: newContent,
    prompt_version: currentPrompt.promptVersion + 1,
    generated_from_audio_ids: JSON.stringify(currentPrompt.generatedFromAudioIds),
    generation_model: currentPrompt.generationModel,
    input_tokens: currentPrompt.inputTokens,
    output_tokens: currentPrompt.outputTokens,
    estimated_cost: currentPrompt.estimatedCost,
    custom_modifications: customModifications
  }

  const { data, error } = await supabase
    .from('project_assistants')
    .insert(insertData)
    .select('id')
    .single()

  if (error) {
    console.error('❌ Error updating prompt content:', error)
    throw new Error(`Failed to update prompt content: ${error.message}`)
  }

  console.log('✅ Updated prompt content with new version')
  return data.id
}

/**
 * Delete project assistant prompt
 */
export async function deleteProjectAssistant(promptId: string): Promise<void> {
  console.log('🗑️ Deleting project assistant:', promptId)

  const { error } = await supabase
    .from('project_assistants')
    .delete()
    .eq('id', promptId)

  if (error) {
    console.error('❌ Error deleting project assistant:', error)
    throw new Error(`Failed to delete project assistant: ${error.message}`)
  }

  console.log('✅ Deleted project assistant')
}

/**
 * Toggle favorite status for a prompt
 */
export async function togglePromptFavorite(promptId: string, isFavorite: boolean): Promise<void> {
  console.log('⭐ Toggling prompt favorite:', { promptId, isFavorite })

  const { error } = await supabase
    .from('project_assistants')
    .update({ 
      is_favorite: isFavorite,
      updated_at: new Date().toISOString()
    })
    .eq('id', promptId)

  if (error) {
    console.error('❌ Error toggling favorite:', error)
    throw new Error(`Failed to toggle favorite: ${error.message}`)
  }

  console.log('✅ Toggled prompt favorite status')
}

/**
 * Get audio transcripts for selection during project creation
 */
export async function getAudioTranscriptsForSelection(
  userEmail: string,
  limit: number = 50,
  searchTerm?: string
): Promise<AudioTranscriptForSelection[]> {
  console.log('🎵 Fetching audio transcripts for selection:', { userEmail, limit, searchTerm })

  let query = supabase
    .from('audio_transcript')
    .select(`
      id,
      title,
      description,
      audio_filename,
      metadata,
      created_at,
      raw_transcript,
      ai_summary
    `)
    .eq('added_by_email', userEmail)
    .order('created_at', { ascending: false })
    .limit(limit)

  // Add search filter if provided
  if (searchTerm && searchTerm.trim()) {
    query = query.or(`
      title.ilike.%${searchTerm}%,
      description.ilike.%${searchTerm}%,
      audio_filename.ilike.%${searchTerm}%
    `)
  }

  const { data, error } = await query

  if (error) {
    console.error('❌ Error fetching audio transcripts:', error)
    throw new Error(`Failed to fetch audio transcripts: ${error.message}`)
  }

  // Transform the data
  const transcripts: AudioTranscriptForSelection[] = (data || []).map(record => ({
    id: record.id,
    title: record.title,
    description: record.description,
    audio_filename: record.audio_filename,
    duration: (record.metadata as any)?.duration || 0,
    created_at: record.created_at,
    ai_summary: record.ai_summary ? (record.ai_summary as any).aiSummary : null,
    raw_transcript: record.raw_transcript ? (record.raw_transcript as any).rawTranscript : null
  }))

  console.log('✅ Fetched audio transcripts:', transcripts.length)
  return transcripts
}

/**
 * Get audio summaries by IDs for prompt generation
 */
export async function getAudioSummariesByIds(audioIds: string[]): Promise<string[]> {
  console.log('📝 Fetching audio summaries by IDs:', audioIds)

  if (audioIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('audio_transcript')
    .select('ai_summary, raw_transcript, title')
    .in('id', audioIds)

  if (error) {
    console.error('❌ Error fetching audio summaries:', error)
    throw new Error(`Failed to fetch audio summaries: ${error.message}`)
  }

  // Extract summaries, fallback to raw transcript if no AI summary
  const summaries = (data || []).map(record => {
    const aiSummary = record.ai_summary ? (record.ai_summary as any).aiSummary : null
    const rawTranscript = record.raw_transcript ? (record.raw_transcript as any).rawTranscript : null
    const title = record.title || 'Untitled Recording'
    
    if (aiSummary) {
      return `**${title}**\n\n${aiSummary}`
    } else if (rawTranscript) {
      return `**${title}**\n\n${rawTranscript}`
    } else {
      return `**${title}**\n\nNo transcript available.`
    }
  })

  console.log('✅ Extracted audio summaries:', summaries.length)
  return summaries
}