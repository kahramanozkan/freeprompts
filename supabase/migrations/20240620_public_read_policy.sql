-- Enable public read access for prompts (and optionally lists)
-- This policy allows anyone using the anon key to SELECT rows.

CREATE POLICY "public read" ON public.prompts
  FOR SELECT USING (true);

-- Optional: enable public read for lists as well
CREATE POLICY "public read" ON public.lists
  FOR SELECT USING (true);
