export const BUSINESS = {
  name: 'KINSAZA',
  subtitle: 'Mortar & Tuckpointing * Masonry * Painting * Drywall * Glass Block * Plumbing * Electrical * Gutters * Handyman * Maintenance',
  phone: '216-385-5864',
  phoneHref: 'tel:+12163855864',
  email: 'kinshzh@gmail.com',
  emailHref: 'mailto:kinshzh@gmail.com',
  intro: 'Home repair and light handyman services for residential and small building repair needs.',
};

export const NAV_ITEMS = [
  { label: 'HOME', path: '/' },
  { label: 'SERVICES', path: '/services' },
  { label: 'PROJECTS', path: '/projects' },
  { label: 'REQUEST SERVICE', path: '/request-service' },
  { label: 'CONTACT', path: '/contact' },
];

export function formatCurrency(amount: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount);
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getProjectNumber(project: { project_number: string | null; created_at: string }): string {
  if (project.project_number) return project.project_number;
  const date = new Date(project.created_at);
  const year = date.getFullYear();
  const num = date.getTime().toString().slice(-3);
  return `${year}-${num}`;
}

export const SERVICE_CLIP_ART: Record<string, { img: string; anim: string }> = {
  'mortar-and-tuckpointing': { img: '/clip-tuckpointing.webp', anim: 'jiggle' },
  'brick-masonry-repair': { img: '/clip-brick.webp', anim: 'wobble' },
  'painting': { img: '/clip-painting.webp', anim: 'shake' },
  'drywall': { img: '/clip-drywall.webp', anim: 'jiggle' },
  'glass-block': { img: '/clip-glassblock.webp', anim: 'flash' },
  'light-plumbing': { img: '/clip-plumbing.webp', anim: 'shake' },
  'light-electrical': { img: '/clip-electrical.webp', anim: 'flash' },
  'gutter-cleaning': { img: '/clip-gutter.webp', anim: 'bounce' },
  'general-handyman-services': { img: '/clip-handyman.webp', anim: 'jiggle' },
  'light-maintenance': { img: '/clip-maintenance.webp', anim: 'wobble' },
  'flooring': { img: '/clip-flooring.webp', anim: 'shake' },
  'windows': { img: '/clip-windows.webp', anim: 'flash' },
};

export function getClipArt(slug: string): { img: string; anim: string } {
  return SERVICE_CLIP_ART[slug] || { img: '/clip-handyman.webp', anim: 'jiggle' };
}

export const SERVICE_PHOTOS: Record<string, { url: string; alt: string }> = {
  'mortar-and-tuckpointing': {
    url: 'https://images.pexels.com/photos/10383579/pexels-photo-10383579.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    alt: 'Worker applying cement to a wall',
  },
  'brick-masonry-repair': {
    url: 'https://images.pexels.com/photos/37623625/pexels-photo-37623625.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    alt: 'Construction worker repairing brick wall on scaffolding',
  },
  'painting': {
    url: 'https://images.pexels.com/photos/1669754/pexels-photo-1669754.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    alt: 'Person using a paint roller to apply white paint on a wall',
  },
  'drywall': {
    url: 'https://images.pexels.com/photos/4981812/pexels-photo-4981812.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    alt: 'Construction worker installing drywall',
  },
  'glass-block': {
    url: 'https://images.pexels.com/photos/36035738/pexels-photo-36035738.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    alt: 'Glass block window in a stucco wall',
  },
  'light-plumbing': {
    url: 'https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    alt: 'Plumber installing steel pipes',
  },
  'light-electrical': {
    url: 'https://images.pexels.com/photos/5691589/pexels-photo-5691589.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    alt: 'Electrician installing a switch',
  },
  'gutter-cleaning': {
    url: 'https://images.pexels.com/photos/2513975/pexels-photo-2513975.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    alt: 'House rooftop with gutters under a blue sky',
  },
  'general-handyman-services': {
    url: 'https://images.pexels.com/photos/7640990/pexels-photo-7640990.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    alt: 'Open toolbox with various tools',
  },
  'light-maintenance': {
    url: 'https://images.pexels.com/photos/4567374/pexels-photo-4567374.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    alt: 'House entrance under renovation with tools',
  },
  'flooring': {
    url: 'https://images.pexels.com/photos/4263067/pexels-photo-4263067.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    alt: 'Worker laying wooden laminate flooring',
  },
  'windows': {
    url: 'https://images.pexels.com/photos/5691507/pexels-photo-5691507.jpeg?auto=compress&cs=tinysrgb&h=400&w=600',
    alt: 'Window removed from hinges during repair work',
  },
};

export function getServicePhoto(slug: string): { url: string; alt: string } | null {
  return SERVICE_PHOTOS[slug] || null;
}
