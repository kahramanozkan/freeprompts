-- This SQL script applies all stats-related migrations.
-- Run this in your Supabase SQL editor.

-- 1. Ensure stats table exists
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

-- 2. Create function to update stats from aggregates
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

-- 3. Create function to increment stats metric by amount
CREATE OR REPLACE FUNCTION increment_stats_metric(metric_name text, increment_by bigint DEFAULT 1)
RETURNS void AS $$
BEGIN
  UPDATE stats 
  SET value = value + increment_by, updated_at = NOW()
  WHERE metric = metric_name;
  
  -- If metric doesn't exist, insert it (should not happen)
  IF NOT FOUND THEN
    INSERT INTO stats (metric, value) VALUES (metric_name, increment_by);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. Drop existing triggers if any
DROP TRIGGER IF EXISTS prompts_stats_trigger ON prompts;
DROP TRIGGER IF EXISTS lists_stats_trigger ON lists;

-- 5. Create trigger function for prompts
CREATE OR REPLACE FUNCTION prompts_stats_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  -- If it's an INSERT or DELETE, update total_prompts
  IF (TG_OP = 'INSERT' OR TG_OP = 'DELETE') THEN
    PERFORM increment_stats_metric('total_prompts', CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE -1 END);
  END IF;
  
  -- If likes or views changed, update total_likes and total_views
  IF (TG_OP = 'UPDATE') THEN
    IF (OLD.likes IS DISTINCT FROM NEW.likes) THEN
      PERFORM increment_stats_metric('total_likes', NEW.likes - OLD.likes);
    END IF;
    IF (OLD.views IS DISTINCT FROM NEW.views) THEN
      PERFORM increment_stats_metric('total_views', NEW.views - OLD.views);
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger function for lists
CREATE OR REPLACE FUNCTION lists_stats_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'DELETE') THEN
    PERFORM increment_stats_metric('total_lists', CASE WHEN TG_OP = 'INSERT' THEN 1 ELSE -1 END);
  END IF;
  
  IF (TG_OP = 'UPDATE') THEN
    IF (OLD.likes IS DISTINCT FROM NEW.likes) THEN
      PERFORM increment_stats_metric('total_likes', NEW.likes - OLD.likes);
    END IF;
    IF (OLD.views IS DISTINCT FROM NEW.views) THEN
      PERFORM increment_stats_metric('total_views', NEW.views - OLD.views);
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 7. Create triggers
CREATE TRIGGER prompts_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON prompts
FOR EACH ROW
EXECUTE FUNCTION prompts_stats_trigger_func();

CREATE TRIGGER lists_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON lists
FOR EACH ROW
EXECUTE FUNCTION lists_stats_trigger_func();

-- 8. Update stats with current aggregates (initial sync)
SELECT update_stats_from_aggregates();

-- 9. Verify
SELECT * FROM stats;