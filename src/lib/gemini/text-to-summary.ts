import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

export interface TextSummaryResult {
  originalText: string
  aiSummary: string
  wordCount: number
  summaryLength: 'short' | 'medium' | 'detailed'
}

export async function generateAISummaryFromText(
  text: string,
  summaryLength: 'short' | 'medium' | 'detailed' = 'medium'
): Promise<TextSummaryResult> {
  try {
    console.log('Starting AI summary generation from text...')
    
    if (!text.trim()) {
      throw new Error('Text cannot be empty')
    }

    // Get the generative model - using configurable model from environment
    const modelName = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-1.5-pro'
    const model = genAI.getGenerativeModel({ model: modelName })
    
    // Create length-specific instructions
    const lengthInstructions = {
      short: 'Create a concise summary with 3-5 bullet points highlighting only the most critical information.',
      medium: 'Create a comprehensive summary with 6-10 bullet points covering key topics, decisions, and action items.',
      detailed: 'Create a detailed summary with 10-15 bullet points providing thorough coverage of all important topics, subtopics, decisions, technical details, and action items.'
    }

    const summaryPrompt = `
Based on the following text, please generate an objective, structured AI summary with bullet points.

TEXT TO SUMMARIZE:
"${text}"

Please provide ONLY a JSON response with this structure:
{
  "aiSummary": "**Overview:**\\n• Key discussion points in bullet format\\n• Important information summarized\\n\\n**Key Points:**\\n• Main topics covered\\n• Important details mentioned\\n\\n**Action Items:** (if any)\\n• Tasks or next steps mentioned\\n• Deadlines or assignments"
}

AI SUMMARY Guidelines:
- ${lengthInstructions[summaryLength]}
- Use objective, factual language (avoid subjective opinions)
- Structure with clear sections using **bold headers**
- Use bullet points (•) for all key information
- For software development content, include these sections if applicable:
  * **Overview:** Main purpose and topics
  * **Features Discussed:** List of app features mentioned
  * **Technical Requirements:** Technical specifications, frameworks, APIs
  * **Design Decisions:** UI/UX choices, architecture decisions
  * **Action Items:** Tasks, assignments, deadlines
  * **Next Steps:** Follow-up meetings, deliverables
- For general content, use:
  * **Overview:** Main purpose and key topics
  * **Key Points:** Important discussion items
  * **Decisions Made:** Conclusions reached (if any)
  * **Action Items:** Tasks and next steps (if any)
- Be specific with technical terms and feature lists
- Include concrete deliverables and timelines if mentioned
- Keep bullet points concise but informative
- If the text quality is poor or unclear, mention it in the summary
- If no action items exist, omit that section
`

    // Generate AI summary
    const result = await model.generateContent(summaryPrompt)
    const response = await result.response
    const responseText = response.text()
    
    console.log('AI summary generation completed')
    
    // Parse the JSON response
    let aiSummary: string
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      
      const summaryData = JSON.parse(jsonMatch[0])
      aiSummary = summaryData.aiSummary || 'Unable to generate AI summary.'
      
    } catch (parseError) {
      console.error('Failed to parse summary JSON response:', parseError)
      
      // Fallback: use the raw response as summary
      aiSummary = `**AI Summary:**\n\n${responseText}`
    }

    // Calculate word count
    const wordCount = text.trim().split(/\s+/).length

    return {
      originalText: text,
      aiSummary,
      wordCount,
      summaryLength
    }
    
  } catch (error) {
    console.error('Error generating AI summary from text:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Gemini API key is not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.')
      } else if (error.message.includes('quota')) {
        throw new Error('Gemini API quota exceeded. Please try again later or check your billing.')
      } else if (error.message.includes('empty')) {
        throw new Error('Please enter some text to summarize.')
      }
    }
    
    throw new Error(`Summary generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Helper function to estimate reading time
export function estimateReadingTime(text: string): number {
  const wordsPerMinute = 200 // Average reading speed
  const wordCount = text.trim().split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

// Helper function to get text statistics
export function getTextStatistics(text: string) {
  const trimmedText = text.trim()
  const wordCount = trimmedText.split(/\s+/).length
  const charCount = trimmedText.length
  const charCountNoSpaces = trimmedText.replace(/\s/g, '').length
  const paragraphCount = trimmedText.split(/\n\s*\n/).length
  const readingTime = estimateReadingTime(trimmedText)
  
  return {
    wordCount,
    charCount,
    charCountNoSpaces,
    paragraphCount,
    readingTime
  }
}