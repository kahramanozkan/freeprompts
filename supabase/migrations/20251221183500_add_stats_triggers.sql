-- Add triggers to automatically update stats when prompts/lists change

-- Trigger function that calls update_stats_from_aggregates
CREATE OR REPLACE FUNCTION trigger_update_stats()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_stats_from_aggregates();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for prompts table
DROP TRIGGER IF EXISTS prompts_stats_trigger ON prompts;
CREATE TRIGGER prompts_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON prompts
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_update_stats();

-- Create triggers for lists table
DROP TRIGGER IF EXISTS lists_stats_trigger ON lists;
CREATE TRIGGER lists_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON lists
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_update_stats();

-- Also create triggers for likes/views updates (if we want more granular)
-- But the statement-level trigger above will catch all changes.

-- Note: For performance, you might want to use row-level triggers that update only affected metrics.
-- However, for simplicity and given the small scale, statement-level trigger is fine.