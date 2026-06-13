-- Revoke execute on internal trigger functions from anon and authenticated.
-- These are only meant to be called by Postgres triggers, not via the Data API.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Tighten user_roles insert path: only the admin permissive policy remains.
-- Drop the restrictive "Cannot self-assign roles" policy (redundant + brittle).
DROP POLICY IF EXISTS "Cannot self-assign roles" ON public.user_roles;