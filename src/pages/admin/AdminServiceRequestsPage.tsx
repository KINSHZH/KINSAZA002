import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { formatDateShort, formatDateTime } from '@/lib/constants';
import type { ServiceRequest, ServiceRequestImage, ServiceRequestStatus } from '@/types';
import { SERVICE_REQUEST_STATUSES } from '@/types';

const STATUS_BADGE: Record<ServiceRequestStatus, string> = {
  new: 'badge-new', contacted: 'badge-contacted', estimate: 'badge-estimate',
  scheduled: 'badge-scheduled', completed: 'badge-completed', cancelled: 'badge-cancelled',
};

export default function AdminServiceRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [selected, setSelected] = useState<ServiceRequest | null>(null);
  const [selectedImages, setSelectedImages] = useState<ServiceRequestImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | ServiceRequestStatus>('all');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('service_requests').select('*').order('created_at', { ascending: false });
    if (!error && data) setRequests(data);
    setLoading(false);
  }

  async function openRequest(req: ServiceRequest) {
    setSelected(req);
    setAdminNotes(req.admin_notes || '');
    const { data: imgs } = await supabase.from('service_request_images').select('*').eq('service_request_id', req.id);
    setSelectedImages(imgs || []);
  }

  async function updateStatus(status: ServiceRequestStatus) {
    if (!selected) return;
    const { error } = await supabase.from('service_requests').update({ status }).eq('id', selected.id);
    if (!error) {
      const u = { ...selected, status };
      setSelected(u);
      setRequests(requests.map((r) => r.id === selected.id ? u : r));
    }
  }

  async function saveAdminNotes() {
    if (!selected) return;
    const { error } = await supabase.from('service_requests').update({ admin_notes: adminNotes }).eq('id', selected.id);
    if (!error) {
      const u = { ...selected, admin_notes: adminNotes };
      setSelected(u);
      setRequests(requests.map((r) => r.id === selected.id ? u : r));
    }
  }

  const filtered = requests.filter((r) => filter === 'all' || r.status === filter);
  const privateImageUrl = (path: string) => `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/service-request-images/${path}`;

  if (loading) return <div className="loading-text">Loading...</div>;

  if (selected) {
    return (
      <div>
        <div style={{ marginBottom: '8px' }}>
          <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#0000ee', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}>&lt;&lt; All Requests</button>
        </div>

        <div className="admin-title">Service Request</div>
        <div style={{ marginBottom: '8px' }}>
          <span className={`badge ${STATUS_BADGE[selected.status]}`}>{selected.status.toUpperCase()}</span>
          <span className="small-text" style={{ marginLeft: '8px' }}>{formatDateTime(selected.created_at)}</span>
        </div>
        <hr className="thin" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
          <div>
            <table style={{ borderCollapse: 'collapse' }}>
              <tbody>
                <tr><td style={{ fontWeight: 'bold', padding: '4px 12px 4px 0', fontSize: '13px' }}>Name:</td><td style={{ fontSize: '13px' }}>{selected.name}</td></tr>
                <tr><td style={{ fontWeight: 'bold', padding: '4px 12px 4px 0', fontSize: '13px' }}>Phone:</td><td style={{ fontSize: '13px' }}>{selected.phone ? <a href={`tel:${selected.phone}`}>{selected.phone}</a> : '—'}</td></tr>
                <tr><td style={{ fontWeight: 'bold', padding: '4px 12px 4px 0', fontSize: '13px' }}>Email:</td><td style={{ fontSize: '13px' }}>{selected.email ? <a href={`mailto:${selected.email}`}>{selected.email}</a> : '—'}</td></tr>
                <tr><td style={{ fontWeight: 'bold', padding: '4px 12px 4px 0', fontSize: '13px' }}>Service:</td><td style={{ fontSize: '13px' }}>{selected.service_needed}</td></tr>
                <tr><td style={{ fontWeight: 'bold', padding: '4px 12px 4px 0', fontSize: '13px' }}>Contact:</td><td style={{ fontSize: '13px' }}>{selected.preferred_contact.toUpperCase()}</td></tr>
                {selected.preferred_date && <tr><td style={{ fontWeight: 'bold', padding: '4px 12px 4px 0', fontSize: '13px' }}>Date:</td><td style={{ fontSize: '13px' }}>{formatDateShort(selected.preferred_date)}</td></tr>}
              </tbody>
            </table>
          </div>

          <div>
            <div className="tech-label">Description</div>
            <div style={{ border: '1px solid #808080', padding: '8px', background: '#f8f8f8', fontSize: '13px', marginBottom: '8px', whiteSpace: 'pre-wrap' }}>{selected.description || '—'}</div>
            {selected.notes && (
              <>
                <div className="tech-label">Additional Notes</div>
                <div style={{ border: '1px solid #808080', padding: '8px', background: '#f8f8f8', fontSize: '13px', marginBottom: '8px', whiteSpace: 'pre-wrap' }}>{selected.notes}</div>
              </>
            )}
            <div className="tech-label">Admin Notes</div>
            <textarea className="admin-input" rows={3} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Internal notes..." />
            <button onClick={saveAdminNotes} className="btn-1996" style={{ marginTop: '4px', fontSize: '12px' }}>Save Notes</button>
          </div>
        </div>

        {selectedImages.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <div className="tech-label" style={{ marginBottom: '4px' }}>Customer Photos (Private)</div>
            <hr className="thin" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {selectedImages.map((img) => (
                <a key={img.id} href={privateImageUrl(img.image_path)} target="_blank" rel="noopener noreferrer" style={{ border: '1px solid #808080', display: 'block' }}>
                  <img src={privateImageUrl(img.image_path)} alt="Customer photo" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                </a>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: '16px' }}>
          <div className="tech-label" style={{ marginBottom: '4px' }}>Change Status</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {SERVICE_REQUEST_STATUSES.map((s) => (
              <button key={s} onClick={() => updateStatus(s)} className="btn-1996" style={{
                fontSize: '12px', fontWeight: selected.status === s ? 'bold' : 'normal',
                background: selected.status === s ? '#000080' : '#c0c0c0', color: selected.status === s ? '#fff' : '#000',
              }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '16px', borderTop: '1px solid #808080', paddingTop: '12px' }}>
          <Link to={`/admin/payments?request=${selected.id}`} className="btn-1996 btn-primary">Create Payment Request</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-title">Service Requests</div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0', marginBottom: '12px' }}>
        {(['all', ...SERVICE_REQUEST_STATUSES] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className="btn-1996" style={{
            fontSize: '12px', fontWeight: filter === f ? 'bold' : 'normal',
            background: filter === f ? '#000080' : '#c0c0c0', color: filter === f ? '#fff' : '#000',
          }}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? <div className="empty-box">No service requests</div> : (
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr><th>Date</th><th>Name</th><th>Service</th><th>Contact</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id}>
                  <td>{formatDateShort(req.created_at)}</td>
                  <td>{req.name}</td>
                  <td>{req.service_needed}</td>
                  <td>{req.preferred_contact.toUpperCase()}</td>
                  <td><span className={`badge ${STATUS_BADGE[req.status]}`}>{req.status.toUpperCase()}</span></td>
                  <td><button onClick={() => openRequest(req)} style={{ background: 'none', border: 'none', color: '#0000ee', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px' }}>View &gt;</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
