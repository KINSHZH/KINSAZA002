import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { SERVICE_LIST } from '@/types';
import type { Project, ProjectImage } from '@/types';

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

export default function AdminProjectEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new' || !id;

  const [project, setProject] = useState<Partial<Project>>({
    title: '', slug: '', project_number: '', service_category: '', description: '',
    project_date: '', featured: false, published: false,
  });
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isNew) return;
    async function load() {
      const { data: proj, error: err } = await supabase.from('projects').select('*').eq('id', id!).maybeSingle();
      if (err) { setError(err.message); setLoading(false); return; }
      if (proj) {
        setProject(proj);
        const { data: imgs } = await supabase.from('project_images').select('*').eq('project_id', id!).order('sort_order');
        setImages(imgs || []);
      }
      setLoading(false);
    }
    load();
  }, [id, isNew]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);
    if (!project.title?.trim()) { setError('Title is required'); setSaving(false); return; }

    const slug = project.slug || slugify(project.title);
    const payload = {
      title: project.title.trim(), slug,
      project_number: project.project_number || null,
      service_category: project.service_category || null,
      description: project.description || null,
      project_date: project.project_date || null,
      featured: project.featured || false, published: project.published || false,
    };

    try {
      if (isNew) {
        const { data, error: ie } = await supabase.from('projects').insert(payload).select().single();
        if (ie) throw ie;
        navigate(`/admin/projects/${data.id}`, { replace: true });
      } else {
        const { error: ue } = await supabase.from('projects').update(payload).eq('id', id!);
        if (ue) throw ue;
        setProject((prev) => ({ ...prev, ...payload }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project');
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!id || isNew) return;
    if (!confirm('Delete this project? This cannot be undone.')) return;
    const { error: de } = await supabase.from('projects').delete().eq('id', id);
    if (de) { setError(de.message); return; }
    navigate('/admin/projects');
  }

  async function togglePublished() {
    if (isNew || !id) return;
    const v = !project.published;
    const { error: e } = await supabase.from('projects').update({ published: v }).eq('id', id);
    if (e) setError(e.message); else setProject((p) => ({ ...p, published: v }));
  }

  async function toggleFeatured() {
    if (isNew || !id) return;
    const v = !project.featured;
    const { error: e } = await supabase.from('projects').update({ featured: v }).eq('id', id);
    if (e) setError(e.message); else setProject((p) => ({ ...p, featured: v }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!id || isNew) { setError('Save the project before uploading images'); return; }
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const newImgs: ProjectImage[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;
        const ext = file.name.split('.').pop() || 'jpg';
        const fileName = `${id}/${Date.now()}_${i}.${ext}`;
        const { error: ue } = await supabase.storage.from('project-images').upload(fileName, file);
        if (ue) throw ue;
        const { data: imgData, error: ie } = await supabase.from('project_images').insert({
          project_id: id, image_path: fileName, sort_order: images.length + i,
          image_type: 'final', is_primary: images.length === 0 && i === 0,
        }).select().single();
        if (ie) throw ie;
        if (imgData) newImgs.push(imgData);
      }
      setImages([...images, ...newImgs]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally { setUploading(false); e.target.value = ''; }
  }

  async function deleteImage(imageId: string, imagePath: string) {
    await supabase.storage.from('project-images').remove([imagePath]);
    await supabase.from('project_images').delete().eq('id', imageId);
    setImages(images.filter((img) => img.id !== imageId));
  }

  async function setPrimaryImage(imageId: string) {
    await supabase.from('project_images').update({ is_primary: false }).eq('project_id', id!);
    await supabase.from('project_images').update({ is_primary: true }).eq('id', imageId);
    setImages(images.map((img) => ({ ...img, is_primary: img.id === imageId })));
  }

  async function updateImageField(imageId: string, field: 'caption' | 'alt_text' | 'image_type', value: string) {
    await supabase.from('project_images').update({ [field]: value }).eq('id', imageId);
    setImages(images.map((img) => img.id === imageId ? { ...img, [field]: value } : img));
  }

  if (loading) return <div className="loading-text">Loading...</div>;

  const imageUrl = (path: string) => `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/project-images/${path}`;

  return (
    <div>
      <div style={{ marginBottom: '8px' }}>
        <Link to="/admin/projects">&lt;&lt; Projects</Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div className="admin-title" style={{ margin: 0 }}>{isNew ? 'New Project' : 'Edit Project'}</div>
        {!isNew && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={toggleFeatured} className="btn-1996" style={project.featured ? { background: '#000080', color: '#fff' } : {}}>
              {project.featured ? 'Featured' : 'Feature'}
            </button>
            <button onClick={togglePublished} className="btn-1996" style={project.published ? { background: '#000080', color: '#fff' } : {}}>
              {project.published ? 'Published' : 'Publish'}
            </button>
          </div>
        )}
      </div>

      {error && <div className="error-box" style={{ marginBottom: '12px' }}>{error}</div>}

      <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <div style={{ marginBottom: '10px' }}>
            <label className="form-label" htmlFor="proj-title">Title *</label>
            <input id="proj-title" type="text" className="admin-input" value={project.title || ''} onChange={(e) => {
              const v = e.target.value;
              setProject((p) => ({ ...p, title: v, slug: isNew ? slugify(v) : p.slug }));
            }} required />
          </div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <div style={{ flex: 1 }}>
              <label className="form-label" htmlFor="proj-num">Project Number</label>
              <input id="proj-num" type="text" className="admin-input" value={project.project_number || ''} onChange={(e) => setProject((p) => ({ ...p, project_number: e.target.value }))} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label" htmlFor="proj-date">Project Date</label>
              <input id="proj-date" type="date" className="admin-input" value={project.project_date || ''} onChange={(e) => setProject((p) => ({ ...p, project_date: e.target.value }))} />
            </div>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label className="form-label" htmlFor="proj-service">Service Category</label>
            <select id="proj-service" className="admin-input" value={project.service_category || ''} onChange={(e) => setProject((p) => ({ ...p, service_category: e.target.value }))}>
              <option value="">-- Select --</option>
              {SERVICE_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label className="form-label" htmlFor="proj-slug">Slug (URL)</label>
            <input id="proj-slug" type="text" className="admin-input" value={project.slug || ''} onChange={(e) => setProject((p) => ({ ...p, slug: slugify(e.target.value) }))} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label className="form-label" htmlFor="proj-desc">Description</label>
            <textarea id="proj-desc" className="admin-input" rows={6} value={project.description || ''} onChange={(e) => setProject((p) => ({ ...p, description: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button type="submit" disabled={saving} className="btn-1996 btn-primary">{saving ? 'Saving...' : 'Save'}</button>
            {!isNew && <button type="button" onClick={handleDelete} className="btn-1996 btn-danger">Delete</button>}
          </div>
        </div>

        <div>
          <div className="form-label" style={{ marginBottom: '6px' }}>Photographs</div>
          <hr className="thin" />
          {isNew ? (
            <div className="empty-box">Save the project first to upload images</div>
          ) : (
            <>
              <div style={{ border: '2px dashed #808080', padding: '12px', textAlign: 'center', marginBottom: '12px', background: '#f8f8f8' }}>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} id="proj-img-upload" style={{ fontSize: '12px' }} />
                <div className="small-text" style={{ marginTop: '4px' }}>{uploading ? 'Uploading...' : 'Upload photos'}</div>
              </div>
              {images.length === 0 ? <div className="empty-box">No photos uploaded</div> : (
                <div>
                  {images.map((img) => (
                    <div key={img.id} style={{ border: '1px solid #808080', padding: '8px', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <img src={imageUrl(img.image_path)} alt={img.alt_text || ''} style={{ width: '60px', height: '60px', objectFit: 'cover', border: '1px solid #808080' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '4px' }}>
                            {img.is_primary && <span className="badge badge-featured">Primary</span>}
                            <button type="button" onClick={() => setPrimaryImage(img.id)} style={{ fontSize: '11px', color: '#0000ee', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Set Primary</button>
                          </div>
                          <input type="text" placeholder="Caption..." className="admin-input" style={{ fontSize: '12px', marginBottom: '4px' }} value={img.caption || ''} onChange={(e) => updateImageField(img.id, 'caption', e.target.value)} />
                          <input type="text" placeholder="Alt text..." className="admin-input" style={{ fontSize: '12px', marginBottom: '4px' }} value={img.alt_text || ''} onChange={(e) => updateImageField(img.id, 'alt_text', e.target.value)} />
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <select className="admin-input" style={{ fontSize: '12px', flex: 1 }} value={img.image_type} onChange={(e) => updateImageField(img.id, 'image_type', e.target.value)}>
                              <option value="before">Before</option>
                              <option value="after">After</option>
                              <option value="progress">Progress</option>
                              <option value="final">Final</option>
                            </select>
                            <button type="button" onClick={() => deleteImage(img.id, img.image_path)} className="btn-1996 btn-danger" style={{ fontSize: '11px', padding: '2px 6px' }}>Del</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
}
