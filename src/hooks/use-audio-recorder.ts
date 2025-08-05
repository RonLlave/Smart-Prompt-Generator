"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import { uploadAudioRecording, getAudioRecordings, deleteAudioRecording, getAudioRecordingUrl, type AudioRecordingDB } from '@/lib/supabase/audio-recordings'
import { useAuth } from '@/hooks/use-auth'

export interface AudioRecording {
  id: string
  blob: Blob
  url: string
  duration: number
  createdAt: Date
  name: string
}

// For backward compatibility
export { type AudioRecordingDB }

export interface RecordingCapabilities {
  basic: boolean
  desktopAudio: boolean
  webAudio: boolean
  microphoneAccess: boolean
  browserName: string
  recommendedApproach: 'full' | 'mic-only' | 'unsupported'
}

export function useAudioRecorder() {
  const { user } = useAuth()
  const [isRecording, setIsRecording] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [capabilities, setCapabilities] = useState<RecordingCapabilities | null>(null)
  const [recordings, setRecordings] = useState<AudioRecordingDB[]>([])
  const [localRecordings, setLocalRecordings] = useState<AudioRecording[]>([])
  const [currentRecording, setCurrentRecording] = useState<AudioRecordingDB | null>(null)
  const [previewRecording, setPreviewRecording] = useState<AudioRecording | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioLevel, setAudioLevel] = useState(0)
  const [recordingMode, setRecordingMode] = useState<'desktop+mic' | 'mic-only'>('desktop+mic')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const combinedStreamRef = useRef<MediaStream | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const desktopStreamRef = useRef<MediaStream | null>(null)
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const levelIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  const detectCapabilities = useCallback(async (): Promise<RecordingCapabilities> => {
    const userAgent = navigator.userAgent.toLowerCase()
    const browserName = userAgent.includes('chrome') ? 'chrome' : 
                      userAgent.includes('firefox') ? 'firefox' : 
                      userAgent.includes('safari') ? 'safari' : 
                      userAgent.includes('edge') ? 'edge' : 'unknown'

    const capabilities: RecordingCapabilities = {
      basic: !!(navigator.mediaDevices && window.MediaRecorder),
      desktopAudio: false,
      webAudio: !!(window.AudioContext || (window as any).webkitAudioContext),
      microphoneAccess: false,
      browserName,
      recommendedApproach: 'unsupported'
    }

    // Check if we're in a secure context
    if (!window.isSecureContext) {
      console.warn('Audio recording requires HTTPS')
      return capabilities
    }

    // Test microphone access
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      capabilities.microphoneAccess = true
      micStream.getTracks().forEach(track => track.stop())
    } catch (error) {
      console.warn('Microphone access denied or unavailable')
    }

    // Check for desktop audio support based on browser and platform
    if (capabilities.basic && navigator.mediaDevices.getDisplayMedia) {
      const isWindows = navigator.platform.toLowerCase().includes('win')
      const isChrome = browserName === 'chrome' || browserName === 'edge'
      
      // Desktop audio works best on Windows with Chrome/Edge
      capabilities.desktopAudio = isChrome && (isWindows || navigator.platform.toLowerCase().includes('linux'))
      
      console.log('Desktop audio support detected:', {
        browser: browserName,
        platform: navigator.platform,
        supported: capabilities.desktopAudio
      })
    }

    // Determine recommended approach
    if (capabilities.desktopAudio && capabilities.microphoneAccess && capabilities.webAudio) {
      capabilities.recommendedApproach = 'full'
    } else if (capabilities.microphoneAccess && capabilities.basic) {
      capabilities.recommendedApproach = 'mic-only'
    } else {
      capabilities.recommendedApproach = 'unsupported'
    }

    return capabilities
  }, [])


  // Initialize capabilities on mount
  useEffect(() => {
    detectCapabilities().then(caps => {
      setCapabilities(caps)
      setIsSupported(caps.recommendedApproach !== 'unsupported')
      
      // Auto-select recording mode based on capabilities
      if (caps.recommendedApproach === 'mic-only') {
        setRecordingMode('mic-only')
      }
    })
  }, [detectCapabilities])

  // Load recordings when user changes
  useEffect(() => {
    const loadUserRecordings = async () => {
      if (!user) {
        setRecordings([])
        setLoading(false)
        setError(null)
        return
      }
      
      try {
        setLoading(true)
        setError(null)
        const dbRecordings = await getAudioRecordings(user.email)
        setRecordings(dbRecordings)
      } catch (err) {
        console.error('Failed to load recordings:', err)
        // Don't show error for database issues, just keep recordings empty
        setRecordings([])
        setError(null) // Silently fail for now since Supabase might not be configured
      } finally {
        setLoading(false)
      }
    }

    loadUserRecordings()
  }, [user]) // Depend on user object

  const startRecording = useCallback(async () => {
    if (!capabilities || capabilities.recommendedApproach === 'unsupported') {
      throw new Error('Audio recording is not supported in this browser')
    }

    try {
      // Set up audio context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      audioContextRef.current = new AudioContextClass()
      
      let finalStream: MediaStream

      if (recordingMode === 'desktop+mic' && capabilities.desktopAudio) {
        try {
          // Get optimal display media constraints for desktop audio
          
          const displayMediaOptions = {
            video: true, // We need video to be true for tab audio capture
            audio: {
              suppressLocalAudioPlayback: false, // Allow hearing the audio while recording
            }
          }

          console.log('Requesting desktop audio with options:', displayMediaOptions)

          // Full recording: Desktop + Microphone  
          const [micStream, desktopStream] = await Promise.all([
            navigator.mediaDevices.getUserMedia({ 
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 44100
              }
            }),
            navigator.mediaDevices.getDisplayMedia(displayMediaOptions)
          ])

          micStreamRef.current = micStream
          desktopStreamRef.current = desktopStream

          // Check if desktop stream has audio tracks
          const desktopAudioTracks = desktopStream.getAudioTracks()
          console.log(`Desktop stream audio tracks: ${desktopAudioTracks.length}`)
          
          // Stop desktop video tracks since we only need audio
          desktopStream.getVideoTracks().forEach(track => track.stop())

          if (desktopAudioTracks.length === 0) {
            console.warn('No desktop audio tracks available - user may not have selected "Share audio"')
            // Continue with just microphone
            finalStream = micStream
            combinedStreamRef.current = finalStream
            console.log('Recording microphone only (no desktop audio tracks)')
          } else {
            // Mix audio streams using Web Audio API
            const micSource = audioContextRef.current.createMediaStreamSource(micStream)
            const desktopSource = audioContextRef.current.createMediaStreamSource(
              new MediaStream(desktopAudioTracks)
            )
            const destination = audioContextRef.current.createMediaStreamDestination()
            
            // Add gain control for better mixing
            const micGain = audioContextRef.current.createGain()
            const desktopGain = audioContextRef.current.createGain()
            
            micGain.gain.value = 1.0      // Full microphone volume
            desktopGain.gain.value = 0.8  // Slightly reduced desktop audio
            
            // Connect audio graph
            micSource.connect(micGain)
            desktopSource.connect(desktopGain)
            micGain.connect(destination)
            desktopGain.connect(destination)
            
            finalStream = destination.stream
            combinedStreamRef.current = finalStream
            
            console.log('Recording desktop audio + microphone with mixed audio')
          }
        } catch (desktopError) {
          console.warn('Desktop audio failed, falling back to microphone only:', desktopError.name, desktopError.message)
          
          // Show helpful error message for common issues
          if (desktopError.name === 'NotSupportedError') {
            setError('Desktop audio recording is not supported on this browser/platform. Using microphone only.')
          } else if (desktopError.name === 'NotAllowedError') {
            setError('Desktop recording permission denied. Using microphone only.')
          }
          
          // Fall back to microphone only
          const micStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          })
          
          micStreamRef.current = micStream
          finalStream = micStream
          combinedStreamRef.current = finalStream
          
          console.log('Recording microphone only (desktop fallback)')
        }
      } else {
        // Fallback: Microphone only
        const micStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        })
        
        micStreamRef.current = micStream
        finalStream = micStream
        combinedStreamRef.current = finalStream
        
        console.log('Recording microphone only')
      }

      // Set up audio visualization
      const source = audioContextRef.current.createMediaStreamSource(finalStream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      source.connect(analyserRef.current)

      // Set up MediaRecorder with fallback MIME types
      let mimeType = 'audio/webm;codecs=opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm'
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4'
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = '' // Let browser choose
          }
        }
      }

      const mediaRecorder = new MediaRecorder(finalStream, 
        mimeType ? { mimeType } : undefined
      )
      
      mediaRecorderRef.current = mediaRecorder
      const chunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const mimeTypeForBlob = mimeType || 'audio/webm'
        const blob = new Blob(chunks, { type: mimeTypeForBlob })
        const duration = (Date.now() - startTimeRef.current) / 1000
        
        // Create local recording for immediate playback
        const url = URL.createObjectURL(blob)
        const recordingName = recordingMode === 'desktop+mic' 
          ? `Desktop+Mic ${new Date().toLocaleTimeString()}`
          : `Microphone ${new Date().toLocaleTimeString()}`

        const localRecording: AudioRecording = {
          id: `local-recording-${Date.now()}`,
          blob,
          url,
          duration,
          createdAt: new Date(),
          name: recordingName
        }

        // Set as preview recording for user to decide whether to save
        setPreviewRecording(localRecording)
        console.log('Recording completed, ready for preview:', recordingName)
      }

      // Start recording
      startTimeRef.current = Date.now()
      mediaRecorder.start(1000)
      setIsRecording(true)
      setRecordingTime(0)

      // Start timing
      timeIntervalRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)

      // Start audio level monitoring
      levelIntervalRef.current = setInterval(() => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
          analyserRef.current.getByteFrequencyData(dataArray)
          
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length
          setAudioLevel(average / 255)
        }
      }, 100)

    } catch (error) {
      console.error('Error starting recording:', error)
      
      // Enhanced error messages
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Permission denied. Please allow microphone and screen sharing access.')
        } else if (error.name === 'NotFoundError') {
          throw new Error('No audio devices found. Please check your microphone connection.')
        } else if (error.name === 'NotSupportedError') {
          throw new Error('Audio recording not supported in this browser. Please use Chrome or Edge.')
        } else if (error.name === 'AbortError') {
          throw new Error('Recording was cancelled by the user.')
        }
      }
      
      throw error
    }
  }, [capabilities, recordingMode])

  const savePreviewRecording = useCallback(async () => {
    if (!previewRecording || !user) {
      console.warn('No preview recording to save or user not authenticated')
      return
    }

    try {
      setLoading(true)
      console.log('Saving preview recording to database...')
      
      const dbRecording = await uploadAudioRecording(
        previewRecording.blob,
        user.email,
        previewRecording.duration,
        previewRecording.blob.type,
        {
          recordingMode,
          recordingName: previewRecording.name,
          browserInfo: capabilities?.browserName || 'unknown'
        }
      )
      
      setRecordings(prev => [dbRecording, ...prev])
      setCurrentRecording(dbRecording)
      
      // Clean up preview
      URL.revokeObjectURL(previewRecording.url)
      setPreviewRecording(null)
      
      console.log('Preview recording saved successfully')
    } catch (err) {
      console.error('Failed to save preview recording:', err)
      setError(err instanceof Error ? err.message : 'Failed to save recording')
    } finally {
      setLoading(false)
    }
  }, [previewRecording, user, recordingMode, capabilities])

  const discardPreviewRecording = useCallback(() => {
    if (previewRecording) {
      URL.revokeObjectURL(previewRecording.url)
      setPreviewRecording(null)
      console.log('Preview recording discarded')
    }
  }, [previewRecording])

  const downloadPreviewRecording = useCallback(() => {
    if (!previewRecording) return
    
    const link = document.createElement('a')
    link.href = previewRecording.url
    link.download = `${previewRecording.name}.${previewRecording.blob.type.includes('webm') ? 'webm' : 'mp4'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    console.log('Preview recording downloaded')
  }, [previewRecording])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      
      // Clean up all streams
      if (combinedStreamRef.current) {
        combinedStreamRef.current.getTracks().forEach(track => track.stop())
        combinedStreamRef.current = null
      }
      
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop())
        micStreamRef.current = null
      }
      
      if (desktopStreamRef.current) {
        desktopStreamRef.current.getTracks().forEach(track => track.stop())
        desktopStreamRef.current = null
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }

      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current)
        timeIntervalRef.current = null
      }

      if (levelIntervalRef.current) {
        clearInterval(levelIntervalRef.current)
        levelIntervalRef.current = null
      }

      setIsRecording(false)
      setRecordingTime(0)
      setAudioLevel(0)
    }
  }, [isRecording])

  const deleteRecording = useCallback(async (id: string) => {
    try {
      // Check if it's a local recording first
      const localRecording = localRecordings.find(r => r.id === id)
      if (localRecording) {
        setLocalRecordings(prev => prev.filter(r => r.id !== id))
        URL.revokeObjectURL(localRecording.url)
        return
      }

      // Delete from database
      await deleteAudioRecording(id)
      setRecordings(prev => prev.filter(r => r.id !== id))
      
      if (currentRecording?.id === id) {
        setCurrentRecording(null)
      }
    } catch (err) {
      console.error('Failed to delete recording:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete recording')
    }
  }, [localRecordings, currentRecording])

  const downloadRecording = useCallback(async (recording: AudioRecordingDB | AudioRecording) => {
    try {
      let downloadUrl: string
      let filename: string

      if ('audio_filename' in recording) {
        // Database recording (from audio_transcript table)
        downloadUrl = await getAudioRecordingUrl(recording)
        const extension = recording.audio_filename?.split('.').pop() || 'webm'
        filename = recording.audio_filename || `recording_${new Date(recording.created_at).getTime()}.${extension}`
      } else {
        // Local recording
        downloadUrl = recording.url
        filename = `${recording.name}.webm`
      }

      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Failed to download recording:', err)
      setError(err instanceof Error ? err.message : 'Failed to download recording')
    }
  }, [])

  // Get all recordings (database + local)
  const allRecordings = [...recordings, ...localRecordings]

  return {
    isRecording,
    isSupported,
    capabilities,
    recordings: allRecordings,
    dbRecordings: recordings,
    localRecordings,
    currentRecording,
    previewRecording,
    recordingTime,
    audioLevel,
    recordingMode,
    setRecordingMode,
    startRecording,
    stopRecording,
    savePreviewRecording,
    discardPreviewRecording,
    downloadPreviewRecording,
    deleteRecording,
    downloadRecording,
    setCurrentRecording,
    detectCapabilities,
    loading,
    error,
    setError
  }
}