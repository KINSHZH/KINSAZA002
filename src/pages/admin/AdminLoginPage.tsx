import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLoginPage() {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate('/admin/dashboard', { replace: true });
  }, [user, loading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error } = await signIn(email, password);
    if (error) { setError(error.message); setSubmitting(false); }
    else { navigate('/admin/dashboard', { replace: true }); }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#c0c0c0', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '320px' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontFamily: 'Times New Roman', fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
            Administrator Login
          </h2>
          <div className="small-text">Home Repair & Field Services</div>
        </div>

        <div style={{ border: '2px outset #e0e0e0', background: '#c0c0c0', padding: '16px' }}>
          {error && <div className="error-box" style={{ marginBottom: '12px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '12px' }}>
              <label className="form-label" htmlFor="admin-email">Email</label>
              <input id="admin-email" type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label className="form-label" htmlFor="admin-pass">Password</label>
              <input id="admin-pass" type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            <button type="submit" disabled={submitting} className="btn-1996 btn-primary" style={{ width: '100%', boxSizing: 'border-box', textAlign: 'center' }}>
              {submitting ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <a href="/" className="small-text">&lt;&lt; Back to Site</a>
        </div>
      </div>
    </div>
  );
}
