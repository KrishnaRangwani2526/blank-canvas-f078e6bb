
-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  bio TEXT,
  about TEXT,
  location TEXT,
  github_url TEXT,
  leetcode_url TEXT,
  kaggle_url TEXT,
  portfolio_url TEXT,
  open_to_work BOOLEAN DEFAULT false,
  seeking_type TEXT,
  work_mode TEXT,
  currently_learning TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Companies table
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  description TEXT,
  website TEXT,
  logo_url TEXT,
  location TEXT,
  industry TEXT,
  size TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Companies are viewable by everyone" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Users can insert their own company" ON public.companies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own company" ON public.companies FOR UPDATE USING (auth.uid() = user_id);

-- Skills table
CREATE TABLE public.skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  level TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skills are viewable by everyone" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Users can insert their own skills" ON public.skills FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own skills" ON public.skills FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own skills" ON public.skills FOR DELETE USING (auth.uid() = user_id);

-- Experience table
CREATE TABLE public.experience (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company TEXT NOT NULL,
  role TEXT,
  description TEXT,
  location TEXT,
  start_date TEXT,
  end_date TEXT,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Experience is viewable by everyone" ON public.experience FOR SELECT USING (true);
CREATE POLICY "Users can insert their own experience" ON public.experience FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own experience" ON public.experience FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own experience" ON public.experience FOR DELETE USING (auth.uid() = user_id);

-- Education table
CREATE TABLE public.education (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  school TEXT NOT NULL,
  degree TEXT,
  field_of_study TEXT,
  start_date TEXT,
  end_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Education is viewable by everyone" ON public.education FOR SELECT USING (true);
CREATE POLICY "Users can insert their own education" ON public.education FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own education" ON public.education FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own education" ON public.education FOR DELETE USING (auth.uid() = user_id);

-- Certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  issuer TEXT,
  issue_date TEXT,
  credential_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Certificates are viewable by everyone" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Users can insert their own certificates" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own certificates" ON public.certificates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own certificates" ON public.certificates FOR DELETE USING (auth.uid() = user_id);

-- Projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tech_stack TEXT[],
  url TEXT,
  github_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Projects are viewable by everyone" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Users can insert their own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Jobs table
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  type TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  status TEXT DEFAULT 'open',
  required_skills TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Jobs are viewable by everyone" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Company owners can insert jobs" ON public.jobs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Company owners can update jobs" ON public.jobs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);
CREATE POLICY "Company owners can delete jobs" ON public.jobs FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid())
);

-- Applications table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending',
  resume_url TEXT,
  cover_letter TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Applicants can view their own applications" ON public.applications FOR SELECT USING (auth.uid() = candidate_id);
CREATE POLICY "Company owners can view applications for their jobs" ON public.applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.jobs j JOIN public.companies c ON j.company_id = c.id WHERE j.id = job_id AND c.user_id = auth.uid())
);
CREATE POLICY "Candidates can insert applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = candidate_id);
CREATE POLICY "Company owners can update application status" ON public.applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.jobs j JOIN public.companies c ON j.company_id = c.id WHERE j.id = job_id AND c.user_id = auth.uid())
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  read BOOLEAN DEFAULT false,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'role' = 'candidate' OR NEW.raw_user_meta_data->>'role' IS NULL THEN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
