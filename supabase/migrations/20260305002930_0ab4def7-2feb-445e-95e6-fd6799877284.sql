ALTER TABLE app_settings
  ADD COLUMN qr_dot_type text NOT NULL DEFAULT 'square',
  ADD COLUMN qr_dot_color text NOT NULL DEFAULT '#000000',
  ADD COLUMN qr_corner_square_type text NOT NULL DEFAULT 'square',
  ADD COLUMN qr_corner_square_color text NOT NULL DEFAULT '#000000',
  ADD COLUMN qr_corner_dot_type text NOT NULL DEFAULT 'square',
  ADD COLUMN qr_corner_dot_color text NOT NULL DEFAULT '#000000',
  ADD COLUMN qr_background_color text NOT NULL DEFAULT '#FFFFFF',
  ADD COLUMN qr_image_url text DEFAULT NULL,
  ADD COLUMN qr_image_size numeric NOT NULL DEFAULT 0.4,
  ADD COLUMN qr_image_margin integer NOT NULL DEFAULT 5;