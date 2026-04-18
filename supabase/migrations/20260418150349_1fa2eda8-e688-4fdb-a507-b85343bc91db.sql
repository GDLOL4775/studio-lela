-- 1. APPOINTMENTS: restrict SELECT to admins, expose safe slot view to public
DROP POLICY IF EXISTS "Anyone can view appointment slots" ON public.appointments;

CREATE POLICY "Admins can view appointments"
  ON public.appointments FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Public-safe view: only scheduling columns, no PII
CREATE OR REPLACE VIEW public.public_appointment_slots
WITH (security_invoker = on) AS
SELECT id, starts_at, duration_minutes, status
FROM public.appointments
WHERE status <> 'cancelado';

GRANT SELECT ON public.public_appointment_slots TO anon, authenticated;

-- 2. SCHEDULE_BLOCKS: hide "reason" from public; expose time-only view
DROP POLICY IF EXISTS "Anyone can view blocks" ON public.schedule_blocks;

CREATE POLICY "Admins can view blocks"
  ON public.schedule_blocks FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE VIEW public.public_schedule_blocks
WITH (security_invoker = on) AS
SELECT id, starts_at, ends_at
FROM public.schedule_blocks;

GRANT SELECT ON public.public_schedule_blocks TO anon, authenticated;

-- 3. USER_ROLES: replace blanket ALL policy with explicit per-command policies
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
  ON public.user_roles FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Defense-in-depth: a restrictive policy that explicitly forbids anyone
-- from inserting a role row for themselves, even if another permissive
-- policy would otherwise allow it. Admins assigning roles to OTHER users
-- still works because user_id <> auth.uid().
CREATE POLICY "Cannot self-assign roles"
  ON public.user_roles AS RESTRICTIVE
  FOR INSERT
  WITH CHECK (user_id <> auth.uid());