-- Rate-limit log (backend-only)
CREATE TABLE IF NOT EXISTS public.booking_rate_limit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS booking_rate_limit_ip_created_at_idx
  ON public.booking_rate_limit (ip, created_at DESC);

GRANT ALL ON public.booking_rate_limit TO service_role;
ALTER TABLE public.booking_rate_limit ENABLE ROW LEVEL SECURITY;
-- No policies for anon/authenticated: only service_role (bypasses RLS) can use it.

-- Remove anonymous insert paths; the edge function uses service_role.
DROP POLICY IF EXISTS "Anyone can create an appointment" ON public.appointments;
DROP POLICY IF EXISTS "Anyone can create a client" ON public.clients;