-- Add username, bio, social_links columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS bio VARCHAR(200),
ADD COLUMN IF NOT EXISTS social_links TEXT[] DEFAULT '{}';

-- Add constraint: username can only contain alphanumeric characters
ALTER TABLE users
ADD CONSTRAINT username_alphanumeric CHECK (username ~ '^[a-zA-Z0-9]*$');

-- Add constraint: bio can only contain alphanumeric characters and spaces
ALTER TABLE users
ADD CONSTRAINT bio_alphanumeric CHECK (bio ~ '^[a-zA-Z0-9 ]*$');

-- Add constraint: social_links array max 5 items
ALTER TABLE users
ADD CONSTRAINT social_links_max_length CHECK (array_length(social_links, 1) <= 5);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);