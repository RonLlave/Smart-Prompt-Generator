"use client"

import { useState, useEffect, useCallback } from 'react'
import { Search, Clock, FileAudio, CheckCircle, Circle, Loader2, AlertCircle } from 'lucide-react'
import { AudioTranscriptForSelection } from '@/lib/types/project-assistants'
import { formatDuration } from '@/lib/supabase/audio-recordings'

interface AudioSelectionProps {
  selectedAudioIds: string[]
  onSelectionChange: (audioIds: string[]) => void
  userEmail: string
  maxSelections?: number
}

export function AudioSelection({ 
  selectedAudioIds, 
  onSelectionChange, 
  userEmail,
  maxSelections = 10 
}: AudioSelectionProps) {
  const [audioTranscripts, setAudioTranscripts] = useState<AudioTranscriptForSelection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fetchAudioTranscripts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        userEmail,
        limit: '50'
      })
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim())
      }
      
      const response = await fetch(`/api/audio-transcripts?${params}`)
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch audio transcripts')
      }
      
      setAudioTranscripts(data.transcripts || [])
    } catch (err) {
      console.error('Error fetching audio transcripts:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }, [userEmail, searchTerm])

  // Fetch audio transcripts
  useEffect(() => {
    fetchAudioTranscripts()
  }, [fetchAudioTranscripts])

  const handleToggleSelection = (audioId: string) => {
    const isSelected = selectedAudioIds.includes(audioId)
    let newSelection: string[]
    
    if (isSelected) {
      // Remove from selection
      newSelection = selectedAudioIds.filter(id => id !== audioId)
    } else {
      // Add to selection (respect max limit)
      if (selectedAudioIds.length >= maxSelections) {
        return // Don't add if at max limit
      }
      newSelection = [...selectedAudioIds, audioId]
    }
    
    onSelectionChange(newSelection)
  }

  const handleSelectAll = () => {
    const availableIds = audioTranscripts.slice(0, maxSelections).map(t => t.id)
    onSelectionChange(availableIds)
  }

  const handleClearAll = () => {
    onSelectionChange([])
  }

  const getAiSummaryPreview = (transcript: AudioTranscriptForSelection): string => {
    if (transcript.ai_summary) {
      return transcript.ai_summary.length > 150 
        ? `${transcript.ai_summary.substring(0, 150)}...`
        : transcript.ai_summary
    }
    if (transcript.raw_transcript) {
      return transcript.raw_transcript.length > 150
        ? `${transcript.raw_transcript.substring(0, 150)}...`
        : transcript.raw_transcript
    }
    return 'No transcript available'
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">Select Audio Recordings</h3>
          <p className="text-sm text-gray-400">
            Choose recordings to include context for AI prompt generation ({selectedAudioIds.length}/{maxSelections} selected)
          </p>
        </div>
        
        {audioTranscripts.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              disabled={selectedAudioIds.length >= maxSelections}
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Select All ({Math.min(audioTranscripts.length, maxSelections)})
            </button>
            <button
              onClick={handleClearAll}
              disabled={selectedAudioIds.length === 0}
              className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search recordings by title, description, or filename..."
          className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
          <span className="text-gray-400">Loading audio recordings...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error Loading Recordings</span>
          </div>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchAudioTranscripts}
            className="mt-2 px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && audioTranscripts.length === 0 && (
        <div className="text-center py-8">
          <FileAudio className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-gray-400 mb-2">No Audio Recordings Found</h4>
          <p className="text-gray-500 text-sm">
            {searchTerm 
              ? `No recordings match "${searchTerm}". Try a different search term.`
              : 'You haven\'t created any audio recordings yet. Visit the Audio page to record your first meeting.'
            }
          </p>
        </div>
      )}

      {/* Audio Transcripts List */}
      {!loading && !error && audioTranscripts.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {audioTranscripts.map((transcript) => {
            const isSelected = selectedAudioIds.includes(transcript.id)
            const canSelect = isSelected || selectedAudioIds.length < maxSelections
            
            return (
              <div
                key={transcript.id}
                className={`border rounded-lg p-4 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-900/20'
                    : canSelect
                    ? 'border-gray-600 hover:border-gray-500 bg-gray-800'
                    : 'border-gray-700 bg-gray-800/50 opacity-50 cursor-not-allowed'
                }`}
                onClick={() => canSelect && handleToggleSelection(transcript.id)}
              >
                <div className="flex items-start gap-3">
                  {/* Selection Indicator */}
                  <div className="mt-1">
                    {isSelected ? (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white truncate">
                          {transcript.title || transcript.audio_filename || 'Untitled Recording'}
                        </h4>
                        {transcript.description && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                            {transcript.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500 ml-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDuration(transcript.duration)}</span>
                        </div>
                        <span>{new Date(transcript.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* AI Summary Preview */}
                    <div className="bg-gray-900/50 rounded p-2 mt-2">
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {getAiSummaryPreview(transcript)}
                      </p>
                    </div>

                    {/* Transcript Indicators */}
                    <div className="flex items-center gap-3 mt-2">
                      {transcript.ai_summary && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-900/30 text-purple-300 rounded">
                          <CheckCircle className="w-3 h-3" />
                          AI Summary
                        </span>
                      )}
                      {transcript.raw_transcript && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-900/30 text-green-300 rounded">
                          <CheckCircle className="w-3 h-3" />
                          Raw Transcript
                        </span>
                      )}
                      {!transcript.ai_summary && !transcript.raw_transcript && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 text-gray-400 rounded">
                          <AlertCircle className="w-3 h-3" />
                          No Transcript
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Selection Summary */}
      {selectedAudioIds.length > 0 && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
          <p className="text-sm text-blue-300">
            <strong>{selectedAudioIds.length}</strong> recording{selectedAudioIds.length !== 1 ? 's' : ''} selected.
            {selectedAudioIds.length >= maxSelections && (
              <span className="ml-2 text-yellow-300">
                Maximum selection limit reached.
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}