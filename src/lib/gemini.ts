import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "")

export async function generatePromptWithGemini(components: Array<{
  displayName: string
  position: { x: number; y: number }
  configuration?: Record<string, unknown>
}>) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })

    const componentDescriptions = components.map(comp => {
      const config = comp.configuration ? JSON.stringify(comp.configuration) : 'default'
      return `- ${comp.displayName} at position (${comp.position.x}, ${comp.position.y}) with config: ${config}`
    }).join('\n')

    const prompt = `You are an expert prompt engineer. I have created a visual prompt builder with the following components arranged on a canvas:

${componentDescriptions}

Based on these components and their positions, create a comprehensive, well-structured prompt that:

1. Takes into account the spatial relationships between components
2. Creates a logical flow from the component arrangement
3. Incorporates the component configurations effectively
4. Results in a clear, actionable prompt for an AI system

The components are arranged from top-left (0,0) to bottom-right. Components closer together should be more related in the final prompt structure.

Please generate a detailed, professional prompt that makes use of all these elements cohesively.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error generating prompt with Gemini:', error)
    throw new Error('Failed to generate prompt. Please check your API key and try again.')
  }
}

export async function isGeminiConfigured(): Promise<boolean> {
  return !!(process.env.GOOGLE_GENERATIVE_AI_API_KEY)
}