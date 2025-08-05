import { GoogleGenerativeAI } from '@google/generative-ai'
import { 
  AssistantPromptRequest, 
  PromptGenerationResult,
  AssistantType,
  ASSISTANT_TYPE_CONFIGS
} from '@/lib/types/project-assistants'

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

// Token estimation constants (approximate)
const ESTIMATED_TOKENS_PER_CHAR = 0.25
const GEMINI_COST_PER_1K_INPUT_TOKENS = 0.00015 // $0.15 per 1M tokens
const GEMINI_COST_PER_1K_OUTPUT_TOKENS = 0.0006 // $0.60 per 1M tokens

/**
 * Generate AI assistant prompts based on project details and audio summaries
 */
export async function generateAssistantPrompts(
  request: AssistantPromptRequest
): Promise<PromptGenerationResult[]> {
  console.log('🤖 Starting assistant prompt generation:', {
    projectName: request.projectName,
    assistantTypes: request.assistantTypes,
    audioSummariesCount: request.audioSummaries.length
  })

  const results: PromptGenerationResult[] = []
  const modelName = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-2.5-pro'
  const model = genAI.getGenerativeModel({ model: modelName })

  // Generate prompts for each assistant type
  for (const assistantType of request.assistantTypes) {
    try {
      console.log(`🔄 Generating prompt for ${assistantType} assistant...`)
      
      const promptContent = await generateSingleAssistantPrompt(
        model,
        assistantType,
        request.projectName,
        request.projectDescription,
        request.audioSummaries
      )
      
      // Estimate tokens and cost
      const inputText = createPromptGenerationInput(
        assistantType,
        request.projectName,
        request.projectDescription,
        request.audioSummaries
      )
      
      const inputTokens = Math.ceil(inputText.length * ESTIMATED_TOKENS_PER_CHAR)
      const outputTokens = Math.ceil(promptContent.length * ESTIMATED_TOKENS_PER_CHAR)
      const estimatedCost = 
        (inputTokens / 1000) * GEMINI_COST_PER_1K_INPUT_TOKENS +
        (outputTokens / 1000) * GEMINI_COST_PER_1K_OUTPUT_TOKENS

      results.push({
        assistantType,
        promptContent,
        inputTokens,
        outputTokens,
        estimatedCost
      })

      console.log(`✅ Generated ${assistantType} prompt (${outputTokens} tokens, $${estimatedCost.toFixed(4)})`)
      
    } catch (error) {
      console.error(`❌ Failed to generate ${assistantType} prompt:`, error)
      
      // Add fallback prompt if generation fails
      results.push({
        assistantType,
        promptContent: generateFallbackPrompt(assistantType, request.projectName, request.projectDescription),
        inputTokens: 0,
        outputTokens: 0,
        estimatedCost: 0
      })
    }
  }

  console.log('🎉 Assistant prompt generation completed:', {
    successfulPrompts: results.filter(r => r.inputTokens > 0).length,
    fallbackPrompts: results.filter(r => r.inputTokens === 0).length,
    totalCost: results.reduce((sum, r) => sum + r.estimatedCost, 0)
  })

  return results
}

/**
 * Generate a single assistant prompt using Gemini
 */
async function generateSingleAssistantPrompt(
  model: any,
  assistantType: AssistantType,
  projectName: string,
  projectDescription: string,
  audioSummaries: string[]
): Promise<string> {
  const assistantConfig = ASSISTANT_TYPE_CONFIGS[assistantType]
  const combinedAudioContent = audioSummaries.join('\n\n---\n\n')
  
  const promptGenerationPrompt = `
You are an expert AI assistant prompt engineer. Generate a detailed, actionable prompt for a ${assistantConfig.label} working on a software development project.

## Project Context:
**Project Name:** ${projectName}
**Project Description:** ${projectDescription}

## Meeting/Audio Content:
${combinedAudioContent || 'No audio summaries provided.'}

## Assistant Role: ${assistantConfig.label}
**Responsibilities:** ${assistantConfig.description}

## Instructions:
Generate a comprehensive prompt that will help a ${assistantConfig.label} AI assistant effectively support this project. The prompt should:

1. **Clearly define the role and responsibilities** specific to ${assistantConfig.label}
2. **Reference specific requirements, features, and decisions** mentioned in the audio content
3. **Provide actionable guidance** for typical tasks this assistant will handle
4. **Include relevant technical context** from the project and meetings
5. **Be copy-paste ready** for immediate use with an AI assistant
6. **Be approximately 500-800 words** with clear structure and sections

## Output Format:
Provide ONLY the assistant prompt content. Do not include explanations, meta-commentary, or additional text. The output should be the complete prompt that can be directly copied and used.

## ${assistantConfig.label} Prompt Focus Areas:
${getAssistantSpecificGuidelines(assistantType)}

Generate the prompt now:`

  const result = await model.generateContent(promptGenerationPrompt)
  const response = await result.response
  const promptContent = response.text().trim()

  if (!promptContent || promptContent.length < 100) {
    throw new Error(`Generated prompt too short or empty for ${assistantType}`)
  }

  return promptContent
}

/**
 * Get assistant-specific guidelines for prompt generation
 */
function getAssistantSpecificGuidelines(assistantType: AssistantType): string {
  const guidelines: Record<AssistantType, string> = {
    manager: `
- Project planning, timeline management, and milestone tracking
- Team coordination and task delegation strategies
- Risk assessment and mitigation planning
- Stakeholder communication and reporting
- Resource allocation and budget considerations
- Quality assurance and delivery oversight`,

    frontend: `
- UI/UX implementation and component development
- Frontend architecture and state management
- Responsive design and cross-browser compatibility
- Performance optimization and code splitting
- Integration with backend APIs and services
- Testing strategies for frontend components`,

    backend: `
- Server-side architecture and API design
- Database integration and data modeling
- Authentication and authorization systems
- Performance optimization and scalability
- Error handling and logging strategies
- Security best practices and implementation`,

    database: `
- Database schema design and optimization
- Query performance and indexing strategies
- Data migration and versioning approaches
- Backup and recovery procedures
- Security policies and access control
- Monitoring and maintenance best practices`,

    uiux: `
- User interface design and design system creation
- User experience flow and interaction design
- Accessibility compliance and inclusive design
- Prototyping and wireframing approaches
- Design tool integration and handoff processes
- User research and testing methodologies`,

    qa: `
- Test strategy development and implementation
- Automated testing frameworks and tools
- Bug identification, reporting, and tracking
- Performance and load testing approaches
- Security testing and vulnerability assessment
- Documentation and test case management`
  }

  return guidelines[assistantType] || 'General software development guidance'
}

/**
 * Create the input text for token estimation
 */
function createPromptGenerationInput(
  assistantType: AssistantType,
  projectName: string,
  projectDescription: string,
  audioSummaries: string[]
): string {
  const assistantConfig = ASSISTANT_TYPE_CONFIGS[assistantType]
  const combinedAudioContent = audioSummaries.join('\n\n---\n\n')
  
  return `Role: ${assistantConfig.label}
Project: ${projectName}
Description: ${projectDescription}
Audio Content: ${combinedAudioContent}
Guidelines: ${getAssistantSpecificGuidelines(assistantType)}`
}

/**
 * Generate fallback prompt when AI generation fails
 */
function generateFallbackPrompt(
  assistantType: AssistantType,
  projectName: string,
  projectDescription: string
): string {
  const assistantConfig = ASSISTANT_TYPE_CONFIGS[assistantType]
  
  return `# ${assistantConfig.label} Assistant Prompt

## Project Context
You are a ${assistantConfig.label} assistant working on the "${projectName}" project.

**Project Description:** ${projectDescription}

## Your Role
${assistantConfig.description}

## Key Responsibilities
${getAssistantSpecificGuidelines(assistantType)}

## Instructions
- Provide expert guidance in your area of specialization
- Reference the project context in your responses
- Offer practical, actionable advice
- Consider project constraints and requirements
- Maintain focus on project goals and deliverables

## Communication Style
- Be clear and concise in your responses
- Ask clarifying questions when needed
- Provide examples and best practices
- Suggest alternatives when appropriate
- Stay focused on your role's responsibilities

*Note: This is a fallback prompt. For best results, generate a custom prompt based on specific project requirements and meeting content.*`
}

/**
 * Regenerate a single assistant prompt
 */
export async function regenerateSingleAssistantPrompt(
  assistantType: AssistantType,
  projectName: string,
  projectDescription: string,
  audioSummaries: string[]
): Promise<PromptGenerationResult> {
  console.log(`🔄 Regenerating single prompt for ${assistantType}`)
  
  const results = await generateAssistantPrompts({
    projectName,
    projectDescription,
    audioSummaries,
    assistantTypes: [assistantType]
  })
  
  return results[0]
}

/**
 * Validate prompt generation request
 */
export function validatePromptGenerationRequest(request: AssistantPromptRequest): string[] {
  const errors: string[] = []
  
  if (!request.projectName || request.projectName.trim().length === 0) {
    errors.push('Project name is required')
  }
  
  if (!request.projectDescription || request.projectDescription.trim().length === 0) {
    errors.push('Project description is required')
  }
  
  if (!request.assistantTypes || request.assistantTypes.length === 0) {
    errors.push('At least one assistant type must be selected')
  }
  
  if (request.assistantTypes.some(type => !Object.keys(ASSISTANT_TYPE_CONFIGS).includes(type))) {
    errors.push('Invalid assistant type provided')
  }
  
  return errors
}

/**
 * Estimate total cost for prompt generation
 */
export function estimatePromptGenerationCost(
  projectDescription: string,
  audioSummaries: string[],
  assistantTypes: AssistantType[]
): number {
  const combinedAudioContent = audioSummaries.join('\n\n---\n\n')
  const averageInputLength = projectDescription.length + combinedAudioContent.length + 500 // Base prompt overhead
  const averageOutputLength = 600 // Expected prompt length
  
  const inputTokensPerPrompt = Math.ceil(averageInputLength * ESTIMATED_TOKENS_PER_CHAR)
  const outputTokensPerPrompt = Math.ceil(averageOutputLength * ESTIMATED_TOKENS_PER_CHAR)
  
  const costPerPrompt = 
    (inputTokensPerPrompt / 1000) * GEMINI_COST_PER_1K_INPUT_TOKENS +
    (outputTokensPerPrompt / 1000) * GEMINI_COST_PER_1K_OUTPUT_TOKENS
  
  return costPerPrompt * assistantTypes.length
}