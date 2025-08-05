"use client"

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Save, X, Download, Volume2, FileText, Wand2, Copy, Check, Loader2 } from 'lucide-react'
import type { AudioRecording } from '@/hooks/use-audio-recorder'
import { transcribeAudioWithGemini, type TranscriptionResult } from '@/lib/gemini/audio-transcription'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer'

interface AudioPreviewProps {
  recording: AudioRecording
  onSave: () => void
  onDiscard: () => void
  onDownload: () => void
  loading?: boolean
}

export function AudioPreview({ recording, onSave, onDiscard, onDownload, loading }: AudioPreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showTranscription, setShowTranscription] = useState(false)
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [transcriptionStep, setTranscriptionStep] = useState<'idle' | 'raw' | 'summary' | 'complete'>('idle')
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const time = parseFloat(e.target.value)
    audio.currentTime = time
    setCurrentTime(time)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audio) audio.volume = newVolume
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleTranscribe = async () => {
    setIsTranscribing(true)
    setTranscriptionError(null)
    setTranscriptionStep('raw')
    setShowTranscription(true)
    
    try {
      console.log('Starting live transcription...')
      
      // Call the new two-step transcription function
      const result = await transcribeAudioWithGemini(recording.blob)
      
      // The function now returns the complete result
      setTranscriptionResult(result)
      setTranscriptionStep('complete')
      
    } catch (err) {
      console.error('Transcription error:', err)
      setTranscriptionError(err instanceof Error ? err.message : 'Failed to transcribe audio')
      setTranscriptionStep('idle')
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

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recording Preview</h3>
        <div className="text-sm text-gray-400">{recording.name}</div>
      </div>

      <audio
        ref={audioRef}
        src={recording.url}
        preload="metadata"
      />

      {/* Audio Controls */}
      <div className="space-y-4">
        {/* Play/Pause and Time */}
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlayPause}
            className="flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-1" />
            )}
          </button>

          <div className="flex-1">
            <input
              type="range"
              min="0"
              max={recording.duration}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-sm text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(recording.duration)}</span>
            </div>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <Volume2 className="w-4 h-4 text-gray-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-sm text-gray-400 w-8">{Math.round(volume * 100)}%</span>
        </div>
      </div>

      {/* Transcription Section */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-white">Live Transcription</h4>
          <button
            onClick={handleTranscribe}
            disabled={isTranscribing || loading}
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
                Generate Transcript
              </>
            )}
          </button>
        </div>

        {transcriptionError && (
          <div className="bg-red-900/20 border border-red-700 text-red-300 p-3 rounded-lg mb-4">
            <div className="text-sm">{transcriptionError}</div>
          </div>
        )}

        {showTranscription && (
          <div className="space-y-4">
            {/* Raw Transcript - Show first */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-400" />
                  <span className="font-medium text-white">
                    Raw Transcript
                    {transcriptionResult && ` (${transcriptionResult.speakerCount} speakers)`}
                  </span>
                  {transcriptionStep === 'raw' && (
                    <Loader2 className="w-4 h-4 animate-spin text-green-400" />
                  )}
                </div>
                {transcriptionResult && (
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
                )}
              </div>
              <div className="text-sm text-gray-300 bg-gray-800 p-3 rounded max-h-32 overflow-y-auto font-mono">
                {transcriptionStep === 'raw' ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating raw transcript...
                  </div>
                ) : transcriptionResult ? (
                  transcriptionResult.rawTranscript
                ) : (
                  <div className="text-gray-500">Raw transcript will appear here first...</div>
                )}
              </div>
            </div>

            {/* AI Summary - Show second */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-purple-400" />
                  <span className="font-medium text-white">AI Summary</span>
                  {transcriptionStep === 'summary' && (
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  )}
                  {transcriptionStep === 'complete' && (
                    <Check className="w-4 h-4 text-green-400" />
                  )}
                </div>
                {transcriptionResult && transcriptionStep === 'complete' && (
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
                ) : transcriptionResult && transcriptionStep === 'complete' ? (
                  <MarkdownRenderer content={transcriptionResult.aiSummary} />
                ) : (
                  <div className="text-gray-500 text-sm">AI summary will be generated after raw transcript...</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 mt-6">
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          disabled={loading}
        >
          <Download className="w-4 h-4" />
          Download
        </button>

        <button
          onClick={onDiscard}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          disabled={loading}
        >
          <X className="w-4 h-4" />
          Discard
        </button>

        <button
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          disabled={loading}
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save to Database'}
        </button>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1f2937;
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #1f2937;
        }
      `}</style>
    </div>
  )
}