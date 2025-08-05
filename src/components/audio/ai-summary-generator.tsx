"use client"

import { useState } from 'react'
import { Wand2, Copy, Check, FileText, Clock, BarChart3, Loader2 } from 'lucide-react'
import { generateAISummaryFromText, getTextStatistics, type TextSummaryResult } from '@/lib/gemini/text-to-summary'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'

interface AISummaryGeneratorProps {
  className?: string
}

export function AISummaryGenerator({ className }: AISummaryGeneratorProps) {
  const [inputText, setInputText] = useState('')
  const [summaryResult, setSummaryResult] = useState<TextSummaryResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [summaryLength, setSummaryLength] = useState<'short' | 'medium' | 'detailed'>('medium')

  const textStats = inputText.trim() ? getTextStatistics(inputText) : null

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to summarize.')
      return
    }

    setIsGenerating(true)
    setError(null)
    
    try {
      console.log('Generating AI summary from text...')
      const result = await generateAISummaryFromText(inputText, summaryLength)
      setSummaryResult(result)
    } catch (err) {
      console.error('Summary generation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate AI summary')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
    }
  }

  const handleClear = () => {
    setInputText('')
    setSummaryResult(null)
    setError(null)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Generate AI Summary</h2>
        <p className="text-gray-400">
          Paste any text transcript, meeting notes, or content to generate a structured AI summary with bullet points.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-6">
        <div className="space-y-4">
          {/* Summary Length Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Summary Length
            </label>
            <div className="flex gap-2">
              {[
                { value: 'short', label: 'Short', desc: '3-5 points' },
                { value: 'medium', label: 'Medium', desc: '6-10 points' },
                { value: 'detailed', label: 'Detailed', desc: '10-15 points' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSummaryLength(option.value as typeof summaryLength)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    summaryLength === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs opacity-80">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Text Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-white">
                Text to Summarize
              </label>
              {inputText.trim() && (
                <button
                  onClick={handleClear}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your transcript, meeting notes, or any text content here..."
              className="w-full h-48 px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Text Statistics */}
          {textStats && (
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{textStats.wordCount} words</span>
              </div>
              <div className="flex items-center gap-1">
                <BarChart3 className="w-4 h-4" />
                <span>{textStats.charCount} characters</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{textStats.readingTime} min read</span>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !inputText.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating AI Summary...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                Generate AI Summary
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded-lg">
          <div className="text-sm">{error}</div>
        </div>
      )}

      {/* Results Section */}
      {summaryResult && (
        <div className="space-y-4">
          {/* AI Summary */}
          <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">
                  AI Summary ({summaryResult.summaryLength})
                </h3>
              </div>
              <button
                onClick={() => copyToClipboard(summaryResult.aiSummary, 'summary')}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
              >
                {copiedField === 'summary' ? (
                  <><Check className="w-4 h-4" /> Copied</>
                ) : (
                  <><Copy className="w-4 h-4" /> Copy Summary</>
                )}
              </button>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <MarkdownRenderer content={summaryResult.aiSummary} />
            </div>
          </div>

          {/* Original Text (Collapsible) */}
          <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">
                  Original Text ({summaryResult.wordCount} words)
                </h3>
              </div>
              <button
                onClick={() => copyToClipboard(summaryResult.originalText, 'original')}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
              >
                {copiedField === 'original' ? (
                  <><Check className="w-4 h-4" /> Copied</>
                ) : (
                  <><Copy className="w-4 h-4" /> Copy Original</>
                )}
              </button>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg max-h-40 overflow-y-auto">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                {summaryResult.originalText}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Usage Tips */}
      {!summaryResult && !isGenerating && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <h4 className="text-blue-300 font-medium mb-2">💡 Tips for Best Results:</h4>
          <ul className="text-sm text-blue-200 space-y-1">
            <li>• <strong>Meeting Transcripts:</strong> Works great with Zoom, Teams, or Google Meet transcripts</li>
            <li>• <strong>Audio Transcriptions:</strong> Perfect companion to the audio recording feature</li>
            <li>• <strong>Articles & Documents:</strong> Summarize long articles, reports, or documentation</li>
            <li>• <strong>Length Options:</strong> Choose &apos;Short&apos; for quick overviews, &apos;Detailed&apos; for comprehensive summaries</li>
            <li>• <strong>Technical Content:</strong> Automatically detects and structures software development discussions</li>
          </ul>
        </div>
      )}
    </div>
  )
}