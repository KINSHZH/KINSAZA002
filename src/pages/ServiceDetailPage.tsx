import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LoadingState, ErrorState, PageHeader } from '@/components/Layout';
import { getClipArt, getServicePhoto } from '@/lib/constants';
import type { Service, Project, ProjectImage } from '@/types';

export default function ServiceDetailPage() {
  const { service: slug } = useParams<{ service: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [projects, setProjects] = useState<(Project & { primary_image?: ProjectImage })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      const { data: serviceData, error: serviceError } = await supabase
        .from('services').select('*').eq('slug', slug).eq('published', true).maybeSingle();

      if (serviceError) { setError(serviceError.message); setLoading(false); return; }
      if (!serviceData) { setError('Service not found'); setLoading(false); return; }

      setService(serviceData);

      const { data: projectsData } = await supabase
        .from('projects').select('*').eq('published', true).eq('service_category', serviceData.name)
        .order('created_at', { ascending: false }).limit(6);

      const projectList = projectsData || [];
      if (projectList.length > 0) {
        const imagePromises = projectList.map((p) =>
          supabase.from('project_images').select('*').eq('project_id', p.id).order('is_primary', { ascending: false }).order('sort_order').limit(1).maybeSingle()
        );
        const imageResults = await Promise.all(imagePromises);
        setProjects(projectList.map((p, i) => ({ ...p, primary_image: imageResults[i].data || undefined })));
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) return <LoadingState />;
  if (error) return (
    <div>
      <PageHeader title="Service Not Found" />
      <ErrorState message={error} />
      <div style={{ marginTop: '12px' }}>
        <Link to="/services" className="btn-1996">&lt;&lt; Back to Services</Link>
      </div>
    </div>
  );
  if (!service) return <ErrorState message="Service not found" />;

  const clip = getClipArt(service.slug);
  const photo = getServicePhoto(service.slug);

  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <Link to="/services">&lt;&lt; Services</Link>
      </div>

      <PageHeader title={service.name} />

      {photo && (
        <div style={{ margin: '12px 0', border: '1px solid #808080', overflow: 'hidden' }}>
          <img
            src={photo.url}
            alt={photo.alt}
            style={{ width: '100%', height: 'auto', display: 'block' }}
            loading="lazy"
          />
        </div>
      )}

      <div className="clip-art-display">
        <img src={clip.img} alt={service.name} />
        <div className="small-text">{service.name}</div>
      </div>

      {service.description && (
        <div style={{ margin: '12px 0' }}>
          <p className="body-text">{service.description}</p>
        </div>
      )}

      <hr className="thin" />

      <div style={{ margin: '12px 0' }}>
        <h3 className="section-heading">Request This Service</h3>
        <p className="body-text">
          Need this type of work done? Submit a service request and we'll discuss your repair needs.
        </p>
        <div style={{ marginTop: '8px' }}>
          <Link to={`/request-service?service=${encodeURIComponent(service.name)}`} className="btn-1996 btn-primary">
            Request This Service
          </Link>
        </div>
      </div>

      {projects.length > 0 && (
        <>
          <hr className="thin" />
          <h3 className="section-heading">Related Projects</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', margin: '12px 0' }}>
            {projects.map((project) => (
              <div key={project.id} style={{ border: '1px solid #808080', padding: '8px', width: '180px' }}>
                <Link to={`/projects/${project.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ width: '100%', height: '100px', border: '1px solid #808080', overflow: 'hidden', marginBottom: '6px' }}>
                    {project.primary_image ? (
                      <img
                        src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/project-images/${project.primary_image.image_path}`}
                        alt={project.primary_image.alt_text || project.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={clip.img} alt="" style={{ width: '40px', height: '40px', opacity: 0.5 }} />
                      </div>
                    )}
                  </div>
                </Link>
                <div style={{ fontFamily: 'Arial', fontSize: '11px', color: '#666' }}>
                  Project {project.project_number || '---'}
                </div>
                <Link to={`/projects/${project.slug}`} style={{ fontSize: '13px' }}>{project.title}</Link>
              </div>
            ))}
          </div>
        </>
      )}

      <hr className="thin" />

      <div style={{ margin: '12px 0' }}>
        <table style={{ borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '4px 12px 4px 0', fontWeight: 'bold' }}>Phone:</td>
              <td style={{ padding: '4px 0' }}><a href="tel:+12163855864">216-385-5864</a></td>
            </tr>
            <tr>
              <td style={{ padding: '4px 12px 4px 0', fontWeight: 'bold' }}>Email:</td>
              <td style={{ padding: '4px 0' }}><a href="mailto:kinshzh@gmail.com">kinshzh@gmail.com</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
