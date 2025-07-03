-- Create full-text search function for conversations
CREATE OR REPLACE FUNCTION search_conversations(
  p_user_id UUID,
  p_query TEXT,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  session_id UUID,
  session_title TEXT,
  session_summary TEXT,
  session_auto_summary TEXT,
  session_created_at TIMESTAMPTZ,
  session_updated_at TIMESTAMPTZ,
  session_message_count INTEGER,
  message_id UUID,
  message_content TEXT,
  message_role TEXT,
  message_created_at TIMESTAMPTZ,
  search_rank REAL,
  match_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH session_matches AS (
    SELECT 
      cs.id as session_id,
      cs.title as session_title,
      cs.summary as session_summary,
      cs.auto_summary as session_auto_summary,
      cs.created_at as session_created_at,
      cs.updated_at as session_updated_at,
      cs.message_count as session_message_count,
      NULL::UUID as message_id,
      NULL::TEXT as message_content,
      NULL::TEXT as message_role,
      NULL::TIMESTAMPTZ as message_created_at,
      ts_rank(
        setweight(to_tsvector('english', cs.title), 'A') ||
        setweight(to_tsvector('english', COALESCE(cs.summary, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(cs.auto_summary, '')), 'B'),
        plainto_tsquery('english', p_query)
      ) as search_rank,
      'session'::TEXT as match_type
    FROM conversation_sessions cs
    WHERE cs.user_id = p_user_id
      AND cs.is_archived = false
      AND (
        setweight(to_tsvector('english', cs.title), 'A') ||
        setweight(to_tsvector('english', COALESCE(cs.summary, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(cs.auto_summary, '')), 'B')
      ) @@ plainto_tsquery('english', p_query)
  ),
  message_matches AS (
    SELECT 
      cm.session_id,
      cs.title as session_title,
      cs.summary as session_summary,
      cs.auto_summary as session_auto_summary,
      cs.created_at as session_created_at,
      cs.updated_at as session_updated_at,
      cs.message_count as session_message_count,
      cm.id as message_id,
      cm.content as message_content,
      cm.role as message_role,
      cm.created_at as message_created_at,
      ts_rank(
        to_tsvector('english', cm.content),
        plainto_tsquery('english', p_query)
      ) as search_rank,
      'message'::TEXT as match_type
    FROM conversation_messages cm
    JOIN conversation_sessions cs ON cm.session_id = cs.id
    WHERE cm.user_id = p_user_id
      AND cs.is_archived = false
      AND to_tsvector('english', cm.content) @@ plainto_tsquery('english', p_query)
  )
  SELECT * FROM (
    SELECT * FROM session_matches
    UNION ALL
    SELECT * FROM message_matches
  ) combined_results
  ORDER BY search_rank DESC, session_created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_search 
ON conversation_sessions 
USING GIN (
  setweight(to_tsvector('english', title), 'A') ||
  setweight(to_tsvector('english', COALESCE(summary, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(auto_summary, '')), 'B')
);

CREATE INDEX IF NOT EXISTS idx_conversation_messages_search 
ON conversation_messages 
USING GIN (to_tsvector('english', content));

-- Additional indexes for filtering
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_user_archived 
ON conversation_sessions (user_id, is_archived, created_at);

CREATE INDEX IF NOT EXISTS idx_conversation_messages_user_session 
ON conversation_messages (user_id, session_id, created_at);
