-- Create search events table to track all search activities
CREATE TABLE IF NOT EXISTS search_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    filters JSONB DEFAULT '{}',
    results_count INTEGER DEFAULT 0,
    clicked_result BOOLEAN DEFAULT FALSE,
    session_duration INTEGER DEFAULT 0, -- in seconds
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create search interactions table to track user interactions with search results
CREATE TABLE IF NOT EXISTS search_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    search_event_id UUID NOT NULL REFERENCES search_events(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('click', 'dismiss', 'save', 'export')),
    target_id TEXT, -- ID of the clicked result (message_id, session_id, etc.)
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dismissed recommendations table to track user preferences
CREATE TABLE IF NOT EXISTS dismissed_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL,
    recommendation_id TEXT NOT NULL,
    dismissed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create search patterns table to cache analyzed patterns
CREATE TABLE IF NOT EXISTS search_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pattern_type TEXT NOT NULL, -- 'query', 'category', 'time', 'filter'
    pattern_value TEXT NOT NULL,
    frequency INTEGER DEFAULT 1,
    confidence DECIMAL(3,2) DEFAULT 0.0,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user search preferences table
CREATE TABLE IF NOT EXISTS user_search_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    preference_key TEXT NOT NULL,
    preference_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, preference_key)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_search_events_user_timestamp ON search_events(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_search_events_query ON search_events USING gin(to_tsvector('english', query));
CREATE INDEX IF NOT EXISTS idx_search_interactions_user_type ON search_interactions(user_id, interaction_type);
CREATE INDEX IF NOT EXISTS idx_search_patterns_user_type ON search_patterns(user_id, pattern_type);
CREATE INDEX IF NOT EXISTS idx_dismissed_recommendations_user ON dismissed_recommendations(user_id, recommendation_type);

-- Create function to update search patterns automatically
CREATE OR REPLACE FUNCTION update_search_patterns()
RETURNS TRIGGER AS $$
BEGIN
    -- Update query patterns
    INSERT INTO search_patterns (user_id, pattern_type, pattern_value, frequency, confidence, last_seen, updated_at)
    VALUES (NEW.user_id, 'query', NEW.query, 1, 0.5, NEW.timestamp, NOW())
    ON CONFLICT (user_id, pattern_type, pattern_value) 
    DO UPDATE SET 
        frequency = search_patterns.frequency + 1,
        confidence = LEAST(search_patterns.confidence + 0.1, 1.0),
        last_seen = NEW.timestamp,
        updated_at = NOW();

    -- Extract and update category patterns
    DECLARE
        category TEXT;
        categories TEXT[] := ARRAY['invoice', 'expense', 'client', 'report', 'task', 'meeting', 'project'];
    BEGIN
        FOREACH category IN ARRAY categories
        LOOP
            IF LOWER(NEW.query) LIKE '%' || category || '%' THEN
                INSERT INTO search_patterns (user_id, pattern_type, pattern_value, frequency, confidence, last_seen, updated_at)
                VALUES (NEW.user_id, 'category', category, 1, 0.6, NEW.timestamp, NOW())
                ON CONFLICT (user_id, pattern_type, pattern_value)
                DO UPDATE SET 
                    frequency = search_patterns.frequency + 1,
                    confidence = LEAST(search_patterns.confidence + 0.1, 1.0),
                    last_seen = NEW.timestamp,
                    updated_at = NOW();
            END IF;
        END LOOP;
    END;

    -- Update time patterns
    INSERT INTO search_patterns (user_id, pattern_type, pattern_value, frequency, confidence, last_seen, updated_at)
    VALUES (NEW.user_id, 'time', EXTRACT(HOUR FROM NEW.timestamp)::TEXT, 1, 0.3, NEW.timestamp, NOW())
    ON CONFLICT (user_id, pattern_type, pattern_value)
    DO UPDATE SET 
        frequency = search_patterns.frequency + 1,
        confidence = LEAST(search_patterns.confidence + 0.05, 1.0),
        last_seen = NEW.timestamp,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update patterns
DROP TRIGGER IF EXISTS trigger_update_search_patterns ON search_events;
CREATE TRIGGER trigger_update_search_patterns
    AFTER INSERT ON search_events
    FOR EACH ROW
    EXECUTE FUNCTION update_search_patterns();

-- Create function to get user search insights
CREATE OR REPLACE FUNCTION get_user_search_insights(target_user_id UUID)
RETURNS TABLE (
    insight_type TEXT,
    insight_title TEXT,
    insight_description TEXT,
    insight_value NUMERIC,
    confidence NUMERIC
) AS $$
BEGIN
    -- Return search frequency insights
    RETURN QUERY
    SELECT 
        'frequency'::TEXT,
        'Search Activity'::TEXT,
        'Average searches per day over the last 30 days'::TEXT,
        (COUNT(*)::NUMERIC / 30),
        0.9::NUMERIC
    FROM search_events 
    WHERE user_id = target_user_id 
    AND timestamp >= NOW() - INTERVAL '30 days';

    -- Return success rate insights
    RETURN QUERY
    SELECT 
        'success_rate'::TEXT,
        'Search Success Rate'::TEXT,
        'Percentage of searches that led to clicked results'::TEXT,
        (COUNT(*) FILTER (WHERE clicked_result = true)::NUMERIC / NULLIF(COUNT(*), 0) * 100),
        0.8::NUMERIC
    FROM search_events 
    WHERE user_id = target_user_id 
    AND timestamp >= NOW() - INTERVAL '30 days';

    -- Return top category insights
    RETURN QUERY
    SELECT 
        'top_category'::TEXT,
        'Most Searched Category'::TEXT,
        'Your most frequently searched topic: ' || pattern_value,
        frequency::NUMERIC,
        confidence
    FROM search_patterns 
    WHERE user_id = target_user_id 
    AND pattern_type = 'category'
    ORDER BY frequency DESC, confidence DESC
    LIMIT 1;

    -- Return peak time insights
    RETURN QUERY
    SELECT 
        'peak_time'::TEXT,
        'Peak Search Time'::TEXT,
        'Hour of day when you search most: ' || pattern_value || ':00',
        frequency::NUMERIC,
        confidence
    FROM search_patterns 
    WHERE user_id = target_user_id 
    AND pattern_type = 'time'
    ORDER BY frequency DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean old search data
CREATE OR REPLACE FUNCTION cleanup_old_search_data()
RETURNS void AS $$
BEGIN
    -- Delete search events older than 1 year
    DELETE FROM search_events 
    WHERE timestamp < NOW() - INTERVAL '1 year';

    -- Delete search interactions older than 1 year
    DELETE FROM search_interactions 
    WHERE timestamp < NOW() - INTERVAL '1 year';

    -- Delete dismissed recommendations older than 6 months
    DELETE FROM dismissed_recommendations 
    WHERE dismissed_at < NOW() - INTERVAL '6 months';

    -- Clean up unused search patterns (not seen in 3 months)
    DELETE FROM search_patterns 
    WHERE last_seen < NOW() - INTERVAL '3 months'
    AND frequency < 3;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
ALTER TABLE search_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE dismissed_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_search_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own search events" ON search_events
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own search interactions" ON search_interactions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own dismissed recommendations" ON dismissed_recommendations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own search patterns" ON search_patterns
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own search preferences" ON user_search_preferences
    FOR ALL USING (auth.uid() = user_id);
