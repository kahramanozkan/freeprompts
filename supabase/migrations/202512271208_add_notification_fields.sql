-- Add new columns to notifications table
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS activate_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS activate_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#3B82F6'; -- default blue

-- Create a partial unique index to ensure only one active notification at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_only_one_active_notification 
ON notifications (is_active) 
WHERE is_active = true;

-- Update existing notifications to have default background color
UPDATE notifications 
SET background_color = '#3B82F6' 
WHERE background_color IS NULL;