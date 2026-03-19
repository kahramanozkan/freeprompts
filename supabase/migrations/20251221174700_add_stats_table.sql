-- Add stats table for homepage statistics
CREATE TABLE IF NOT EXISTS stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric TEXT UNIQUE NOT NULL,
  value BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial metrics if they don't exist
INSERT INTO stats (metric, value) VALUES
  ('total_prompts', 0),
  ('total_lists', 0),
  ('total_views', 0),
  ('total_likes', 0)
ON CONFLICT (metric) DO NOTHING;

-- Create function to update stats from aggregates
CREATE OR REPLACE FUNCTION update_stats_from_aggregates()
RETURNS void AS $$
BEGIN
  -- Update total prompts
  UPDATE stats SET value = (SELECT COUNT(*) FROM prompts), updated_at = NOW()
  WHERE metric = 'total_prompts';
  
  -- Update total lists
  UPDATE stats SET value = (SELECT COUNT(*) FROM lists), updated_at = NOW()
  WHERE metric = 'total_lists';
  
  -- Update total views (sum of views from prompts and lists)
  UPDATE stats SET value = (
    SELECT COALESCE(SUM(views), 0) FROM prompts
  ) + (
    SELECT COALESCE(SUM(views), 0) FROM lists
  ), updated_at = NOW()
  WHERE metric = 'total_views';
  
  -- Update total likes (sum of likes from prompts and lists)
  UPDATE stats SET value = (
    SELECT COALESCE(SUM(likes), 0) FROM prompts
  ) + (
    SELECT COALESCE(SUM(likes), 0) FROM lists
  ), updated_at = NOW()
  WHERE metric = 'total_likes';
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update stats after prompts/lists changes
-- We'll create a simple event trigger that calls the function on insert/update/delete
-- However, for simplicity we can rely on a scheduled job or manual refresh.
-- For now, we'll create a function that can be called manually or via cron.

-- Enable RLS on stats table
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

-- Everyone can read stats
CREATE POLICY "Anyone can view stats" ON stats
  FOR SELECT USING (true);

-- Only service role can update stats (via function)
CREATE POLICY "Service role can update stats" ON stats
  FOR UPDATE USING (auth.role() = 'service_role');

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stats_metric ON stats(metric);