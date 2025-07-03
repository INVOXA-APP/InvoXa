-- Function to get saved searches with usage stats
CREATE OR REPLACE FUNCTION get_saved_searches_with_stats(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  description TEXT,
  query TEXT,
  filters JSONB,
  category VARCHAR,
  is_favorite BOOLEAN,
  usage_count INTEGER,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  days_since_last_use INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ss.id,
    ss.name,
    ss.description,
    ss.query,
    ss.filters,
    ss.category,
    ss.is_favorite,
    ss.usage_count,
    ss.last_used_at,
    ss.created_at,
    ss.updated_at,
    CASE 
      WHEN ss.last_used_at IS NULL THEN NULL
      ELSE EXTRACT(DAY FROM NOW() - ss.last_used_at)::INTEGER
    END as days_since_last_use
  FROM saved_searches ss
  WHERE ss.user_id = p_user_id
  ORDER BY 
    ss.is_favorite DESC,
    ss.usage_count DESC,
    ss.last_used_at DESC NULLS LAST,
    ss.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get search suggestions based on query patterns
CREATE OR REPLACE FUNCTION get_search_suggestions(p_user_id UUID, p_query_fragment TEXT)
RETURNS TABLE (
  suggestion TEXT,
  category VARCHAR,
  usage_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    ss.query as suggestion,
    ss.category,
    ss.usage_count
  FROM saved_searches ss
  WHERE ss.user_id = p_user_id
    AND ss.query ILIKE '%' || p_query_fragment || '%'
    AND LENGTH(p_query_fragment) >= 2
  ORDER BY ss.usage_count DESC, ss.last_used_at DESC NULLS LAST
  LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old unused searches
CREATE OR REPLACE FUNCTION cleanup_unused_searches(p_user_id UUID, p_days_threshold INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM saved_searches
  WHERE user_id = p_user_id
    AND is_favorite = FALSE
    AND usage_count = 0
    AND created_at < NOW() - INTERVAL '1 day' * p_days_threshold;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
