/*
  # Interview System with Multiple Questions

  1. New Tables
    - `interviews`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text, optional)
      - `unique_url` (text, unique)
      - `recruiter_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
    - `interview_questions`
      - `id` (uuid, primary key)
      - `interview_id` (uuid, foreign key)
      - `question_text` (text)
      - `video_url` (text)
      - `order_index` (integer)
      - `created_at` (timestamp)
    - `interview_responses`
      - `id` (uuid, primary key)
      - `interview_id` (uuid, foreign key)
      - `candidate_email` (text)
      - `responses` (jsonb - array of question responses)
      - `completed_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for recruiters and candidates
*/

-- Create interviews table
CREATE TABLE IF NOT EXISTS interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  unique_url text UNIQUE NOT NULL,
  recruiter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create interview_questions table
CREATE TABLE IF NOT EXISTS interview_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  video_url text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create interview_responses table
CREATE TABLE IF NOT EXISTS interview_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  candidate_email text NOT NULL,
  responses jsonb NOT NULL DEFAULT '[]'::jsonb,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_interviews_recruiter_id ON interviews(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_interviews_unique_url ON interviews(unique_url);
CREATE INDEX IF NOT EXISTS idx_interview_questions_interview_id ON interview_questions(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_questions_order ON interview_questions(interview_id, order_index);
CREATE INDEX IF NOT EXISTS idx_interview_responses_interview_id ON interview_responses(interview_id);

-- Enable RLS
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_responses ENABLE ROW LEVEL SECURITY;

-- Policies for interviews
CREATE POLICY "Recruiters can manage their own interviews"
  ON interviews
  FOR ALL
  TO authenticated
  USING (auth.uid() = recruiter_id)
  WITH CHECK (auth.uid() = recruiter_id);

CREATE POLICY "Anyone can read interviews by unique_url"
  ON interviews
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policies for interview_questions
CREATE POLICY "Recruiters can manage questions for their interviews"
  ON interview_questions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM interviews 
      WHERE interviews.id = interview_questions.interview_id 
      AND interviews.recruiter_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM interviews 
      WHERE interviews.id = interview_questions.interview_id 
      AND interviews.recruiter_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read questions for interviews"
  ON interview_questions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policies for interview_responses
CREATE POLICY "Anyone can insert responses"
  ON interview_responses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Recruiters can read responses to their interviews"
  ON interview_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM interviews 
      WHERE interviews.id = interview_responses.interview_id 
      AND interviews.recruiter_id = auth.uid()
    )
  );