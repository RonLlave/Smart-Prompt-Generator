import { NextRequest, NextResponse } from 'next/server'
import { getAudioTranscriptsForSelection } from '@/lib/supabase/project-assistants'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 API: Get audio transcripts endpoint called')
    
    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get('search') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const userEmail = searchParams.get('userEmail')
    
    console.log('📝 Request params:', {
      searchTerm,
      limit,
      userEmail: userEmail ? '***@***' : 'missing'
    })

    // Validate user email parameter
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      )
    }

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      )
    }

    console.log('🎵 Fetching audio transcripts...')
    const transcripts = await getAudioTranscriptsForSelection(
      userEmail,
      limit,
      searchTerm
    )
    
    console.log('✅ Successfully fetched transcripts:', transcripts.length)

    return NextResponse.json({
      success: true,
      transcripts,
      count: transcripts.length,
      searchTerm,
      limit
    })

  } catch (error) {
    console.error('❌ API Error fetching audio transcripts:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch audio transcripts',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}