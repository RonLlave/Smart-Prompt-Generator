import { NextRequest, NextResponse } from 'next/server'
import { generateAssistantPrompts, validatePromptGenerationRequest } from '@/lib/gemini/assistant-prompt-generation'
import { getAudioSummariesByIds } from '@/lib/supabase/project-assistants'
import { AssistantPromptRequest, PromptGenerationResult } from '@/lib/types/project-assistants'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API: Generate assistant prompts endpoint called')
    
    const body = await request.json() as AssistantPromptRequest & {
      selectedAudioIds?: string[]
    }
    
    console.log('📝 Request body:', {
      projectName: body.projectName,
      assistantTypes: body.assistantTypes,
      selectedAudioIds: body.selectedAudioIds?.length || 0
    })

    // Validate request
    const validationErrors = validatePromptGenerationRequest(body)
    if (validationErrors.length > 0) {
      console.error('❌ Validation errors:', validationErrors)
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }

    // Get audio summaries if audio IDs provided
    let audioSummaries: string[] = []
    if (body.selectedAudioIds && body.selectedAudioIds.length > 0) {
      try {
        console.log('🎵 Fetching audio summaries for IDs:', body.selectedAudioIds)
        audioSummaries = await getAudioSummariesByIds(body.selectedAudioIds)
        console.log('✅ Fetched audio summaries:', audioSummaries.length)
      } catch (error) {
        console.error('⚠️ Failed to fetch audio summaries, continuing without:', error)
        // Continue without audio summaries if fetch fails
      }
    }

    // Prepare request for prompt generation
    const promptRequest: AssistantPromptRequest = {
      projectName: body.projectName,
      projectDescription: body.projectDescription,
      audioSummaries,
      assistantTypes: body.assistantTypes
    }

    // Generate prompts using Gemini
    console.log('🤖 Generating assistant prompts...')
    const results: PromptGenerationResult[] = await generateAssistantPrompts(promptRequest)
    
    console.log('✅ Successfully generated prompts:', {
      count: results.length,
      totalCost: results.reduce((sum, r) => sum + r.estimatedCost, 0)
    })

    return NextResponse.json({
      success: true,
      results,
      totalCost: results.reduce((sum, r) => sum + r.estimatedCost, 0),
      totalInputTokens: results.reduce((sum, r) => sum + r.inputTokens, 0),
      totalOutputTokens: results.reduce((sum, r) => sum + r.outputTokens, 0)
    })

  } catch (error) {
    console.error('❌ API Error generating prompts:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate prompts',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}