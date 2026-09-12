/*
# Recreate service-request-images storage bucket

## Overview
The `service-request-images` storage bucket exists in the database table but is not
recognized by the Supabase Storage API, causing "Bucket not found" (404) errors when
customers try to upload photos with their service requests. This migration uses an
UPDATE to force the Storage API to re-register the bucket, and re-applies all storage
policies.

## Changes
1. Update the existing `service-request-images` bucket to force Storage API registration
2. Re-apply all storage policies for the bucket:
   - anon + authenticated can INSERT (customers upload photos)
   - authenticated can SELECT (admin views photos)
   - authenticated can DELETE (admin removes photos)
*/

UPDATE storage.buckets SET name = 'service-request-images', public = false
WHERE id = 'service-request-images';

-- Re-apply storage policies for service-request-images (private bucket)
DROP POLICY IF EXISTS "anon_insert_service_request_images_bucket" ON storage.objects;
CREATE POLICY "anon_insert_service_request_images_bucket" ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'service-request-images');

DROP POLICY IF EXISTS "auth_read_service_request_images_bucket" ON storage.objects;
CREATE POLICY "auth_read_service_request_images_bucket" ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'service-request-images');

DROP POLICY IF EXISTS "auth_delete_service_request_images_bucket" ON storage.objects;
CREATE POLICY "auth_delete_service_request_images_bucket" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'service-request-images');
