-- Allow anyone to read skills (skill names are not sensitive PII)
DROP POLICY IF EXISTS "Users can view own skills" ON public.skills;

CREATE POLICY "Skills are publicly viewable"
ON public.skills
FOR SELECT
USING (true);