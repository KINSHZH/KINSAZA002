import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS, BUSINESS } from '@/lib/constants';
import { useSiteSettings } from '@/hooks/useSiteSettings';

function SoundCloudIcon({ size = 16, color = '#ffff00' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
      <path d="M1.5 13.5c-.3 0-.5.2-.5.5v3c0 .3.2.5.5.5s.5-.2.5-.5v-3c0-.3-.2-.5-.5-.5zm2-1c-.3 0-.5.2-.5.5v4c0 .3.2.5.5.5s.5-.2.5-.5v-4c0-.3-.2-.5-.5-.5zm2-1c-.3 0-.5.2-.5.5v5c0 .3.2.5.5.5s.5-.2.5-.5v-5c0-.3-.2-.5-.5-.5zm2-1c-.3 0-.5.2-.5.5v6c0 .3.2.5.5.5s.5-.2.5-.5v-6c0-.3-.2-.5-.5-.5zm2-1c-.3 0-.5.2-.5.5v7c0 .3.2.5.5.5s.5-.2.5-.5v-7c0-.3-.2-.5-.5-.5zm2.5-1c-.3 0-.5.2-.5.5v8c0 .3.2.5.5.5s.5-.2.5-.5v-8c0-.3-.2-.5-.5-.5zm2.5-1c-.3 0-.5.2-.5.5v9c0 .3.2.5.5.5s.5-.2.5-.5v-9c0-.3-.2-.5-.5-.5zm2.5 0c-.3 0-.5.2-.5.5v9c0 .3.2.5.5.5s.5-.2.5-.5v-9c0-.3-.2-.5-.5-.5zm2.5 0c-.3 0-.5.2-.5.5v9c0 .3.2.5.5.5s.5-.2.5-.5v-9c0-.3-.2-.5-.5-.5zm2.5 0c-.3 0-.5.2-.5.5v9c0 .3.2.5.5.5s.5-.2.5-.5v-9c0-.3-.2-.5-.5-.5zm2.5 0c-.3 0-.5.2-.5.5v9c0 .3.2.5.5.5s.5-.2.5-.5v-9c0-.3-.2-.5-.5-.5zm2.5 0c-.3 0-.5.2-.5.5v9c0 .3.2.5.5.5s.5-.2.5-.5v-9c0-.3-.2-.5-.5-.5zm2.5 0c-.3 0-.5.2-.5.5v9c0 .3.2.5.5.5s.5-.2.5-.5v-9c0-.3-.2-.5-.5-.5z" />
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
          <SoundCloudIcon size={18} color="#ffff00" />
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
            <SoundCloudIcon size={18} color="#ffff00" />
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
