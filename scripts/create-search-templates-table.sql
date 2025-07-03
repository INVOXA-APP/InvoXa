-- Create search templates table
CREATE TABLE IF NOT EXISTS search_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  query TEXT NOT NULL,
  filters JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  icon VARCHAR(50),
  color VARCHAR(20),
  is_system BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_search_templates_category ON search_templates(category);
CREATE INDEX IF NOT EXISTS idx_search_templates_created_by ON search_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_search_templates_usage_count ON search_templates(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_search_templates_tags ON search_templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_search_templates_is_system ON search_templates(is_system);

-- Enable RLS
ALTER TABLE search_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view public and system templates" ON search_templates
  FOR SELECT USING (is_public = true OR is_system = true OR created_by = auth.uid());

CREATE POLICY "Users can view their own templates" ON search_templates
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create their own templates" ON search_templates
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own templates" ON search_templates
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own templates" ON search_templates
  FOR DELETE USING (created_by = auth.uid());

-- Function to increment usage count
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE search_templates 
  SET usage_count = usage_count + 1,
      last_used_at = NOW(),
      updated_at = NOW()
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample system templates
INSERT INTO search_templates (name, description, category, query, filters, tags, icon, color, is_system, is_public) VALUES
-- Invoice Management Templates
('Overdue Invoices', 'Find conversations about overdue or unpaid invoices', 'Invoice Management', 'overdue invoice OR unpaid invoice OR payment reminder', '{"hasActionItems": true}', '{"invoice", "payment", "overdue"}', 'FileText', 'red', true, true),
('Invoice Creation Help', 'Find discussions about creating new invoices', 'Invoice Management', 'create invoice OR new invoice OR invoice template', '{}', '{"invoice", "creation", "help"}', 'FileText', 'blue', true, true),
('Payment Issues', 'Find conversations about payment problems or disputes', 'Invoice Management', 'payment issue OR payment problem OR dispute', '{"hasActionItems": true}', '{"payment", "issue", "dispute"}', 'FileText', 'orange', true, true),
('Invoice Automation', 'Find discussions about automating invoice processes', 'Invoice Management', 'automate invoice OR invoice automation OR recurring invoice', '{}', '{"automation", "recurring", "process"}', 'FileText', 'purple', true, true),

-- Client Management Templates
('Client Onboarding', 'Find conversations about new client setup and onboarding', 'Client Management', 'client onboarding OR new client OR client setup', '{}', '{"client", "onboarding", "setup"}', 'Users', 'green', true, true),
('Client Communication', 'Find important client communication and updates', 'Client Management', 'client meeting OR client call OR client update', '{"messageRole": "all"}', '{"client", "communication", "meeting"}', 'Users', 'blue', true, true),
('Contract Discussions', 'Find conversations about client contracts and agreements', 'Client Management', 'contract OR agreement OR terms', '{"hasActionItems": true}', '{"contract", "agreement", "legal"}', 'Users', 'purple', true, true),
('VIP Client Issues', 'Find urgent issues or requests from important clients', 'Client Management', 'VIP client OR important client OR urgent', '{"hasActionItems": true}', '{"VIP", "urgent", "priority"}', 'Users', 'red', true, true),

-- Expense Management Templates
('Travel Expenses', 'Find conversations about business travel and related expenses', 'Expense Management', 'travel expense OR business trip OR mileage', '{}', '{"travel", "expense", "trip"}', 'CreditCard', 'blue', true, true),
('Office Supplies', 'Find discussions about office supplies and equipment purchases', 'Expense Management', 'office supplies OR equipment OR purchase', '{}', '{"supplies", "equipment", "purchase"}', 'CreditCard', 'green', true, true),
('Expense Reports', 'Find conversations about expense reporting and reimbursements', 'Expense Management', 'expense report OR reimbursement OR receipt', '{}', '{"report", "reimbursement", "receipt"}', 'CreditCard', 'orange', true, true),
('Tax Deductible Expenses', 'Find discussions about tax-deductible business expenses', 'Expense Management', 'tax deductible OR business expense OR write off', '{}', '{"tax", "deductible", "writeoff"}', 'CreditCard', 'purple', true, true),

-- Financial Reports Templates
('Monthly Financial Review', 'Find monthly financial discussions and reviews', 'Financial Reports', 'monthly report OR financial review OR month end', '{"minMessageCount": 3}', '{"monthly", "review", "financial"}', 'BarChart3', 'blue', true, true),
('Quarterly Analysis', 'Find quarterly business analysis and planning discussions', 'Financial Reports', 'quarterly OR Q1 OR Q2 OR Q3 OR Q4', '{"hasSummary": true}', '{"quarterly", "analysis", "planning"}', 'BarChart3', 'purple', true, true),
('Cash Flow Discussions', 'Find conversations about cash flow and liquidity', 'Financial Reports', 'cash flow OR liquidity OR working capital', '{"hasActionItems": true}', '{"cashflow", "liquidity", "capital"}', 'BarChart3', 'green', true, true),
('Profit and Loss Review', 'Find P&L discussions and profitability analysis', 'Financial Reports', 'profit loss OR P&L OR profitability', '{"hasSummary": true}', '{"profit", "loss", "profitability"}', 'BarChart3', 'orange', true, true),

-- Task Management Templates
('Urgent Tasks', 'Find urgent tasks and high-priority items', 'Task Management', 'urgent task OR high priority OR deadline', '{"hasActionItems": true}', '{"urgent", "priority", "deadline"}', 'CheckSquare', 'red', true, true),
('Project Milestones', 'Find discussions about project milestones and deliverables', 'Task Management', 'milestone OR deliverable OR project update', '{}', '{"milestone", "deliverable", "project"}', 'CheckSquare', 'blue', true, true),
('Task Assignments', 'Find conversations about task assignments and responsibilities', 'Task Management', 'assign task OR responsibility OR delegate', '{"hasActionItems": true}', '{"assign", "responsibility", "delegate"}', 'CheckSquare', 'green', true, true),
('Completed Tasks', 'Find discussions about completed tasks and achievements', 'Task Management', 'completed task OR finished OR done', '{}', '{"completed", "finished", "achievement"}', 'CheckSquare', 'purple', true, true),

-- Meeting Templates
('Client Meetings', 'Find client meeting discussions and follow-ups', 'Meetings', 'client meeting OR client call OR client presentation', '{}', '{"client", "meeting", "presentation"}', 'Video', 'blue', true, true),
('Team Meetings', 'Find internal team meeting discussions', 'Meetings', 'team meeting OR staff meeting OR standup', '{}', '{"team", "meeting", "standup"}', 'Video', 'green', true, true),
('Meeting Follow-ups', 'Find meeting follow-up actions and next steps', 'Meetings', 'follow up OR action items OR next steps', '{"hasActionItems": true}', '{"followup", "actions", "nextsteps"}', 'Video', 'orange', true, true),
('Meeting Preparation', 'Find conversations about preparing for upcoming meetings', 'Meetings', 'prepare meeting OR meeting agenda OR upcoming meeting', '{}', '{"prepare", "agenda", "upcoming"}', 'Video', 'purple', true, true),

-- Compliance Templates
('Tax Compliance', 'Find discussions about tax compliance and filing', 'Compliance', 'tax compliance OR tax filing OR IRS', '{"hasActionItems": true}', '{"tax", "compliance", "filing"}', 'Shield', 'red', true, true),
('Regulatory Updates', 'Find conversations about regulatory changes and compliance', 'Compliance', 'regulation OR compliance OR legal requirement', '{}', '{"regulation", "compliance", "legal"}', 'Shield', 'orange', true, true),
('Audit Preparation', 'Find discussions about audit preparation and documentation', 'Compliance', 'audit OR audit preparation OR documentation', '{"hasActionItems": true}', '{"audit", "preparation", "documentation"}', 'Shield', 'yellow', true, true),
('Legal Consultations', 'Find conversations with legal counsel and advice', 'Compliance', 'legal advice OR attorney OR lawyer', '{}', '{"legal", "attorney", "advice"}', 'Shield', 'purple', true, true),

-- Technology Templates
('Software Issues', 'Find discussions about software problems and troubleshooting', 'Technology', 'software issue OR bug OR error OR troubleshoot', '{"hasActionItems": true}', '{"software", "bug", "troubleshoot"}', 'Monitor', 'red', true, true),
('System Integrations', 'Find conversations about system integrations and APIs', 'Technology', 'integration OR API OR connect system', '{}', '{"integration", "API", "system"}', 'Monitor', 'blue', true, true),
('Security Discussions', 'Find conversations about cybersecurity and data protection', 'Technology', 'security OR cybersecurity OR data protection', '{"hasActionItems": true}', '{"security", "cybersecurity", "protection"}', 'Monitor', 'orange', true, true),
('Software Training', 'Find discussions about software training and onboarding', 'Technology', 'software training OR user training OR onboarding', '{}', '{"training", "onboarding", "education"}', 'Monitor', 'green', true, true),

-- Business Development Templates
('Sales Opportunities', 'Find conversations about new sales leads and opportunities', 'Business Development', 'sales opportunity OR lead OR prospect', '{"hasActionItems": true}', '{"sales", "opportunity", "lead"}', 'TrendingUp', 'green', true, true),
('Marketing Campaigns', 'Find discussions about marketing campaigns and strategies', 'Business Development', 'marketing campaign OR advertising OR promotion', '{}', '{"marketing", "campaign", "advertising"}', 'TrendingUp', 'purple', true, true),
('Partnership Discussions', 'Find conversations about business partnerships and collaborations', 'Business Development', 'partnership OR collaboration OR joint venture', '{}', '{"partnership", "collaboration", "venture"}', 'TrendingUp', 'blue', true, true),
('Growth Planning', 'Find strategic discussions about business growth and expansion', 'Business Development', 'growth plan OR expansion OR strategy', '{"hasSummary": true}', '{"growth", "expansion", "strategy"}', 'TrendingUp', 'orange', true, true);

-- Update timestamps
UPDATE search_templates SET updated_at = NOW() WHERE is_system = true;
