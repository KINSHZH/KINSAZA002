/*
# Add Flooring and Windows services

## Overview
Adds two new services to the services table: Flooring and Windows.

## Changes
- Inserts "Flooring" service with slug "flooring" at sort_order 14
- Inserts "Windows" service with slug "windows" at sort_order 15
*/

INSERT INTO services (name, slug, description, sort_order)
VALUES
  ('Flooring', 'flooring', 'Flooring repair and installation including tile, laminate, vinyl, and hardwood repair.', 14),
  ('Windows', 'windows', 'Window repair and replacement including glass replacement, frame repair, and weatherproofing.', 15)
ON CONFLICT (slug) DO NOTHING;
