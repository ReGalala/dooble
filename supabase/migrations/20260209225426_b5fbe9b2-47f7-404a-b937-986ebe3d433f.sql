-- Fix activities RLS: recreate as permissive
DROP POLICY IF EXISTS "Anyone can read activities" ON public.activities;
CREATE POLICY "Anyone can read activities"
ON public.activities
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Companies can insert activities" ON public.activities;
CREATE POLICY "Companies can insert activities"
ON public.activities
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'company'
    AND profiles.email = activities.company_email
));

DROP POLICY IF EXISTS "Companies can update own activities" ON public.activities;
CREATE POLICY "Companies can update own activities"
ON public.activities
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'company'
    AND profiles.email = activities.company_email
));

-- Fix tickets RLS: recreate as permissive
DROP POLICY IF EXISTS "Users can insert own tickets" ON public.tickets;
CREATE POLICY "Users can insert own tickets"
ON public.tickets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own tickets" ON public.tickets;
CREATE POLICY "Users can read own tickets"
ON public.tickets
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);