import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { SiteSettings } from '@/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ business_name: '', phone: '', email: '', homepage_intro: '', contact_message: '' });

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
      if (error) { setError(error.message); }
      else if (data) {
        setSettings(data);
        setForm({ business_name: data.business_name, phone: data.phone, email: data.email, homepage_intro: data.homepage_intro, contact_message: data.contact_message || '' });
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null); setSaved(false);
    if (!form.business_name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError('Business name, phone, and email are required'); setSaving(false); return;
    }
    if (!settings) return;
    const { error: ue } = await supabase.from('site_settings').update({
      business_name: form.business_name.trim(), phone: form.phone.trim(), email: form.email.trim(),
      homepage_intro: form.homepage_intro.trim(), contact_message: form.contact_message.trim() || null,
    }).eq('id', settings.id);
    if (ue) { setError(ue.message); } else { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setSaving(false);
  }

  if (loading) return <div className="loading-text">Loading...</div>;

  return (
    <div>
      <div className="admin-title">Site Settings</div>

      {error && <div className="error-box" style={{ marginBottom: '12px' }}>{error}</div>}
      {saved && <div className="success-box" style={{ marginBottom: '12px' }}>Settings saved.</div>}

      <form onSubmit={handleSave} style={{ maxWidth: '500px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label className="form-label" htmlFor="set-biz">Business Display Name *</label>
          <input id="set-biz" type="text" className="admin-input" value={form.business_name} onChange={(e) => setForm((p) => ({ ...p, business_name: e.target.value }))} required />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <div style={{ flex: 1 }}>
            <label className="form-label" htmlFor="set-phone">Phone *</label>
            <input id="set-phone" type="text" className="admin-input" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} required />
          </div>
          <div style={{ flex: 1 }}>
            <label className="form-label" htmlFor="set-email">Email *</label>
            <input id="set-email" type="email" className="admin-input" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
          </div>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label className="form-label" htmlFor="set-intro">Homepage Introduction</label>
          <textarea id="set-intro" className="admin-input" rows={3} value={form.homepage_intro} onChange={(e) => setForm((p) => ({ ...p, homepage_intro: e.target.value }))} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label className="form-label" htmlFor="set-msg">Contact Message</label>
          <textarea id="set-msg" className="admin-input" rows={3} value={form.contact_message} onChange={(e) => setForm((p) => ({ ...p, contact_message: e.target.value }))} />
        </div>
        <button type="submit" disabled={saving} className="btn-1996 btn-primary">{saving ? 'Saving...' : 'Save Settings'}</button>
      </form>
    </div>
  );
}
