/*
# Add Light Maintenance service

## Overview
Adds a "Light Maintenance" service to the services table to cover general
maintenance tasks like door repair, lock replacement, caulking, etc.

## Changes
- Inserts a new service row: "Light Maintenance" with slug "light-maintenance"
- Placed at sort_order 13 (after General Handyman Services at 12)
*/

INSERT INTO services (name, slug, description, sort_order)
VALUES (
  'Light Maintenance',
  'light-maintenance',
  'General light maintenance including door repair, lock replacement, caulking, weatherstripping, and minor adjustments.',
  13
)
ON CONFLICT (slug) DO NOTHING;
