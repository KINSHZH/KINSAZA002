import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS, BUSINESS } from '@/lib/constants';
import { useSiteSettings } from '@/hooks/useSiteSettings';

function SoundCloudIcon({ size = 22, color = '#ffff00' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 24" fill="none" aria-hidden="true">
      {/* Sound wave bars */}
      <rect x="2" y="10" width="2" height="8" rx="1" fill={color} />
      <rect x="6" y="8" width="2" height="12" rx="1" fill={color} />
      <rect x="10" y="6" width="2" height="16" rx="1" fill={color} />
      <rect x="14" y="9" width="2" height="10" rx="1" fill={color} />
      <rect x="18" y="5" width="2" height="18" rx="1" fill={color} />
      <rect x="22" y="7" width="2" height="14" rx="1" fill={color} />
      <rect x="26" y="9" width="2" height="10" rx="1" fill={color} />
      {/* Cloud body */}
      <path
        d="M30 20c-3.3 0-6-2.7-6-6 0-2.6 1.7-4.8 4-5.7C28.7 5.9 31.2 4 34 4c3.9 0 7 3.1 7 7 0 .3 0 .7-.1 1H44c1.7 0 3 1.3 3 3s-1.3 3-3 3H30z"
        fill={color}
      />
      {/* Cloud cutout for wave effect */}
      <rect x="32" y="10" width="2" height="6" rx="1" fill="#000040" />
      <rect x="36" y="8" width="2" height="10" rx="1" fill="#000040" />
      <rect x="40" y="11" width="2" height="6" rx="1" fill="#000040" />
    </svg>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { businessName } = useSiteSettings();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <div className="site-header">
        <div className="site-brand">
          <Link to="/" className="site-emblem-link" aria-label={`${businessName} home`}>
            <img className="site-emblem" src="/knsaza001.jpg" alt="KNSAZA home repair emblem" />
          </Link>
          <div>
            <h1><Link to="/">{businessName}</Link></h1>
            <div className="subtitle">{BUSINESS.subtitle}</div>
          </div>
        </div>
      </div>

      <button
        className="nav-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
        aria-expanded={menuOpen}
      >
        {menuOpen ? '[ Close Menu ]' : '[ Menu ]'}
      </button>

      <nav className="nav-bar desktop" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          item.external ? (
            <a
              key={item.path}
              href={item.path}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.label}
            </a>
          ) : (
            <Link
              key={item.path}
              to={item.path}
              className={isActive(item.path) ? 'active' : ''}
            >
              {item.label}
            </Link>
          )
        ))}
        <a
          href="https://soundcloud.com/kinsaza"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="SoundCloud"
          style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}
        >
          <SoundCloudIcon size={28} color="#ffff00" />
        </a>
      </nav>

      {menuOpen && (
        <nav className="nav-bar mobile open" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => (
            item.external ? (
              <a
                key={item.path}
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                className={isActive(item.path) ? 'active' : ''}
              >
                {item.label}
              </Link>
            )
          ))}
          <a
            href="https://soundcloud.com/kinsaza"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="SoundCloud"
            style={{ display: 'flex', alignItems: 'center', padding: '8px 20px' }}
          >
            <SoundCloudIcon size={28} color="#ffff00" />
          </a>
        </nav>
      )}
    </>
  );
}

export function Footer() {
  const { phone, email } = useSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div style={{ marginBottom: '4px' }}>
        <strong>{BUSINESS.name}</strong>
      </div>
      <div>
        Phone: <a href={BUSINESS.phoneHref}>{phone}</a> |{' '}
        Email: <a href={BUSINESS.emailHref}>{email}</a> |{' '}
        <Link to="/admin/login">Admin Login</Link>
      </div>
      <div style={{ marginTop: '4px', color: '#808080' }}>
        &copy; {year} {BUSINESS.name}. All rights reserved.
      </div>
    </footer>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <h2 className="page-title">{title}</h2>
      {subtitle && <div className="page-subtitle">{subtitle}</div>}
      <hr className="thick" />
    </div>
  );
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="loading-text" style={{ padding: '20px', textAlign: 'center' }}>
      {message}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <div className="empty-box">{message}</div>;
}

export function ErrorState({ message }: { message: string }) {
  return <div className="error-box">{message}</div>;
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-wrap">
      <Header />
      <main className="content-pad">
        {children}
      </main>
      <Footer />
    </div>
  );
}
