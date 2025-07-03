-- Add indexes to frequently queried columns for performance
-- This script is designed to be run after init-db.sql

-- Index for invoices table
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices (user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices (due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices (status);

-- Index for expenses table
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON public.expenses (user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses (date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses (category);

-- Index for clients table
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients (user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients (email);
CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients (name);

-- Index for users table (application-specific users)
CREATE INDEX IF NOT EXISTS idx_users_user_id ON public.users (user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);

-- Index for settings table
CREATE INDEX IF NOT EXISTS idx_settings_user_id ON public.settings (user_id);

-- Note: Supabase automatically creates indexes for primary keys.
-- These additional indexes are for common filter/order operations.
