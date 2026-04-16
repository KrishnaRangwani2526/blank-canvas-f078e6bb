
-- 1. Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  bio TEXT,
  about TEXT,
  avatar_url TEXT,
  location TEXT,
  currently_learning TEXT,
  github_url TEXT,
  kaggle_url TEXT,
  leetcode_url TEXT,
  open_to_work BOOLEAN DEFAULT false,
  seeking_type TEXT,
  work_mode TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are publicly viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- 2. Education
CREATE TABLE public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school TEXT NOT NULL,
  degree TEXT,
  field_of_study TEXT,
  start_date TEXT,
  end_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own education" ON public.education FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own education" ON public.education FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own education" ON public.education FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own education" ON public.education FOR DELETE USING (auth.uid() = user_id);

-- 3. Experience
CREATE TABLE public.experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_date TEXT,
  end_date TEXT,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own experience" ON public.experience FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own experience" ON public.experience FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own experience" ON public.experience FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own experience" ON public.experience FOR DELETE USING (auth.uid() = user_id);

-- 4. Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  project_link TEXT,
  tech_stack TEXT,
  start_date TEXT,
  end_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- 5. Certificates
CREATE TABLE public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issuer TEXT,
  issue_date TEXT,
  description TEXT,
  credential_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own certificates" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own certificates" ON public.certificates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own certificates" ON public.certificates FOR DELETE USING (auth.uid() = user_id);

-- 6. Skills
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own skills" ON public.skills FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own skills" ON public.skills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own skills" ON public.skills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own skills" ON public.skills FOR DELETE USING (auth.uid() = user_id);

-- 7. Learning Goals
CREATE TABLE public.learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own learning_goals" ON public.learning_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own learning_goals" ON public.learning_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own learning_goals" ON public.learning_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own learning_goals" ON public.learning_goals FOR DELETE USING (auth.uid() = user_id);

-- 8. Companies
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
CREATE POLICY "Companies are publicly viewable" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Users can insert own company" ON public.companies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own company" ON public.companies FOR UPDATE USING (auth.uid() = user_id);

-- 9. Jobs
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  requirements JSONB,
  job_type TEXT NOT NULL,
  work_mode TEXT NOT NULL,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  ats_config JSONB,
  github_requirement JSONB,
  kaggle_requirement JSONB,
  leetcode_requirement JSONB,
  priority_order JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Jobs are publicly viewable" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Company owners can insert jobs" ON public.jobs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Company owners can update jobs" ON public.jobs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Company owners can delete jobs" ON public.jobs FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);

-- 10. Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);

-- 11. Employees
CREATE TABLE public.employees (
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
CREATE POLICY "Company owners can view employees" ON public.employees FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Company owners can insert employees" ON public.employees FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Company owners can update employees" ON public.employees FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Company owners can delete employees" ON public.employees FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);

-- 12. Employee Requests
CREATE TABLE public.employee_requests (
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
CREATE POLICY "Company owners can view requests" ON public.employee_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Company owners can insert requests" ON public.employee_requests FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Company owners can update requests" ON public.employee_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Company owners can delete requests" ON public.employee_requests FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);

-- 13. HR Members
CREATE TABLE public.hr_members (
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
CREATE POLICY "Company owners can view hr_members" ON public.hr_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Company owners can insert hr_members" ON public.hr_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Company owners can update hr_members" ON public.hr_members FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Company owners can delete hr_members" ON public.hr_members FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);

-- 14. Candidates (sync table for HR view)
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  email TEXT,
  bio TEXT,
  about TEXT,
  avatar_url TEXT,
  github_url TEXT,
  kaggle_url TEXT,
  leetcode_url TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  experience JSONB DEFAULT '[]'::jsonb,
  education JSONB DEFAULT '[]'::jsonb,
  projects JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates are publicly viewable" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Users can upsert own candidate" ON public.candidates FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own candidate" ON public.candidates FOR UPDATE USING (auth.uid() = id);

-- 15. Auto-create profile on candidate signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.raw_user_meta_data ->> 'role' = 'candidate' THEN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''))
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 16. Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employee_requests_updated_at BEFORE UPDATE ON public.employee_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON public.candidates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 17. Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
