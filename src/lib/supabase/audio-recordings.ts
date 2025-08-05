import { createClient } from './client'
import { transcribeAudioWithGemini, type TranscriptionResult } from '@/lib/gemini/audio-transcription'

const supabase = createClient()

export interface AudioRecordingDB {
  id: string
  audio_filename: string | null
  complete_file_link: string | null
  added_by_email: string | null
  title: string | null
  description: string | null
  raw_transcript: Record<string, unknown> | null
  ai_summary: Record<string, unknown> | null
  metadata: Record<string, unknown> | null
  created_at: string
  // Computed properties for transcription (stored in metadata)
  transcription?: string
  ai_summary_text?: string
  speaker_count?: number
}

export async function uploadAudioRecording(
  blob: Blob,
  userEmail: string,
  duration: number,
  mimeType: string,
  title: string,
  description: string,
  metadata: Record<string, unknown> = {}
): Promise<AudioRecordingDB> {
  console.log('🚀 uploadAudioRecording called with:', {
    userEmail,
    duration,
    mimeType,
    blobSize: blob.size,
    blobType: blob.type,
    title,
    description,
    metadata
  })

  // Generate unique filename and storage details
  const timestamp = Date.now()
  const extension = mimeType.includes('webm') ? 'webm' : 
                   mimeType.includes('mp4') ? 'mp4' : 
                   mimeType.includes('wav') ? 'wav' : 'webm'
  const fileName = `recording_${timestamp}.${extension}`
  const filePath = `audio-recordings/${userEmail}/${timestamp}_${fileName}`
  
  console.log('📁 Generated storage details:', {
    filePath,
    fileName,
    extension,
    timestamp,
    bucket: 'audio-recordings'
  })

  // STEP 1: Generate transcripts and AI summary
  console.log('🎤 Starting transcript generation with Gemini...')
  let transcriptionResult: TranscriptionResult | null = null
  
  try {
    transcriptionResult = await transcribeAudioWithGemini(blob)
    console.log('✅ Transcription completed successfully')
  } catch (transcriptionError) {
    console.error('❌ Transcription failed:', transcriptionError)
    // Continue with upload but without transcription data
    console.log('⚠️ Continuing upload without transcription data')
  }

  // STEP 2: Save to database first (with transcripts if available)
  const insertData = {
    audio_filename: fileName,
    complete_file_link: null, // Will be updated after storage upload
    added_by_email: userEmail,
    title: title.trim(),
    description: description.trim(),
    raw_transcript: transcriptionResult ? {
      rawTranscript: transcriptionResult.rawTranscript,
      speakerCount: transcriptionResult.speakerCount,
      speakerSegments: transcriptionResult.speakerSegments,
      generatedAt: new Date().toISOString()
    } : null,
    ai_summary: transcriptionResult ? {
      aiSummary: transcriptionResult.aiSummary,
      generatedAt: new Date().toISOString()
    } : null,
    metadata: {
      ...metadata,
      duration,
      mimeType,
      fileSize: blob.size,
      upload_timestamp: timestamp,
      storage_path: filePath // Will be used later for storage
    }
  }
  
  console.log('💾 Saving to database first:', {
    table: 'audio_transcript',
    audio_filename: insertData.audio_filename,
    added_by_email: insertData.added_by_email,
    hasRawTranscript: !!insertData.raw_transcript,
    hasAiSummary: !!insertData.ai_summary,
    metadataKeys: Object.keys(insertData.metadata)
  })

  const { data: dbData, error: dbError } = await supabase
    .from('audio_transcript')
    .insert(insertData)
    .select()
    .single()

  if (dbError) {
    console.error('❌ Database insert failed:', {
      error: dbError,
      message: dbError.message,
      code: dbError.code,
      details: dbError.details,
      hint: dbError.hint,
      insertData
    })
    throw new Error(`Failed to save audio recording to database: ${dbError.message}`)
  }
  
  console.log('✅ Database record created:', {
    id: dbData.id,
    audio_filename: dbData.audio_filename,
    added_by_email: dbData.added_by_email,
    created_at: dbData.created_at,
    hasRawTranscript: !!dbData.raw_transcript,
    hasAiSummary: !!dbData.ai_summary
  })

  // STEP 3: Upload to Supabase Storage
  console.log('📤 Starting file upload to Supabase Storage...')
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('audio-recordings')
    .upload(filePath, blob, {
      contentType: mimeType,
      upsert: false
    })

  if (uploadError) {
    console.error('❌ Upload error:', {
      error: uploadError,
      message: uploadError.message,
      filePath,
      blobSize: blob.size
    })
    
    // Clean up database record if storage upload fails
    console.log('🧹 Cleaning up database record due to storage error...')
    await supabase
      .from('audio_transcript')
      .delete()
      .eq('id', dbData.id)
    
    throw new Error(`Failed to upload audio file to storage: ${uploadError.message}`)
  }

  console.log('✅ File uploaded successfully to storage:', {
    path: uploadData.path,
    id: uploadData.id,
    fullPath: uploadData.fullPath
  })
  
  // STEP 4: Update database record with public URL
  console.log('🔗 Getting public URL and updating database record...')
  const { data: urlData } = await supabase.storage
    .from('audio-recordings')
    .getPublicUrl(uploadData.path)
  
  const { data: updatedDbData, error: updateError } = await supabase
    .from('audio_transcript')
    .update({ 
      complete_file_link: urlData.publicUrl,
      metadata: {
        ...insertData.metadata,
        storage_path: uploadData.path
      }
    })
    .eq('id', dbData.id)
    .select()
    .single()

  if (updateError) {
    console.error('❌ Failed to update database with public URL:', updateError)
    // Don't fail the entire process, just log the error
  }

  console.log('✅ Public URL updated in database:', {
    publicUrl: urlData.publicUrl,
    path: uploadData.path
  })

  const finalRecord = updatedDbData || { ...dbData, complete_file_link: urlData.publicUrl }
  const transformedRecord = transformAudioRecord(finalRecord)
  
  console.log('🎉 Audio recording upload process completed successfully:', {
    recordId: transformedRecord.id,
    fileName: transformedRecord.audio_filename,
    publicUrl: transformedRecord.complete_file_link,
    hasTranscription: !!transformedRecord.transcription,
    hasAiSummary: !!transformedRecord.ai_summary_text
  })

  return transformedRecord
}

// Helper function to transform raw database record to include computed properties
function transformAudioRecord(record: Record<string, unknown>): AudioRecordingDB {
  const rawTranscript = record.raw_transcript as Record<string, unknown> | null
  const aiSummary = record.ai_summary as Record<string, unknown> | null
  
  return {
    ...record,
    transcription: rawTranscript?.rawTranscript as string | undefined,
    ai_summary_text: aiSummary?.aiSummary as string | undefined,
    speaker_count: rawTranscript?.speakerCount as number | undefined,
  }
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

  return (data || []).map(transformAudioRecord)
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
    ai_summary: string
    speaker_count: number
    metadata: Record<string, unknown>
  }>
): Promise<AudioRecordingDB> {
  // First get the current record to merge metadata
  const { data: currentRecord, error: fetchError } = await supabase
    .from('audio_transcript')
    .select('metadata')
    .eq('id', id)
    .single()

  if (fetchError) {
    console.error('Error fetching current record:', fetchError)
    throw new Error(`Failed to fetch current record: ${fetchError.message}`)
  }

  // Prepare the update payload
  const updatePayload: Record<string, unknown> = {}
  
  // If we have transcription data, store it in metadata
  if (updates.transcription || updates.ai_summary || updates.speaker_count || updates.metadata) {
    const existingMetadata = (currentRecord.metadata as Record<string, unknown>) || {}
    const newMetadata = { ...existingMetadata }
    
    if (updates.transcription) newMetadata.transcription = updates.transcription
    if (updates.ai_summary) newMetadata.ai_summary = updates.ai_summary
    if (updates.speaker_count) newMetadata.speaker_count = updates.speaker_count
    if (updates.metadata) Object.assign(newMetadata, updates.metadata)
    
    updatePayload.metadata = newMetadata
  }

  const { data, error } = await supabase
    .from('audio_transcript')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating recording:', error)
    throw new Error(`Failed to update recording: ${error.message}`)
  }

  return transformAudioRecord(data)
}

// Helper function to get file size in human readable format
export function formatFileSize(bytes: number): string {
  // Handle NaN, undefined, null, or negative values
  if (!bytes || isNaN(bytes) || bytes < 0) {
    return 'Unknown'
  }
  
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Helper function to format duration
export function formatDuration(seconds: number): string {
  // Handle NaN, undefined, null, or negative values
  if (!seconds || isNaN(seconds) || seconds < 0) {
    return '0:00'
  }
  
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}