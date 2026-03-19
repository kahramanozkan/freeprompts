-- Populate empty usernames with random unique values
-- This script ensures every user has a username (if null) in the format user{9-digit-number}
-- It will generate random usernames and retry on conflict.

CREATE OR REPLACE FUNCTION generate_random_username() RETURNS TEXT AS $$
DECLARE
  new_username TEXT;
  attempts INT := 0;
BEGIN
  LOOP
    -- Generate 9-digit random number (100000000 - 999999999)
    new_username := 'user' || floor(random() * 900000000 + 100000000)::INT;
    
    -- Check if username already exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = new_username) THEN
      RETURN new_username;
    END IF;
    
    attempts := attempts + 1;
    IF attempts > 10 THEN
      -- Fallback: use timestamp
      new_username := 'user' || extract(epoch from now())::INT;
      IF NOT EXISTS (SELECT 1 FROM users WHERE username = new_username) THEN
        RETURN new_username;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update users with NULL or empty username
UPDATE users
SET username = generate_random_username()
WHERE username IS NULL OR username = '';

-- Drop the helper function
DROP FUNCTION generate_random_username();

-- Ensure constraint after update
ALTER TABLE users
DROP CONSTRAINT IF EXISTS username_alphanumeric;

ALTER TABLE users
ADD CONSTRAINT username_alphanumeric CHECK (username ~ '^[a-zA-Z0-9]*$');