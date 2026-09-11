export interface Service {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  project_number: string | null;
  service_category: string | null;
  description: string | null;
  project_date: string | null;
  featured: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectImage {
  id: string;
  project_id: string;
  image_path: string;
  caption: string | null;
  alt_text: string | null;
  sort_order: number;
  image_type: string;
  is_primary: boolean;
  created_at: string;
}

export type ServiceRequestStatus =
  | 'new'
  | 'contacted'
  | 'estimate'
  | 'scheduled'
  | 'completed'
  | 'cancelled';

export interface ServiceRequest {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  service_needed: string;
  description: string | null;
  preferred_contact: string;
  preferred_date: string | null;
  notes: string | null;
  status: ServiceRequestStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequestImage {
  id: string;
  service_request_id: string;
  image_path: string;
  created_at: string;
}

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'cancelled'
  | 'expired'
  | 'refunded';

export interface Payment {
  id: string;
  service_request_id: string | null;
  customer_name: string;
  customer_email: string;
  description: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
  paid_at: string | null;
}

export interface SiteSettings {
  id: string;
  business_name: string;
  phone: string;
  email: string;
  homepage_intro: string;
  contact_message: string | null;
  updated_at: string;
}

export const SERVICE_LIST = [
  'Mortar Repair',
  'Tuckpointing',
  'Brick & Masonry Repair',
  'Painting',
  'Drywall Repair',
  'Drywall Installation',
  'Glass Block Window Repair',
  'Glass Block Installation',
  'Light Plumbing',
  'Light Electrical',
  'Gutter Cleaning',
  'General Handyman Services',
  'Light Maintenance',
  'Flooring',
  'Windows',
] as const;

export const SERVICE_REQUEST_STATUSES: ServiceRequestStatus[] = [
  'new',
  'contacted',
  'estimate',
  'scheduled',
  'completed',
  'cancelled',
];

export const PAYMENT_STATUSES: PaymentStatus[] = [
  'pending',
  'paid',
  'cancelled',
  'expired',
  'refunded',
];
