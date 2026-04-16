
-- Add missing columns to skills
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS category TEXT;

-- Add missing columns to learning_goals
ALTER TABLE public.learning_goals ADD COLUMN IF NOT EXISTS proof TEXT;
ALTER TABLE public.learning_goals ADD COLUMN IF NOT EXISTS target_date TEXT;
ALTER TABLE public.learning_goals ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;

-- Create timeline_tasks table (replaces localStorage)
CREATE TABLE public.timeline_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.timeline_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own timeline tasks" ON public.timeline_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own timeline tasks" ON public.timeline_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own timeline tasks" ON public.timeline_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own timeline tasks" ON public.timeline_tasks FOR DELETE USING (auth.uid() = user_id);
