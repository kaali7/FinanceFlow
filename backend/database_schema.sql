-- Users table (Managed by Supabase Auth usually, but creating a public profile reference if needed)
-- In Supabase, 'auth.users' handles authentication. We might want a public 'profiles' table or just reference auth.users.
-- For this project, we'll assume we can link to auth.users or just store user data if not using full Supabase Auth UI.
-- Let's create a local 'users' table for simplicity if strictly using custom auth, 
-- but best practice with Supabase is to use their Auth.
-- We will assume the use of Supabase Auth, so 'user_id' in other tables will be UUIDs.

-- 1. Income Table
CREATE TABLE IF NOT EXISTS income (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- References auth.users(id)
    amount DECIMAL(10, 2) NOT NULL,
    source TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- References auth.users(id)
    amount DECIMAL(10, 2) NOT NULL,
    category TEXT NOT NULL, -- e.g., 'Food', 'Transport', 'Utilities'
    description TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Budgets Table (Monthly Budget Summaries)
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- References auth.users(id)
    month VARCHAR(7) NOT NULL, -- Format: 'YYYY-MM'
    total_budget DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, month)
);

-- 4. Chat History (Optional but good for context)
CREATE TABLE IF NOT EXISTS chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- References auth.users(id)
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) policies should be enabled in a real production app
-- to ensure users can only see their own data.
-- ALTER TABLE income ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own income" ON income FOR SELECT USING (auth.uid() = user_id);
-- ... and so on.
