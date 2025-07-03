-- Create the 'invoices' table
CREATE TABLE IF NOT EXISTS public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    client_name text NOT NULL,
    amount numeric(10, 2) NOT NULL,
    due_date date NOT NULL,
    status text DEFAULT 'Pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    invoice_id text NOT NULL UNIQUE, -- Unique invoice identifier
    CONSTRAINT invoices_pkey PRIMARY KEY (id),
    CONSTRAINT invoices_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invoices." ON public.invoices FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices." ON public.invoices FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices." ON public.invoices FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices." ON public.invoices FOR DELETE USING (auth.uid() = user_id);

-- Create the 'expenses' table
CREATE TABLE IF NOT EXISTS public.expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    amount numeric(10, 2) NOT NULL,
    category text NOT NULL,
    description text,
    date date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT expenses_pkey PRIMARY KEY (id),
    CONSTRAINT expenses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own expenses." ON public.expenses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses." ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses." ON public.expenses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses." ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- Create the 'clients' table
CREATE TABLE IF NOT EXISTS public.clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    address text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT clients_pkey PRIMARY KEY (id),
    CONSTRAINT clients_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own clients." ON public.clients FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients." ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients." ON public.clients FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients." ON public.clients FOR DELETE USING (auth.uid() = user_id);

-- Create the 'users' table (for custom user profiles/roles beyond auth.users)
-- This table is for application-specific user data, linked to auth.users
CREATE TABLE IF NOT EXISTS public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL, -- Link to auth.users.id
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    role text DEFAULT 'employee'::text NOT NULL, -- e.g., 'admin', 'employee', 'client'
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Admin can view all users
CREATE POLICY "Admins can view all users." ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admins can insert users
CREATE POLICY "Admins can insert users." ON public.users FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admins can update users
CREATE POLICY "Admins can update users." ON public.users FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin')
);

-- Admins can delete users
CREATE POLICY "Admins can delete users." ON public.users FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND role = 'admin')
);

-- Self-service: Users can view their own profile
CREATE POLICY "Users can view their own profile." ON public.users FOR SELECT USING (auth.uid() = user_id);

-- Self-service: Users can update their own profile (e.g., name, but not role)
CREATE POLICY "Users can update their own profile." ON public.users FOR UPDATE USING (auth.uid() = user_id);

-- Create a function to update the updated_at column for all tables
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
DROP TRIGGER IF EXISTS set_invoices_updated_at ON public.invoices;
CREATE TRIGGER set_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_expenses_updated_at ON public.expenses;
CREATE TRIGGER set_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_clients_updated_at ON public.clients;
CREATE TRIGGER set_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
