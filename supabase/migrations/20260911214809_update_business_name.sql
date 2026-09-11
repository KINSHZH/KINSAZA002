/*
# Update business display name in site settings

## Overview
Updates the default business display name to match the new branding
("Home Repair & Field Services" instead of "HOME REPAIR // FIELD SERVICES").

## Changes
- Updates the existing site_settings row's business_name field
*/

UPDATE site_settings
SET business_name = 'Home Repair & Field Services'
WHERE business_name = 'HOME REPAIR // FIELD SERVICES';
