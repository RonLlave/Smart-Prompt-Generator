import { NextRequest, NextResponse } from 'next/server'
import { generatePromptWithGemini } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const { components } = await request.json()

    if (!components || !Array.isArray(components)) {
      return NextResponse.json(
        { error: 'Invalid components data' },
        { status: 400 }
      )
    }

    if (components.length === 0) {
      return NextResponse.json(
        { error: 'No components provided' },
        { status: 400 }
      )
    }

    const generatedPrompt = await generatePromptWithGemini(components)

    return NextResponse.json({ prompt: generatedPrompt })
  } catch (error) {
    console.error('Error in generate-prompt API:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate prompt'
      },
      { status: 500 }
    )
  }
}