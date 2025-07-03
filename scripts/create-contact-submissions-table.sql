-- Create the 'contact_submissions' table for CRM tracking
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    tracking_id varchar(50) UNIQUE NOT NULL,
    first_name varchar(100) NOT NULL,
    last_name varchar(100) NOT NULL,
    email varchar(255) NOT NULL,
    company varchar(255) NOT NULL,
    phone varchar(50),
    subject varchar(100) NOT NULL,
    message text NOT NULL,
    status varchar(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
    priority varchar(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to varchar(100),
    follow_up_date timestamp,
    customer_email_sent boolean DEFAULT false,
    customer_email_id varchar(100),
    internal_email_sent boolean DEFAULT false,
    internal_email_id varchar(100),
    notes text,
    tags text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_priority ON public.contact_submissions(priority);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_assigned_to ON public.contact_submissions(assigned_to);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_follow_up_date ON public.contact_submissions(follow_up_date);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON public.contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_company ON public.contact_submissions(company);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_tracking_id ON public.contact_submissions(tracking_id);

-- Enable Row Level Security
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Admin users can view all contact submissions
CREATE POLICY "Admin can view all submissions" ON public.contact_submissions
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Sales users can view assigned submissions
CREATE POLICY "Sales can view assigned submissions" ON public.contact_submissions
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'sales' AND 
    (assigned_to = auth.jwt() ->> 'email' OR assigned_to IS NULL)
  );

-- Support users can view support submissions
CREATE POLICY "Support can view support submissions" ON public.contact_submissions
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'support' AND 
    subject IN ('Technical Support', 'General Question')
  );

-- Admin users can insert contact submissions
CREATE POLICY "Admins can insert contact submissions." ON public.contact_submissions FOR INSERT WITH CHECK (
  auth.jwt() ->> 'role' IN ('admin', 'sales', 'support')
);

-- Admin users can update contact submissions
CREATE POLICY "Admins can update contact submissions." ON public.contact_submissions FOR UPDATE USING (
  auth.jwt() ->> 'role' IN ('admin', 'sales', 'support')
);

-- Admin users can delete contact submissions
CREATE POLICY "Admins can delete contact submissions." ON public.contact_submissions FOR DELETE USING (
  auth.jwt() ->> 'role' = 'admin'
);

-- Assigned users can update their assigned submissions
CREATE POLICY "Users can update assigned submissions." ON public.contact_submissions FOR UPDATE USING (
  assigned_to = auth.jwt() ->> 'email'
);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_contact_submissions_updated_at ON public.contact_submissions;
CREATE TRIGGER set_contact_submissions_updated_at
BEFORE UPDATE ON public.contact_submissions
FOR EACH ROW
EXECUTE FUNCTION update_contact_submissions_updated_at();

-- Create function to auto-assign submissions based on subject
CREATE OR REPLACE FUNCTION auto_assign_contact_submission()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-assign based on subject
    IF NEW.subject ILIKE '%demo%' OR NEW.subject ILIKE '%trial%' THEN
        NEW.assigned_to := (
            SELECT id FROM public.users 
            WHERE role = 'sales' 
            ORDER BY created_at ASC 
            LIMIT 1
        );
        NEW.priority := 'high';
    ELSIF NEW.subject ILIKE '%support%' OR NEW.subject ILIKE '%help%' OR NEW.subject ILIKE '%issue%' THEN
        NEW.assigned_to := (
            SELECT id FROM public.users 
            WHERE role = 'support' 
            ORDER BY created_at ASC 
            LIMIT 1
        );
        NEW.priority := 'medium';
    ELSIF NEW.subject ILIKE '%enterprise%' OR NEW.subject ILIKE '%partnership%' THEN
        NEW.assigned_to := (
            SELECT id FROM public.users 
            WHERE role = 'sales' 
            ORDER BY created_at ASC 
            LIMIT 1
        );
        NEW.priority := 'urgent';
    END IF;

    -- Set follow-up date based on priority
    CASE NEW.priority
        WHEN 'urgent' THEN NEW.follow_up_date := NOW() + INTERVAL '2 hours';
        WHEN 'high' THEN NEW.follow_up_date := NOW() + INTERVAL '4 hours';
        WHEN 'medium' THEN NEW.follow_up_date := NOW() + INTERVAL '1 day';
        ELSE NEW.follow_up_date := NOW() + INTERVAL '2 days';
    END CASE;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-assignment
DROP TRIGGER IF EXISTS trigger_auto_assign_contact_submission ON public.contact_submissions;
CREATE TRIGGER trigger_auto_assign_contact_submission
    BEFORE INSERT ON public.contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION auto_assign_contact_submission();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
