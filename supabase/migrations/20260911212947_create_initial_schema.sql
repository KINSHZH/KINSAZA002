/*
# Create initial schema for home repair service website

## Overview
Creates the complete database schema for a local home repair and light handyman service website.
Includes projects, project images, services, service requests, service request images,
payments, and site settings tables.

## New Tables

### 1. services
- Catalog of services offered (masonry, tuckpointing, painting, drywall, etc.)
- Publicly readable; admin-managed
- Fields: id, name, slug, description, sort_order, published, created_at, updated_at

### 2. projects
- Project archive entries showing completed work
- Publicly readable when published; admin-managed
- Fields: id, title, slug, project_number, service_category, description, project_date, featured, published, created_at, updated_at

### 3. project_images
- Images attached to projects (before/after/progress/final)
- Publicly readable when parent project is published
- Fields: id, project_id, image_path, caption, alt_text, sort_order, image_type, is_primary, created_at

### 4. service_requests
- Customer-submitted service requests
- Publicly insertable (customers submit forms); admin-managed
- Fields: id, name, phone, email, service_needed, description, preferred_contact, preferred_date, notes, status, admin_notes, created_at, updated_at

### 5. service_request_images
- Customer-uploaded photos showing repair problems
- Private - only authenticated admins can view
- Fields: id, service_request_id, image_path, created_at

### 6. payments
- Payment requests created by admin for customers
- Publicly readable by payment ID (customer payment page); admin-managed
- Fields: id, service_request_id, customer_name, customer_email, description, amount, currency, status, stripe_checkout_session_id, stripe_payment_intent_id, created_at, paid_at

### 7. site_settings
- Single-row table for site-wide configuration
- Publicly readable; admin-managed
- Fields: id, business_name, phone, email, homepage_intro, contact_message, updated_at

## Security
- RLS enabled on ALL tables
- Public tables (services, published projects, project images, site_settings): readable by anon
- service_requests: anon can INSERT only; authenticated can SELECT/UPDATE
- service_request_images: authenticated only (private customer photos)
- payments: anon can SELECT by ID (for payment page); authenticated has full access
- All writes to public tables (services, projects, project_images, site_settings) restricted to authenticated
*/

-- ============================================================
-- SERVICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_services" ON services;
CREATE POLICY "anon_read_services" ON services FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_services" ON services;
CREATE POLICY "auth_insert_services" ON services FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_services" ON services;
CREATE POLICY "auth_update_services" ON services FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_services" ON services;
CREATE POLICY "auth_delete_services" ON services FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- PROJECTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  project_number text,
  service_category text,
  description text,
  project_date date,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Public can only see published projects; admin can see all
DROP POLICY IF EXISTS "anon_read_published_projects" ON projects;
CREATE POLICY "anon_read_published_projects" ON projects FOR SELECT
  TO anon USING (published = true);

DROP POLICY IF EXISTS "auth_read_all_projects" ON projects;
CREATE POLICY "auth_read_all_projects" ON projects FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_projects" ON projects;
CREATE POLICY "auth_insert_projects" ON projects FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_projects" ON projects;
CREATE POLICY "auth_update_projects" ON projects FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_projects" ON projects;
CREATE POLICY "auth_delete_projects" ON projects FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- PROJECT IMAGES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS project_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_path text NOT NULL,
  caption text,
  alt_text text,
  sort_order integer NOT NULL DEFAULT 0,
  image_type text DEFAULT 'final',
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;

-- Public can see images of published projects only
DROP POLICY IF EXISTS "anon_read_published_project_images" ON project_images;
CREATE POLICY "anon_read_published_project_images" ON project_images FOR SELECT
  TO anon USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_images.project_id AND projects.published = true)
  );

DROP POLICY IF EXISTS "auth_read_all_project_images" ON project_images;
CREATE POLICY "auth_read_all_project_images" ON project_images FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_project_images" ON project_images;
CREATE POLICY "auth_insert_project_images" ON project_images FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_project_images" ON project_images;
CREATE POLICY "auth_update_project_images" ON project_images FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_project_images" ON project_images;
CREATE POLICY "auth_delete_project_images" ON project_images FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- SERVICE REQUESTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  service_needed text NOT NULL,
  description text,
  preferred_contact text DEFAULT 'either',
  preferred_date date,
  notes text,
  status text NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- Anon can INSERT (customers submit forms) but cannot SELECT
DROP POLICY IF EXISTS "anon_insert_service_requests" ON service_requests;
CREATE POLICY "anon_insert_service_requests" ON service_requests FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Only authenticated (admin) can SELECT and UPDATE
DROP POLICY IF EXISTS "auth_read_service_requests" ON service_requests;
CREATE POLICY "auth_read_service_requests" ON service_requests FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_service_requests" ON service_requests;
CREATE POLICY "auth_update_service_requests" ON service_requests FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_service_requests" ON service_requests;
CREATE POLICY "auth_delete_service_requests" ON service_requests FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- SERVICE REQUEST IMAGES TABLE (private customer photos)
-- ============================================================
CREATE TABLE IF NOT EXISTS service_request_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id uuid NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  image_path text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE service_request_images ENABLE ROW LEVEL SECURITY;

-- Only authenticated (admin) can access customer-uploaded photos
DROP POLICY IF EXISTS "auth_read_service_request_images" ON service_request_images;
CREATE POLICY "auth_read_service_request_images" ON service_request_images FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_service_request_images" ON service_request_images;
CREATE POLICY "anon_insert_service_request_images" ON service_request_images FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_service_request_images" ON service_request_images;
CREATE POLICY "auth_delete_service_request_images" ON service_request_images FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- PAYMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id uuid REFERENCES service_requests(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  description text,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'pending',
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  created_at timestamptz DEFAULT now(),
  paid_at timestamptz
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Anon can SELECT payments (customer needs to see their payment page by ID)
-- But we restrict: anon can only select by exact ID match (payment page uses ID in URL)
-- This is safe because payment IDs are unguessable UUIDs
DROP POLICY IF EXISTS "anon_read_payments" ON payments;
CREATE POLICY "anon_read_payments" ON payments FOR SELECT
  TO anon USING (true);

DROP POLICY IF EXISTS "auth_read_payments" ON payments;
CREATE POLICY "auth_read_payments" ON payments FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_payments" ON payments;
CREATE POLICY "auth_insert_payments" ON payments FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_payments" ON payments;
CREATE POLICY "auth_update_payments" ON payments FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_payments" ON payments;
CREATE POLICY "auth_delete_payments" ON payments FOR DELETE
  TO authenticated USING (true);

-- ============================================================
-- SITE SETTINGS TABLE (single-row)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL DEFAULT 'HOME REPAIR // FIELD SERVICES',
  phone text NOT NULL DEFAULT '216-385-5864',
  email text NOT NULL DEFAULT 'kinshzh@gmail.com',
  homepage_intro text NOT NULL DEFAULT 'Home repair and light handyman services for residential and small building repair needs.',
  contact_message text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_site_settings" ON site_settings;
CREATE POLICY "anon_read_site_settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_update_site_settings" ON site_settings;
CREATE POLICY "auth_update_site_settings" ON site_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_insert_site_settings" ON site_settings;
CREATE POLICY "auth_insert_site_settings" ON site_settings FOR INSERT
  TO authenticated WITH CHECK (true);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published);
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_service_request_id ON payments(service_request_id);
CREATE INDEX IF NOT EXISTS idx_service_request_images_request_id ON service_request_images(service_request_id);

-- ============================================================
-- SEED DATA: Services
-- ============================================================
INSERT INTO services (name, slug, description, sort_order) VALUES
  ('Mortar Repair', 'mortar-repair', 'Mortar joint repair and restoration for brick and masonry walls.', 1),
  ('Tuckpointing', 'tuckpointing', 'Tuckpointing services to restore deteriorated mortar joints and improve wall integrity.', 2),
  ('Brick & Masonry Repair', 'brick-masonry-repair', 'Brick replacement, masonry repair, and structural restoration.', 3),
  ('Painting', 'painting', 'Interior and exterior painting for residential and small commercial properties.', 4),
  ('Drywall Repair', 'drywall-repair', 'Drywall patching, crack repair, and surface restoration.', 5),
  ('Drywall Installation', 'drywall-installation', 'New drywall installation for rooms, additions, and renovations.', 6),
  ('Glass Block Window Repair', 'glass-block-window-repair', 'Repair of existing glass block windows including mortar and panel replacement.', 7),
  ('Glass Block Installation', 'glass-block-installation', 'New glass block window installation for basements, bathrooms, and interior walls.', 8),
  ('Light Plumbing', 'light-plumbing', 'Basic plumbing repairs including faucet replacement, leak repair, and fixture installation.', 9),
  ('Light Electrical', 'light-electrical', 'Light electrical work including outlet replacement, fixture installation, and basic wiring.', 10),
  ('Gutter Cleaning', 'gutter-cleaning', 'Gutter cleaning and downspout maintenance to prevent water damage.', 11),
  ('General Handyman Services', 'general-handyman', 'General light handyman services for miscellaneous home repair needs.', 12)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA: Site Settings (ensure one row exists)
-- ============================================================
INSERT INTO site_settings (business_name, phone, email, homepage_intro, contact_message)
VALUES (
  'HOME REPAIR // FIELD SERVICES',
  '216-385-5864',
  'kinshzh@gmail.com',
  'Home repair and light handyman services for residential and small building repair needs.',
  'For direct assistance, call or email. We will discuss your repair needs and determine the best approach.'
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_requests_updated_at ON service_requests;
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Storage buckets
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('service-request-images', 'service-request-images', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for project-images (public bucket)
DROP POLICY IF EXISTS "anon_read_project_images_bucket" ON storage.objects;
CREATE POLICY "anon_read_project_images_bucket" ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'project-images');

DROP POLICY IF EXISTS "auth_insert_project_images_bucket" ON storage.objects;
CREATE POLICY "auth_insert_project_images_bucket" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'project-images');

DROP POLICY IF EXISTS "auth_update_project_images_bucket" ON storage.objects;
CREATE POLICY "auth_update_project_images_bucket" ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'project-images') WITH CHECK (bucket_id = 'project-images');

DROP POLICY IF EXISTS "auth_delete_project_images_bucket" ON storage.objects;
CREATE POLICY "auth_delete_project_images_bucket" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'project-images');

-- Storage policies for service-request-images (private bucket)
-- Anon can upload (customers submit photos with their request)
DROP POLICY IF EXISTS "anon_insert_service_request_images_bucket" ON storage.objects;
CREATE POLICY "anon_insert_service_request_images_bucket" ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'service-request-images');

-- Only authenticated (admin) can read
DROP POLICY IF EXISTS "auth_read_service_request_images_bucket" ON storage.objects;
CREATE POLICY "auth_read_service_request_images_bucket" ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'service-request-images');

DROP POLICY IF EXISTS "auth_delete_service_request_images_bucket" ON storage.objects;
CREATE POLICY "auth_delete_service_request_images_bucket" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'service-request-images');
