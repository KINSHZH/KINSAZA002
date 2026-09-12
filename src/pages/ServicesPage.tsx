import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LoadingState, ErrorState, EmptyState, PageHeader } from '@/components/Layout';
import { getClipArt, getServicePhoto } from '@/lib/constants';
import { playServiceSound } from '@/lib/serviceSounds';
import type { Service } from '@/types';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('services').select('*').eq('published', true).order('sort_order');
      if (error) { setError(error.message); } else { setServices(data || []); }
      setLoading(false);
    }
    load();
  }, []);

  function toggle(serviceId: string) {
    setExpanded(expanded === serviceId ? null : serviceId);
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader title="Services" subtitle="Repair, restoration, and maintenance work" />

      <p className="body-text" style={{ marginBottom: '16px' }}>
        We offer a range of home repair services. Hover over the icons to see them animate,
        then click a category to expand and see photos of that type of work.
      </p>

      {services.length === 0 ? (
        <EmptyState message="No services configured yet." />
      ) : (
        <div>
          {services.map((service) => {
            const clip = getClipArt(service.slug);
            const photo = getServicePhoto(service.slug);
            const isOpen = expanded === service.id;

            return (
              <div key={service.id} style={{ border: '1px solid #808080', marginBottom: '4px' }}>
                {/* Header row - always visible, clickable to expand */}
                <button
                  onClick={() => toggle(service.id)}
                  className="service-clip"
                  data-anim={clip.anim}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    background: isOpen ? '#ffffe0' : '#f0f0f0',
                    border: '2px solid',
                    borderColor: isOpen ? '#0000ee' : '#c0c0c0',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#000000',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                  aria-expanded={isOpen}
                  onMouseEnter={() => playServiceSound(service.slug)}
                >
                  <span style={{ fontSize: '12px', fontFamily: 'monospace', color: '#000' }}>
                    {isOpen ? '[-]' : '[+]'}
                  </span>
                  <img src={clip.img} alt={service.name} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                  <span style={{ color: '#0000ee', textDecoration: 'underline' }}>{service.name}</span>
                </button>

                {/* Expanded content - photo and details */}
                {isOpen && (
                  <div style={{ padding: '12px', background: '#f8f8f8' }}>
                    {photo && (
                      <div style={{ marginBottom: '10px', border: '1px solid #808080', overflow: 'hidden' }}>
                        <img
                          src={photo.url}
                          alt={photo.alt}
                          style={{ width: '100%', height: 'auto', display: 'block' }}
                          loading="lazy"
                        />
                      </div>
                    )}

                    {service.description && (
                      <p className="body-text" style={{ margin: '0 0 10px 0' }}>
                        {service.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <Link
                        to={`/services/${service.slug}`}
                        className="btn-1996"
                        style={{ fontSize: '12px' }}
                      >
                        More Details
                      </Link>
                      <Link
                        to={`/request-service?service=${encodeURIComponent(service.name)}`}
                        className="btn-1996 btn-primary"
                        style={{ fontSize: '12px' }}
                      >
                        Request This Service
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <hr className="thin" />

      <div style={{ margin: '12px 0' }}>
        <h3 className="section-heading">How It Works</h3>
        <ol style={{ fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li><strong>Request service</strong> -- submit a request online or call us.</li>
          <li><strong>We discuss the job</strong> -- we'll talk about what needs fixing.</li>
          <li><strong>Estimate</strong> -- we'll give you a price for the work.</li>
          <li><strong>Schedule</strong> -- we set up a time to do the repair.</li>
          <li><strong>Pay securely</strong> -- pay online with a credit card if needed.</li>
        </ol>
      </div>

      <div style={{ margin: '16px 0' }}>
        <Link to="/request-service" className="btn-1996 btn-primary">Request Service</Link>
      </div>
    </div>
  );
}
