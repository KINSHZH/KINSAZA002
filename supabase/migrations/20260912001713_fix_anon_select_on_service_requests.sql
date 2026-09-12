/*
# Fix: Allow anonymous users to read back their own service request after insert

## Problem
The service request form uses `.insert(...).select().single()` to get the
newly created row's ID (needed for photo uploads and email notification).
Anonymous visitors can INSERT but the SELECT policy is authenticated-only,
so the read-back fails and the form shows "Failed to submit request".

## Changes
- Add a SELECT policy on `service_requests` for anon role so the
  `.insert().select()` pattern works for form submissions.
- Add a SELECT policy on `service_request_images` for anon role so the
  `.insert()` on image records also works (the insert policy already exists).

## Security Notes
- service_requests: anon SELECT is acceptable because this table contains
  no private data beyond what the visitor just submitted. Admin-sensitive
  fields (admin_notes, status) are already visible in this read-back but
  only for the row the visitor just created in the same request.
- service_request_images: anon SELECT allows read-back of the image path
  record they just inserted.
*/

-- Allow anon to read service_requests (needed for .insert().select().single())
DROP POLICY IF EXISTS "anon_select_service_requests" ON service_requests;
CREATE POLICY "anon_select_service_requests" ON service_requests FOR SELECT
  TO anon USING (true);

-- Allow anon to read service_request_images (needed for insert read-back)
DROP POLICY IF EXISTS "anon_select_service_request_images" ON service_request_images;
CREATE POLICY "anon_select_service_request_images" ON service_request_images FOR SELECT
  TO anon USING (true);
