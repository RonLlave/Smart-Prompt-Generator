import { createClient } from './client'

const supabase = createClient()

export interface AudioRecordingDB {
  id: string
  audio_filename: string | null
  complete_file_link: string | null
  added_by_email: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  // Computed properties for transcription (stored in metadata)
  transcription?: string
  ai_summary?: string
  speaker_count?: number
}

export async function uploadAudioRecording(
  blob: Blob,
  userEmail: string,
  duration: number,
  mimeType: string,
  metadata: Record<string, unknown> = {}
): Promise<AudioRecordingDB> {
  console.log('uploadAudioRecording called with:', {
    userEmail,
    duration,
    mimeType,
    blobSize: blob.size,
    metadata
  })

  // Generate unique filename
  const timestamp = Date.now()
  const extension = mimeType.includes('webm') ? 'webm' : 
                   mimeType.includes('mp4') ? 'mp4' : 
                   mimeType.includes('wav') ? 'wav' : 'webm'
  const fileName = `recording_${timestamp}.${extension}`
  
  // Generate file path for storage
  const filePath = `audio-recordings/${userEmail}/${timestamp}_${fileName}`
  
  console.log('Generated file path:', filePath)
  
  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('audio-recordings')
    .upload(filePath, blob, {
      contentType: mimeType,
      upsert: false
    })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    throw new Error(`Failed to upload audio file: ${uploadError.message}`)
  }

  console.log('File uploaded successfully, now saving to database')
  
  // Get public URL for the uploaded file
  const { data: urlData } = await supabase.storage
    .from('audio-recordings')
    .getPublicUrl(uploadData.path)
  
  // Save record to audio_transcript table
  const insertData = {
    audio_filename: fileName,
    complete_file_link: urlData.publicUrl,
    added_by_email: userEmail,
    metadata: {
      ...metadata,
      duration,
      mimeType,
      fileSize: blob.size,
      upload_timestamp: timestamp,
      storage_path: uploadData.path
    }
  }
  
  console.log('Database insert data:', insertData)

  const { data: dbData, error: dbError } = await supabase
    .from('audio_transcript')
    .insert(insertData)
    .select()
    .single()

  if (dbError) {
    // Clean up uploaded file if database insert fails
    await supabase.storage
      .from('audio-recordings')
      .remove([uploadData.path])
    
    console.error('Database error:', dbError)
    throw new Error(`Failed to save audio recording: ${dbError.message}`)
  }
  
  console.log('Database insert successful:', dbData)

  return dbData
}

export async function getAudioRecordings(
  userEmail: string
): Promise<AudioRecordingDB[]> {
  const { data, error } = await supabase
    .from('audio_transcript')
    .select('*')
    .eq('added_by_email', userEmail)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching recordings:', error)
    throw new Error(`Failed to fetch recordings: ${error.message}`)
  }

  return data || []
}

export async function getAudioRecordingUrl(recording: AudioRecordingDB): Promise<string> {
  // Since we store public URLs, we can return them directly
  if (recording.complete_file_link) {
    return recording.complete_file_link
  }

  // Fallback: try to get from storage path in metadata
  if (recording.metadata && typeof recording.metadata === 'object' && 'storage_path' in recording.metadata) {
    const storagePath = recording.metadata.storage_path as string
    const { data } = await supabase.storage
      .from('audio-recordings')
      .createSignedUrl(storagePath, 3600) // 1 hour expiry

    if (data?.signedUrl) {
      return data.signedUrl
    }
  }

  throw new Error('Failed to get audio file URL')
}

export async function deleteAudioRecording(id: string): Promise<void> {
  // First get the storage path from metadata
  const { data: recording, error: fetchError } = await supabase
    .from('audio_transcript')
    .select('metadata')
    .eq('id', id)
    .single()

  if (fetchError) {
    console.error('Error fetching recording:', fetchError)
    throw new Error(`Failed to fetch recording: ${fetchError.message}`)
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('audio_transcript')
    .delete()
    .eq('id', id)

  if (dbError) {
    console.error('Error deleting from database:', dbError)
    throw new Error(`Failed to delete recording: ${dbError.message}`)
  }

  // Delete from storage if we have the storage path
  if (recording.metadata && typeof recording.metadata === 'object' && 'storage_path' in recording.metadata) {
    const storagePath = recording.metadata.storage_path as string
    const { error: storageError } = await supabase.storage
      .from('audio-recordings')
      .remove([storagePath])

    if (storageError) {
      console.error('Error deleting from storage:', storageError)
      // Don't throw here as the database record is already deleted
      // The cleanup function will handle orphaned files
    }
  }
}

export async function updateAudioRecording(
  id: string,
  updates: Partial<{
    transcription: string
    metadata: Record<string, unknown>
  }>
): Promise<AudioRecordingDB> {
  const { data, error } = await supabase
    .from('audio_recordings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating recording:', error)
    throw new Error(`Failed to update recording: ${error.message}`)
  }

  return data
}

// Helper function to get file size in human readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Helper function to format duration
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}