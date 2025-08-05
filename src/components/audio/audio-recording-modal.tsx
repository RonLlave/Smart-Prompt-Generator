"use client"

import { useState, useRef, useEffect } from 'react'
import { X, Play, Pause, Volume2, Download, Trash2, Clock, FileAudio } from 'lucide-react'
import { AudioRecordingDB, formatDuration, formatFileSize, getAudioRecordingUrl } from '@/lib/supabase/audio-recordings'

interface AudioRecordingModalProps {
  recording: AudioRecordingDB
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => void
}

export function AudioRecordingModal({ recording, isOpen, onClose, onDelete }: AudioRecordingModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const audioRef = useRef<HTMLAudioElement>(null)

  // Load audio URL when modal opens
  useEffect(() => {
    if (isOpen && recording) {
      setLoading(true)
      setError(null)
      
      getAudioRecordingUrl(recording.file_path)
        .then(url => {
          setAudioUrl(url)
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to load audio URL:', err)
          setError('Failed to load audio file')
          setLoading(false)
        })
    }
  }, [isOpen, recording])

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)
    const handleError = () => {
      setError('Failed to load audio file')
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [audioUrl])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
      setIsPlaying(true)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = parseFloat(e.target.value)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a')
      link.href = audioUrl
      link.download = `recording_${new Date(recording.created_at).getTime()}.${recording.mime_type.split('/')[1]}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this recording? This action cannot be undone.')) {
      onDelete(recording.id)
      onClose()
    }
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileAudio className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Audio Recording</h3>
              <p className="text-sm text-gray-400">{getRecordingType()}</p>
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
        <div className="p-6 space-y-6">
          {/* Recording Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Duration:</span>
                <span className="text-white">{formatDuration(recording.duration_seconds)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">File Size:</span>
                <span className="text-white">{formatFileSize(recording.file_size)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Format:</span>
                <span className="text-white">{recording.mime_type}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Created:</span>
                <span className="text-white">{new Date(recording.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time:</span>
                <span className="text-white">{new Date(recording.created_at).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Audio Player */}
          <div className="bg-gray-800 rounded-lg p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-400">Loading audio...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8 text-red-400">
                <Volume2 className="w-6 h-6 mr-2" />
                <span>{error}</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Audio element */}
                {audioUrl && (
                  <audio ref={audioRef} src={audioUrl} preload="metadata" />
                )}

                {/* Play/Pause Button */}
                <div className="flex items-center justify-center">
                  <button
                    onClick={togglePlayPause}
                    className="p-4 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 text-white" />
                    ) : (
                      <Play className="w-6 h-6 text-white ml-1" />
                    )}
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                        duration > 0 ? (currentTime / duration) * 100 : 0
                      }%, #374151 ${
                        duration > 0 ? (currentTime / duration) * 100 : 0
                      }%, #374151 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{formatDuration(currentTime)}</span>
                    <span>{formatDuration(duration)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Transcription */}
          {recording.transcription && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Transcription</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{recording.transcription}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Created {new Date(recording.created_at).toLocaleString()}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              disabled={!audioUrl}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
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