"use client"

import { useState } from 'react'
import { X, FileText, Wand2, Copy, Check, Loader2, Clock, FileAudio, Monitor, Mic, Database } from 'lucide-react'
import { AudioRecordingDB, formatDuration, formatFileSize } from '@/lib/supabase/audio-recordings'
import { transcribeAudioWithGemini, type TranscriptionResult } from '@/lib/gemini/audio-transcription'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'

interface RecordingDetailsModalProps {
  recording: AudioRecordingDB
  isOpen: boolean
  onClose: () => void
  onUpdateTranscription?: (id: string, transcription: TranscriptionResult) => void
}

export function RecordingDetailsModal({ 
  recording, 
  isOpen, 
  onClose, 
  onUpdateTranscription 
}: RecordingDetailsModalProps) {
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [transcriptionStep, setTranscriptionStep] = useState<'idle' | 'raw' | 'summary' | 'complete'>('idle')
  const [newTranscription, setNewTranscription] = useState<TranscriptionResult | null>(null)

  const getRecordingIcon = () => {
    const metadata = recording.metadata as any
    if (metadata?.recordingMode === 'desktop+mic') {
      return <Monitor className="w-5 h-5 text-blue-400" />
    } else if (metadata?.recordingMode === 'mic-only') {
      return <Mic className="w-5 h-5 text-green-400" />
    }
    return <FileAudio className="w-5 h-5 text-gray-400" />
  }

  const getRecordingType = () => {
    const metadata = recording.metadata as any
    if (metadata?.recordingMode === 'desktop+mic') {
      return 'Desktop + Microphone'
    } else if (metadata?.recordingMode === 'mic-only') {
      return 'Microphone Only'
    }
    return 'Audio Recording'
  }

  const getRecordingTypeColor = () => {
    const metadata = recording.metadata as any
    if (metadata?.recordingMode === 'desktop+mic') {
      return 'bg-blue-900/50 text-blue-300 border-blue-700'
    } else if (metadata?.recordingMode === 'mic-only') {
      return 'bg-green-900/50 text-green-300 border-green-700'
    }
    return 'bg-gray-900/50 text-gray-300 border-gray-700'
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

  const handleTranscribe = async () => {
    if (!recording.complete_file_link) {
      setTranscriptionError('Audio file URL not available')
      return
    }

    setIsTranscribing(true)
    setTranscriptionError(null)
    setTranscriptionStep('raw')
    setNewTranscription(null)
    
    try {
      // Fetch the audio file
      const response = await fetch(recording.complete_file_link)
      if (!response.ok) {
        throw new Error('Failed to fetch audio file')
      }
      
      const audioBlob = await response.blob()
      
      // Call the transcription service
      const result = await transcribeAudioWithGemini(audioBlob)
      
      setNewTranscription(result)
      setTranscriptionStep('complete')
      
      // Notify parent component if callback provided
      if (onUpdateTranscription) {
        onUpdateTranscription(recording.id, result)
      }
      
    } catch (err) {
      console.error('Transcription error:', err)
      setTranscriptionError(err instanceof Error ? err.message : 'Failed to transcribe audio')
      setTranscriptionStep('idle')
    } finally {
      setIsTranscribing(false)
    }
  }

  // Get existing transcripts from database
  const existingRawTranscript = recording.raw_transcript as any
  const existingAiSummary = recording.ai_summary as any
  const hasExistingTranscripts = existingRawTranscript?.rawTranscript || existingAiSummary?.aiSummary

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              {getRecordingIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-semibold text-white truncate">
                {recording.title || 'Audio Recording'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-1 rounded-full border ${getRecordingTypeColor()}`}>
                  {getRecordingType()}
                </span>
                <span className="text-sm text-gray-400">
                  {recording.metadata?.fileSize ? formatFileSize(recording.metadata.fileSize as number) : 'Unknown size'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Description */}
          {recording.description && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Description</h4>
              <p className="text-gray-400 text-sm leading-relaxed bg-gray-800 p-3 rounded-lg">
                {recording.description}
              </p>
            </div>
          )}

          {/* Recording Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recording Details
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white">
                    {recording.metadata?.duration 
                      ? formatDuration(recording.metadata.duration as number)
                      : 'Unknown'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Format:</span>
                  <span className="text-white">
                    {recording.metadata?.mimeType 
                      ? (recording.metadata.mimeType as string).split('/')[1].toUpperCase()
                      : 'Unknown'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">File Size:</span>
                  <span className="text-white">
                    {recording.metadata?.fileSize 
                      ? formatFileSize(recording.metadata.fileSize as number)
                      : 'Unknown'
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Database Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white">{new Date(recording.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time:</span>
                  <span className="text-white">{new Date(recording.created_at).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Added by:</span>
                  <span className="text-white truncate ml-2">{recording.added_by_email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Manual Transcription Section */}
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-white flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-400" />
                Generate New Transcription
              </h4>
              <button
                onClick={handleTranscribe}
                disabled={isTranscribing}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isTranscribing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Transcribing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Generate New Transcript
                  </>
                )}
              </button>
            </div>

            {transcriptionError && (
              <div className="bg-red-900/20 border border-red-700 text-red-300 p-3 rounded-lg mb-4">
                <div className="text-sm">{transcriptionError}</div>
              </div>
            )}

            {/* New Transcription Results */}
            {(newTranscription || isTranscribing) && (
              <div className="space-y-4">
                {/* Raw Transcript */}
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-400" />
                      <span className="font-medium text-white">
                        New Raw Transcript
                        {newTranscription && ` (${newTranscription.speakerCount} speakers)`}
                      </span>
                      {transcriptionStep === 'raw' && (
                        <Loader2 className="w-4 h-4 animate-spin text-green-400" />
                      )}
                    </div>
                    {newTranscription && (
                      <button
                        onClick={() => copyToClipboard(newTranscription.rawTranscript, 'new-transcript')}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                      >
                        {copiedField === 'new-transcript' ? (
                          <><Check className="w-3 h-3" /> Copied</>
                        ) : (
                          <><Copy className="w-3 h-3" /> Copy</>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-gray-300 bg-gray-800 p-3 rounded max-h-32 overflow-y-auto font-mono">
                    {transcriptionStep === 'raw' ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating raw transcript...
                      </div>
                    ) : newTranscription ? (
                      newTranscription.rawTranscript
                    ) : (
                      <div className="text-gray-500">Click &quot;Generate New Transcript&quot; to create a fresh transcription...</div>
                    )}
                  </div>
                </div>

                {/* AI Summary */}
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-purple-400" />
                      <span className="font-medium text-white">New AI Summary</span>
                      {transcriptionStep === 'summary' && (
                        <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                      )}
                      {transcriptionStep === 'complete' && (
                        <Check className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    {newTranscription && transcriptionStep === 'complete' && (
                      <button
                        onClick={() => copyToClipboard(newTranscription.aiSummary, 'new-summary')}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                      >
                        {copiedField === 'new-summary' ? (
                          <><Check className="w-3 h-3" /> Copied</>
                        ) : (
                          <><Copy className="w-3 h-3" /> Copy</>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="bg-gray-800 p-3 rounded min-h-[3rem]">
                    {transcriptionStep === 'raw' ? (
                      <div className="text-gray-500 text-sm">Waiting for raw transcript to complete...</div>
                    ) : transcriptionStep === 'summary' ? (
                      <div className="flex items-center gap-2 text-purple-400 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating AI summary based on raw transcript...
                      </div>
                    ) : newTranscription && transcriptionStep === 'complete' ? (
                      <MarkdownRenderer content={newTranscription.aiSummary} />
                    ) : (
                      <div className="text-gray-500 text-sm">AI summary will be generated after raw transcript...</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Existing Database Transcripts */}
          {hasExistingTranscripts && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-white flex items-center gap-2 border-t border-gray-700 pt-6">
                <Database className="w-5 h-5 text-blue-400" />
                Saved Transcriptions
              </h4>

              {/* Existing Raw Transcript */}
              {existingRawTranscript?.rawTranscript && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="font-medium text-white">
                        Raw Transcript
                        {existingRawTranscript.speakerCount && ` (${existingRawTranscript.speakerCount} speakers)`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {existingRawTranscript.generatedAt && (
                        <span className="text-xs text-gray-500">
                          {new Date(existingRawTranscript.generatedAt).toLocaleString()}
                        </span>
                      )}
                      <button
                        onClick={() => copyToClipboard(existingRawTranscript.rawTranscript, 'existing-transcript')}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                      >
                        {copiedField === 'existing-transcript' ? (
                          <><Check className="w-3 h-3" /> Copied</>
                        ) : (
                          <><Copy className="w-3 h-3" /> Copy</>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300 bg-gray-900 p-3 rounded max-h-32 overflow-y-auto font-mono">
                    {existingRawTranscript.rawTranscript}
                  </div>
                </div>
              )}

              {/* Existing AI Summary */}
              {existingAiSummary?.aiSummary && (
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-blue-400" />
                      <span className="font-medium text-white">AI Summary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {existingAiSummary.generatedAt && (
                        <span className="text-xs text-gray-500">
                          {new Date(existingAiSummary.generatedAt).toLocaleString()}
                        </span>
                      )}
                      <button
                        onClick={() => copyToClipboard(existingAiSummary.aiSummary, 'existing-summary')}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                      >
                        {copiedField === 'existing-summary' ? (
                          <><Check className="w-3 h-3" /> Copied</>
                        ) : (
                          <><Copy className="w-3 h-3" /> Copy</>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-900 p-3 rounded">
                    <MarkdownRenderer content={existingAiSummary.aiSummary} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Transcripts Message */}
          {!hasExistingTranscripts && !newTranscription && !isTranscribing && (
            <div className="text-center py-8 border-t border-gray-700">
              <FileText className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-gray-400 mb-2">No Transcriptions Available</h4>
              <p className="text-gray-500 text-sm mb-4">
                This recording doesn&apos;t have any saved transcriptions yet.
              </p>
              <button
                onClick={handleTranscribe}
                disabled={isTranscribing}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 mx-auto"
              >
                <Wand2 className="w-4 h-4" />
                Generate First Transcription
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}