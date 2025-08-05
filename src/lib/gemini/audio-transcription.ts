import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

export interface TranscriptionResult {
  rawTranscript: string
  aiSummary: string
  speakerCount: number
  speakerSegments: Array<{
    speaker: string
    text: string
    timestamp?: string
  }>
}

export async function transcribeAudioWithGemini(
  audioBlob: Blob
): Promise<TranscriptionResult> {
  try {
    console.log('Starting audio transcription with Gemini (Step 1: Raw Transcript)...')
    
    // Convert blob to base64
    const arrayBuffer = await audioBlob.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString('base64')
    
    // Get the generative model - using configurable model from environment
    const modelName = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-1.5-pro'
    const model = genAI.getGenerativeModel({ model: modelName })
    
    // STEP 1: Generate raw transcript with speaker identification
    const transcriptPrompt = `
Please transcribe this audio file with speaker identification. Provide ONLY a JSON response with this exact structure:

{
  "rawTranscript": "Complete word-for-word transcription with speaker labels like 'Speaker 1: Hello, how are you? Speaker 2: I'm doing well, thanks.'",
  "speakerCount": 2,
  "speakerSegments": [
    {
      "speaker": "Speaker 1",
      "text": "Hello, how are you?",
      "timestamp": "00:00"
    },
    {
      "speaker": "Speaker 2", 
      "text": "I'm doing well, thanks.",
      "timestamp": "00:05"
    }
  ]
}

Instructions:
- Be intelligent about identifying different voices and speech patterns
- If you can't clearly distinguish speakers, use "Speaker 1" for all content
- Include natural pauses and "um", "uh" sounds in raw transcript
- Estimate timestamps based on speech flow (don't worry about exact precision)
- Ensure the rawTranscript field contains the complete transcription with speaker labels
`

    // Generate raw transcript
    const transcriptResult = await model.generateContent([
      {
        inlineData: {
          data: base64Audio,
          mimeType: audioBlob.type || 'audio/webm'
        }
      },
      transcriptPrompt
    ])

    const transcriptResponse = await transcriptResult.response
    const transcriptText = transcriptResponse.text()
    
    console.log('Step 1 completed: Raw transcript generated')
    
    // Parse the transcript JSON response
    let transcriptData: Partial<TranscriptionResult>
    try {
      const jsonMatch = transcriptText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in transcript response')
      }
      
      transcriptData = JSON.parse(jsonMatch[0])
      
      if (!transcriptData.rawTranscript) {
        throw new Error('No rawTranscript in response')
      }
      
    } catch (parseError) {
      console.error('Failed to parse transcript JSON response:', parseError)
      
      // Fallback: use the raw response as transcript
      transcriptData = {
        rawTranscript: transcriptText,
        speakerCount: 1,
        speakerSegments: [{
          speaker: 'Speaker 1',
          text: transcriptText,
          timestamp: '00:00'
        }]
      }
    }

    console.log('Starting Step 2: AI Summary generation based on raw transcript...')

    // STEP 2: Generate AI summary based on the raw transcript
    const summaryPrompt = `
Based on the following raw transcript, please generate an objective, structured AI summary with bullet points.

RAW TRANSCRIPT:
"${transcriptData.rawTranscript}"

Please provide ONLY a JSON response with this structure:
{
  "aiSummary": "**Meeting Overview:**\\n• Key discussion points in bullet format\\n• Decisions made and action items\\n\\n**Technical Details:** (if applicable)\\n• Features discussed\\n• Requirements mentioned\\n• Technical specifications\\n\\n**Action Items:**\\n• Tasks assigned\\n• Next steps\\n• Deadlines mentioned"
}

AI SUMMARY Guidelines:
- Use objective, factual language (avoid subjective opinions)
- Structure with clear sections using **bold headers**
- Use bullet points (•) for all key information
- For software development meetings, include these sections if applicable:
  * **Meeting Overview:** Main purpose and topics
  * **Features Discussed:** List of app features mentioned
  * **Technical Requirements:** Technical specifications, frameworks, APIs
  * **Design Decisions:** UI/UX choices, architecture decisions
  * **Action Items:** Tasks, assignments, deadlines
  * **Next Steps:** Follow-up meetings, deliverables
- For non-technical meetings, use:
  * **Meeting Overview:** Purpose and main topics
  * **Key Points:** Important discussion items
  * **Decisions Made:** Conclusions reached
  * **Action Items:** Tasks and next steps
- Be specific with feature lists (e.g., "Authentication system", "User dashboard", "Payment integration")
- Include technical terms mentioned (React, API, database, etc.)
- List concrete deliverables and timelines
- Keep bullet points concise but informative
- If audio quality was poor, mention it in the summary
`

    // Generate AI summary
    const summaryResult = await model.generateContent(summaryPrompt)
    const summaryResponse = await summaryResult.response
    const summaryText = summaryResponse.text()
    
    console.log('Step 2 completed: AI summary generated')
    
    // Parse the summary JSON response
    let aiSummary: string
    try {
      const jsonMatch = summaryText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in summary response')
      }
      
      const summaryData = JSON.parse(jsonMatch[0])
      aiSummary = summaryData.aiSummary || 'Unable to generate AI summary.'
      
    } catch (parseError) {
      console.error('Failed to parse summary JSON response:', parseError)
      aiSummary = 'Unable to generate AI summary. Error parsing response.'
    }

    // Combine the results
    const finalResult: TranscriptionResult = {
      rawTranscript: transcriptData.rawTranscript || '',
      aiSummary,
      speakerCount: transcriptData.speakerCount || 1,
      speakerSegments: transcriptData.speakerSegments || [{
        speaker: 'Speaker 1',
        text: transcriptData.rawTranscript || '',
        timestamp: '00:00'
      }]
    }
    
    console.log('Audio transcription completed successfully with 2-step process')
    return finalResult
    
  } catch (error) {
    console.error('Error transcribing audio with Gemini:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Gemini API key is not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.')
      } else if (error.message.includes('quota')) {
        throw new Error('Gemini API quota exceeded. Please try again later or check your billing.')
      } else if (error.message.includes('audio format')) {
        throw new Error('Audio format not supported. Please try a different recording format.')
      }
    }
    
    throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function transcribeAudioChunk(
  audioBlob: Blob,
  isLiveRecording: boolean = false
): Promise<TranscriptionResult> {
  // For live recording, we might want different processing
  if (isLiveRecording) {
    console.log('Processing live recording chunk...')
  }
  
  return transcribeAudioWithGemini(audioBlob)
}

// Helper function to format transcript for display
export function formatTranscriptForDisplay(segments: TranscriptionResult['speakerSegments']): string {
  return segments.map(segment => {
    const timestamp = segment.timestamp ? `[${segment.timestamp}] ` : ''
    return `${timestamp}${segment.speaker}: ${segment.text}`
  }).join('\n\n')
}

// Helper function to estimate audio duration from blob
export function estimateAudioDuration(audioBlob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio()
    audio.onloadedmetadata = () => {
      resolve(audio.duration)
    }
    audio.onerror = () => {
      resolve(0) // Fallback if can't determine duration
    }
    audio.src = URL.createObjectURL(audioBlob)
  })
}