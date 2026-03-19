-- Add language fields to users table
ALTER TABLE users 
ADD COLUMN prompt_language TEXT DEFAULT 'english',
ADD COLUMN site_language TEXT DEFAULT 'english';

-- Add check constraints for language values
ALTER TABLE users 
ADD CONSTRAINT check_prompt_language 
CHECK (prompt_language IN ('english', 'spanish', 'french', 'german', 'russian', 'chinese', 'portuguese', 'hindi', 'japanese', 'turkish'));

ALTER TABLE users 
ADD CONSTRAINT check_site_language 
CHECK (site_language IN ('english', 'russian', 'portuguese', 'hindi', 'turkish'));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_prompt_language ON users(prompt_language);
CREATE INDEX IF NOT EXISTS idx_users_site_language ON users(site_language);