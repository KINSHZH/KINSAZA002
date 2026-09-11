import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface DashboardCounts {
  publishedProjects: number; draftProjects: number; newRequests: number;
  pendingPayments: number; paidPayments: number;
}

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState<DashboardCounts>({ publishedProjects: 0, draftProjects: 0, newRequests: 0, pendingPayments: 0, paidPayments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [pub, draft, newReqs, pendPays, paidPays] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('published', true),
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('published', false),
        supabase.from('service_requests').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'paid'),
      ]);
      setCounts({
        publishedProjects: pub.count || 0, draftProjects: draft.count || 0,
        newRequests: newReqs.count || 0, pendingPayments: pendPays.count || 0, paidPayments: paidPays.count || 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="loading-text">Loading dashboard...</div>;

  const cards = [
    { label: 'Published Projects', value: counts.publishedProjects, link: '/admin/projects' },
    { label: 'Draft Projects', value: counts.draftProjects, link: '/admin/projects' },
    { label: 'New Service Requests', value: counts.newRequests, link: '/admin/service-requests' },
    { label: 'Pending Payments', value: counts.pendingPayments, link: '/admin/payments' },
    { label: 'Paid Payments', value: counts.paidPayments, link: '/admin/payments' },
  ];

  return (
    <div>
      <div className="admin-title">Dashboard</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px', marginBottom: '16px' }}>
        {cards.map((card) => (
          <Link key={card.label} to={card.link} style={{ textDecoration: 'none' }}>
            <div style={{ border: '1px solid #808080', padding: '10px', background: '#f8f8f8' }}>
              <div style={{ fontFamily: 'Arial', fontSize: '11px', color: '#666' }}>{card.label}</div>
              <div style={{ fontFamily: 'Arial', fontSize: '24px', fontWeight: 'bold', color: '#000080' }}>{card.value}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="admin-title" style={{ fontSize: '14px' }}>Quick Actions</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
        <Link to="/admin/projects/new" className="btn-1996">New Project</Link>
        <Link to="/admin/service-requests" className="btn-1996">View Requests</Link>
        <Link to="/admin/payments" className="btn-1996">Payments</Link>
        <Link to="/admin/settings" className="btn-1996">Settings</Link>
      </div>
    </div>
  );
}
