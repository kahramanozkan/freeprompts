-- Add missing RLS policies for subscribers and user_likes tables
-- Ensure RLS is enabled (idempotent)
DO $$
BEGIN
    -- Enable RLS on subscribers if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'subscribers' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Enable RLS on user_likes if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE tablename = 'user_likes' 
        AND rowsecurity = true
    ) THEN
        ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Policies for subscribers (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subscribers' 
        AND policyname = 'Anyone can subscribe'
    ) THEN
        CREATE POLICY "Anyone can subscribe" ON subscribers
            FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'subscribers' 
        AND policyname = 'Anyone can view subscribers'
    ) THEN
        CREATE POLICY "Anyone can view subscribers" ON subscribers
            FOR SELECT USING (true);
    END IF;
END $$;

-- Policies for user_likes (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_likes' 
        AND policyname = 'Allow all operations on user_likes'
    ) THEN
        CREATE POLICY "Allow all operations on user_likes" ON user_likes
            FOR ALL USING (true);
    END IF;
END $$;

-- Also ensure stats table has RLS policies if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'stats') THEN
        -- Enable RLS if not already enabled
        IF NOT EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE tablename = 'stats' 
            AND rowsecurity = true
        ) THEN
            ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
        END IF;
        -- Add policy if not exists
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'stats' 
            AND policyname = 'Anyone can view stats'
        ) THEN
            CREATE POLICY "Anyone can view stats" ON stats
                FOR SELECT USING (true);
        END IF;
    END IF;
END $$;