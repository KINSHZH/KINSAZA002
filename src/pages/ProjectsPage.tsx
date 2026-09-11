import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LoadingState, ErrorState, EmptyState, PageHeader } from '@/components/Layout';
import { formatDateShort } from '@/lib/constants';
import type { Project, ProjectImage } from '@/types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<(Project & { primary_image?: ProjectImage })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('projects').select('*').eq('published', true).order('created_at', { ascending: false });
        if (error) throw error;

        const projectList = data || [];
        if (projectList.length > 0) {
          const imagePromises = projectList.map((p) =>
            supabase.from('project_images').select('*').eq('project_id', p.id).order('is_primary', { ascending: false }).order('sort_order').limit(1).maybeSingle()
          );
          const imageResults = await Promise.all(imagePromises);
          setProjects(projectList.map((p, i) => ({ ...p, primary_image: imageResults[i].data || undefined })));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
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
      <PageHeader title="Project Archive" subtitle="Completed work and repair records" />

      {projects.length === 0 ? (
        <EmptyState message="No projects have been published yet. Check back soon!" />
      ) : (
        <div>
          {projects.map((project, index) => (
            <div key={project.id} className="project-entry">
              <div className="project-entry-header">
                <span>
                  <strong>Project {project.project_number || String(index + 1).padStart(3, '0')}</strong>
                  {' -- '}
                  <Link to={`/projects/${project.slug}`}>{project.title}</Link>
                </span>
                <span style={{ color: '#666' }}>
                  {project.service_category || 'General'} | {formatDateShort(project.project_date)}
                </span>
              </div>
              <div className="project-entry-body">
                <Link to={`/projects/${project.slug}`} style={{ textDecoration: 'none' }}>
                  {project.primary_image ? (
                    <img
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/project-images/${project.primary_image.image_path}`}
                      alt={project.primary_image.alt_text || project.title}
                      className="project-thumb"
                      loading="lazy"
                    />
                  ) : (
                    <div className="project-thumb-placeholder">No Photo</div>
                  )}
                </Link>
                <div style={{ flex: '1', minWidth: '150px' }}>
                  <div style={{ fontFamily: 'Arial', fontSize: '12px', color: '#666' }}>
                    <strong>Service:</strong> {project.service_category || 'General'}
                  </div>
                  <div style={{ fontFamily: 'Arial', fontSize: '12px', color: '#666', marginBottom: '6px' }}>
                    <strong>Date:</strong> {formatDateShort(project.project_date)}
                  </div>
                  {project.description && (
                    <div className="small-text" style={{ marginBottom: '6px' }}>
                      {project.description.slice(0, 120)}
                      {project.description.length > 120 ? '...' : ''}
                    </div>
                  )}
                  <Link to={`/projects/${project.slug}`}>View Details &gt;&gt;</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <hr className="thin" />

      <div style={{ margin: '12px 0' }}>
        <Link to="/request-service" className="btn-1996 btn-primary">Request Service</Link>
      </div>
    </div>
  );
}
