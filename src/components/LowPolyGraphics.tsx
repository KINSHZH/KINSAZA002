// Original low-poly/geometric SVG graphics for the retro technical aesthetic.
// These are simple wireframe-style decorations inspired by 1990s engineering aesthetics.

export function BrickWallGraphic({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 60" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      <rect x="0" y="0" width="120" height="60" />
      <line x1="0" y1="12" x2="120" y2="12" />
      <line x1="0" y1="24" x2="120" y2="24" />
      <line x1="0" y1="36" x2="120" y2="36" />
      <line x1="0" y1="48" x2="120" y2="48" />
      <line x1="20" y1="0" x2="20" y2="12" />
      <line x1="60" y1="0" x2="60" y2="12" />
      <line x1="100" y1="0" x2="100" y2="12" />
      <line x1="40" y1="12" x2="40" y2="24" />
      <line x1="80" y1="12" x2="80" y2="24" />
      <line x1="20" y1="24" x2="20" y2="36" />
      <line x1="60" y1="24" x2="60" y2="36" />
      <line x1="100" y1="24" x2="100" y2="36" />
      <line x1="40" y1="36" x2="40" y2="48" />
      <line x1="80" y1="36" x2="80" y2="48" />
      <line x1="20" y1="48" x2="20" y2="60" />
      <line x1="60" y1="48" x2="60" y2="60" />
      <line x1="100" y1="48" x2="100" y2="60" />
    </svg>
  );
}

export function TrowelGraphic({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M40 10 L40 35" />
      <path d="M35 10 L45 10" />
      <path d="M25 35 L55 35 L50 60 L30 60 Z" />
      <path d="M25 35 L55 35" />
      <path d="M30 60 L50 60" />
      <path d="M35 40 L45 55" />
    </svg>
  );
}

export function GlassBlockGraphic({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      <rect x="10" y="10" width="60" height="60" />
      <line x1="10" y1="30" x2="70" y2="30" />
      <line x1="10" y1="50" x2="70" y2="50" />
      <line x1="30" y1="10" x2="30" y2="30" />
      <line x1="50" y1="10" x2="50" y2="30" />
      <line x1="30" y1="30" x2="30" y2="50" />
      <line x1="50" y1="30" x2="50" y2="50" />
      <line x1="30" y1="50" x2="30" y2="70" />
      <line x1="50" y1="50" x2="50" y2="70" />
      <line x1="10" y1="20" x2="20" y2="10" strokeDasharray="2,2" opacity="0.5" />
      <line x1="10" y1="40" x2="30" y2="20" strokeDasharray="2,2" opacity="0.5" />
    </svg>
  );
}

export function WireframeHouse({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 100" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      <path d="M10 50 L60 15 L110 50 L110 95 L10 95 Z" />
      <path d="M40 95 L40 60 L80 60 L80 95" />
      <line x1="40" y1="75" x2="80" y2="75" />
      <line x1="60" y1="60" x2="60" y2="95" />
      <path d="M10 50 L60 15 L110 50" strokeDasharray="3,2" opacity="0.4" />
    </svg>
  );
}

export function PaintRollerGraphic({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="15" y="10" width="50" height="15" rx="2" />
      <line x1="15" y1="17" x2="65" y2="17" strokeDasharray="3,2" />
      <line x1="40" y1="25" x2="40" y2="40" />
      <line x1="35" y1="40" x2="45" y2="40" />
      <line x1="38" y1="40" x2="38" y2="70" />
      <line x1="42" y1="40" x2="42" y2="70" />
      <line x1="38" y1="70" x2="42" y2="70" />
    </svg>
  );
}

export function DrywallPanelGraphic({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      <rect x="10" y="10" width="60" height="60" />
      <line x1="10" y1="30" x2="70" y2="30" strokeDasharray="4,2" />
      <line x1="10" y1="50" x2="70" y2="50" strokeDasharray="4,2" />
      <line x1="30" y1="10" x2="30" y2="70" strokeDasharray="4,2" />
      <line x1="50" y1="10" x2="50" y2="70" strokeDasharray="4,2" />
      <circle cx="20" cy="20" r="1.5" fill="currentColor" />
      <circle cx="60" cy="20" r="1.5" fill="currentColor" />
      <circle cx="20" cy="60" r="1.5" fill="currentColor" />
      <circle cx="60" cy="60" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function PipeGraphic({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="20" y="15" width="40" height="10" rx="2" />
      <line x1="40" y1="25" x2="40" y2="50" />
      <path d="M40 50 Q40 65 25 65 L20 65" />
      <rect x="15" y="60" width="10" height="10" rx="2" />
      <line x1="25" y1="65" x2="40" y2="20" strokeDasharray="2,2" opacity="0.3" />
    </svg>
  );
}

export function ElectricalGraphic({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M45 15 L25 45 L38 45 L30 65 L55 35 L42 35 Z" />
      <circle cx="40" cy="40" r="30" strokeDasharray="3,3" opacity="0.3" />
    </svg>
  );
}

export function GutterGraphic({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M10 20 L70 20 L65 30 L15 30 Z" />
      <line x1="20" y1="30" x2="20" y2="70" />
      <line x1="60" y1="30" x2="60" y2="70" />
      <path d="M15 70 L25 70" />
      <path d="M55 70 L65 70" />
      <line x1="10" y1="25" x2="70" y2="25" strokeDasharray="3,2" opacity="0.4" />
    </svg>
  );
}

export function WireframeCube({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      <path d="M15 25 L40 10 L65 25 L65 55 L40 70 L15 55 Z" />
      <path d="M15 25 L40 40 L65 25" />
      <path d="M40 40 L40 70" />
      <path d="M15 25 L15 55" strokeDasharray="2,2" opacity="0.5" />
      <path d="M65 25 L65 55" strokeDasharray="2,2" opacity="0.5" />
    </svg>
  );
}

export const SERVICE_GRAPHIC_MAP: Record<string, React.FC<{ className?: string }>> = {
  'mortar-repair': BrickWallGraphic,
  'tuckpointing': TrowelGraphic,
  'brick-masonry-repair': BrickWallGraphic,
  'painting': PaintRollerGraphic,
  'drywall-repair': DrywallPanelGraphic,
  'drywall-installation': DrywallPanelGraphic,
  'glass-block-window-repair': GlassBlockGraphic,
  'glass-block-installation': GlassBlockGraphic,
  'light-plumbing': PipeGraphic,
  'light-electrical': ElectricalGraphic,
  'gutter-cleaning': GutterGraphic,
  'general-handyman': WireframeHouse,
};

export function ServiceGraphic({ slug, className = '' }: { slug: string; className?: string }) {
  const Graphic = SERVICE_GRAPHIC_MAP[slug] || WireframeCube;
  return <Graphic className={className} />;
}
