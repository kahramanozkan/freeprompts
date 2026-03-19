-- Test increment_stats_metric function
SELECT * FROM stats WHERE metric = 'total_likes';
-- Increment by 1
SELECT increment_stats_metric('total_likes', 1);
-- Check again
SELECT * FROM stats WHERE metric = 'total_likes';