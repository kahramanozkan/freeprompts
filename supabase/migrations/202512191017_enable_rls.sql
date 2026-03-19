-- Enable Row Level Security on tables where it's currently disabled
-- (based on Supabase Linter errors)

ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;

-- Note: Policies already exist from initial_schema.sql, but they may need to be recreated.
-- If policies are missing, you can run the following:
-- CREATE POLICY "Anyone can view prompts" ON prompts FOR SELECT USING (true);
-- CREATE POLICY "Authenticated users can create prompts" ON prompts FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own prompts" ON prompts FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "Users can delete own prompts" ON prompts FOR DELETE USING (auth.uid() = user_id);

-- For subscribers:
-- CREATE POLICY "Anyone can subscribe" ON subscribers FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Anyone can view subscribers" ON subscribers FOR SELECT USING (true);

-- For user_likes:
-- CREATE POLICY "Allow all operations on user_likes" ON user_likes FOR ALL USING (true);