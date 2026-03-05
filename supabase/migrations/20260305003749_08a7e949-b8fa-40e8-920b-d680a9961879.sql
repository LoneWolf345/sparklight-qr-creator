
-- Create storage bucket for QR logos
INSERT INTO storage.buckets (id, name, public) VALUES ('qr-logos', 'qr-logos', true);

-- Allow authenticated users to upload
CREATE POLICY "Admins can upload qr logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'qr-logos' AND public.has_role(auth.uid(), 'admin'));

-- Allow public read
CREATE POLICY "Public can read qr logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'qr-logos');

-- Allow admins to delete
CREATE POLICY "Admins can delete qr logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'qr-logos' AND public.has_role(auth.uid(), 'admin'));

-- Allow admins to update
CREATE POLICY "Admins can update qr logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'qr-logos' AND public.has_role(auth.uid(), 'admin'));
