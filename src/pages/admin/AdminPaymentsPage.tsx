import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { formatCurrency, formatDateTime } from '@/lib/constants';
import type { Payment, PaymentStatus, ServiceRequest } from '@/types';
import { PAYMENT_STATUSES } from '@/types';

const STATUS_BADGE: Record<PaymentStatus, string> = {
  pending: 'badge-pending', paid: 'badge-paid', cancelled: 'badge-cancelled',
  expired: 'badge-expired', refunded: 'badge-refunded',
};

export default function AdminPaymentsPage() {
  const [searchParams] = useSearchParams();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  const [newPayment, setNewPayment] = useState({ service_request_id: '', customer_name: '', customer_email: '', description: '', amount: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    load(); loadRequests();
    const reqId = searchParams.get('request');
    if (reqId) { setShowCreate(true); loadRequestDetails(reqId); }
  }, [searchParams]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
    if (!error && data) setPayments(data);
    setLoading(false);
  }

  async function loadRequests() {
    const { data } = await supabase.from('service_requests').select('*').order('created_at', { ascending: false }).limit(50);
    setRequests(data || []);
  }

  async function loadRequestDetails(reqId: string) {
    const { data } = await supabase.from('service_requests').select('*').eq('id', reqId).maybeSingle();
    if (data) setNewPayment((p) => ({ ...p, service_request_id: data.id, customer_name: data.name, customer_email: data.email || '', description: data.service_needed }));
  }

  async function handleCreatePayment(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true); setCreateError(null);
    if (!newPayment.customer_name.trim() || !newPayment.customer_email.trim() || !newPayment.amount) {
      setCreateError('Name, email, and amount are required'); setCreating(false); return;
    }
    const amount = parseFloat(newPayment.amount);
    if (isNaN(amount) || amount <= 0) { setCreateError('Amount must be a positive number'); setCreating(false); return; }

    const { data, error } = await supabase.from('payments').insert({
      service_request_id: newPayment.service_request_id || null,
      customer_name: newPayment.customer_name.trim(), customer_email: newPayment.customer_email.trim(),
      description: newPayment.description.trim() || null, amount, currency: 'usd', status: 'pending',
    }).select().single();

    if (error) { setCreateError(error.message); }
    else {
      setPayments([data, ...payments]); setShowCreate(false);
      setNewPayment({ service_request_id: '', customer_name: '', customer_email: '', description: '', amount: '' });
    }
    setCreating(false);
  }

  async function updateStatus(paymentId: string, status: PaymentStatus) {
    const updates: Partial<Payment> = { status };
    if (status === 'paid') updates.paid_at = new Date().toISOString();
    else updates.paid_at = null;
    const { error } = await supabase.from('payments').update(updates).eq('id', paymentId);
    if (!error) setPayments(payments.map((p) => p.id === paymentId ? { ...p, ...updates } : p));
  }

  function copyPaymentLink(paymentId: string) {
    navigator.clipboard.writeText(`${window.location.origin}/payment/${paymentId}`);
    setCopiedId(paymentId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div className="admin-title" style={{ margin: 0 }}>Payments</div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-1996 btn-primary">
          {showCreate ? 'Cancel' : 'New Payment'}
        </button>
      </div>

      {showCreate && (
        <div style={{ border: '1px solid #808080', padding: '12px', marginBottom: '12px', background: '#f8f8f8' }}>
          <div className="form-label" style={{ marginBottom: '8px' }}>Create Payment Request</div>
          {createError && <div className="error-box" style={{ marginBottom: '8px' }}>{createError}</div>}
          <form onSubmit={handleCreatePayment}>
            <div style={{ marginBottom: '8px' }}>
              <label className="form-label" htmlFor="pay-req">Link to Service Request (optional)</label>
              <select id="pay-req" className="admin-input" value={newPayment.service_request_id} onChange={(e) => {
                const v = e.target.value; setNewPayment((p) => ({ ...p, service_request_id: v }));
                if (v) loadRequestDetails(v);
              }}>
                <option value="">-- None --</option>
                {requests.map((r) => <option key={r.id} value={r.id}>{r.name} - {r.service_needed} ({formatDateTime(r.created_at)})</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="pay-name">Customer Name *</label>
                <input id="pay-name" type="text" className="admin-input" value={newPayment.customer_name} onChange={(e) => setNewPayment((p) => ({ ...p, customer_name: e.target.value }))} required />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="pay-email">Customer Email *</label>
                <input id="pay-email" type="email" className="admin-input" value={newPayment.customer_email} onChange={(e) => setNewPayment((p) => ({ ...p, customer_email: e.target.value }))} required />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label" htmlFor="pay-amount">Amount (USD) *</label>
                <input id="pay-amount" type="number" step="0.01" min="0.01" className="admin-input" value={newPayment.amount} onChange={(e) => setNewPayment((p) => ({ ...p, amount: e.target.value }))} placeholder="0.00" required />
              </div>
              <div style={{ flex: 2 }}>
                <label className="form-label" htmlFor="pay-desc">Description</label>
                <input id="pay-desc" type="text" className="admin-input" value={newPayment.description} onChange={(e) => setNewPayment((p) => ({ ...p, description: e.target.value }))} placeholder="Deposit for tuckpointing..." />
              </div>
            </div>
            <button type="submit" disabled={creating} className="btn-1996 btn-primary">{creating ? 'Creating...' : 'Create Payment Request'}</button>
          </form>
        </div>
      )}

      {loading ? <div className="loading-text">Loading...</div> :
        payments.length === 0 ? <div className="empty-box">No payment requests</div> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr><th>Date</th><th>Customer</th><th>Description</th><th>Amount</th><th>Status</th><th>Paid</th><th></th></tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>{formatDateTime(p.created_at)}</td>
                    <td>{p.customer_name}<br /><span style={{ fontSize: '11px', color: '#666' }}>{p.customer_email}</span></td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description || '—'}</td>
                    <td><strong>{formatCurrency(p.amount, p.currency)}</strong></td>
                    <td>
                      <select value={p.status} onChange={(e) => updateStatus(p.id, e.target.value as PaymentStatus)} className="admin-input" style={{ fontSize: '12px', width: 'auto', padding: '1px 4px' }}>
                        {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                      </select>
                    </td>
                    <td style={{ fontSize: '11px' }}>{p.paid_at ? formatDateTime(p.paid_at) : '—'}</td>
                    <td>
                      <button onClick={() => copyPaymentLink(p.id)} style={{ background: 'none', border: 'none', color: '#0000ee', cursor: 'pointer', textDecoration: 'underline', fontSize: '12px' }}>
                        {copiedId === p.id ? 'Copied!' : 'Copy Link'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      <div style={{ marginTop: '12px', border: '1px solid #808080', padding: '8px', background: '#ffffe0', fontSize: '12px', color: '#666' }}>
        <strong>Note:</strong> Stripe integration requires configuration. Payment links can be shared with customers.
        When Stripe is configured, the "Pay Securely" button will redirect to Stripe Checkout.
      </div>
    </div>
  );
}
