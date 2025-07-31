/*
  # Video Interview Platform Schema

  1. New Tables
    - `questions`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `video_url` (text, not null) 
      - `unique_url` (text, unique, not null)
      - `recruiter_id` (uuid, references auth.users)
      - `created_at` (timestamp)
    
    - `responses`
      - `id` (uuid, primary key)
      - `question_id` (uuid, references questions)
      - `candidate_email` (text, not null)
      - `video_url` (text, not null)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for recruiters to manage their questions
    - Add policies for public access to submit responses
    - Create storage bucket for video files

  3. Storage
    - Create videos bucket with appropriate policies
*/

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  video_url text NOT NULL,
  unique_url text UNIQUE NOT NULL,
  recruiter_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create responses table
CREATE TABLE IF NOT EXISTS responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  candidate_email text NOT NULL,
  video_url text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Questions policies
CREATE POLICY "Recruiters can manage their own questions"
  ON questions
  FOR ALL
  TO authenticated
  USING (auth.uid() = recruiter_id);

CREATE POLICY "Anyone can read questions by unique_url"
  ON questions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Responses policies
CREATE POLICY "Recruiters can read responses to their questions"
  ON responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM questions 
      WHERE questions.id = responses.question_id 
      AND questions.recruiter_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert responses"
  ON responses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_recruiter_id ON questions(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_questions_unique_url ON questions(unique_url);
CREATE INDEX IF NOT EXISTS idx_responses_question_id ON responses(question_id);

-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can upload videos"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Anyone can view videos"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'videos');

CREATE POLICY "Users can delete their own videos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1]);