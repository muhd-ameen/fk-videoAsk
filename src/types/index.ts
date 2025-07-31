export interface Interview {
  id: string
  title: string
  description?: string
  unique_url: string
  recruiter_id: string
  created_at: string
}

export interface InterviewQuestion {
  id: string
  interview_id: string
  question_text: string
  video_url: string
  order_index: number
  created_at: string
}

export interface InterviewResponse {
  id: string
  interview_id: string
  first_name: string
  last_name: string
  candidate_email: string
  responses: QuestionResponse[]
  completed_at?: string
  created_at: string
}

export interface QuestionResponse {
  question_id: string
  video_url: string
  answered_at: string
}