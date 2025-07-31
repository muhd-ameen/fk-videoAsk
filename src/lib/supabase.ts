import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      interviews: {
        Row: {
          id: string
          title: string
          description: string | null
          unique_url: string
          recruiter_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          unique_url: string
          recruiter_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          unique_url?: string
          recruiter_id?: string
          created_at?: string
        }
      }
      interview_questions: {
        Row: {
          id: string
          interview_id: string
          question_text: string
          video_url: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          interview_id: string
          question_text: string
          video_url: string
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          interview_id?: string
          question_text?: string
          video_url?: string
          order_index?: number
          created_at?: string
        }
      }
      interview_responses: {
        Row: {
          id: string
          interview_id: string
          first_name: string
          last_name: string
          candidate_email: string
          responses: Array<{
            question_id: string
            video_url: string
            answered_at: string
          }>
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          interview_id: string
          first_name: string
          last_name: string
          candidate_email: string
          responses?: Array<{
            question_id: string
            video_url: string
            answered_at: string
          }>
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          interview_id?: string
          first_name?: string
          last_name?: string
          candidate_email?: string
          responses?: Array<{
            question_id: string
            video_url: string
            answered_at: string
          }>
          completed_at?: string | null
          created_at?: string
        }
      }
    }
  }
}