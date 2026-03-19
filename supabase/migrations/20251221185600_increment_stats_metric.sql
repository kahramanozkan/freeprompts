-- Create function to increment stats metric by amount
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

-- Add function to database types (already done in code)
-- This is just SQL.