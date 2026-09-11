import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/Layout';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { BUSINESS } from '@/lib/constants';
import RequestServiceForm from '@/components/RequestServiceForm';

export default function ContactPage() {
  const { phone, email, contactMessage } = useSiteSettings();

  return (
    <div>
      <PageHeader title="Contact" subtitle="Phone, email, or send us a request" />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', margin: '12px 0' }}>
        <div style={{ border: '1px solid #808080', padding: '12px', background: '#f8f8f8', flex: '1', minWidth: '200px' }}>
          <div className="tech-label">Phone</div>
          <a href={BUSINESS.phoneHref} style={{ fontSize: '18px', fontWeight: 'bold' }}>{phone}</a>
          <div style={{ marginTop: '8px' }}>
            <a href={BUSINESS.phoneHref} className="btn-1996 btn-primary">Call</a>
          </div>
        </div>

        <div style={{ border: '1px solid #808080', padding: '12px', background: '#f8f8f8', flex: '1', minWidth: '200px' }}>
          <div className="tech-label">Email</div>
          <a href={BUSINESS.emailHref} style={{ fontSize: '16px', fontWeight: 'bold', wordBreak: 'break-all' }}>{email}</a>
          <div style={{ marginTop: '8px' }}>
            <a href={BUSINESS.emailHref} className="btn-1996 btn-primary">Email</a>
          </div>
        </div>
      </div>

      <div style={{ border: '1px solid #808080', padding: '12px', background: '#ffffe0', margin: '12px 0' }}>
        <p className="body-text">{contactMessage}</p>
        <div style={{ marginTop: '8px' }}>
          <Link to="/request-service" className="btn-1996 btn-primary">Request Service</Link>
        </div>
      </div>

      <hr className="thick" />

      <h3 className="section-heading">Or Submit a Request Below</h3>
      <RequestServiceForm />
    </div>
  );
}
