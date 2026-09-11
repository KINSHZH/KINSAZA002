import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/constants';
import type { Payment } from '@/types';

export default function PaymentPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    async function load() {
      if (!paymentId) return;
      const { data, error } = await supabase.from('payments').select('*').eq('id', paymentId).maybeSingle();
      if (error) { setError(error.message); }
      else if (!data) { setError('Payment request not found'); }
      else { setPayment(data); }
      setLoading(false);
    }
    load();
  }, [paymentId]);

  async function handlePay() {
    if (!payment) return;
    setPaying(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ payment_id: payment.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create checkout session');
      if (result.url) { window.location.href = result.url; }
      else throw new Error('No checkout URL returned');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment initialization failed');
      setPaying(false);
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c8c8c8' }}>
      <div style={{ fontFamily: 'Arial', fontSize: '14px', color: '#666' }}>Loading payment...</div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c8c8c8', padding: '20px' }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <div className="error-box">
          <strong>Payment Error</strong>
          <p style={{ margin: '8px 0 0 0' }}>{error}</p>
        </div>
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <Link to="/" className="btn-1996">Return Home</Link>
        </div>
      </div>
    </div>
  );

  if (!payment) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c8c8c8' }}>
      <div className="empty-box" style={{ maxWidth: '400px' }}>Payment request not found</div>
    </div>
  );

  if (payment.status === 'paid') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c8c8c8', padding: '20px' }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <div className="success-box">
          <h3 style={{ margin: '0 0 8px 0', color: '#008000' }}>Payment Received</h3>
          <p style={{ margin: '0 0 8px 0' }}>Thank you. Your payment has been processed.</p>
          <hr className="thin" />
          <div className="small-text">Amount: {formatCurrency(payment.amount, payment.currency)}</div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <Link to="/" className="btn-1996">Return Home</Link>
        </div>
      </div>
    </div>
  );

  if (payment.status === 'cancelled' || payment.status === 'expired' || payment.status === 'refunded') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c8c8c8', padding: '20px' }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <div className="empty-box">
          <strong>Payment {payment.status.toUpperCase()}</strong>
          <p style={{ margin: '8px 0 0 0' }}>This payment request is no longer active.</p>
        </div>
        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <Link to="/" className="btn-1996">Return Home</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c8c8c8', padding: '20px' }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontFamily: 'Times New Roman', fontSize: '22px', fontWeight: 'bold', margin: 0 }}>Service Payment</h2>
          <div className="small-text">Home Repair & Field Services</div>
        </div>

        <div style={{ border: '2px solid #808080', background: '#ffffff', padding: '16px' }}>
          {payment.description && (
            <div style={{ marginBottom: '8px' }}>
              <div className="tech-label">Description</div>
              <div style={{ fontSize: '14px' }}>{payment.description}</div>
            </div>
          )}
          <div style={{ marginBottom: '8px' }}>
            <div className="tech-label">Customer</div>
            <div style={{ fontSize: '14px' }}>{payment.customer_name}</div>
          </div>
          <hr className="thin" />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0' }}>
            <strong style={{ fontSize: '15px' }}>Amount Due:</strong>
            <span style={{ fontFamily: 'Times New Roman', fontSize: '24px', fontWeight: 'bold' }}>
              {formatCurrency(payment.amount, payment.currency)}
            </span>
          </div>
          <button onClick={handlePay} disabled={paying} className="btn-1996 btn-primary" style={{ width: '100%', textAlign: 'center', boxSizing: 'border-box' }}>
            {paying ? 'Processing...' : 'Pay Securely'}
          </button>
          <div style={{ textAlign: 'center', marginTop: '8px' }} className="small-text">
            Secure payment via Stripe
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <Link to="/" className="small-text">&lt;&lt; Return Home</Link>
        </div>
      </div>
    </div>
  );
}
