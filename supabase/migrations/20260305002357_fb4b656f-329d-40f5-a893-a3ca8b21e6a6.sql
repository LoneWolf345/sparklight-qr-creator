
-- Create qr_scans table for logging scan events
CREATE TABLE public.qr_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  homes_passed_id text NOT NULL,
  scanned_at timestamptz NOT NULL DEFAULT now(),
  user_agent text,
  ip_address text,
  referer text
);

-- No RLS needed on scans - edge function uses service role
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

-- Admins can view scans
CREATE POLICY "Admins can view scans"
  ON public.qr_scans FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for scans (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.qr_scans;
