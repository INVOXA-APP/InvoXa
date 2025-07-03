-- Create team search collaboration tables
CREATE TABLE IF NOT EXISTS team_search_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    organization_id UUID,
    pattern_name VARCHAR(255) NOT NULL,
    search_query TEXT NOT NULL,
    description TEXT,
    category VARCHAR(100),
    tags TEXT[],
    success_rate DECIMAL(5,2) DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS team_search_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    organization_id UUID,
    template_name VARCHAR(255) NOT NULL,
    template_query TEXT NOT NULL,
    description TEXT,
    category VARCHAR(100),
    variables JSONB DEFAULT '{}',
    usage_instructions TEXT,
    success_metrics JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    approval_status VARCHAR(50) DEFAULT 'pending',
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_search_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    organization_id UUID,
    insight_type VARCHAR(100) NOT NULL,
    insight_title VARCHAR(255) NOT NULL,
    insight_description TEXT,
    related_queries TEXT[],
    success_data JSONB DEFAULT '{}',
    verification_count INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_search_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    organization_id UUID,
    pattern_id UUID REFERENCES team_search_patterns(id),
    template_id UUID REFERENCES team_search_templates(id),
    search_query TEXT NOT NULL,
    success_rating INTEGER CHECK (success_rating >= 1 AND success_rating <= 5),
    time_saved_minutes INTEGER,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_search_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    pattern_id UUID REFERENCES team_search_patterns(id),
    template_id UUID REFERENCES team_search_templates(id),
    insight_id UUID REFERENCES team_search_insights(id),
    vote_type VARCHAR(20) CHECK (vote_type IN ('upvote', 'downvote', 'helpful', 'not_helpful')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, pattern_id, vote_type),
    UNIQUE(user_id, template_id, vote_type),
    UNIQUE(user_id, insight_id, vote_type)
);

CREATE TABLE IF NOT EXISTS team_search_collaboration_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    organization_id UUID,
    patterns_shared INTEGER DEFAULT 0,
    templates_created INTEGER DEFAULT 0,
    insights_contributed INTEGER DEFAULT 0,
    total_usage_by_others INTEGER DEFAULT 0,
    collaboration_score DECIMAL(10,2) DEFAULT 0,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, organization_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_search_patterns_org ON team_search_patterns(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_search_patterns_user ON team_search_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_team_search_patterns_public ON team_search_patterns(is_public, is_approved);
CREATE INDEX IF NOT EXISTS idx_team_search_patterns_category ON team_search_patterns(category);
CREATE INDEX IF NOT EXISTS idx_team_search_patterns_success ON team_search_patterns(success_rate DESC);

CREATE INDEX IF NOT EXISTS idx_team_search_templates_org ON team_search_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_search_templates_user ON team_search_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_team_search_templates_public ON team_search_templates(is_public, is_approved);
CREATE INDEX IF NOT EXISTS idx_team_search_templates_category ON team_search_templates(category);

CREATE INDEX IF NOT EXISTS idx_team_search_usage_user ON team_search_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_team_search_usage_pattern ON team_search_usage(pattern_id);
CREATE INDEX IF NOT EXISTS idx_team_search_usage_template ON team_search_usage(template_id);
CREATE INDEX IF NOT EXISTS idx_team_search_usage_created ON team_search_usage(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_team_search_votes_user ON team_search_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_team_search_votes_pattern ON team_search_votes(pattern_id);
CREATE INDEX IF NOT EXISTS idx_team_search_votes_template ON team_search_votes(template_id);

CREATE INDEX IF NOT EXISTS idx_team_search_stats_org ON team_search_collaboration_stats(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_search_stats_score ON team_search_collaboration_stats(collaboration_score DESC);

-- Create functions for updating collaboration stats
CREATE OR REPLACE FUNCTION update_collaboration_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update stats when patterns are shared
    IF TG_TABLE_NAME = 'team_search_patterns' THEN
        INSERT INTO team_search_collaboration_stats (user_id, organization_id, patterns_shared)
        VALUES (NEW.user_id, NEW.organization_id, 1)
        ON CONFLICT (user_id, organization_id)
        DO UPDATE SET 
            patterns_shared = team_search_collaboration_stats.patterns_shared + 1,
            updated_at = NOW();
    END IF;
    
    -- Update stats when templates are created
    IF TG_TABLE_NAME = 'team_search_templates' THEN
        INSERT INTO team_search_collaboration_stats (user_id, organization_id, templates_created)
        VALUES (NEW.user_id, NEW.organization_id, 1)
        ON CONFLICT (user_id, organization_id)
        DO UPDATE SET 
            templates_created = team_search_collaboration_stats.templates_created + 1,
            updated_at = NOW();
    END IF;
    
    -- Update stats when insights are contributed
    IF TG_TABLE_NAME = 'team_search_insights' THEN
        INSERT INTO team_search_collaboration_stats (user_id, organization_id, insights_contributed)
        VALUES (NEW.user_id, NEW.organization_id, 1)
        ON CONFLICT (user_id, organization_id)
        DO UPDATE SET 
            insights_contributed = team_search_collaboration_stats.insights_contributed + 1,
            updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_pattern_stats
    AFTER INSERT ON team_search_patterns
    FOR EACH ROW EXECUTE FUNCTION update_collaboration_stats();

CREATE TRIGGER trigger_update_template_stats
    AFTER INSERT ON team_search_templates
    FOR EACH ROW EXECUTE FUNCTION update_collaboration_stats();

CREATE TRIGGER trigger_update_insight_stats
    AFTER INSERT ON team_search_insights
    FOR EACH ROW EXECUTE FUNCTION update_collaboration_stats();
