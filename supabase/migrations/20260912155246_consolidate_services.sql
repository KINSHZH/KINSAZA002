/*
# Consolidate duplicate services into single categories

## Overview
Merges duplicate/overlapping service categories per business owner request:
- "Mortar Repair" + "Tuckpointing" -> "Mortar and Tuckpointing"
- "Drywall Repair" + "Drywall Installation" -> "Drywall"
- "Glass Block Window Repair" + "Glass Block Installation" -> "Glass Block"

Also updates site_settings business_name to "KINSAZA".

## Changes
- Updates first service in each pair with new name/slug
- Reassigns any projects/service_requests referencing the removed service
- Deletes the duplicate service rows
- Renumbers sort_order for clean ordering
- Updates site_settings business_name

## Security
- No policy changes
*/

-- 1. Merge Mortar Repair + Tuckpointing -> "Mortar and Tuckpointing"
UPDATE services SET name = 'Mortar and Tuckpointing', slug = 'mortar-and-tuckpointing', sort_order = 1
  WHERE slug = 'mortar-repair';

UPDATE projects SET service_category = 'Mortar and Tuckpointing'
  WHERE service_category IN ('Mortar Repair', 'Tuckpointing');

UPDATE service_requests SET service_needed = 'Mortar and Tuckpointing'
  WHERE service_needed IN ('Mortar Repair', 'Tuckpointing');

DELETE FROM services WHERE slug = 'tuckpointing';

-- 2. Merge Drywall Repair + Drywall Installation -> "Drywall"
UPDATE services SET name = 'Drywall', slug = 'drywall', sort_order = 4
  WHERE slug = 'drywall-repair';

UPDATE projects SET service_category = 'Drywall'
  WHERE service_category IN ('Drywall Repair', 'Drywall Installation');

UPDATE service_requests SET service_needed = 'Drywall'
  WHERE service_needed IN ('Drywall Repair', 'Drywall Installation');

DELETE FROM services WHERE slug = 'drywall-installation';

-- 3. Merge Glass Block Window Repair + Glass Block Installation -> "Glass Block"
UPDATE services SET name = 'Glass Block', slug = 'glass-block', sort_order = 5
  WHERE slug = 'glass-block-window-repair';

UPDATE projects SET service_category = 'Glass Block'
  WHERE service_category IN ('Glass Block Window Repair', 'Glass Block Installation');

UPDATE service_requests SET service_needed = 'Glass Block'
  WHERE service_needed IN ('Glass Block Window Repair', 'Glass Block Installation');

DELETE FROM services WHERE slug = 'glass-block-installation';

-- 4. Clean up sort_order for remaining services
UPDATE services SET sort_order = 2 WHERE slug = 'brick-masonry-repair';
UPDATE services SET sort_order = 3 WHERE slug = 'painting';
UPDATE services SET sort_order = 6 WHERE slug = 'light-plumbing';
UPDATE services SET sort_order = 7 WHERE slug = 'light-electrical';
UPDATE services SET sort_order = 8 WHERE slug = 'gutter-cleaning';
UPDATE services SET sort_order = 9 WHERE slug = 'general-handyman';
UPDATE services SET sort_order = 10 WHERE slug = 'light-maintenance';
UPDATE services SET sort_order = 11 WHERE slug = 'flooring';
UPDATE services SET sort_order = 12 WHERE slug = 'windows';

-- 5. Update business name to KINSAZA
UPDATE site_settings SET business_name = 'KINSAZA';
