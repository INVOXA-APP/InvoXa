-- Test data for search templates functionality
-- This script creates sample conversations and messages for testing

-- Insert sample conversation sessions
INSERT INTO conversation_sessions (id, user_id, title, summary, auto_summary, created_at, updated_at, message_count, summary_generated_at) VALUES
('session-1', 'user-123', 'Invoice Discussion with ABC Corp', 'Discussed overdue invoice #INV-001 for $5,000. Client requested payment extension until end of month. Agreed to 2-week extension with 2% late fee.', NULL, '2024-01-15 10:00:00', '2024-01-15 11:30:00', 8, '2024-01-15 11:30:00'),
('session-2', 'user-123', 'Q3 Financial Review Meeting', NULL, 'Reviewed Q3 performance metrics. Revenue up 15% compared to Q2. Discussed budget allocation for Q4 marketing campaigns and new hire approvals.', '2024-01-20 14:00:00', '2024-01-20 15:45:00', 12, '2024-01-20 15:45:00'),
('session-3', 'user-123', 'Client Onboarding - XYZ Solutions', 'Completed onboarding process for new client XYZ Solutions. Set up billing preferences, project scope, and communication protocols.', NULL, '2024-01-25 09:00:00', '2024-01-25 10:15:00', 6, '2024-01-25 10:15:00'),
('session-4', 'user-123', 'Software Integration Issues', NULL, 'Troubleshooting API integration problems with payment gateway. Need to update webhook endpoints and test transaction processing.', '2024-01-28 16:00:00', '2024-01-28 17:30:00', 10, '2024-01-28 17:30:00'),
('session-5', 'user-123', 'Travel Expense Report', 'Processed travel expenses for conference attendance. Total expenses: $2,847 including flights, hotel, and meals. All receipts verified and approved.', NULL, '2024-02-01 13:00:00', '2024-02-01 13:45:00', 5, '2024-02-01 13:45:00');

-- Insert sample conversation messages
INSERT INTO conversation_messages (id, session_id, user_id, role, content, metadata, created_at) VALUES
-- Session 1: Invoice Discussion
('msg-1-1', 'session-1', 'user-123', 'user', 'I need help with the overdue invoice from ABC Corp. They haven''t paid INV-001 for $5,000 yet.', '{}', '2024-01-15 10:00:00'),
('msg-1-2', 'session-1', 'user-123', 'assistant', 'I can help you with that overdue invoice. Let me check the details for INV-001. When was the original due date, and have you sent any follow-up communications?', '{"hasContext": true}', '2024-01-15 10:02:00'),
('msg-1-3', 'session-1', 'user-123', 'user', 'The due date was January 1st, so it''s 2 weeks overdue. I sent one reminder email last week but no response.', '{}', '2024-01-15 10:05:00'),
('msg-1-4', 'session-1', 'user-123', 'assistant', 'For a 2-week overdue invoice, I recommend calling the client directly. You should also prepare a formal notice with late fees. Would you like me to help draft a professional follow-up email or calculate the late fees?', '{"hasContext": true}', '2024-01-15 10:07:00'),
('msg-1-5', 'session-1', 'user-123', 'user', 'Yes, please help calculate late fees. Our standard rate is 2% per month.', '{}', '2024-01-15 10:10:00'),
('msg-1-6', 'session-1', 'user-123', 'assistant', 'Based on your 2% monthly late fee rate, for the $5,000 invoice that''s 2 weeks overdue, the late fee would be approximately $50 (2% of $5,000 for half a month). The total amount due would be $5,050.', '{"hasContext": true}', '2024-01-15 10:12:00'),
('msg-1-7', 'session-1', 'user-123', 'user', 'Perfect. The client just called and requested a 2-week extension. Should I agree?', '{}', '2024-01-15 11:20:00'),
('msg-1-8', 'session-1', 'user-123', 'assistant', 'A 2-week extension can be reasonable for a good client. I recommend agreeing but with conditions: confirm the new payment date in writing, apply the current late fee, and specify that additional fees will accrue if this deadline is also missed.', '{"hasContext": true}', '2024-01-15 11:25:00'),

-- Session 2: Q3 Financial Review
('msg-2-1', 'session-2', 'user-123', 'user', 'Let''s review our Q3 financial performance. I have the revenue numbers ready.', '{}', '2024-01-20 14:00:00'),
('msg-2-2', 'session-2', 'user-123', 'assistant', 'Great! I''d be happy to help analyze your Q3 financial performance. Please share the revenue numbers and any other key metrics you''d like to review.', '{"hasContext": true}', '2024-01-20 14:02:00'),
('msg-2-3', 'session-2', 'user-123', 'user', 'Q3 revenue was $485,000 compared to Q2''s $420,000. That''s a 15.5% increase.', '{}', '2024-01-20 14:05:00'),
('msg-2-4', 'session-2', 'user-123', 'assistant', 'Excellent growth! A 15.5% quarter-over-quarter increase is very strong. What were the main drivers of this growth? New clients, increased project sizes, or expanded services?', '{"hasContext": true}', '2024-01-20 14:07:00'),
('msg-2-5', 'session-2', 'user-123', 'user', 'Mainly new clients - we added 8 new accounts in Q3. Now I need to plan Q4 budget allocation.', '{}', '2024-01-20 14:15:00'),
('msg-2-6', 'session-2', 'user-123', 'assistant', 'With 8 new clients driving growth, you should consider increasing your client success and support capacity for Q4. For budget allocation, I recommend focusing on: 1) Marketing to maintain client acquisition momentum, 2) Operations scaling to handle increased workload, 3) Technology investments to improve efficiency.', '{"hasContext": true}', '2024-01-20 14:18:00'),

-- Session 3: Client Onboarding
('msg-3-1', 'session-3', 'user-123', 'user', 'I need to onboard a new client - XYZ Solutions. They''re a mid-size tech company.', '{}', '2024-01-25 09:00:00'),
('msg-3-2', 'session-3', 'user-123', 'assistant', 'I''ll help you with the XYZ Solutions onboarding. Let''s make sure we cover all the essentials: contract details, billing setup, project scope, communication preferences, and key contacts. What type of services will you be providing them?', '{"hasContext": true}', '2024-01-25 09:03:00'),
('msg-3-3', 'session-3', 'user-123', 'user', 'We''ll be handling their monthly financial reporting and tax preparation. They want net-30 payment terms.', '{}', '2024-01-25 09:08:00'),
('msg-3-4', 'session-3', 'user-123', 'assistant', 'Perfect. For financial reporting and tax prep clients, I recommend setting up: 1) Monthly reporting schedule (typically by the 15th), 2) Secure document sharing system, 3) Quarterly check-ins for tax planning, 4) Clear communication about document deadlines. Net-30 terms are standard for this type of work.', '{"hasContext": true}', '2024-01-25 09:12:00'),
('msg-3-5', 'session-3', 'user-123', 'user', 'Great points. They also requested weekly status updates during their busy season (Q4).', '{}', '2024-01-25 09:45:00'),
('msg-3-6', 'session-3', 'user-123', 'assistant', 'Weekly updates during Q4 make sense for tax prep clients. I suggest creating a standard template for these updates including: work completed, upcoming deadlines, documents needed from them, and any issues requiring attention. This keeps communication efficient and professional.', '{"hasContext": true}', '2024-01-25 10:10:00'),

-- Session 4: Software Integration
('msg-4-1', 'session-4', 'user-123', 'user', 'We''re having issues with our payment gateway API integration. Transactions are failing.', '{}', '2024-01-28 16:00:00'),
('msg-4-2', 'session-4', 'user-123', 'assistant', 'API integration issues can be frustrating. Let''s troubleshoot systematically. Are you getting specific error codes? And is this affecting all transactions or just certain types?', '{"hasContext": true}', '2024-01-28 16:03:00'),
('msg-4-3', 'session-4', 'user-123', 'user', 'We''re getting 401 unauthorized errors, but only on webhook callbacks. Direct API calls work fine.', '{}', '2024-01-28 16:08:00'),
('msg-4-4', 'session-4', 'user-123', 'assistant', 'A 401 error on webhooks specifically suggests an authentication issue with your webhook endpoint. Check if your webhook URL is using HTTPS and verify that you''re properly validating the webhook signature. The payment gateway likely requires signature verification for security.', '{"hasContext": true}', '2024-01-28 16:12:00'),
('msg-4-5', 'session-4', 'user-123', 'user', 'You''re right! Our webhook endpoint was still using HTTP. I need to update it to HTTPS and implement signature validation.', '{}', '2024-01-28 16:45:00'),
('msg-4-6', 'session-4', 'user-123', 'assistant', 'Exactly! Here''s what you need to do: 1) Update webhook URL to HTTPS in your payment gateway dashboard, 2) Implement signature validation using the secret key they provided, 3) Test with their sandbox environment first. Most gateways provide code examples for signature validation.', '{"hasContext": true}', '2024-01-28 16:48:00'),
('msg-4-7', 'session-4', 'user-123', 'user', 'Perfect. I''ll also need to update our error handling to better log these webhook issues.', '{}', '2024-01-28 17:15:00'),
('msg-4-8', 'session-4', 'user-123', 'assistant', 'Good thinking! For webhook error handling, log the full request headers, payload, and your validation results. This will help debug future issues quickly. Also consider implementing retry logic for failed webhooks.', '{"hasContext": true}', '2024-01-28 17:18:00'),

-- Session 5: Travel Expenses
('msg-5-1', 'session-5', 'user-123', 'user', 'I need to process my travel expense report from the conference last week.', '{}', '2024-02-01 13:00:00'),
('msg-5-2', 'session-5', 'user-123', 'assistant', 'I''ll help you process your conference travel expenses. What expenses do you need to categorize and what''s the total amount?', '{"hasContext": true}', '2024-02-01 13:02:00'),
('msg-5-3', 'session-5', 'user-123', 'user', 'Flight was $1,200, hotel for 3 nights was $900, meals totaled $347, and ground transportation was $400.', '{}', '2024-02-01 13:05:00'),
('msg-5-4', 'session-5', 'user-123', 'assistant', 'Let me calculate that: Flight $1,200 + Hotel $900 + Meals $347 + Transportation $400 = $2,847 total. Make sure you have receipts for all expenses over $25. The flight and hotel definitely need receipts, and any individual meals over $25.', '{"hasContext": true}', '2024-02-01 13:08:00'),
('msg-5-5', 'session-5', 'user-123', 'user', 'Yes, I have all receipts. This was for the Tech Innovation Conference - should be fully deductible as business expense.', '{}', '2024-02-01 13:40:00');

-- Insert some search template test data
INSERT INTO search_templates (id, user_id, name, description, query, category, filters, tags, is_public, usage_count, created_at, updated_at) VALUES
('template-1', 'user-123', 'Overdue Invoice Search', 'Find conversations about overdue invoices and payment issues', 'overdue invoice payment', 'invoices', '{"messageRole": "all", "hasActionItems": true}', '["invoices", "payments", "overdue"]', true, 15, '2024-01-10 10:00:00', '2024-01-30 15:30:00'),
('template-2', 'user-123', 'Client Onboarding Process', 'Search for client onboarding discussions and setup procedures', 'client onboarding setup', 'clients', '{"messageRole": "all", "minMessageCount": 5}', '["clients", "onboarding", "setup"]', true, 8, '2024-01-12 14:00:00', '2024-01-28 11:20:00'),
('template-3', 'user-123', 'Financial Review Meetings', 'Find quarterly and monthly financial review discussions', 'financial review quarterly monthly', 'reports', '{"hasSummary": true}', '["financial", "review", "quarterly", "reports"]', false, 12, '2024-01-15 09:00:00', '2024-01-29 16:45:00'),
('template-4', 'user-123', 'Technical Issues & Solutions', 'Search for software problems, API issues, and technical troubleshooting', 'API integration software issue problem', 'general', '{"messageRole": "all"}', '["technical", "API", "software", "troubleshooting"]', true, 6, '2024-01-18 11:30:00', '2024-01-30 10:15:00'),
('template-5', 'user-123', 'Expense Reports & Travel', 'Find expense-related conversations including travel and reimbursements', 'expense travel receipt reimbursement', 'expenses', '{"messageRole": "all"}', '["expenses", "travel", "receipts"]', false, 4, '2024-01-20 13:15:00', '2024-02-01 14:00:00');

-- Update template usage counts based on hypothetical usage
UPDATE search_templates SET 
  usage_count = usage_count + FLOOR(RANDOM() * 10 + 1),
  last_used_at = NOW() - (RANDOM() * INTERVAL '30 days')
WHERE user_id = 'user-123';

-- Create some saved searches for testing
INSERT INTO saved_searches (id, user_id, name, description, query, filters, created_at, last_used_at, usage_count) VALUES
('saved-1', 'user-123', 'My Overdue Invoices', 'Quick search for overdue payment discussions', 'overdue invoice', '{"messageRole": "all", "hasActionItems": true}', '2024-01-25 10:00:00', '2024-01-30 14:30:00', 5),
('saved-2', 'user-123', 'Q4 Planning Sessions', 'Find all Q4 planning and budget discussions', 'Q4 budget planning', '{"hasSummary": true, "minMessageCount": 8}', '2024-01-28 15:00:00', '2024-02-01 09:15:00', 3);

-- Add some indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_conversation_messages_content_search ON conversation_messages USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_title_search ON conversation_sessions USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_conversation_sessions_summary_search ON conversation_sessions USING gin(to_tsvector('english', coalesce(summary, '') || ' ' || coalesce(auto_summary, '')));

-- Create a function for full-text search ranking
CREATE OR REPLACE FUNCTION calculate_search_rank(query_text text, content_text text)
RETURNS float AS $$
BEGIN
  IF query_text IS NULL OR content_text IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Simple ranking based on text similarity and position
  RETURN ts_rank(to_tsvector('english', content_text), plainto_tsquery('english', query_text));
END;
$$ LANGUAGE plpgsql;

COMMIT;
