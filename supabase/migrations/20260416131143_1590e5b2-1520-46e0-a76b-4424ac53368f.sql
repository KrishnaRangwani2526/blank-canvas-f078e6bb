
-- Create applications table
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  candidate_id UUID REFERENCES public.candidates(id),
  status TEXT NOT NULL DEFAULT 'applied',
  rank INTEGER,
  ats_score NUMERIC,
  resume_url TEXT,
  cover_letter TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, user_id)
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Candidates can view their own applications
CREATE POLICY "Users can view own applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = user_id);

-- Company owners can view applications for their jobs
CREATE POLICY "Company owners can view job applications"
  ON public.applications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.jobs j
    JOIN public.companies c ON c.id = j.company_id
    WHERE j.id = applications.job_id AND c.user_id = auth.uid()
  ));

-- Users can insert their own applications
CREATE POLICY "Users can insert own applications"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Company owners can update applications (status, rank, ats_score)
CREATE POLICY "Company owners can update applications"
  ON public.applications FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.jobs j
    JOIN public.companies c ON c.id = j.company_id
    WHERE j.id = applications.job_id AND c.user_id = auth.uid()
  ));

-- Users can delete their own applications
CREATE POLICY "Users can delete own applications"
  ON public.applications FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
