-- Add last_minute and starts_at columns to activities
ALTER TABLE public.activities
  ADD COLUMN last_minute boolean NOT NULL DEFAULT false,
  ADD COLUMN starts_at timestamptz;

-- Update seed data with a mix of last_minute and starts_at
UPDATE public.activities SET last_minute = true, starts_at = now() + interval '45 minutes' WHERE id IN (1, 5, 9, 13);
UPDATE public.activities SET last_minute = true, starts_at = now() + interval '2 hours' WHERE id IN (3, 7);
UPDATE public.activities SET starts_at = now() + interval '4 hours' WHERE id IN (2, 6, 10);
UPDATE public.activities SET starts_at = now() + interval '1 day' WHERE id IN (4, 8, 11, 14);
UPDATE public.activities SET starts_at = now() + interval '3 days' WHERE id IN (12, 15, 16);