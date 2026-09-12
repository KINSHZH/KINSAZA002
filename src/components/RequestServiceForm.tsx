import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { SERVICE_LIST } from '@/types';

type FormState = {
  name: string; phone: string; email: string; service_needed: string;
  description: string; preferred_contact: string; preferred_date: string; notes: string;
};

const EMPTY_FORM: FormState = {
  name: '', phone: '', email: '', service_needed: '', description: '',
  preferred_contact: 'either', preferred_date: '', notes: '',
};

export default function RequestServiceForm() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  useEffect(() => {
    const serviceParam = searchParams.get('service');
    if (serviceParam && SERVICE_LIST.includes(serviceParam as typeof SERVICE_LIST[number])) {
      setForm((prev) => ({ ...prev, service_needed: serviceParam }));
    }
  }, [searchParams]);

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.service_needed) e.service_needed = 'Please select a service';
    if (!form.description.trim()) e.description = 'Please describe the work needed';
    if (form.preferred_contact === 'phone' || form.preferred_contact === 'either') {
      if (!form.phone.trim()) e.phone = 'Phone number required';
    }
    if (form.preferred_contact === 'email' || form.preferred_contact === 'either') {
      if (!form.email.trim()) e.email = 'Email required';
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter((f) => f.type.startsWith('image/'));
    if (valid.length !== selected.length) setSubmitError('Only image files are allowed');
    const limited = [...files, ...valid].slice(0, 5);
    setFiles(limited);
    setFilePreviews(limited.map((f) => URL.createObjectURL(f)));
  }

  function removeFile(index: number) {
    const nf = files.filter((_, i) => i !== index);
    setFiles(nf);
    setFilePreviews(nf.map((f) => URL.createObjectURL(f)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setSubmitting(true);

    try {
      const { data: reqData, error: insertErr } = await supabase
        .from('service_requests').insert({
          name: form.name.trim(), phone: form.phone.trim() || null, email: form.email.trim() || null,
          service_needed: form.service_needed, description: form.description.trim(),
          preferred_contact: form.preferred_contact, preferred_date: form.preferred_date || null,
          notes: form.notes.trim() || null, status: 'new',
        }).select().single();

      if (insertErr) throw insertErr;

      if (files.length > 0 && reqData) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const ext = file.name.split('.').pop() || 'jpg';
          const fileName = `${reqData.id}/${Date.now()}_${i}.${ext}`;
          const { error: upErr } = await supabase.storage.from('service-request-images').upload(fileName, file);
          if (upErr) throw upErr;
          await supabase.from('service_request_images').insert({ service_request_id: reqData.id, image_path: fileName });
        }
      }

      try {
        const notifyUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-service-request`;
        await fetch(notifyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ service_request_id: reqData.id }),
        });
      } catch {
        // Email notification is best-effort; don't block the user
      }

      setSubmitted(true);
      setForm(EMPTY_FORM);
      setFiles([]);
      setFilePreviews([]);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  }

  if (submitted) {
    return (
      <div className="confirmation-box">
        <h3 style={{ marginTop: 0, color: '#008000' }}>Request Received</h3>
        <p className="body-text">Your service request has been received. For direct assistance:</p>
        <table style={{ borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px 12px 4px 0', fontWeight: 'bold' }}>Phone:</td>
              <td><a href="tel:+12163855864">216-385-5864</a></td>
            </tr>
            <tr>
              <td style={{ padding: '4px 12px 4px 0', fontWeight: 'bold' }}>Email:</td>
              <td><a href="mailto:kinshzh@gmail.com">kinshzh@gmail.com</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      {submitError && <div className="error-box">{submitError}</div>}

      <form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ paddingBottom: '8px', width: '50%' }}>
                <label className="form-label" htmlFor="cf-name">Name <span className="form-required">*</span></label>
                <input id="cf-name" type="text" className="form-input" value={form.name} onChange={(e) => update('name', e.target.value)} />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </td>
              <td style={{ paddingBottom: '8px', paddingLeft: '8px' }}>
                <label className="form-label" htmlFor="cf-phone">Phone</label>
                <input id="cf-phone" type="tel" className="form-input" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
                {errors.phone && <div className="form-error">{errors.phone}</div>}
              </td>
            </tr>
            <tr>
              <td style={{ paddingBottom: '8px' }}>
                <label className="form-label" htmlFor="cf-email">Email</label>
                <input id="cf-email" type="email" className="form-input" value={form.email} onChange={(e) => update('email', e.target.value)} />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </td>
              <td style={{ paddingBottom: '8px', paddingLeft: '8px' }}>
                <label className="form-label" htmlFor="cf-service">Service Needed <span className="form-required">*</span></label>
                <select id="cf-service" className="form-input" value={form.service_needed} onChange={(e) => update('service_needed', e.target.value)}>
                  <option value="">-- Select --</option>
                  {SERVICE_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.service_needed && <div className="form-error">{errors.service_needed}</div>}
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginBottom: '8px' }}>
          <label className="form-label" htmlFor="cf-desc">Description of Work <span className="form-required">*</span></label>
          <textarea id="cf-desc" className="form-input" rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} />
          {errors.description && <div className="form-error">{errors.description}</div>}
        </div>

        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ paddingBottom: '8px', width: '50%' }}>
                <label className="form-label" htmlFor="cf-contact">Preferred Contact</label>
                <select id="cf-contact" className="form-input" value={form.preferred_contact} onChange={(e) => update('preferred_contact', e.target.value)}>
                  <option value="either">Either</option>
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                </select>
              </td>
              <td style={{ paddingBottom: '8px', paddingLeft: '8px' }}>
                <label className="form-label" htmlFor="cf-date">Preferred Date</label>
                <input id="cf-date" type="date" className="form-input" value={form.preferred_date} onChange={(e) => update('preferred_date', e.target.value)} />
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginBottom: '8px' }}>
          <label className="form-label" htmlFor="cf-notes">Additional Notes</label>
          <textarea id="cf-notes" className="form-input" rows={2} value={form.notes} onChange={(e) => update('notes', e.target.value)} />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label className="form-label">Optional Photos</label>
          <div style={{ border: '2px dashed #808080', padding: '8px', textAlign: 'center', background: '#f8f8f8' }}>
            <input type="file" accept="image/*" multiple onChange={handleFileChange} style={{ fontSize: '12px' }} id="cf-file" />
            <div className="small-text" style={{ marginTop: '4px' }}>Show the repair condition (max 5)</div>
          </div>
          {filePreviews.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
              {filePreviews.map((preview, i) => (
                <div key={i} style={{ position: 'relative', width: '48px', height: '48px', border: '1px solid #808080', overflow: 'hidden' }}>
                  <img src={preview} alt={`Upload ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => removeFile(i)} style={{ position: 'absolute', top: '0', right: '0', background: 'rgba(255,255,255,0.8)', border: 'none', color: '#cc0000', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold', padding: '0 2px' }}>X</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={submitting} className="btn-1996 btn-primary">
          {submitting ? 'Submitting...' : 'Submit Request'}
        </button>
        <span className="small-text" style={{ marginLeft: '12px' }}>* required fields</span>
      </form>
    </div>
  );
}
