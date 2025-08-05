"use client"

import { useState } from 'react'
import { Mic, Square, Volume2, Settings, AlertTriangle, CheckCircle, Grid, List } from 'lucide-react'
import { useAudioRecorder, type AudioRecordingDB } from '@/hooks/use-audio-recorder'
import { AudioRecordingCard } from './audio-recording-card'
import { AudioRecordingModal } from './audio-recording-modal'
import { AudioPreview } from './audio-preview'

function AudioLevelBar({ level }: { level: number }) {
  const bars = 20
  const activeBars = Math.floor(level * bars)
  
  return (
    <div className="flex items-center gap-1 h-8">
      {Array.from({ length: bars }, (_, i) => (
        <div
          key={i}
          className={`w-1 h-full rounded-full transition-colors ${
            i < activeBars 
              ? i < bars * 0.7 
                ? 'bg-green-500' 
                : i < bars * 0.9 
                ? 'bg-yellow-500' 
                : 'bg-red-500'
              : 'bg-gray-600'
          }`}
        />
      ))}
    </div>
  )
}

export function AudioRecorder() {
  const {
    isRecording,
    isSupported,
    capabilities,
    recordings,
    recordingTime,
    audioLevel,
    recordingMode,
    setRecordingMode,
    startRecording,
    stopRecording,
    previewRecording,
    savePreviewRecording,
    discardPreviewRecording,
    downloadPreviewRecording,
    deleteRecording,
    downloadRecording,
    loading,
    error: hookError,
    setError: setHookError
  } = useAudioRecorder()

  const [selectedRecording, setSelectedRecording] = useState<AudioRecordingDB | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCapabilities, setShowCapabilities] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const handleStartRecording = async () => {
    try {
      setError(null)
      setHookError(null)
      await startRecording()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording')
    }
  }

  const handlePlayRecording = (recording: AudioRecordingDB) => {
    setSelectedRecording(recording)
  }

  const handleDownloadRecording = async (recording: AudioRecordingDB) => {
    try {
      await downloadRecording(recording)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download recording')
    }
  }

  const handleDeleteRecording = async (id: string) => {
    try {
      await deleteRecording(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete recording')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getBrowserRecommendation = () => {
    if (!capabilities) return null
    
    const { browserName, recommendedApproach } = capabilities
    
    if (recommendedApproach === 'unsupported') {
      return (
        <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Audio Recording Not Supported</span>
          </div>
          <p className="text-sm">
            {browserName === 'firefox' 
              ? 'Firefox doesn\'t support desktop audio recording. Please use Chrome or Edge for the best experience.'
              : browserName === 'safari'
              ? 'Safari has limited audio recording support. Please use Chrome or Edge for the best experience.'
              : 'Your browser doesn\'t support audio recording. Please use Chrome or Edge.'}
          </p>
        </div>
      )
    }
    
    if (recommendedApproach === 'mic-only') {
      return (
        <div className="bg-yellow-900/20 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Limited Desktop Audio Support</span>
          </div>
          <p className="text-sm">
            Desktop audio recording is not available. Microphone recording is supported.
          </p>
        </div>
      )
    }
    
    return (
      <div className="bg-green-900/20 border border-green-700 text-green-300 px-4 py-3 rounded-lg mb-6">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5" />
          <span className="font-semibold">Full Audio Recording Supported</span>
        </div>
        <p className="text-sm">
          Both desktop audio and microphone recording are available.
        </p>
      </div>
    )
  }

  if (!isSupported || !capabilities) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8 text-white">Audio Recorder</h1>
          {getBrowserRecommendation()}
          
          {capabilities && (
            <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">Browser Capabilities</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Browser:</span>
                  <span className="capitalize text-white">{capabilities.browserName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Basic Recording:</span>
                  <span className={capabilities.basic ? 'text-green-400' : 'text-red-400'}>
                    {capabilities.basic ? '✓ Supported' : '✗ Not Supported'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Desktop Audio:</span>
                  <span className={capabilities.desktopAudio ? 'text-green-400' : 'text-red-400'}>
                    {capabilities.desktopAudio ? '✓ Supported' : '✗ Not Supported'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Microphone Access:</span>
                  <span className={capabilities.microphoneAccess ? 'text-green-400' : 'text-red-400'}>
                    {capabilities.microphoneAccess ? '✓ Available' : '✗ Denied/Unavailable'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Web Audio API:</span>
                  <span className={capabilities.webAudio ? 'text-green-400' : 'text-red-400'}>
                    {capabilities.webAudio ? '✓ Supported' : '✗ Not Supported'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Audio Recorder</h1>
          <button
            onClick={() => setShowCapabilities(!showCapabilities)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
            Capabilities
          </button>
        </div>
        
        {getBrowserRecommendation()}
        
        {showCapabilities && capabilities && (
          <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Browser Capabilities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Browser:</span>
                        <span className="capitalize font-medium text-white">{capabilities.browserName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Basic Recording:</span>
                        <span className={capabilities.basic ? 'text-green-400' : 'text-red-400'}>
                          {capabilities.basic ? '✓ Supported' : '✗ Not Supported'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Desktop Audio:</span>
                        <span className={capabilities.desktopAudio ? 'text-green-400' : 'text-red-400'}>
                          {capabilities.desktopAudio ? '✓ Supported' : '✗ Not Supported'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Microphone Access:</span>
                        <span className={capabilities.microphoneAccess ? 'text-green-400' : 'text-red-400'}>
                          {capabilities.microphoneAccess ? '✓ Available' : '✗ Denied/Unavailable'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Web Audio API:</span>
                        <span className={capabilities.webAudio ? 'text-green-400' : 'text-red-400'}>
                          {capabilities.webAudio ? '✓ Supported' : '✗ Not Supported'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Recommended Mode:</span>
                        <span className="font-medium capitalize text-white">{capabilities.recommendedApproach.replace('-', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {(error || hookError) && (
                <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-6">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold">Recording Error</div>
                      <div className="text-sm">{error || hookError}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Recording Mode Selection */}
              {capabilities?.recommendedApproach === 'full' && (
                <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4 text-white">Recording Mode</h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="recordingMode"
                        value="desktop+mic"
                        checked={recordingMode === 'desktop+mic'}
                        onChange={(e) => setRecordingMode(e.target.value as 'desktop+mic' | 'mic-only')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <div className="font-medium text-white">Desktop Audio + Microphone</div>
                        <div className="text-sm text-gray-400">Record both desktop background sounds and microphone input</div>
                        <div className="text-xs text-blue-400 mt-1">Perfect for recording Google Meet, Zoom, or Teams calls</div>
                      </div>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="recordingMode"
                        value="mic-only"
                        checked={recordingMode === 'mic-only'}
                        onChange={(e) => setRecordingMode(e.target.value as 'desktop+mic' | 'mic-only')}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <div className="font-medium text-white">Microphone Only</div>
                        <div className="text-sm text-gray-400">Record only microphone input</div>
                      </div>
                    </label>
                  </div>
                  
                  {recordingMode === 'desktop+mic' && (
                    <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                      <div className="text-sm text-blue-300">
                        <div className="font-medium mb-2">💡 Desktop Audio Setup:</div>
                        <ul className="text-xs space-y-1 text-blue-200">
                          <li><strong>Step 1:</strong> Open your meeting (Google Meet, Zoom, etc.) in a separate tab</li>
                          <li><strong>Step 2:</strong> Click &quot;Start Desktop + Mic Recording&quot; below</li>
                          <li><strong>Step 3:</strong> In the Chrome dialog, select &quot;Chrome Tab&quot;</li>
                          <li><strong>Step 4:</strong> Choose the tab with your meeting</li>
                          <li><strong>Step 5:</strong> ✅ <strong>Check &quot;Share audio&quot;</strong> (very important!)</li>
                          <li><strong>Step 6:</strong> Click &quot;Share&quot; to start recording</li>
                        </ul>
                        <div className="mt-2 text-xs text-yellow-300">
                          ⚠️ If you don&apos;t check &quot;Share audio&quot;, only your microphone will be recorded!
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recording Controls */}
              <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-6 mb-8">
                <div className="text-center mb-6">
                  {isRecording ? (
                    <div className="space-y-4">
                      <div className="text-2xl font-mono text-red-400">
                        🔴 {formatTime(recordingTime)}
                      </div>
                      <div className="text-sm text-gray-400 mb-2">
                        Recording {recordingMode === 'desktop+mic' ? 'Desktop + Microphone' : 'Microphone Only'}
                      </div>
                      <AudioLevelBar level={audioLevel} />
                      <button
                        onClick={stopRecording}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Square className="w-5 h-5" />
                        Stop Recording
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Mic className="w-16 h-16 text-gray-400 mx-auto" />
                      <button
                        onClick={handleStartRecording}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Mic className="w-5 h-5" />
                        {recordingMode === 'desktop+mic' ? 'Start Desktop + Mic Recording' : 'Start Microphone Recording'}
                      </button>
                      <p className="text-sm text-gray-400 max-w-md mx-auto">
                        {recordingMode === 'desktop+mic' 
                          ? 'Click to start recording desktop audio and microphone. You\'ll be prompted to select audio sources.'
                          : 'Click to start recording from your microphone only.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recording Preview */}
              {previewRecording && (
                <AudioPreview
                  recording={previewRecording}
                  onSave={savePreviewRecording}
                  onDiscard={discardPreviewRecording} 
                  onDownload={downloadPreviewRecording}
                  loading={loading}
                />
              )}

              {/* Recordings List */}
              {recordings.length > 0 && (
                <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">
                      Recordings ({recordings.length})
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-colors ${
                          viewMode === 'grid' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-700 text-gray-400 hover:text-white'
                        }`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-colors ${
                          viewMode === 'list' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-700 text-gray-400 hover:text-white'
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-gray-400">Loading recordings...</span>
                    </div>
                  ) : (
                    <div className={viewMode === 'grid' 
                      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
                      : 'space-y-3'
                    }>
                      {recordings.map((recording) => (
                        <AudioRecordingCard
                          key={recording.id}
                          recording={recording as AudioRecordingDB}
                          onPlay={handlePlayRecording}
                          onDelete={handleDeleteRecording}
                          onDownload={handleDownloadRecording}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {recordings.length === 0 && !isRecording && !loading && (
                <div className="text-center py-12">
                  <Volume2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-300 mb-2">No recordings yet</h2>
                  <p className="text-gray-500">
                    Start your first {recordingMode === 'desktop+mic' ? 'desktop + microphone' : 'microphone'} recording above
                  </p>
                </div>
        )}

        {/* Recording Status Indicator (Fixed Position) */}
        {isRecording && (
          <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              <span className="text-sm font-medium">Recording {formatTime(recordingTime)}</span>
            </div>
          </div>
        )}

        {/* Audio Recording Modal */}
        {selectedRecording && (
          <AudioRecordingModal
            recording={selectedRecording}
            isOpen={!!selectedRecording}
            onClose={() => setSelectedRecording(null)}
            onDelete={handleDeleteRecording}
          />
        )}
      </div>
    </div>
  )
}