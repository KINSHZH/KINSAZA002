import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LoadingState, ErrorState } from '@/components/Layout';
import { formatDate } from '@/lib/constants';
import type { Project, ProjectImage } from '@/types';

export default function ProjectDetailPage() {
  const { project: slug } = useParams<{ project: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<ProjectImage | null>(null);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      const { data: projectData, error: projectError } = await supabase
        .from('projects').select('*').eq('slug', slug).eq('published', true).maybeSingle();

      if (projectError) { setError(projectError.message); setLoading(false); return; }
      if (!projectData) { setError('Project not found'); setLoading(false); return; }

      setProject(projectData);
      const { data: imagesData } = await supabase
        .from('project_images').select('*').eq('project_id', projectData.id)
        .order('is_primary', { ascending: false }).order('sort_order');
      setImages(imagesData || []);
      setLoading(false);
    }
    load();
  }, [slug]);

  useEffect(() => {
    if (lightboxImage) {
      document.body.style.overflow = 'hidden';
      const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxImage(null); };
      window.addEventListener('keydown', handleKey);
      return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', handleKey); };
    }
  }, [lightboxImage]);

  if (loading) return <LoadingState />;
  if (error) return (
    <div>
      <h2 className="page-title">Project Not Found</h2>
      <ErrorState message={error} />
      <div style={{ marginTop: '12px' }}>
        <Link to="/projects" className="btn-1996">&lt;&lt; Back to Projects</Link>
      </div>
    </div>
  );
  if (!project) return <ErrorState message="Project not found" />;

  const imageUrl = (path: string) => `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/project-images/${path}`;

  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <Link to="/projects">&lt;&lt; Project Archive</Link>
      </div>

      <h2 className="page-title">{project.title}</h2>
      <div className="small-text" style={{ marginBottom: '8px' }}>
        Project {project.project_number || '---'}
      </div>
      <hr className="thick" />

      {/* Project info table */}
      <table style={{ borderCollapse: 'collapse', margin: '12px 0', width: '100%' }}>
        <tbody>
          <tr>
            <td style={{ padding: '4px 12px 4px 0', fontWeight: 'bold', width: '100px', fontSize: '13px' }}>Service:</td>
            <td style={{ padding: '4px 0', fontSize: '14px' }}>{project.service_category || 'General'}</td>
          </tr>
          <tr>
            <td style={{ padding: '4px 12px 4px 0', fontWeight: 'bold', fontSize: '13px' }}>Date:</td>
            <td style={{ padding: '4px 0', fontSize: '14px' }}>{formatDate(project.project_date)}</td>
          </tr>
          <tr>
            <td style={{ padding: '4px 12px 4px 0', fontWeight: 'bold', fontSize: '13px' }}>Status:</td>
            <td style={{ padding: '4px 0', fontSize: '14px', color: '#008000' }}>Completed</td>
          </tr>
        </tbody>
      </table>

      <hr className="thin" />

      {/* Description */}
      {project.description && (
        <div style={{ margin: '12px 0' }}>
          <h3 className="section-heading">Description</h3>
          <p className="body-text" style={{ whiteSpace: 'pre-wrap' }}>{project.description}</p>
        </div>
      )}

      {/* Photographs */}
      <h3 className="section-heading">Photographs</h3>
      {images.length === 0 ? (
        <div className="empty-box">No photographs uploaded for this project.</div>
      ) : (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '12px 0' }}>
            {images.map((img) => (
              <button
                key={img.id}
                onClick={() => setLightboxImage(img)}
                style={{ border: '1px solid #808080', padding: '0', background: '#fff', cursor: 'pointer' }}
                aria-label={img.alt_text || img.caption || 'View image'}
              >
                <img
                  src={imageUrl(img.image_path)}
                  alt={img.alt_text || img.caption || project.title}
                  style={{ width: '150px', height: '150px', objectFit: 'cover', display: 'block' }}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
          <div style={{ margin: '8px 0' }}>
            {images.filter((i) => i.caption).map((img) => (
              <div key={img.id} className="small-text" style={{ marginBottom: '2px' }}>
                <strong>[{img.image_type}]</strong> {img.caption}
              </div>
            ))}
          </div>
        </>
      )}

      <hr className="thin" />

      {/* Call to action */}
      <div style={{ margin: '16px 0' }}>
        <h3 className="section-heading">Need Similar Work?</h3>
        <div style={{ marginTop: '8px' }}>
          <Link to="/request-service" className="btn-1996 btn-primary">Request Service</Link>
        </div>
        <table style={{ borderCollapse: 'collapse', margin: '12px 0' }}>
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

      {/* Lightbox */}
      {lightboxImage && (
        <div className="lightbox-overlay" onClick={() => setLightboxImage(null)} role="dialog" aria-modal="true">
          <button className="lightbox-close" onClick={() => setLightboxImage(null)} aria-label="Close">
            [ Close ]
          </button>
          <img
            src={imageUrl(lightboxImage.image_path)}
            alt={lightboxImage.alt_text || lightboxImage.caption || project.title}
            onClick={(e) => e.stopPropagation()}
          />
          {lightboxImage.caption && (
            <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, textAlign: 'center', color: '#fff', fontFamily: 'Arial', fontSize: '13px' }}>
              {lightboxImage.caption}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
