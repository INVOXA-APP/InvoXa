-- Create content table for CMS
CREATE TABLE IF NOT EXISTS content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'text' CHECK (type IN ('text', 'image', 'html')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_content_key ON content(key);
CREATE INDEX IF NOT EXISTS idx_content_type ON content(type);

-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('content-files', 'content-files', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read content
CREATE POLICY "Allow authenticated users to read content" ON content
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert content
CREATE POLICY "Allow authenticated users to insert content" ON content
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update content
CREATE POLICY "Allow authenticated users to update content" ON content
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete content
CREATE POLICY "Allow authenticated users to delete content" ON content
    FOR DELETE USING (auth.role() = 'authenticated');

-- Storage policies
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'content-files' AND auth.role() = 'authenticated');

CREATE POLICY "Allow public access to files" ON storage.objects
    FOR SELECT USING (bucket_id = 'content-files');

-- Insert some initial content
INSERT INTO content (key, value, type) VALUES
    ('hero.title', 'Invoice Management', 'text'),
    ('hero.subtitle', 'Transform your billing process with AI-powered insights, multi-currency support, and blockchain security. Built for modern businesses that demand excellence.', 'text'),
    ('hero.cta_primary', 'Start Free Trial', 'text'),
    ('hero.cta_secondary', 'Watch Demo', 'text'),
    ('features.title', 'Everything you need to manage invoices', 'text'),
    ('features.subtitle', 'Powerful features designed to streamline your billing process and grow your business.', 'text'),
    ('company.name', 'InvoXa', 'text'),
    ('company.tagline', 'The future of invoice management', 'text')
ON CONFLICT (key) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_content_updated_at 
    BEFORE UPDATE ON content 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
