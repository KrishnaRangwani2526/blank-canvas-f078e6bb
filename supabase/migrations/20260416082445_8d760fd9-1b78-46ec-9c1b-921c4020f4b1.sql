
-- Profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  bio TEXT,
  about TEXT,
  avatar_url TEXT,
  cover_url TEXT,
  headline TEXT,
  location TEXT,
  website TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  phone TEXT,
  email TEXT,
  open_to_work BOOLEAN DEFAULT false,
  seeking_type TEXT,
  work_mode TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE USING (auth.uid() = user_id);

-- Education
CREATE TABLE public.education (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  school TEXT,
  degree TEXT,
  field_of_study TEXT,
  start_date TEXT,
  end_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Education viewable by everyone" ON public.education FOR SELECT USING (true);
CREATE POLICY "Users can insert own education" ON public.education FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own education" ON public.education FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own education" ON public.education FOR DELETE USING (auth.uid() = user_id);

-- Experience
CREATE TABLE public.experience (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company TEXT,
  role TEXT,
  description TEXT,
  location TEXT,
  start_date TEXT,
  end_date TEXT,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Experience viewable by everyone" ON public.experience FOR SELECT USING (true);
CREATE POLICY "Users can insert own experience" ON public.experience FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own experience" ON public.experience FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own experience" ON public.experience FOR DELETE USING (auth.uid() = user_id);

-- Projects
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  description TEXT,
  tech_stack JSONB,
  start_date TEXT,
  end_date TEXT,
  url TEXT,
  github_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects viewable by everyone" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Certificates
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  issuer TEXT,
  issue_date TEXT,
  credential_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Certificates viewable by everyone" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Users can insert own certificates" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own certificates" ON public.certificates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own certificates" ON public.certificates FOR DELETE USING (auth.uid() = user_id);

-- Skills
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  percentage INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skills viewable by everyone" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Users can insert own skills" ON public.skills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own skills" ON public.skills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own skills" ON public.skills FOR DELETE USING (auth.uid() = user_id);

-- Learning Goals
CREATE TABLE public.learning_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal TEXT,
  progress INTEGER DEFAULT 0,
  target_date TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.learning_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own learning goals" ON public.learning_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own learning goals" ON public.learning_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own learning goals" ON public.learning_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own learning goals" ON public.learning_goals FOR DELETE USING (auth.uid() = user_id);

-- Notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT,
  type TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- Companies
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  email TEXT,
  logo_url TEXT,
  website TEXT,
  description TEXT,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Companies viewable by everyone" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Users can insert own company" ON public.companies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own company" ON public.companies FOR UPDATE USING (auth.uid() = user_id);

-- Jobs
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  location TEXT,
  job_type TEXT,
  work_mode TEXT,
  requirements JSONB,
  github_requirement JSONB,
  kaggle_requirement JSONB,
  leetcode_requirement JSONB,
  priority_order JSONB,
  ats_config JSONB,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Jobs viewable by everyone" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Company owners can insert jobs" ON public.jobs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Company owners can update jobs" ON public.jobs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Company owners can delete jobs" ON public.jobs FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);

-- Candidates (denormalized for HR view)
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  bio TEXT,
  about TEXT,
  skills JSONB,
  projects JSONB,
  education JSONB,
  experience JSONB,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Candidates viewable by everyone" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Anyone can insert candidates" ON public.candidates FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update candidates" ON public.candidates FOR UPDATE USING (true);

-- Applications
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending',
  cover_letter TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own applications" ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "HR can view job applications" ON public.applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.jobs j JOIN public.companies c ON j.company_id = c.id WHERE j.id = job_id AND c.user_id = auth.uid())
);
CREATE POLICY "Users can insert own applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own applications" ON public.applications FOR UPDATE USING (auth.uid() = user_id);

-- Employees
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  role TEXT,
  department TEXT,
  status TEXT DEFAULT 'active',
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company owners can view employees" ON public.employees FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Company owners can insert employees" ON public.employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Company owners can update employees" ON public.employees FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);

-- Employee Requests
CREATE TABLE public.employee_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  role TEXT,
  department TEXT,
  status TEXT DEFAULT 'pending',
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.employee_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company owners can view employee requests" ON public.employee_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Anyone can insert employee requests" ON public.employee_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Company owners can update employee requests" ON public.employee_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);

-- HR Members
CREATE TABLE public.hr_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  role TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.hr_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company owners can view HR members" ON public.hr_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Company owners can insert HR members" ON public.hr_members FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);

-- Connections
CREATE TABLE public.connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own connections" ON public.connections FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can insert connections" ON public.connections FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can update own connections" ON public.connections FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can delete own connections" ON public.connections FOR DELETE USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

-- Messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Project Comments
CREATE TABLE public.project_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Project comments viewable by everyone" ON public.project_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON public.project_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.project_comments FOR DELETE USING (auth.uid() = user_id);

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
