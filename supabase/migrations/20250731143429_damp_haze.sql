/*
  # Fix Response Deletion RLS Policy

  This migration fixes the Row Level Security policy for interview_responses
  to allow recruiters to delete responses to their own interviews.

  ## Changes
  1. Drop existing policies that might be conflicting
  2. Create comprehensive policies for CRUD operations
  3. Ensure recruiters can delete responses to their interviews
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can insert responses" ON interview_responses;
DROP POLICY IF EXISTS "Recruiters can read responses to their questions" ON interview_responses;
DROP POLICY IF EXISTS "Recruiters can read responses to their interviews" ON interview_responses;

-- Create comprehensive policies for interview_responses
CREATE POLICY "Anyone can insert interview responses"
  ON interview_responses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Recruiters can read their interview responses"
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

CREATE POLICY "Recruiters can delete their interview responses"
  ON interview_responses
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM interviews
      WHERE interviews.id = interview_responses.interview_id
      AND interviews.recruiter_id = auth.uid()
    )
  );

-- Ensure RLS is enabled
ALTER TABLE interview_responses ENABLE ROW LEVEL SECURITY;