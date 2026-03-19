-- Enable RLS on stats table if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'stats' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Create policy for public read access to stats
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'stats' 
        AND policyname = 'Anyone can view stats'
    ) THEN
        CREATE POLICY "Anyone can view stats" ON stats FOR SELECT USING (true);
    END IF;
END
$$;

-- Ensure stats table has data by calling the aggregate function
SELECT update_stats_from_aggregates();