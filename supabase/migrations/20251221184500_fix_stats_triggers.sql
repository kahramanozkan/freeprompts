-- Fix stats triggers to update only affected metrics for better performance
-- Drop existing triggers first
DROP TRIGGER IF EXISTS prompts_stats_trigger ON prompts;
DROP TRIGGER IF EXISTS lists_stats_trigger ON lists;

-- Create function to update specific metric
CREATE OR REPLACE FUNCTION update_stats_metric(metric_name text)
RETURNS void AS $$
BEGIN
  IF metric_name = 'total_prompts' THEN
    UPDATE stats SET value = (SELECT COUNT(*) FROM prompts), updated_at = NOW()
    WHERE metric = 'total_prompts';
  ELSIF metric_name = 'total_lists' THEN
    UPDATE stats SET value = (SELECT COUNT(*) FROM lists), updated_at = NOW()
    WHERE metric = 'total_lists';
  ELSIF metric_name = 'total_views' THEN
    UPDATE stats SET value = (
      SELECT COALESCE(SUM(views), 0) FROM prompts
    ) + (
      SELECT COALESCE(SUM(views), 0) FROM lists
    ), updated_at = NOW()
    WHERE metric = 'total_views';
  ELSIF metric_name = 'total_likes' THEN
    UPDATE stats SET value = (
      SELECT COALESCE(SUM(likes), 0) FROM prompts
    ) + (
      SELECT COALESCE(SUM(likes), 0) FROM lists
    ), updated_at = NOW()
    WHERE metric = 'total_likes';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for prompts
CREATE OR REPLACE FUNCTION prompts_stats_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  -- If it's an INSERT or DELETE, update total_prompts
  IF (TG_OP = 'INSERT' OR TG_OP = 'DELETE') THEN
    PERFORM update_stats_metric('total_prompts');
  END IF;
  
  -- If likes or views changed, update total_likes and total_views
  IF (TG_OP = 'UPDATE') THEN
    IF (OLD.likes IS DISTINCT FROM NEW.likes) OR (OLD.views IS DISTINCT FROM NEW.views) THEN
      PERFORM update_stats_metric('total_likes');
      PERFORM update_stats_metric('total_views');
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger function for lists
CREATE OR REPLACE FUNCTION lists_stats_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' OR TG_OP = 'DELETE') THEN
    PERFORM update_stats_metric('total_lists');
  END IF;
  
  IF (TG_OP = 'UPDATE') THEN
    IF (OLD.likes IS DISTINCT FROM NEW.likes) OR (OLD.views IS DISTINCT FROM NEW.views) THEN
      PERFORM update_stats_metric('total_likes');
      PERFORM update_stats_metric('total_views');
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER prompts_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON prompts
FOR EACH ROW
EXECUTE FUNCTION prompts_stats_trigger_func();

CREATE TRIGGER lists_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON lists
FOR EACH ROW
EXECUTE FUNCTION lists_stats_trigger_func();

-- Also create a trigger for user_likes table? Not needed because likes are stored in prompts/lists tables directly.

-- Ensure stats table has initial values (if missing)
INSERT INTO stats (metric, value) VALUES
  ('total_prompts', 0),
  ('total_lists', 0),
  ('total_views', 0),
  ('total_likes', 0)
ON CONFLICT (metric) DO NOTHING;

-- Update stats with current aggregates
SELECT update_stats_from_aggregates();