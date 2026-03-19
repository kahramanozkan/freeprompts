-- Make increment_stats_metric function security definer to bypass RLS
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also update the trigger functions to use the same security
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