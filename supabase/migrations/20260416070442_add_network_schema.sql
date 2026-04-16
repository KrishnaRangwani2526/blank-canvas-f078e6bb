-- Network and Interconnectivity Schema Update

-- 1. Connections Table
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(requester_id, recipient_id)
);

ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own connections" 
ON public.connections FOR SELECT 
USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert connection requests" 
ON public.connections FOR INSERT 
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their own connections" 
ON public.connections FOR UPDATE 
USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can delete their own connections" 
ON public.connections FOR DELETE 
USING (auth.uid() = requester_id OR auth.uid() = recipient_id);

-- 2. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages" 
ON public.messages FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" 
ON public.messages FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update received messages (mark as read)" 
ON public.messages FOR UPDATE 
USING (auth.uid() = recipient_id OR auth.uid() = sender_id);

-- 3. Project Comments Table
CREATE TABLE IF NOT EXISTS public.project_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.project_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view project comments" 
ON public.project_comments FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert comments" 
ON public.project_comments FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" 
ON public.project_comments FOR DELETE 
USING (auth.uid() = user_id);

-- Update RLS policies to allow authenticated users to view profiles of candidates
-- (If not already present)
CREATE POLICY "Authenticated users can view any profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON public.connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_comments_updated_at BEFORE UPDATE ON public.project_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
