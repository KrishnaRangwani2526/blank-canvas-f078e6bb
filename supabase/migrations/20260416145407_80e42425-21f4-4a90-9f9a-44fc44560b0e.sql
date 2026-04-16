-- Education: make publicly readable
DROP POLICY IF EXISTS "Users can view own education" ON public.education;
CREATE POLICY "Education is publicly viewable" ON public.education FOR SELECT USING (true);

-- Projects: make publicly readable
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
CREATE POLICY "Projects are publicly viewable" ON public.projects FOR SELECT USING (true);

-- Certificates: make publicly readable
DROP POLICY IF EXISTS "Users can view own certificates" ON public.certificates;
CREATE POLICY "Certificates are publicly viewable" ON public.certificates FOR SELECT USING (true);