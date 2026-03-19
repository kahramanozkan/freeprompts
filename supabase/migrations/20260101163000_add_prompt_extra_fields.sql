-- Add theme, category, group, json_prompt columns to prompts table
ALTER TABLE prompts
ADD COLUMN IF NOT EXISTS theme TEXT,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS "group" TEXT,
ADD COLUMN IF NOT EXISTS json_prompt TEXT;

-- Update database.types.ts will be updated separately