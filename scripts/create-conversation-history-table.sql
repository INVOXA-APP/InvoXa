-- Create conversation sessions table
CREATE TABLE IF NOT EXISTS conversation_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    summary TEXT,
    auto_summary TEXT,
    summary_generated_at TIMESTAMP WITH TIME ZONE,
    context JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    message_count INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation messages table
CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES conversation_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_user_id ON conversation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_updated_at ON conversation_sessions(updated_at);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_session_id ON conversation_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_user_id ON conversation_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_created_at ON conversation_messages(created_at);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_title_search ON conversation_sessions USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_summary_search ON conversation_sessions USING gin(to_tsvector('english', COALESCE(summary, '')));
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_auto_summary_search ON conversation_sessions USING gin(to_tsvector('english', COALESCE(auto_summary, '')));
CREATE INDEX IF NOT EXISTS idx_conversation_messages_content_search ON conversation_messages USING gin(to_tsvector('english', content));

-- Create composite search index for better performance
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_full_search ON conversation_sessions 
USING gin(to_tsvector('english', title || ' ' || COALESCE(summary, '') || ' ' || COALESCE(auto_summary, '')));

-- Enable Row Level Security
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own conversation sessions" ON conversation_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversation sessions" ON conversation_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversation sessions" ON conversation_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversation sessions" ON conversation_sessions
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own conversation messages" ON conversation_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversation messages" ON conversation_messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversation messages" ON conversation_messages
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversation messages" ON conversation_messages
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_conversation_sessions_updated_at 
    BEFORE UPDATE ON conversation_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function for advanced conversation search
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
    session_created_at TIMESTAMP WITH TIME ZONE,
    session_updated_at TIMESTAMP WITH TIME ZONE,
    session_message_count INTEGER,
    message_id UUID,
    message_content TEXT,
    message_role TEXT,
    message_created_at TIMESTAMP WITH TIME ZONE,
    search_rank REAL,
    match_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH session_matches AS (
        SELECT 
            cs.id,
            cs.title,
            cs.summary,
            cs.auto_summary,
            cs.created_at,
            cs.updated_at,
            cs.message_count,
            NULL::UUID as msg_id,
            NULL::TEXT as msg_content,
            NULL::TEXT as msg_role,
            NULL::TIMESTAMP WITH TIME ZONE as msg_created_at,
            ts_rank(
                to_tsvector('english', cs.title || ' ' || COALESCE(cs.summary, '') || ' ' || COALESCE(cs.auto_summary, '')),
                plainto_tsquery('english', p_query)
            ) as rank,
            'session' as match_type
        FROM conversation_sessions cs
        WHERE cs.user_id = p_user_id
        AND to_tsvector('english', cs.title || ' ' || COALESCE(cs.summary, '') || ' ' || COALESCE(cs.auto_summary, ''))
            @@ plainto_tsquery('english', p_query)
    ),
    message_matches AS (
        SELECT 
            cm.session_id,
            cs.title,
            cs.summary,
            cs.auto_summary,
            cs.created_at,
            cs.updated_at,
            cs.message_count,
            cm.id as msg_id,
            cm.content as msg_content,
            cm.role as msg_role,
            cm.created_at as msg_created_at,
            ts_rank(
                to_tsvector('english', cm.content),
                plainto_tsquery('english', p_query)
            ) as rank,
            'message' as match_type
        FROM conversation_messages cm
        JOIN conversation_sessions cs ON cm.session_id = cs.id
        WHERE cm.user_id = p_user_id
        AND to_tsvector('english', cm.content) @@ plainto_tsquery('english', p_query)
    )
    SELECT * FROM (
        SELECT * FROM session_matches
        UNION ALL
        SELECT * FROM message_matches
    ) combined_results
    ORDER BY search_rank DESC, session_updated_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
