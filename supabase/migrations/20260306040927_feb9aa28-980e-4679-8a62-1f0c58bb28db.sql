
-- Update qr_batches SELECT policy to allow anon access
DROP POLICY "Authenticated users can view batches" ON public.qr_batches;
CREATE POLICY "Anyone can view batches" ON public.qr_batches
  FOR SELECT
  USING (true);

-- Update qr_codes SELECT policy to allow anon access
DROP POLICY "Authenticated users can view codes" ON public.qr_codes;
CREATE POLICY "Anyone can view codes" ON public.qr_codes
  FOR SELECT
  USING (true);

-- Update app_settings SELECT policy to allow anon access
DROP POLICY "Authenticated users can view settings" ON public.app_settings;
CREATE POLICY "Anyone can view settings" ON public.app_settings
  FOR SELECT
  USING (true);
