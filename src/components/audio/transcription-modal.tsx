"use client"

import { useState } from 'react'
import { X, FileText, Wand2, Copy, Check, Loader2, Volume2, Users } from 'lucide-react'
import { AudioRecordingDB } from '@/lib/supabase/audio-recordings'
import { transcribeAudioWithGemini, type TranscriptionResult, formatTranscriptForDisplay } from '@/lib/gemini/audio-transcription'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'

interface TranscriptionModalProps {
  recording: AudioRecordingDB
  isOpen: boolean
  onClose: () => void
  onTranscriptionComplete?: (result: TranscriptionResult) => void
}

export function TranscriptionModal({ 
  recording, 
  isOpen, 
  onClose, 
  onTranscriptionComplete 
}: TranscriptionModalProps) {
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleTranscribe = async () => {
    if (!recording.complete_file_link) {
      setError('Audio file URL not available')
      return
    }

    setIsTranscribing(true)
    setError(null)
    
    try {
      console.log('Fetching audio file for transcription...')
      
      // Fetch the audio file
      const response = await fetch(recording.complete_file_link)
      if (!response.ok) {
        throw new Error('Failed to fetch audio file')
      }
      
      const audioBlob = await response.blob()
      console.log('Audio file fetched, starting transcription...')
      
      // Transcribe with Gemini
      const result = await transcribeAudioWithGemini(audioBlob, recording.audio_filename || undefined)
      
      setTranscriptionResult(result)
      onTranscriptionComplete?.(result)
      
      // Optionally save transcription to database metadata
      // This could be implemented later to persist transcriptions
      
    } catch (err) {
      console.error('Transcription error:', err)
      setError(err instanceof Error ? err.message : 'Failed to transcribe audio')
    } finally {
      setIsTranscribing(false)
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

  const formatTimestamp = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Audio Transcription</h2>
              <p className="text-sm text-gray-400">
                Recording from {formatTimestamp(recording.created_at)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Recording Info */}
          <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Volume2 className="w-4 h-4" />
                <span>{recording.metadata?.fileSize ? `${Math.round((recording.metadata.fileSize as number) / 1024)} KB` : 'Unknown size'}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>{recording.metadata?.duration ? `${Math.round(recording.metadata.duration as number)}s` : 'Unknown duration'}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="capitalize">{recording.metadata?.recordingMode || 'Audio'}</span>
              </div>
            </div>
          </div>

          {/* Transcription Button */}
          {!transcriptionResult && !isTranscribing && (
            <div className="text-center py-8">
              <button
                onClick={handleTranscribe}
                disabled={isTranscribing}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Wand2 className="w-5 h-5" />
                Generate Transcription & AI Summary
              </button>
              <p className="text-sm text-gray-400 mt-2">
                This will transcribe the audio and identify speakers using AI
              </p>
            </div>
          )}

          {/* Loading State */}
          {isTranscribing && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3 text-blue-400">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Transcribing audio with AI...</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                This may take a few moments depending on audio length
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded-lg mb-6">
              <div className="font-semibold mb-1">Transcription Failed</div>
              <div className="text-sm">{error}</div>
              <button
                onClick={handleTranscribe}
                className="mt-3 text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Transcription Results */}
          {transcriptionResult && (
            <div className="space-y-6">
              {/* Speaker Summary */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="font-medium text-white">Speaker Analysis</span>
                </div>
                <p className="text-sm text-gray-400">
                  Detected {transcriptionResult.speakerCount} speaker{transcriptionResult.speakerCount !== 1 ? 's' : ''} in this recording
                </p>
              </div>

              {/* AI Summary */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-purple-400" />
                    <span className="font-medium text-white">AI Summary</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(transcriptionResult.aiSummary, 'summary')}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                  >
                    {copiedField === 'summary' ? (
                      <><Check className="w-3 h-3" /> Copied</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copy</>
                    )}
                  </button>
                </div>
                <div className="bg-gray-800 p-3 rounded border">
                  <MarkdownRenderer content={transcriptionResult.aiSummary} />
                </div>
              </div>

              {/* Raw Transcript */}
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-400" />
                    <span className="font-medium text-white">Raw Transcript</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(transcriptionResult.rawTranscript, 'transcript')}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                  >
                    {copiedField === 'transcript' ? (
                      <><Check className="w-3 h-3" /> Copied</>
                    ) : (
                      <><Copy className="w-3 h-3" /> Copy</>
                    )}
                  </button>
                </div>
                <div className="text-sm text-gray-300 leading-relaxed bg-gray-800 p-3 rounded border max-h-64 overflow-y-auto font-mono">
                  {transcriptionResult.rawTranscript}
                </div>
              </div>

              {/* Speaker Segments */}
              {transcriptionResult.speakerSegments.length > 1 && (
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="font-medium text-white">Speaker Breakdown</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(formatTranscriptForDisplay(transcriptionResult.speakerSegments), 'segments')}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                    >
                      {copiedField === 'segments' ? (
                        <><Check className="w-3 h-3" /> Copied</>
                      ) : (
                        <><Copy className="w-3 h-3" /> Copy</>
                      )}
                    </button>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {transcriptionResult.speakerSegments.map((segment, index) => (
                      <div key={index} className="bg-gray-800 p-3 rounded border-l-2 border-blue-500">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-blue-400">{segment.speaker}</span>
                          {segment.timestamp && (
                            <span className="text-xs text-gray-500">[{segment.timestamp}]</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-300">{segment.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleTranscribe}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}