export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          email_verified: string | null
          name: string | null
          image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          email_verified?: string | null
          name?: string | null
          image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          email_verified?: string | null
          name?: string | null
          image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          type: string
          provider: string
          provider_account_id: string
          refresh_token: string | null
          access_token: string | null
          expires_at: number | null
          token_type: string | null
          scope: string | null
          id_token: string | null
          session_state: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          provider: string
          provider_account_id: string
          refresh_token?: string | null
          access_token?: string | null
          expires_at?: number | null
          token_type?: string | null
          scope?: string | null
          id_token?: string | null
          session_state?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          provider?: string
          provider_account_id?: string
          refresh_token?: string | null
          access_token?: string | null
          expires_at?: number | null
          token_type?: string | null
          scope?: string | null
          id_token?: string | null
          session_state?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          session_token: string
          user_id: string
          expires: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_token: string
          user_id: string
          expires: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_token?: string
          user_id?: string
          expires?: string
          created_at?: string
          updated_at?: string
        }
      }
      verification_tokens: {
        Row: {
          identifier: string
          token: string
          expires: string
          created_at: string
        }
        Insert: {
          identifier: string
          token: string
          expires: string
          created_at?: string
        }
        Update: {
          identifier?: string
          token?: string
          expires?: string
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_public: boolean
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_public?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          is_public?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      project_components: {
        Row: {
          id: string
          project_id: string
          component_type: string
          position_x: number
          position_y: number
          width: number
          height: number
          z_index: number
          properties: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          component_type: string
          position_x: number
          position_y: number
          width: number
          height: number
          z_index?: number
          properties?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          component_type?: string
          position_x?: number
          position_y?: number
          width?: number
          height?: number
          z_index?: number
          properties?: Json
          created_at?: string
          updated_at?: string
        }
      }
      audio_recordings: {
        Row: {
          id: string
          project_id: string
          user_id: string
          file_path: string
          file_size: number
          duration_seconds: number | null
          mime_type: string
          transcription: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          file_path: string
          file_size: number
          duration_seconds?: number | null
          mime_type: string
          transcription?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          file_path?: string
          file_size?: number
          duration_seconds?: number | null
          mime_type?: string
          transcription?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      prompt_generations: {
        Row: {
          id: string
          project_id: string
          user_id: string
          prompt_text: string
          ai_model: string
          response_text: string | null
          tokens_used: number | null
          cost_usd: number | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          prompt_text: string
          ai_model: string
          response_text?: string | null
          tokens_used?: number | null
          cost_usd?: number | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          prompt_text?: string
          ai_model?: string
          response_text?: string | null
          tokens_used?: number | null
          cost_usd?: number | null
          metadata?: Json
          created_at?: string
        }
      }
      collaborators: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: 'viewer' | 'editor' | 'admin'
          invited_by: string
          accepted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role: 'viewer' | 'editor' | 'admin'
          invited_by: string
          accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: 'viewer' | 'editor' | 'admin'
          invited_by?: string
          accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_activity: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          activity_data: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          activity_data?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: string
          activity_data?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      api_usage: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          endpoint: string
          method: string
          tokens_used: number | null
          cost_usd: number | null
          response_time_ms: number | null
          status_code: number | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          endpoint: string
          method: string
          tokens_used?: number | null
          cost_usd?: number | null
          response_time_ms?: number | null
          status_code?: number | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          endpoint?: string
          method?: string
          tokens_used?: number | null
          cost_usd?: number | null
          response_time_ms?: number | null
          status_code?: number | null
          error_message?: string | null
          created_at?: string
        }
      }
      error_logs: {
        Row: {
          id: string
          user_id: string | null
          error_type: string
          error_message: string
          stack_trace: string | null
          context: Json
          severity: 'debug' | 'info' | 'warning' | 'error' | 'critical'
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          error_type: string
          error_message: string
          stack_trace?: string | null
          context?: Json
          severity: 'debug' | 'info' | 'warning' | 'error' | 'critical'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          error_type?: string
          error_message?: string
          stack_trace?: string | null
          context?: Json
          severity?: 'debug' | 'info' | 'warning' | 'error' | 'critical'
          created_at?: string
        }
      }
      performance_metrics: {
        Row: {
          id: string
          metric_type: string
          metric_value: number
          unit: string
          context: Json
          created_at: string
        }
        Insert: {
          id?: string
          metric_type: string
          metric_value: number
          unit: string
          context?: Json
          created_at?: string
        }
        Update: {
          id?: string
          metric_type?: string
          metric_value?: number
          unit?: string
          context?: Json
          created_at?: string
        }
      }
      audio_transcript: {
        Row: {
          id: string
          audio_filename: string
          complete_file_link: string
          added_by_email: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          audio_filename: string
          complete_file_link: string
          added_by_email: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          audio_filename?: string
          complete_file_link?: string
          added_by_email?: string
          metadata?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_project_stats: {
        Args: { user_uuid: string }
        Returns: {
          total_projects: number
          total_components: number
          total_audio_files: number
          total_prompts: number
          total_collaborations: number
          storage_used_bytes: number
        }[]
      }
      get_monthly_api_costs: {
        Args: { user_uuid: string; month_date?: string }
        Returns: {
          month: string
          total_tokens: number
          total_cost_usd: number
          api_call_count: number
        }[]
      }
      check_project_quota: {
        Args: { user_uuid: string; max_projects?: number }
        Returns: boolean
      }
      soft_delete_project: {
        Args: { project_uuid: string; user_uuid: string }
        Returns: boolean
      }
      duplicate_project: {
        Args: { 
          source_project_id: string
          user_uuid: string
          new_name?: string 
        }
        Returns: string
      }
      generate_audio_file_path: {
        Args: { 
          user_id: string
          project_id: string
          file_name: string 
        }
        Returns: string
      }
      cleanup_orphaned_audio_files: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}