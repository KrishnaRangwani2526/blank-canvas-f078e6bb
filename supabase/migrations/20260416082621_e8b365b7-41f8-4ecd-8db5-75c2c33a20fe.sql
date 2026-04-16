
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS metadata JSONB;
ALTER TABLE public.employees ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ;
