-- Add missing indexes for performance optimization

-- Index for user_likes table (commonly queried by user_id and prompt_id)
CREATE INDEX IF NOT EXISTS idx_user_likes_user_id_prompt_id ON user_likes(user_id, prompt_id);
CREATE INDEX IF NOT EXISTS idx_user_likes_prompt_id ON user_likes(prompt_id);

-- Index for subscribers table (email lookups)
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);

-- Index for notifications table (is_active filter)
CREATE INDEX IF NOT EXISTS idx_notifications_is_active ON notifications(is_active);

-- Ensure prompts and lists have proper indexes (they already have idx_prompts_created_at and idx_lists_created_at)
-- Add index for prompts tags (if using array operations)
-- CREATE INDEX IF NOT EXISTS idx_prompts_tags ON prompts USING GIN(tags);

-- Add index for lists slug (already exists idx_lists_slug)
-- Add index for lists prompt_ids (if using array operations)
-- CREATE INDEX IF NOT EXISTS idx_lists_prompt_ids ON lists USING GIN(prompt_ids);

-- Note: RLS is currently disabled but will be enabled in a separate migration.