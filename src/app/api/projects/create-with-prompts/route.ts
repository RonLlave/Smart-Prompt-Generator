import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'
import { generateAssistantPrompts, validatePromptGenerationRequest } from '@/lib/gemini/assistant-prompt-generation'
import { getAudioSummariesByIds, createMultiplePromptVersions } from '@/lib/supabase/project-assistants'
import { CreateProjectWithPromptsRequest, CreateProjectWithPromptsResponse, AssistantPromptRequest } from '@/lib/types/project-assistants'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 API: Create project with prompts endpoint called')
    
    const body = await request.json() as CreateProjectWithPromptsRequest & {
      userEmail: string
    }
    
    console.log('📝 Request body:', {
      projectName: body.projectName,
      assistantTypes: body.assistantTypes,
      selectedAudioIds: body.selectedAudioIds?.length || 0,
      userEmail: body.userEmail ? '***@***' : 'missing'
    })

    // Validate required fields
    if (!body.projectName || !body.projectDescription || !body.assistantTypes || !body.userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: projectName, projectDescription, assistantTypes, userEmail' },
        { status: 400 }
      )
    }

    // Validate assistant types
    const validationErrors = validatePromptGenerationRequest({
      projectName: body.projectName,
      projectDescription: body.projectDescription,
      audioSummaries: [],
      assistantTypes: body.assistantTypes
    })
    
    if (validationErrors.length > 0) {
      console.error('❌ Validation errors:', validationErrors)
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Step 1: Create the project
    console.log('📂 Creating project in database...')
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert({
        name: body.projectName,
        description: body.projectDescription,
        user_id: body.userEmail, // Using email as user identifier
        components: [],
        status: 'active'
      })
      .select('id')
      .single()

    if (projectError) {
      console.error('❌ Error creating project:', projectError)
      return NextResponse.json(
        { error: 'Failed to create project', details: projectError.message },
        { status: 500 }
      )
    }

    console.log('✅ Project created with ID:', projectData.id)
    const projectId = projectData.id

    // Step 2: Get audio summaries if provided
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

    // Step 3: Generate assistant prompts
    console.log('🤖 Generating assistant prompts...')
    const promptRequest: AssistantPromptRequest = {
      projectName: body.projectName,
      projectDescription: body.projectDescription,
      audioSummaries,
      assistantTypes: body.assistantTypes
    }

    const promptResults = await generateAssistantPrompts(promptRequest)
    console.log('✅ Generated prompts:', promptResults.length)

    // Step 4: Save prompts to database
    console.log('💾 Saving prompts to database...')
    try {
      const promptIds = await createMultiplePromptVersions(
        projectId,
        promptResults,
        body.selectedAudioIds || [],
        'gemini-2.5-pro'
      )
      console.log('✅ Saved prompts to database:', promptIds.length)
    } catch (error) {
      console.error('⚠️ Failed to save some prompts to database:', error)
      // Continue even if some prompts fail to save
    }

    // Step 5: Return success response
    const response: CreateProjectWithPromptsResponse = {
      projectId,
      prompts: promptResults
    }

    console.log('🎉 Successfully created project with prompts:', {
      projectId,
      promptsGenerated: promptResults.length,
      totalCost: promptResults.reduce((sum, r) => sum + r.estimatedCost, 0)
    })

    return NextResponse.json({
      success: true,
      ...response,
      totalCost: promptResults.reduce((sum, r) => sum + r.estimatedCost, 0),
      totalInputTokens: promptResults.reduce((sum, r) => sum + r.inputTokens, 0),
      totalOutputTokens: promptResults.reduce((sum, r) => sum + r.outputTokens, 0)
    })

  } catch (error) {
    console.error('❌ API Error creating project with prompts:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to create project with prompts',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}