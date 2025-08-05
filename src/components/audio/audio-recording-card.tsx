"use client"

import React, { useState } from 'react'
import { Play, MoreVertical, Download, Trash2, Clock, FileAudio, Mic, Monitor, FileText } from 'lucide-react'
import { AudioRecordingDB, formatDuration, formatFileSize } from '@/lib/supabase/audio-recordings'
import { TranscriptionModal } from './transcription-modal'

interface AudioRecordingCardProps {
  recording: AudioRecordingDB
  onPlay: (recording: AudioRecordingDB) => void
  onDelete: (id: string) => void
  onDownload: (recording: AudioRecordingDB) => void
}

export function AudioRecordingCard({ recording, onPlay, onDelete, onDownload }: AudioRecordingCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showTranscriptionModal, setShowTranscriptionModal] = useState(false)

  const getRecordingIcon = () => {
    const metadata = recording.metadata as any
    if (metadata?.recordingMode === 'desktop+mic') {
      return <Monitor className="w-4 h-4 text-blue-400" />
    } else if (metadata?.recordingMode === 'mic-only') {
      return <Mic className="w-4 h-4 text-green-400" />
    }
    return <FileAudio className="w-4 h-4 text-gray-400" />
  }

  const getRecordingType = () => {
    const metadata = recording.metadata as any
    if (metadata?.recordingMode === 'desktop+mic') {
      return 'Desktop + Mic'
    } else if (metadata?.recordingMode === 'mic-only') {
      return 'Microphone'
    }
    return 'Audio'
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

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this recording? This action cannot be undone.')) {
      onDelete(recording.id)
    }
    setShowMenu(false)
  }

  const handleDownload = () => {
    onDownload(recording)
    setShowMenu(false)
  }

  return (
    <div className="bg-gray-800 hover:bg-gray-750 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200 p-6 relative group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-700 rounded-lg">
            {getRecordingIcon()}
          </div>
          <div>
            <h3 className="font-medium text-white text-sm">
              Recording {new Date(recording.created_at).toLocaleTimeString()}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full border ${getRecordingTypeColor()}`}>
                {getRecordingType()}
              </span>
              <span className="text-xs text-gray-500">
                {recording.metadata?.fileSize ? formatFileSize(recording.metadata.fileSize as number) : 'Unknown size'}
              </span>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-20 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 min-w-[160px]">
                <button
                  onClick={() => {
                    setShowTranscriptionModal(true)
                    setShowMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Transcribe
                </button>
                <button
                  onClick={handleDownload}
                  className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Waveform Placeholder */}
      <div className="mb-4">
        <div className="h-16 bg-gray-700 rounded-lg flex items-center justify-center relative overflow-hidden">
          <div className="text-gray-400">Audio Waveform</div>
          
          {/* Play Button Overlay */}
          <button
            onClick={() => onPlay(recording)}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors rounded-lg"
          >
            <div className="p-3 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg transition-colors">
              <Play className="w-5 h-5 text-white ml-0.5" />
            </div>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{recording.metadata?.duration ? formatDuration(recording.metadata.duration as number) : '0:00'}</span>
          </div>
          <span>{new Date(recording.created_at).toLocaleDateString()}</span>
        </div>
        
        <button
          onClick={() => onPlay(recording)}
          className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
        >
          Play
        </button>
      </div>

      {/* Transcription Preview */}
      {(recording.transcription || recording.metadata?.rawTranscript) && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-500 line-clamp-2">
            {recording.transcription || (recording.metadata?.rawTranscript as string)}
          </p>
        </div>
      )}

      {/* Transcription Modal */}
      {showTranscriptionModal && (
        <TranscriptionModal
          recording={recording}
          isOpen={showTranscriptionModal}
          onClose={() => setShowTranscriptionModal(false)}
        />
      )}
    </div>
  )
}