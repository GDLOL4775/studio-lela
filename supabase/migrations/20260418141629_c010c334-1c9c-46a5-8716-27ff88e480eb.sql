
-- Replace overly-permissive WITH CHECK (TRUE) with basic shape validation.
DROP POLICY IF EXISTS "Anyone can create a client" ON public.clients;
CREATE POLICY "Anyone can create a client"
  ON public.clients FOR INSERT
  WITH CHECK (
    length(trim(name)) BETWEEN 2 AND 120
    AND length(trim(phone)) BETWEEN 8 AND 30
  );

DROP POLICY IF EXISTS "Anyone can create an appointment" ON public.appointments;
CREATE POLICY "Anyone can create an appointment"
  ON public.appointments FOR INSERT
  WITH CHECK (
    length(trim(client_name)) BETWEEN 2 AND 120
    AND length(trim(client_phone)) BETWEEN 8 AND 30
    AND length(trim(service_name)) BETWEEN 1 AND 200
    AND starts_at > now() - interval '1 day'
    AND status = 'pendente'
  );
