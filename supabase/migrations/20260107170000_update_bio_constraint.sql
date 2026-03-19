-- Update bio constraint to allow basic punctuation (space, comma, period, dash, etc.)
ALTER TABLE users
DROP CONSTRAINT IF EXISTS bio_alphanumeric;

ALTER TABLE users
ADD CONSTRAINT bio_alphanumeric CHECK (bio ~ '^[a-zA-Z0-9 .,\-!?]*$');