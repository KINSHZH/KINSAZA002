import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { formatDateShort } from '@/lib/constants';
import type { Project } from '@/types';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'featured'>('all');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (!error && data) setProjects(data);
    setLoading(false);
  }

  const filtered = projects.filter((p) => {
    if (filter === 'published' && !p.published) return false;
    if (filter === 'draft' && p.published) return false;
    if (filter === 'featured' && !p.featured) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div className="admin-title" style={{ margin: 0 }}>Projects</div>
        <Link to="/admin/projects/new" className="btn-1996 btn-primary">New Project</Link>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
        <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="admin-input" style={{ width: '200px' }} />
        <div style={{ display: 'flex', gap: '0' }}>
          {(['all', 'published', 'draft', 'featured'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className="btn-1996" style={{ fontWeight: filter === f ? 'bold' : 'normal', background: filter === f ? '#000080' : '#c0c0c0', color: filter === f ? '#fff' : '#000', border: '2px outset #e0e0e0' }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="loading-text">Loading...</div> :
        filtered.length === 0 ? <div className="empty-box">No projects found.</div> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Number</th><th>Title</th><th>Service</th><th>Date</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>{p.project_number || '—'}</td>
                    <td><Link to={`/admin/projects/${p.id}`}>{p.title}</Link>{p.featured && <span className="badge badge-featured" style={{ marginLeft: '4px' }}>F</span>}</td>
                    <td>{p.service_category || '—'}</td>
                    <td>{formatDateShort(p.project_date)}</td>
                    <td>{p.published ? <span className="badge badge-published">Published</span> : <span className="badge badge-draft">Draft</span>}</td>
                    <td><Link to={`/admin/projects/${p.id}`}>Edit &gt;</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  );
}
