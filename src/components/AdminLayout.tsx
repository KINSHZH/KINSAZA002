import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Mail, CreditCard, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const ADMIN_NAV = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Projects', path: '/admin/projects', icon: FolderKanban },
  { label: 'Service Requests', path: '/admin/service-requests', icon: Mail },
  { label: 'Payments', path: '/admin/payments', icon: CreditCard },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!loading && !user) navigate('/admin/login', { replace: true });
  }, [loading, user, navigate]);

  if (loading) return <div className="admin-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loading-text">Loading...</div></div>;
  if (!user) return null;

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="admin-body" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        className="admin-sidebar"
        style={{
          width: '200px', flexShrink: 0,
          position: 'fixed', left: 0, top: 0, bottom: 0,
          display: sidebarOpen ? 'flex' : 'none',
          flexDirection: 'column', zIndex: 40,
        }}
      >
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #000060', color: '#ffff00', fontWeight: 'bold', fontSize: '14px' }}>
          Admin Panel
        </div>
        <nav style={{ flex: 1 }}>
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} className={isActive(item.path) ? 'active' : ''}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Icon size={12} /> {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
        <div style={{ padding: '12px 16px', borderTop: '1px solid #000060' }}>
          <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '6px', wordBreak: 'break-all' }}>{user.email}</div>
          <button
            onClick={async () => { await signOut(); navigate('/admin/login'); }}
            style={{ background: 'none', border: 'none', color: '#ff6666', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', padding: 0 }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 30 }} onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, marginLeft: window.innerWidth > 768 ? 0 : 0 }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', borderBottom: '2px solid #808080' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn-1996"
            style={{ padding: '4px 8px' }}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={14} /> : <Menu size={14} />}
          </button>
          <span style={{ fontFamily: 'Arial', fontSize: '14px', fontWeight: 'bold' }}>Admin</span>
        </header>

        <main style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
          <div className="admin-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
