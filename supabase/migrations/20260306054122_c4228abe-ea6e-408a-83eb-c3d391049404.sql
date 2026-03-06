
-- Create audit_log table
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  entity_name text,
  details jsonb,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can view all audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Authenticated users can insert audit logs
CREATE POLICY "Authenticated users can insert audit logs"
  ON public.audit_log FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add created_by to qr_codes
ALTER TABLE public.qr_codes ADD COLUMN created_by uuid;
