import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { LoadingState, ErrorState, EmptyState } from '@/components/Layout';
import { getClipArt, getServicePhoto } from '@/lib/constants';
import type { Service, Project, ProjectImage } from '@/types';

export default function HomePage() {
  const { intro, phone, email } = useSiteSettings();
  const [services, setServices] = useState<Service[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<(Project & { primary_image?: ProjectImage })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedService, setExpandedService] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [servicesRes, projectsRes] = await Promise.all([
          supabase.from('services').select('*').eq('published', true).order('sort_order'),
          supabase.from('projects').select('*').eq('published', true).eq('featured', true).order('created_at', { ascending: false }).limit(3),
        ]);

        if (servicesRes.error) throw servicesRes.error;
        if (projectsRes.error) throw projectsRes.error;

        const projects = projectsRes.data || [];
        if (projects.length > 0) {
          const imagePromises = projects.map((p) =>
            supabase.from('project_images').select('*').eq('project_id', p.id).order('is_primary', { ascending: false }).order('sort_order').limit(1).maybeSingle()
          );
          const imageResults = await Promise.all(imagePromises);
          setFeaturedProjects(projects.map((p, i) => ({ ...p, primary_image: imageResults[i].data || undefined })));
        }

        setServices(servicesRes.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load page content');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      {/* Welcome heading */}
      <div className="marquee-heading">
        Welcome to Home Repair & Field Services
      </div>

      <div className="construction-bar" />

      <p className="body-text" style={{ margin: '12px 0' }}>
        {intro}
      </p>

      <p className="body-text" style={{ margin: '12px 0' }}>
        We handle all types of home repair work -- from masonry and tuckpointing to painting,
        drywall, glass block windows, light plumbing, electrical, and general handyman tasks.
        Browse our services below, view our <Link to="/projects">project archive</Link>,
        or <Link to="/request-service">request service</Link> online.
      </p>

      {/* Service lineup with animated clip art - click to expand photos */}
      <h3 className="section-heading">Our Services</h3>
      <p className="small-text" style={{ marginBottom: '8px' }}>
        Hover over the icons to see them animate. Click any service to see photos of that type of work.
      </p>

      {services.length === 0 ? (
        <EmptyState message="No services configured yet." />
      ) : (
        <div className="service-lineup">
          {services.map((service) => {
            const clip = getClipArt(service.slug);
            const isOpen = expandedService === service.id;
            return (
              <div key={service.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <button
                  onClick={() => setExpandedService(isOpen ? null : service.id)}
                  className="service-clip"
                  data-anim={clip.anim}
                  aria-expanded={isOpen}
                  style={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textDecoration: 'none',
                    padding: '6px 8px',
                    border: '2px solid',
                    borderColor: isOpen ? '#0000ee' : '#c0c0c0',
                    background: isOpen ? '#ffffe0' : '#f0f0f0',
                    cursor: 'pointer',
                    position: 'relative',
                    fontFamily: 'inherit',
                  }}
                >
                  <img src={clip.img} alt={service.name} />
                  <span className="label" style={{ color: isOpen ? '#ff0000' : undefined }}>{service.name}</span>
                </button>

                {isOpen && (
                  <div style={{
                    marginTop: '4px',
                    width: '220px',
                    border: '1px solid #808080',
                    background: '#f8f8f8',
                    padding: '8px',
                    zIndex: 10,
                  }}>
                    {(() => {
                      const photo = getServicePhoto(service.slug);
                      return photo ? (
                        <div style={{ border: '1px solid #808080', overflow: 'hidden', marginBottom: '6px' }}>
                          <img
                            src={photo.url}
                            alt={photo.alt}
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                            loading="lazy"
                          />
                        </div>
                      ) : null;
                    })()}
                    {service.description && (
                      <p className="small-text" style={{ margin: '0 0 6px 0' }}>{service.description}</p>
                    )}
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <Link to={`/services/${service.slug}`} className="btn-1996" style={{ fontSize: '11px' }}>
                        Details
                      </Link>
                      <Link to={`/request-service?service=${encodeURIComponent(service.name)}`} className="btn-1996 btn-primary" style={{ fontSize: '11px' }}>
                        Request
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

      {/* Quick links */}
      <div style={{ margin: '12px 0', fontSize: '14px' }}>
        <strong>Quick Links:</strong>{' '}
        <Link to="/request-service">Request Service</Link> |{' '}
        <Link to="/projects">View Projects</Link> |{' '}
        <Link to="/contact">Contact Us</Link> |{' '}
        <a href="tel:+12163855864">Call {phone}</a>
      </div>

      {/* Featured projects */}
      {featuredProjects.length > 0 && (
        <>
          <h3 className="section-heading">Featured Projects</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', margin: '12px 0' }}>
            {featuredProjects.map((project) => (
              <div key={project.id} style={{ border: '1px solid #808080', padding: '8px', background: '#f8f8f8', width: '200px' }}>
                <Link to={`/projects/${project.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ width: '100%', height: '120px', border: '1px solid #808080', overflow: 'hidden', marginBottom: '6px' }}>
                    {project.primary_image ? (
                      <img
                        src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/project-images/${project.primary_image.image_path}`}
                        alt={project.primary_image.alt_text || project.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src="/clip-handyman.webp" alt="" style={{ width: '48px', height: '48px', opacity: 0.5 }} />
                      </div>
                    )}
                  </div>
                </Link>
                <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#666' }}>
                  Project {project.project_number || '---'}
                </div>
                <Link to={`/projects/${project.slug}`} style={{ fontSize: '13px' }}>
                  {project.title}
                </Link>
              </div>
            ))}
          </div>
          <div style={{ margin: '8px 0' }}>
            <Link to="/projects">View All Projects &gt;&gt;</Link>
          </div>
          <hr className="thin" />
        </>
      )}

      {/* Contact section */}
      <h3 className="section-heading">Need Something Repaired?</h3>
      <div style={{ margin: '12px 0' }}>
        <p className="body-text">
          Call us or send an email. We'll discuss your repair needs and set up a time to take a look.
        </p>
        <table style={{ margin: '8px 0', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px 12px 4px 0', fontWeight: 'bold', fontSize: '14px' }}>Phone:</td>
              <td style={{ padding: '4px 0' }}>
                <a href="tel:+12163855864" style={{ fontSize: '15px' }}>{phone}</a>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '4px 12px 4px 0', fontWeight: 'bold', fontSize: '14px' }}>Email:</td>
              <td style={{ padding: '4px 0' }}>
                <a href="mailto:kinshzh@gmail.com" style={{ fontSize: '15px' }}>{email}</a>
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ margin: '12px 0' }}>
          <Link to="/request-service" className="btn-1996 btn-primary">Request Service</Link>{' '}
          <Link to="/contact" className="btn-1996">Contact Us</Link>
        </div>
      </div>
    </div>
  );
}
