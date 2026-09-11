import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/Layout';
import { SERVICE_LIST } from '@/types';

type FormState = {
  name: string; phone: string; email: string; service_needed: string;
  description: string; preferred_contact: string; preferred_date: string; notes: string;
};

const EMPTY_FORM: FormState = {
  name: '', phone: '', email: '', service_needed: '', description: '',
  preferred_contact: 'either', preferred_date: '', notes: '',
};

export default function RequestServicePage() {
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
      if (!form.phone.trim()) e.phone = 'Phone number required for your preferred contact method';
    }
    if (form.preferred_contact === 'email' || form.preferred_contact === 'either') {
      if (!form.email.trim()) e.email = 'Email required for your preferred contact method';
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
      <div>
        <PageHeader title="Request Received" />
        <div className="confirmation-box">
          <h3 style={{ marginTop: 0, color: '#008000' }}>Your request has been received.</h3>
          <p className="body-text">
            Thank you for submitting your service request. We will review it and contact you to discuss the details.
          </p>
          <hr className="thin" />
          <p style={{ fontWeight: 'bold', fontSize: '14px' }}>For direct assistance:</p>
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
          <div style={{ marginTop: '12px' }}>
            <Link to="/" className="btn-1996">Return Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Request Service" subtitle="Submit a repair request and we'll contact you" />

      {submitError && <div className="error-box">{submitError}</div>}

      <form onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ paddingBottom: '8px', width: '50%' }}>
                <label className="form-label" htmlFor="name">Name <span className="form-required">*</span></label>
                <input id="name" type="text" className="form-input" value={form.name} onChange={(e) => update('name', e.target.value)} />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </td>
              <td style={{ paddingBottom: '8px', paddingLeft: '8px' }}>
                <label className="form-label" htmlFor="phone">Phone</label>
                <input id="phone" type="tel" className="form-input" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
                {errors.phone && <div className="form-error">{errors.phone}</div>}
              </td>
            </tr>
            <tr>
              <td style={{ paddingBottom: '8px' }}>
                <label className="form-label" htmlFor="email">Email</label>
                <input id="email" type="email" className="form-input" value={form.email} onChange={(e) => update('email', e.target.value)} />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </td>
              <td style={{ paddingBottom: '8px', paddingLeft: '8px' }}>
                <label className="form-label" htmlFor="service_needed">Service Needed <span className="form-required">*</span></label>
                <select id="service_needed" className="form-input" value={form.service_needed} onChange={(e) => update('service_needed', e.target.value)}>
                  <option value="">-- Select Service --</option>
                  {SERVICE_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.service_needed && <div className="form-error">{errors.service_needed}</div>}
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginBottom: '8px' }}>
          <label className="form-label" htmlFor="description">Description of Work <span className="form-required">*</span></label>
          <textarea id="description" className="form-input" rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Describe the repair needed..." />
          {errors.description && <div className="form-error">{errors.description}</div>}
        </div>

        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ paddingBottom: '8px', width: '50%' }}>
                <label className="form-label" htmlFor="preferred_contact">Preferred Contact Method</label>
                <select id="preferred_contact" className="form-input" value={form.preferred_contact} onChange={(e) => update('preferred_contact', e.target.value)}>
                  <option value="either">Either</option>
                  <option value="phone">Phone</option>
                  <option value="email">Email</option>
                </select>
              </td>
              <td style={{ paddingBottom: '8px', paddingLeft: '8px' }}>
                <label className="form-label" htmlFor="preferred_date">Preferred Date</label>
                <input id="preferred_date" type="date" className="form-input" value={form.preferred_date} onChange={(e) => update('preferred_date', e.target.value)} />
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginBottom: '8px' }}>
          <label className="form-label" htmlFor="notes">Additional Notes</label>
          <textarea id="notes" className="form-input" rows={3} value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Any additional information..." />
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label className="form-label">Optional Photos</label>
          <div style={{ border: '2px dashed #808080', padding: '12px', textAlign: 'center', background: '#f8f8f8' }}>
            <input type="file" accept="image/*" multiple onChange={handleFileChange} className="form-input" style={{ border: 'none', padding: '0' }} id="file-upload" />
            <label htmlFor="file-upload" className="small-text" style={{ display: 'block', marginTop: '4px' }}>
              Upload photos showing the repair condition (max 5)
            </label>
          </div>
          {filePreviews.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              {filePreviews.map((preview, i) => (
                <div key={i} style={{ position: 'relative', width: '60px', height: '60px', border: '1px solid #808080', overflow: 'hidden' }}>
                  <img src={preview} alt={`Upload ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={() => removeFile(i)} style={{ position: 'absolute', top: '0', right: '0', background: 'rgba(255,255,255,0.8)', border: 'none', color: '#cc0000', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', padding: '0 4px' }}>X</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: '12px' }}>
          <button type="submit" disabled={submitting} className="btn-1996 btn-primary">
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
          <span className="small-text" style={{ marginLeft: '12px' }}>
            Fields marked <span className="form-required">*</span> are required
          </span>
        </div>
      </form>
    </div>
  );
}
