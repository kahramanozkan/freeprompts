SELECT * FROM stats;
SELECT COUNT(*) as total_prompts FROM prompts;
SELECT COUNT(*) as total_lists FROM lists;
SELECT COALESCE(SUM(views), 0) as total_views FROM prompts;
SELECT COALESCE(SUM(likes), 0) as total_likes FROM prompts;