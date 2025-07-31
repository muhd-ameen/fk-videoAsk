/*
  # Add candidate names to interview responses

  1. Changes
    - Add `first_name` column to `interview_responses` table
    - Add `last_name` column to `interview_responses` table
    - Both fields are required (NOT NULL)

  2. Security
    - No changes to RLS policies needed as they already cover the new columns
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interview_responses' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE interview_responses ADD COLUMN first_name text NOT NULL DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'interview_responses' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE interview_responses ADD COLUMN last_name text NOT NULL DEFAULT '';
  END IF;
END $$;