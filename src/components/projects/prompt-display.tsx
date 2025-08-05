"use client"

import { useState } from 'react'
import { Copy, RefreshCw, Check, Loader2, Users, Monitor, Server, Database, Palette, CheckCircle, Download } from 'lucide-react'
import { AssistantType, ASSISTANT_TYPE_CONFIGS, PromptGenerationResult } from '@/lib/types/project-assistants'

interface PromptDisplayProps {
  prompts: PromptGenerationResult[]
  isLoading: boolean
  onRegenerate: (assistantType?: AssistantType) => void
  onCopy: (assistantType: AssistantType, content: string) => void
  totalCost?: number
  totalTokens?: number
}

const ICON_COMPONENTS = {
  Users,
  Monitor,
  Server,
  Database,
  Palette,
  CheckCircle
}

export function PromptDisplay({ 
  prompts, 
  isLoading, 
  onRegenerate, 
  onCopy,
  totalCost = 0,
  totalTokens = 0
}: PromptDisplayProps) {
  const [activeTab, setActiveTab] = useState<AssistantType | null>(
    prompts.length > 0 ? prompts[0].assistantType : null
  )
  const [copiedStates, setCopiedStates] = useState<Record<AssistantType, boolean>>({} as Record<AssistantType, boolean>)
  const [regeneratingStates, setRegeneratingStates] = useState<Record<AssistantType, boolean>>({} as Record<AssistantType, boolean>)

  // Update active tab when prompts change
  if (activeTab === null && prompts.length > 0) {
    setActiveTab(prompts[0].assistantType)
  }

  const handleCopy = async (assistantType: AssistantType, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedStates(prev => ({ ...prev, [assistantType]: true }))
      onCopy(assistantType, content)
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [assistantType]: false }))
      }, 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const handleRegenerate = async (assistantType?: AssistantType) => {
    if (assistantType) {
      setRegeneratingStates(prev => ({ ...prev, [assistantType]: true }))
    }
    
    try {
      await onRegenerate(assistantType)
    } finally {
      if (assistantType) {
        setRegeneratingStates(prev => ({ ...prev, [assistantType]: false }))
      }
    }
  }

  const downloadPrompt = (assistantType: AssistantType, content: string) => {
    const config = ASSISTANT_TYPE_CONFIGS[assistantType]
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${config.label.toLowerCase().replace(/\s+/g, '-')}-prompt.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadAllPrompts = () => {
    const allPrompts = prompts.map(prompt => {
      const config = ASSISTANT_TYPE_CONFIGS[prompt.assistantType]
      return `# ${config.label} Assistant Prompt\n\n${prompt.promptContent}\n\n${'='.repeat(80)}\n`
    }).join('\n')
    
    const blob = new Blob([allPrompts], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'all-assistant-prompts.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'border-blue-500 text-blue-400',
      green: 'border-green-500 text-green-400',
      purple: 'border-purple-500 text-purple-400',
      orange: 'border-orange-500 text-orange-400',
      pink: 'border-pink-500 text-pink-400',
      red: 'border-red-500 text-red-400'
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  if (isLoading) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Generating AI Assistant Prompts</h3>
          <p className="text-gray-400 text-sm">
            Using Google Gemini to create contextual prompts based on your project details and audio summaries...
          </p>
        </div>
      </div>
    )
  }

  if (prompts.length === 0) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
        <Users className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-400 mb-2">No Prompts Generated</h3>
        <p className="text-gray-500 text-sm">
          Select assistant types and generate prompts to see them here.
        </p>
      </div>
    )
  }

  const activePrompt = prompts.find(p => p.assistantType === activeTab)

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
      {/* Header with Stats */}
      <div className="p-4 border-b border-gray-700 bg-gray-900/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-white">Generated Assistant Prompts</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadAllPrompts}
              className="flex items-center gap-1 px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
            >
              <Download className="w-3 h-3" />
              Download All
            </button>
            <button
              onClick={() => handleRegenerate()}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              Regenerate All
            </button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-6 text-xs text-gray-400">
          <span>{prompts.length} prompt{prompts.length !== 1 ? 's' : ''} generated</span>
          <span>{totalTokens.toLocaleString()} total tokens</span>
          <span>${totalCost.toFixed(4)} estimated cost</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-700 bg-gray-900/30">
        {prompts.map(prompt => {
          const config = ASSISTANT_TYPE_CONFIGS[prompt.assistantType]
          const IconComponent = ICON_COMPONENTS[config.icon as keyof typeof ICON_COMPONENTS] || Users
          const isActive = activeTab === prompt.assistantType
          
          return (
            <button
              key={prompt.assistantType}
              onClick={() => setActiveTab(prompt.assistantType)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? `${getColorClasses(config.color)} bg-gray-800`
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {config.label}
            </button>
          )
        })}
      </div>

      {/* Active Prompt Content */}
      {activePrompt && (
        <div className="p-6">
          {/* Prompt Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg border ${getColorClasses(ASSISTANT_TYPE_CONFIGS[activePrompt.assistantType].color)}`}>
                {(() => {
                  const IconComponent = ICON_COMPONENTS[ASSISTANT_TYPE_CONFIGS[activePrompt.assistantType].icon as keyof typeof ICON_COMPONENTS] || Users
                  return <IconComponent className="w-5 h-5" />
                })()}
              </div>
              <div>
                <h4 className="text-lg font-medium text-white">
                  {ASSISTANT_TYPE_CONFIGS[activePrompt.assistantType].label}
                </h4>
                <p className="text-xs text-gray-400">
                  {activePrompt.outputTokens.toLocaleString()} tokens • ${activePrompt.estimatedCost.toFixed(4)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadPrompt(activePrompt.assistantType, activePrompt.promptContent)}
                className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={() => handleRegenerate(activePrompt.assistantType)}
                disabled={regeneratingStates[activePrompt.assistantType]}
                className="flex items-center gap-1 px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${regeneratingStates[activePrompt.assistantType] ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
              <button
                onClick={() => handleCopy(activePrompt.assistantType, activePrompt.promptContent)}
                className={`flex items-center gap-1 px-3 py-2 text-sm rounded transition-colors ${
                  copiedStates[activePrompt.assistantType]
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {copiedStates[activePrompt.assistantType] ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Prompt Content */}
          <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-mono">
              {activePrompt.promptContent}
            </pre>
          </div>

          {/* Prompt Description */}
          <div className="mt-4 p-3 bg-gray-900/50 rounded-lg">
            <p className="text-xs text-gray-400 leading-relaxed">
              <strong>Role:</strong> {ASSISTANT_TYPE_CONFIGS[activePrompt.assistantType].description}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}