
-- Add missing columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS about TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT,
ADD COLUMN IF NOT EXISTS leetcode_url TEXT,
ADD COLUMN IF NOT EXISTS kaggle_url TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Companies table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    description TEXT,
    industry TEXT,
    logo_url TEXT,
    website TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own company" ON public.companies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own company" ON public.companies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own company" ON public.companies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own company" ON public.companies FOR DELETE USING (auth.uid() = user_id);

-- Jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    requirements JSONB DEFAULT '[]'::jsonb,
    job_type TEXT NOT NULL DEFAULT 'full-time',
    work_mode TEXT NOT NULL DEFAULT 'remote',
    location TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    ats_config JSONB,
    github_requirement JSONB,
    kaggle_requirement JSONB,
    leetcode_requirement JSONB,
    priority_order JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Company owners can create jobs" ON public.jobs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Company owners can update jobs" ON public.jobs FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Company owners can delete jobs" ON public.jobs FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);

-- Applications table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'applied',
    rank INTEGER,
    ats_score NUMERIC,
    resume_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(job_id, user_id)
);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates can view own applications" ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Company owners can view job applications" ON public.applications FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.jobs j JOIN public.companies c ON j.company_id = c.id WHERE j.id = job_id AND c.user_id = auth.uid())
);
CREATE POLICY "Candidates can apply" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Company owners can update applications" ON public.applications FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.jobs j JOIN public.companies c ON j.company_id = c.id WHERE j.id = job_id AND c.user_id = auth.uid())
);

-- Employees table
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    role TEXT,
    department TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    avatar_url TEXT,
    joined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company owners can manage employees" ON public.employees FOR ALL USING (
    EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);

-- Employee Requests table
CREATE TABLE IF NOT EXISTS public.employee_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT,
    department TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.employee_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company owners can manage requests" ON public.employee_requests FOR ALL USING (
    EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);

-- HR Members table
CREATE TABLE IF NOT EXISTS public.hr_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    role TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hr_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company owners can manage HR" ON public.hr_members FOR ALL USING (
    EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view notifications" ON public.notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (true);

-- Education table
CREATE TABLE IF NOT EXISTS public.education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    school TEXT NOT NULL DEFAULT '',
    degree TEXT NOT NULL DEFAULT '',
    field_of_study TEXT DEFAULT '',
    start_date TEXT,
    end_date TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own education" ON public.education FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own education" ON public.education FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own education" ON public.education FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own education" ON public.education FOR DELETE USING (auth.uid() = user_id);

-- Experience table
CREATE TABLE IF NOT EXISTS public.experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    company TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT '',
    start_date TEXT,
    end_date TEXT,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own experience" ON public.experience FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own experience" ON public.experience FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own experience" ON public.experience FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own experience" ON public.experience FOR DELETE USING (auth.uid() = user_id);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    description TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    project_link TEXT,
    github_link TEXT,
    start_date TEXT,
    end_date TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view projects for HR" ON public.projects FOR SELECT USING (true);

-- Certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    issuer TEXT DEFAULT '',
    issue_date TEXT,
    expiry_date TEXT,
    credential_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own certificates" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own certificates" ON public.certificates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own certificates" ON public.certificates FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view certificates for HR" ON public.certificates FOR SELECT USING (true);

-- Skills table
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    category TEXT DEFAULT 'general',
    percentage INTEGER DEFAULT 50,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own skills" ON public.skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own skills" ON public.skills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own skills" ON public.skills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own skills" ON public.skills FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view skills for HR" ON public.skills FOR SELECT USING (true);

-- Learning Goals table
CREATE TABLE IF NOT EXISTS public.learning_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    link TEXT,
    deadline TEXT,
    proof TEXT,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own goals" ON public.learning_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own goals" ON public.learning_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.learning_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.learning_goals FOR DELETE USING (auth.uid() = user_id);

-- Candidates denormalized table for HR search
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE,
    name TEXT DEFAULT '',
    email TEXT,
    bio TEXT,
    about TEXT,
    avatar_url TEXT,
    github_url TEXT,
    kaggle_url TEXT,
    leetcode_url TEXT,
    skills TEXT[] DEFAULT '{}',
    experience JSONB DEFAULT '[]'::jsonb,
    education JSONB DEFAULT '[]'::jsonb,
    projects JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone authenticated can view candidates" ON public.candidates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can upsert own candidate" ON public.candidates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own candidate" ON public.candidates FOR UPDATE USING (auth.uid() = user_id);

-- Allow HR to view all profiles for candidate browsing
CREATE POLICY "Authenticated can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);

-- Update the handle_new_user function to include full_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', 'Achiever'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Timestamps triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON public.candidates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
