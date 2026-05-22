import React, { useState, useRef, useEffect } from 'react';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import './ResumePage.css';

const TEMPLATES = [
  { id: 'modern', name: 'Modern', color: '#00d4ff' },
  { id: 'classic', name: 'Classic', color: '#2c3e50' },
  { id: 'minimal', name: 'Minimal', color: '#e74c3c' },
  { id: 'professional', name: 'Professional', color: '#27ae60' },
  { id: 'creative', name: 'Creative', color: '#9b59b6' },
  { id: 'elegant', name: 'Elegant', color: '#c0392b' },
  { id: 'bold', name: 'Bold', color: '#f39c12' },
  { id: 'corporate', name: 'Corporate', color: '#1abc9c' },
  { id: 'dark', name: 'Dark', color: '#e74c3c' },
  { id: 'tech', name: 'Tech', color: '#00ff88' },
  { id: 'executive', name: 'Executive', color: '#8e44ad' },
  { id: 'simple', name: 'Simple', color: '#3498db' },
  { id: 'academic', name: 'Academic Pro', color: '#4a5568' },
  { id: 'modern_executive', name: 'Executive Pro', color: '#1e3a8a' },
  { id: 'faang_ats', name: 'FAANG ATS', color: '#1f2937' },
  { id: 'creative_sidebar', name: 'Creative Sidebar', color: '#ec4899' },
  { id: 'elegant_serif', name: 'Elegant Serif', color: '#7c3aed' },
];

const VISIBLE_COUNT = 6;

const defaultData = {
  personal: { name: 'Your Name', title: 'Professional Title', email: 'email@example.com', phone: '+1 234 567 890', location: 'City, Country', website: 'yourwebsite.com', linkedin: 'linkedin.com/in/yourname', summary: 'A passionate professional with experience in...', photo: '' },
  experience: [{ id: 1, company: 'Company Name', position: 'Job Title', startDate: '2022-01', endDate: '', current: true, description: '• Led team of 5 engineers\n• Increased performance by 40%\n• Delivered projects on time' }],
  education: [{ id: 1, school: 'University Name', degree: 'Bachelor of Science', field: 'Computer Science', startDate: '2018-09', endDate: '2022-06', gpa: '3.8' }],
  skills: [{ id: 1, category: 'Technical', items: 'JavaScript, React, Node.js, Python' }, { id: 2, category: 'Soft Skills', items: 'Leadership, Communication, Problem Solving' }],
  languages: [{ id: 1, language: 'English', level: 'Native' }, { id: 2, language: 'Spanish', level: 'Intermediate' }],
  certifications: [{ id: 1, name: 'AWS Certified Developer', issuer: 'Amazon', date: '2023-06' }],
  projects: [{ id: 1, name: 'Project Name', description: 'Brief description of the project', tech: 'React, Node.js', link: '' }]
};

export default function ResumePage() {
  const [data, setData] = useState(defaultData);
  const [template, setTemplate] = useState('modern');
  const [activeTab, setActiveTab] = useState('personal');
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const previewRef = useRef(null);

  // --- Zoom and View Mode States ---
  const [viewMode, setViewMode] = useState('split'); // 'split' or 'full'
  const [zoom, setZoom] = useState(85);
  const [zoomMode, setZoomMode] = useState('auto'); // 'auto' or 'manual'
  const [autoScale, setAutoScale] = useState(0.85);
  const [previewHeight, setPreviewHeight] = useState(1123);
  const previewParentRef = useRef(null);

  const currentScale = zoomMode === 'auto' ? autoScale : zoom / 100;

  const handleZoomIn = () => {
    setZoomMode('manual');
    setZoom(prev => Math.min(prev + 10, 150));
  };

  const handleZoomOut = () => {
    setZoomMode('manual');
    setZoom(prev => Math.max(prev - 10, 40));
  };

  const handleZoomFit = () => {
    setZoomMode('auto');
  };

  // Track size changes of the parent container to automatically scale the preview
  useEffect(() => {
    if (!previewParentRef.current) return;
    
    const updateScale = () => {
      const parent = previewParentRef.current;
      if (!parent) return;
      
      const parentWidth = parent.clientWidth;
      const padding = 48; // total padding
      const targetWidth = 794; // standard A4 page width
      
      const scale = (parentWidth - padding) / targetWidth;
      const clampedScale = Math.max(0.3, Math.min(scale, 1.5));
      setAutoScale(clampedScale);
    };

    updateScale();

    const observer = new ResizeObserver(() => {
      updateScale();
    });
    
    observer.observe(previewParentRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [viewMode]);

  // Monitor height of preview content
  useEffect(() => {
    if (!previewRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setPreviewHeight(entry.contentRect.height);
      }
    });
    
    observer.observe(previewRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [data, template]);

  const visibleTemplates = showAllTemplates ? TEMPLATES : TEMPLATES.slice(0, VISIBLE_COUNT);

  const updatePersonal = (field, value) => setData(d => ({ ...d, personal: { ...d.personal, [field]: value } }));

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => updatePersonal('photo', reader.result);
    reader.readAsDataURL(file);
  };

  const updateItem = (section, id, field, value) => setData(d => ({ ...d, [section]: d[section].map(i => i.id === id ? { ...i, [field]: value } : i) }));
  const addItem = (section, tmpl) => setData(d => ({ ...d, [section]: [...d[section], { ...tmpl, id: Date.now() }] }));
  const removeItem = (section, id) => setData(d => ({ ...d, [section]: d[section].filter(i => i.id !== id) }));

  const handlePrint = () => {
    const printContent = previewRef.current.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>${data.personal.name} - Resume</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; }
        @page { margin: 0.5in; }
        @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
      </style></head>
      <body>${printContent}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const tabs = [
    { id: 'personal', label: '👤 Personal' },
    { id: 'experience', label: '💼 Experience' },
    { id: 'education', label: '🎓 Education' },
    { id: 'skills', label: '⚡ Skills' },
    { id: 'languages', label: '🌐 Languages' },
    { id: 'certifications', label: '🏆 Certifications' },
    { id: 'projects', label: '🚀 Projects' },
  ];

  return (
    <div className="resume-page-container pdf-rotate-page">
      <SEO
        title="Free Resume Builder Online 2026 - ATS Friendly Templates, PDF Download | ZeroWaveLabs"
        description="Build a professional ATS-friendly resume online for free in 2026. Choose from 12 beautiful templates, add your photo, experience, education and skills. Download as PDF instantly. No sign up required."
        keywords="free resume builder online 2026, free resume maker, CV builder online free, ATS friendly resume builder"
        url="https://zerowavelabs.com/tools/resume-builder"
      />
      
      <section className="tool-header-hero">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="intelligence-badge">Intelligence Tool</div>
          <h1>AI Resume Builder</h1>
          <p>Create professional, ATS-friendly resumes in minutes. Choose a template and build your career path.</p>
        </motion.div>
      </section>

      <div className="workspace-container">
        {/* ─── TEMPLATE SELECTOR ─── */}
        <div className="template-selector">

        <div className="template-grid">
          {visibleTemplates.map(t => (
            <div
              key={t.id}
              className={`template-card ${template === t.id ? 'active' : ''}`}
              onClick={() => setTemplate(t.id)}
            >
              <div className="template-preview-mini" style={{ borderTop: `4px solid ${t.color}` }}>
                <div style={{ width: '60%', height: '8px', background: t.color, borderRadius: '2px', marginBottom: '6px' }} />
                <div style={{ width: '100%', height: '4px', background: '#eee', borderRadius: '2px', marginBottom: '4px' }} />
                <div style={{ width: '80%', height: '4px', background: '#eee', borderRadius: '2px', marginBottom: '4px' }} />
                <div style={{ width: '90%', height: '4px', background: '#eee', borderRadius: '2px' }} />
              </div>
              <span>{t.name}</span>
              {template === t.id && <div className="template-check">✓</div>}
            </div>
          ))}
        </div>

        {/* ─── SHOW MORE / LESS BUTTON ─── */}
        <div className="template-toggle-wrap">
          <button
            className="template-toggle-btn"
            onClick={() => setShowAllTemplates(prev => !prev)}
          >
            {showAllTemplates ? (
              <>
                <span className="toggle-icon toggle-icon--up">▴</span>
                Show less
              </>
            ) : (
              <>
                <span className="toggle-icon">▾</span>
                View all {TEMPLATES.length} templates
              </>
            )}
          </button>

          {/* dots indicator */}
          <div className="template-dots">
            <span className={`template-dot ${!showAllTemplates ? 'active' : ''}`} />
            <span className={`template-dot ${showAllTemplates ? 'active' : ''}`} />
          </div>
        </div>
      </div>

      {/* ─── BUILDER ─── */}
      <div className={`resume-builder ${viewMode === 'full' ? 'full-preview-mode' : ''}`}>
        <div className="resume-form">
          <div className="form-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`form-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="form-content">
            {activeTab === 'personal' && (
              <div className="form-section">
                <div className="form-row">
                  <div className="form-group"><label>Full Name</label><input value={data.personal.name} onChange={e => updatePersonal('name', e.target.value)} /></div>
                  <div className="form-group"><label>Professional Title</label><input value={data.personal.title} onChange={e => updatePersonal('title', e.target.value)} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Email</label><input value={data.personal.email} onChange={e => updatePersonal('email', e.target.value)} /></div>
                  <div className="form-group"><label>Phone</label><input value={data.personal.phone} onChange={e => updatePersonal('phone', e.target.value)} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Location</label><input value={data.personal.location} onChange={e => updatePersonal('location', e.target.value)} /></div>
                  <div className="form-group"><label>Website</label><input value={data.personal.website} onChange={e => updatePersonal('website', e.target.value)} /></div>
                </div>
                <div className="form-group"><label>LinkedIn</label><input value={data.personal.linkedin} onChange={e => updatePersonal('linkedin', e.target.value)} /></div>
                <div className="form-group">
                  <label>Profile Photo (optional)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {data.personal.photo ? (
                      <div style={{ position: 'relative' }}>
                        <img src={data.personal.photo} alt="Profile" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00d4ff' }} />
                        <button type="button" onClick={() => updatePersonal('photo', '')} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px', fontWeight: '700' }}>✕</button>
                      </div>
                    ) : (
                      <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(0,212,255,0.1)', border: '2px dashed rgba(0,212,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👤</div>
                    )}
                    <div>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ color: 'white', fontSize: '12px' }} />
                      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '4px' }}>JPG, PNG — Max 5MB</p>
                    </div>
                  </div>
                </div>
                <div className="form-group"><label>Professional Summary</label><textarea rows="4" value={data.personal.summary} onChange={e => updatePersonal('summary', e.target.value)} /></div>
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="form-section">
                {data.experience.map(exp => (
                  <div key={exp.id} className="form-item-card">
                    <div className="form-item-header">
                      <h4>Experience</h4>
                      <button className="remove-btn" onClick={() => removeItem('experience', exp.id)}>✕ Remove</button>
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label>Company</label><input value={exp.company} onChange={e => updateItem('experience', exp.id, 'company', e.target.value)} /></div>
                      <div className="form-group"><label>Position</label><input value={exp.position} onChange={e => updateItem('experience', exp.id, 'position', e.target.value)} /></div>
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label>Start Date</label><input type="month" value={exp.startDate} onChange={e => updateItem('experience', exp.id, 'startDate', e.target.value)} /></div>
                      <div className="form-group"><label>End Date</label><input type="month" value={exp.endDate} disabled={exp.current} onChange={e => updateItem('experience', exp.id, 'endDate', e.target.value)} /></div>
                    </div>
                    <div className="form-group checkbox-group">
                      <input type="checkbox" id={`current-${exp.id}`} checked={exp.current} onChange={e => updateItem('experience', exp.id, 'current', e.target.checked)} />
                      <label htmlFor={`current-${exp.id}`}>Currently working here</label>
                    </div>
                    <div className="form-group"><label>Description (use • for bullets)</label><textarea rows="4" value={exp.description} onChange={e => updateItem('experience', exp.id, 'description', e.target.value)} /></div>
                  </div>
                ))}
                <button className="add-btn" onClick={() => addItem('experience', { company: '', position: '', startDate: '', endDate: '', current: false, description: '' })}>+ Add Experience</button>
              </div>
            )}

            {activeTab === 'education' && (
              <div className="form-section">
                {data.education.map(edu => (
                  <div key={edu.id} className="form-item-card">
                    <div className="form-item-header">
                      <h4>Education</h4>
                      <button className="remove-btn" onClick={() => removeItem('education', edu.id)}>✕ Remove</button>
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label>School / University</label><input value={edu.school} onChange={e => updateItem('education', edu.id, 'school', e.target.value)} /></div>
                      <div className="form-group"><label>Degree</label><input value={edu.degree} onChange={e => updateItem('education', edu.id, 'degree', e.target.value)} /></div>
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label>Field of Study</label><input value={edu.field} onChange={e => updateItem('education', edu.id, 'field', e.target.value)} /></div>
                      <div className="form-group"><label>GPA (optional)</label><input value={edu.gpa} onChange={e => updateItem('education', edu.id, 'gpa', e.target.value)} /></div>
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label>Start Date</label><input type="month" value={edu.startDate} onChange={e => updateItem('education', edu.id, 'startDate', e.target.value)} /></div>
                      <div className="form-group"><label>End Date</label><input type="month" value={edu.endDate} onChange={e => updateItem('education', edu.id, 'endDate', e.target.value)} /></div>
                    </div>
                  </div>
                ))}
                <button className="add-btn" onClick={() => addItem('education', { school: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' })}>+ Add Education</button>
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="form-section">
                {data.skills.map(skill => (
                  <div key={skill.id} className="form-item-card">
                    <div className="form-item-header">
                      <h4>Skill Category</h4>
                      <button className="remove-btn" onClick={() => removeItem('skills', skill.id)}>✕ Remove</button>
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label>Category Name</label><input value={skill.category} onChange={e => updateItem('skills', skill.id, 'category', e.target.value)} /></div>
                      <div className="form-group"><label>Skills (comma separated)</label><input value={skill.items} onChange={e => updateItem('skills', skill.id, 'items', e.target.value)} /></div>
                    </div>
                  </div>
                ))}
                <button className="add-btn" onClick={() => addItem('skills', { category: '', items: '' })}>+ Add Skill Category</button>
              </div>
            )}

            {activeTab === 'languages' && (
              <div className="form-section">
                {data.languages.map(lang => (
                  <div key={lang.id} className="form-item-card">
                    <div className="form-item-header">
                      <h4>Language</h4>
                      <button className="remove-btn" onClick={() => removeItem('languages', lang.id)}>✕ Remove</button>
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label>Language</label><input value={lang.language} onChange={e => updateItem('languages', lang.id, 'language', e.target.value)} /></div>
                      <div className="form-group"><label>Proficiency Level</label>
                        <select value={lang.level} onChange={e => updateItem('languages', lang.id, 'level', e.target.value)}>
                          <option>Native</option><option>Fluent</option><option>Advanced</option><option>Intermediate</option><option>Beginner</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                <button className="add-btn" onClick={() => addItem('languages', { language: '', level: 'Intermediate' })}>+ Add Language</button>
              </div>
            )}

            {activeTab === 'certifications' && (
              <div className="form-section">
                {data.certifications.map(cert => (
                  <div key={cert.id} className="form-item-card">
                    <div className="form-item-header">
                      <h4>Certification</h4>
                      <button className="remove-btn" onClick={() => removeItem('certifications', cert.id)}>✕ Remove</button>
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label>Certification Name</label><input value={cert.name} onChange={e => updateItem('certifications', cert.id, 'name', e.target.value)} /></div>
                      <div className="form-group"><label>Issuing Organization</label><input value={cert.issuer} onChange={e => updateItem('certifications', cert.id, 'issuer', e.target.value)} /></div>
                    </div>
                    <div className="form-group"><label>Date Issued</label><input type="month" value={cert.date} onChange={e => updateItem('certifications', cert.id, 'date', e.target.value)} /></div>
                  </div>
                ))}
                <button className="add-btn" onClick={() => addItem('certifications', { name: '', issuer: '', date: '' })}>+ Add Certification</button>
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="form-section">
                {data.projects.map(proj => (
                  <div key={proj.id} className="form-item-card">
                    <div className="form-item-header">
                      <h4>Project</h4>
                      <button className="remove-btn" onClick={() => removeItem('projects', proj.id)}>✕ Remove</button>
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label>Project Name</label><input value={proj.name} onChange={e => updateItem('projects', proj.id, 'name', e.target.value)} /></div>
                      <div className="form-group"><label>Technologies Used</label><input value={proj.tech} onChange={e => updateItem('projects', proj.id, 'tech', e.target.value)} /></div>
                    </div>
                    <div className="form-group"><label>Project Link (optional)</label><input value={proj.link} onChange={e => updateItem('projects', proj.id, 'link', e.target.value)} /></div>
                    <div className="form-group"><label>Description</label><textarea rows="3" value={proj.description} onChange={e => updateItem('projects', proj.id, 'description', e.target.value)} /></div>
                  </div>
                ))}
                <button className="add-btn" onClick={() => addItem('projects', { name: '', description: '', tech: '', link: '' })}>+ Add Project</button>
              </div>
            )}
          </div>
        </div>

        <div className="resume-preview">
          <div className="preview-toolbar">
            <div className="toolbar-left">
              <span className="toolbar-title">Live Preview</span>
              <div className="view-mode-toggles">
                <button 
                  className={`view-mode-btn ${viewMode === 'split' ? 'active' : ''}`}
                  onClick={() => setViewMode('split')}
                  title="Split View (Form + Preview)"
                >
                  ✏️ Edit Mode
                </button>
                <button 
                  className={`view-mode-btn ${viewMode === 'full' ? 'active' : ''}`}
                  onClick={() => setViewMode('full')}
                  title="Full Page View"
                >
                  📄 Full Page
                </button>
              </div>
            </div>
            
            <div className="toolbar-right">
              {viewMode === 'full' && (
                <button 
                  className="print-btn" 
                  style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.2)' }}
                  onClick={() => setViewMode('split')}
                  title="Return to edit fields"
                >
                  ✏️ Edit Resume
                </button>
              )}
              <div className="zoom-controls">
                <button className="zoom-btn" onClick={handleZoomOut} title="Zoom Out">−</button>
                <span className="zoom-value" onClick={handleZoomFit} title="Click to Fit Page">
                  {zoomMode === 'auto' ? `Fit (${Math.round(autoScale * 100)}%)` : `${zoom}%`}
                </span>
                <button className="zoom-btn" onClick={handleZoomIn} title="Zoom In">+</button>
              </div>
              <button className="print-btn" onClick={handlePrint}>🖨️ Print / PDF</button>
            </div>
          </div>
          
          <div className="preview-frame" ref={previewParentRef}>
            <div 
              className="preview-scale-wrapper" 
              style={{ 
                width: `${794 * currentScale}px`, 
                height: `${previewHeight * currentScale}px`,
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start'
              }}
            >
              <div 
                className="preview-container" 
                ref={previewRef}
                style={{ 
                  width: '794px',
                  minHeight: '1123px',
                  transform: `scale(${currentScale})`,
                  transformOrigin: 'top center',
                  flexShrink: 0
                }}
              >
                <ResumeTemplate data={data} template={template} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Side Toggle Button */}
      <button 
        className={`floating-side-toggle ${viewMode === 'full' ? 'active' : ''}`}
        onClick={() => setViewMode(prev => prev === 'full' ? 'split' : 'full')}
        title={viewMode === 'full' ? "Switch to Split View" : "Switch to Full Page View"}
      >
        {viewMode === 'full' ? '✏️ Edit Mode' : '📄 Full Page'}
      </button>
    </div>
  </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month) - 1]} ${year}`;
}

function ResumeTemplate({ data, template }) {
  const t = TEMPLATES.find(t => t.id === template);
  const color = t?.color || '#00d4ff';

  if (template === 'modern') return <ModernTemplate data={data} color={color} />;
  if (template === 'classic') return <ClassicTemplate data={data} color={color} />;
  if (template === 'minimal') return <MinimalTemplate data={data} color={color} />;
  if (template === 'professional') return <ProfessionalTemplate data={data} color={color} />;
  if (template === 'creative') return <CreativeTemplate data={data} color={color} />;
  if (template === 'elegant') return <ElegantTemplate data={data} color={color} />;
  if (template === 'bold') return <BoldTemplate data={data} color={color} />;
  if (template === 'corporate') return <CorporateTemplate data={data} color={color} />;
  if (template === 'dark') return <DarkTemplate data={data} color={color} />;
  if (template === 'tech') return <TechTemplate data={data} color={color} />;
  if (template === 'executive') return <ExecutiveTemplate data={data} color={color} />;
  if (template === 'simple') return <SimpleTemplate data={data} color={color} />;
  if (template === 'academic') return <AcademicTemplate data={data} color={color} />;
  if (template === 'modern_executive') return <ModernExecutiveTemplate data={data} color={color} />;
  if (template === 'faang_ats') return <FaangAtsTemplate data={data} color={color} />;
  if (template === 'creative_sidebar') return <CreativeSidebarTemplate data={data} color={color} />;
  if (template === 'elegant_serif') return <ElegantSerifTemplate data={data} color={color} />;
  return <ModernTemplate data={data} color={color} />;
}

// =================== TEMPLATE 1: MODERN ===================
function ModernTemplate({ data, color }) {
  const { personal, experience, education, skills, languages, certifications, projects } = data;
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#222', fontSize: '13px', lineHeight: '1.5', background: '#fff', minHeight: '297mm' }}>
      <div style={{ background: color, color: '#fff', padding: '32px 40px', position: 'relative', display: 'flex', alignItems: 'center', gap: '24px' }}>
        {personal.photo && <img src={personal.photo} alt="" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.6)', flexShrink: 0 }} />}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 4px', letterSpacing: '1px' }}>{personal.name}</h1>
          <p style={{ fontSize: '15px', opacity: 0.9, margin: '0 0 16px', fontWeight: '300' }}>{personal.title}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '12px', opacity: 0.9 }}>
            {personal.email && <span>✉ {personal.email}</span>}
            {personal.phone && <span>📱 {personal.phone}</span>}
            {personal.location && <span>📍 {personal.location}</span>}
            {personal.website && <span>🌐 {personal.website}</span>}
            {personal.linkedin && <span>💼 {personal.linkedin}</span>}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '33%', background: '#f8f9fa', padding: '24px 20px', minHeight: '100%' }}>
          {personal.summary && (
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: color, marginBottom: '10px' }}>Profile</h2>
              <p style={{ fontSize: '12px', color: '#555', lineHeight: '1.7' }}>{personal.summary}</p>
            </div>
          )}
          {skills.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: color, marginBottom: '10px' }}>Skills</h2>
              {skills.map(s => (
                <div key={s.id} style={{ marginBottom: '10px' }}>
                  <p style={{ fontWeight: '600', fontSize: '11px', marginBottom: '4px' }}>{s.category}</p>
                  <p style={{ fontSize: '11px', color: '#666' }}>{s.items}</p>
                </div>
              ))}
            </div>
          )}
          {languages.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: color, marginBottom: '10px' }}>Languages</h2>
              {languages.map(l => (
                <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px' }}>
                  <span>{l.language}</span><span style={{ color: '#888' }}>{l.level}</span>
                </div>
              ))}
            </div>
          )}
          {certifications.length > 0 && (
            <div>
              <h2 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: color, marginBottom: '10px' }}>Certifications</h2>
              {certifications.map(c => (
                <div key={c.id} style={{ marginBottom: '8px' }}>
                  <p style={{ fontWeight: '600', fontSize: '11px' }}>{c.name}</p>
                  <p style={{ fontSize: '11px', color: '#888' }}>{c.issuer} {c.date && `• ${formatDate(c.date)}`}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ flex: 1, padding: '24px 32px' }}>
          {experience.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: color, borderBottom: `2px solid ${color}`, paddingBottom: '6px', marginBottom: '16px' }}>Experience</h2>
              {experience.map(exp => (
                <div key={exp.id} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div><p style={{ fontWeight: '700', fontSize: '13px' }}>{exp.position}</p><p style={{ color: '#666', fontSize: '12px' }}>{exp.company}</p></div>
                    <p style={{ fontSize: '11px', color: '#888', whiteSpace: 'nowrap' }}>{formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}</p>
                  </div>
                  {exp.description && <p style={{ marginTop: '6px', fontSize: '12px', color: '#555', whiteSpace: 'pre-line', lineHeight: '1.7' }}>{exp.description}</p>}
                </div>
              ))}
            </div>
          )}
          {education.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: color, borderBottom: `2px solid ${color}`, paddingBottom: '6px', marginBottom: '16px' }}>Education</h2>
              {education.map(edu => (
                <div key={edu.id} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div><p style={{ fontWeight: '700', fontSize: '13px' }}>{edu.degree} {edu.field && `in ${edu.field}`}</p><p style={{ color: '#666', fontSize: '12px' }}>{edu.school} {edu.gpa && `• GPA: ${edu.gpa}`}</p></div>
                    <p style={{ fontSize: '11px', color: '#888', whiteSpace: 'nowrap' }}>{formatDate(edu.startDate)} — {formatDate(edu.endDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {projects.length > 0 && (
            <div>
              <h2 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: color, borderBottom: `2px solid ${color}`, paddingBottom: '6px', marginBottom: '16px' }}>Projects</h2>
              {projects.map(p => (
                <div key={p.id} style={{ marginBottom: '12px' }}>
                  <p style={{ fontWeight: '700', fontSize: '13px' }}>{p.name} {p.tech && <span style={{ fontWeight: '400', color: '#888', fontSize: '11px' }}>• {p.tech}</span>}</p>
                  <p style={{ fontSize: '12px', color: '#555', marginTop: '3px' }}>{p.description}</p>
                  {p.link && <p style={{ fontSize: '11px', color: color }}>{p.link}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =================== TEMPLATE 2: CLASSIC ===================
function ClassicTemplate({ data, color }) {
  const { personal, experience, education, skills, languages, certifications } = data;
  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#222', fontSize: '13px', lineHeight: '1.6', background: '#fff', padding: '40px 48px', minHeight: '297mm' }}>
      <div style={{ textAlign: 'center', borderBottom: `3px double ${color}`, paddingBottom: '20px', marginBottom: '24px' }}>
        {personal.photo && <div style={{ marginBottom: '14px' }}><img src={personal.photo} alt="" style={{ width: '85px', height: '85px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${color}` }} /></div>}
        <h1 style={{ fontSize: '30px', fontWeight: '700', margin: '0 0 6px', letterSpacing: '3px', textTransform: 'uppercase' }}>{personal.name}</h1>
        <p style={{ fontSize: '14px', color: '#666', margin: '0 0 12px', fontStyle: 'italic' }}>{personal.title}</p>
        <p style={{ fontSize: '11px', color: '#888' }}>{[personal.email, personal.phone, personal.location, personal.website].filter(Boolean).join(' | ')}</p>
      </div>
      {personal.summary && <div style={{ marginBottom: '20px' }}><p style={{ textAlign: 'justify', color: '#444', fontStyle: 'italic' }}>{personal.summary}</p></div>}
      {experience.length > 0 && (
        <div style={{ marginBottom: '22px' }}>
          <h2 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '3px', borderBottom: `1px solid ${color}`, paddingBottom: '4px', color: color, marginBottom: '14px' }}>Professional Experience</h2>
          {experience.map(exp => (
            <div key={exp.id} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ fontWeight: '700' }}>{exp.position}</p>
                <p style={{ fontSize: '12px', color: '#888' }}>{formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}</p>
              </div>
              <p style={{ fontStyle: 'italic', color: '#666', fontSize: '12px' }}>{exp.company}</p>
              {exp.description && <p style={{ marginTop: '6px', color: '#555', whiteSpace: 'pre-line', fontSize: '12px' }}>{exp.description}</p>}
            </div>
          ))}
        </div>
      )}
      {education.length > 0 && (
        <div style={{ marginBottom: '22px' }}>
          <h2 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '3px', borderBottom: `1px solid ${color}`, paddingBottom: '4px', color: color, marginBottom: '14px' }}>Education</h2>
          {education.map(edu => (
            <div key={edu.id} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p style={{ fontWeight: '700' }}>{edu.degree} {edu.field && `in ${edu.field}`}</p>
                <p style={{ fontSize: '12px', color: '#888' }}>{formatDate(edu.startDate)} — {formatDate(edu.endDate)}</p>
              </div>
              <p style={{ fontStyle: 'italic', color: '#666', fontSize: '12px' }}>{edu.school} {edu.gpa && `• GPA: ${edu.gpa}`}</p>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: '40px' }}>
        {skills.length > 0 && (
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '3px', borderBottom: `1px solid ${color}`, paddingBottom: '4px', color: color, marginBottom: '10px' }}>Skills</h2>
            {skills.map(s => <p key={s.id} style={{ marginBottom: '4px', fontSize: '12px' }}><strong>{s.category}:</strong> {s.items}</p>)}
          </div>
        )}
        {languages.length > 0 && (
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '3px', borderBottom: `1px solid ${color}`, paddingBottom: '4px', color: color, marginBottom: '10px' }}>Languages</h2>
            {languages.map(l => <p key={l.id} style={{ marginBottom: '4px', fontSize: '12px' }}>{l.language} — {l.level}</p>)}
          </div>
        )}
      </div>
    </div>
  );
}

// =================== TEMPLATE 3: MINIMAL ===================
function MinimalTemplate({ data, color }) {
  const { personal, experience, education, skills, languages } = data;
  return (
    <div style={{ fontFamily: '"Helvetica Neue", Helvetica, sans-serif', color: '#111', fontSize: '12px', lineHeight: '1.6', background: '#fff', padding: '48px', minHeight: '297mm' }}>
      <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        {personal.photo && <img src={personal.photo} alt="" style={{ width: '85px', height: '85px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${color}`, flexShrink: 0 }} />}
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '300', margin: '0 0 4px', letterSpacing: '-1px' }}>{personal.name}</h1>
          <p style={{ fontSize: '14px', color: color, margin: '0 0 16px', fontWeight: '500' }}>{personal.title}</p>
          <div style={{ display: 'flex', gap: '20px', fontSize: '11px', color: '#777' }}>
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span>{personal.phone}</span>}
            {personal.location && <span>{personal.location}</span>}
          </div>
        </div>
      </div>
      {personal.summary && <p style={{ color: '#555', marginBottom: '32px', borderLeft: `3px solid ${color}`, paddingLeft: '16px', fontStyle: 'italic' }}>{personal.summary}</p>}
      {experience.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '3px', color: '#999', marginBottom: '16px' }}>Experience</h2>
          {experience.map(exp => (
            <div key={exp.id} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '16px', marginBottom: '16px' }}>
              <p style={{ fontSize: '11px', color: '#999', paddingTop: '2px' }}>{formatDate(exp.startDate)}<br />{exp.current ? 'Present' : formatDate(exp.endDate)}</p>
              <div>
                <p style={{ fontWeight: '600', fontSize: '13px' }}>{exp.position}</p>
                <p style={{ color: color, fontSize: '12px', marginBottom: '4px' }}>{exp.company}</p>
                {exp.description && <p style={{ color: '#666', whiteSpace: 'pre-line', fontSize: '11px' }}>{exp.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
      {education.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '3px', color: '#999', marginBottom: '16px' }}>Education</h2>
          {education.map(edu => (
            <div key={edu.id} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '16px', marginBottom: '12px' }}>
              <p style={{ fontSize: '11px', color: '#999' }}>{formatDate(edu.startDate)}<br />{formatDate(edu.endDate)}</p>
              <div>
                <p style={{ fontWeight: '600', fontSize: '13px' }}>{edu.degree}</p>
                <p style={{ color: '#666', fontSize: '12px' }}>{edu.school} {edu.field && `• ${edu.field}`}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {skills.length > 0 && (
          <div>
            <h2 style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '3px', color: '#999', marginBottom: '10px' }}>Skills</h2>
            {skills.map(s => <div key={s.id} style={{ marginBottom: '6px' }}><p style={{ fontWeight: '600', fontSize: '11px' }}>{s.category}</p><p style={{ fontSize: '11px', color: '#666' }}>{s.items}</p></div>)}
          </div>
        )}
        {languages.length > 0 && (
          <div>
            <h2 style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '3px', color: '#999', marginBottom: '10px' }}>Languages</h2>
            {languages.map(l => <p key={l.id} style={{ fontSize: '11px', marginBottom: '4px' }}>{l.language} — <span style={{ color: '#999' }}>{l.level}</span></p>)}
          </div>
        )}
      </div>
    </div>
  );
}

// =================== TEMPLATE 4: PROFESSIONAL ===================
function ProfessionalTemplate({ data, color }) {
  const { personal, experience, education, skills, languages, certifications, projects } = data;
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#222', fontSize: '12px', lineHeight: '1.6', background: '#fff', minHeight: '297mm' }}>
      <div style={{ background: '#1a1a2e', color: '#fff', padding: '28px 40px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        {personal.photo && <img src={personal.photo} alt="" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${color}`, flexShrink: 0 }} />}
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 2px' }}>{personal.name}</h1>
          <p style={{ color: color, fontSize: '14px', margin: '0 0 14px' }}>{personal.title}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '11px', color: '#aaa' }}>
            {personal.email && <span>✉ {personal.email}</span>}
            {personal.phone && <span>☎ {personal.phone}</span>}
            {personal.location && <span>⊙ {personal.location}</span>}
            {personal.linkedin && <span>in {personal.linkedin}</span>}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '35%', background: '#f5f5f5', padding: '24px 20px', borderRight: '2px solid #e0e0e0' }}>
          {personal.summary && <div style={{ marginBottom: '22px' }}><h3 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: color, marginBottom: '8px' }}>About Me</h3><p style={{ fontSize: '11px', color: '#555', lineHeight: '1.7' }}>{personal.summary}</p></div>}
          {skills.length > 0 && <div style={{ marginBottom: '22px' }}><h3 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: color, marginBottom: '8px' }}>Technical Skills</h3>{skills.map(s => <div key={s.id} style={{ marginBottom: '8px' }}><p style={{ fontWeight: '600', fontSize: '11px', marginBottom: '3px' }}>{s.category}</p>{s.items.split(',').map((skill, i) => <span key={i} style={{ display: 'inline-block', background: color + '20', color: color, borderRadius: '3px', padding: '1px 6px', fontSize: '10px', margin: '2px 2px 0 0' }}>{skill.trim()}</span>)}</div>)}</div>}
          {languages.length > 0 && <div style={{ marginBottom: '22px' }}><h3 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: color, marginBottom: '8px' }}>Languages</h3>{languages.map(l => <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px' }}><span>{l.language}</span><span style={{ color: '#888', fontSize: '10px' }}>{l.level}</span></div>)}</div>}
          {certifications.length > 0 && <div><h3 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: color, marginBottom: '8px' }}>Certifications</h3>{certifications.map(c => <div key={c.id} style={{ marginBottom: '8px' }}><p style={{ fontWeight: '600', fontSize: '11px' }}>{c.name}</p><p style={{ fontSize: '10px', color: '#888' }}>{c.issuer}</p></div>)}</div>}
        </div>
        <div style={{ flex: 1, padding: '24px 28px' }}>
          {experience.length > 0 && <div style={{ marginBottom: '22px' }}><h3 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: '#1a1a2e', borderLeft: `4px solid ${color}`, paddingLeft: '10px', marginBottom: '14px' }}>Work Experience</h3>{experience.map(exp => <div key={exp.id} style={{ marginBottom: '14px', paddingLeft: '14px', borderLeft: '2px solid #eee' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><div><p style={{ fontWeight: '700', fontSize: '13px' }}>{exp.position}</p><p style={{ color: color, fontSize: '12px' }}>{exp.company}</p></div><p style={{ fontSize: '10px', color: '#888', whiteSpace: 'nowrap', background: '#f0f0f0', padding: '2px 8px', borderRadius: '10px', height: 'fit-content' }}>{formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</p></div>{exp.description && <p style={{ marginTop: '6px', fontSize: '11px', color: '#555', whiteSpace: 'pre-line' }}>{exp.description}</p>}</div>)}</div>}
          {education.length > 0 && <div style={{ marginBottom: '22px' }}><h3 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: '#1a1a2e', borderLeft: `4px solid ${color}`, paddingLeft: '10px', marginBottom: '14px' }}>Education</h3>{education.map(edu => <div key={edu.id} style={{ marginBottom: '10px', paddingLeft: '14px', borderLeft: '2px solid #eee' }}><p style={{ fontWeight: '700', fontSize: '13px' }}>{edu.degree} {edu.field && `in ${edu.field}`}</p><p style={{ color: color, fontSize: '12px' }}>{edu.school}</p><p style={{ fontSize: '11px', color: '#888' }}>{formatDate(edu.startDate)} - {formatDate(edu.endDate)} {edu.gpa && `• GPA: ${edu.gpa}`}</p></div>)}</div>}
          {projects.length > 0 && <div><h3 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: '#1a1a2e', borderLeft: `4px solid ${color}`, paddingLeft: '10px', marginBottom: '14px' }}>Projects</h3>{projects.map(p => <div key={p.id} style={{ marginBottom: '10px', paddingLeft: '14px', borderLeft: '2px solid #eee' }}><p style={{ fontWeight: '700', fontSize: '12px' }}>{p.name}</p><p style={{ fontSize: '10px', color: color, marginBottom: '3px' }}>{p.tech}</p><p style={{ fontSize: '11px', color: '#555' }}>{p.description}</p></div>)}</div>}
        </div>
      </div>
    </div>
  );
}

// =================== TEMPLATE 5: CREATIVE ===================
function CreativeTemplate({ data, color }) {
  const { personal, experience, education, skills, languages, certifications } = data;
  return (
    <div style={{ fontFamily: '"Trebuchet MS", sans-serif', color: '#222', fontSize: '12px', lineHeight: '1.6', background: '#fff', minHeight: '297mm' }}>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '38%', background: color, color: '#fff', padding: '40px 24px', minHeight: '100%' }}>
          {personal.photo ? <img src={personal.photo} alt="" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(255,255,255,0.5)', marginBottom: '16px' }} /> : <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>{personal.name.charAt(0)}</div>}
          <h1 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 4px', lineHeight: '1.2' }}>{personal.name}</h1>
          <p style={{ fontSize: '13px', opacity: 0.8, margin: '0 0 24px' }}>{personal.title}</p>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '20px', marginBottom: '20px' }}>
            {personal.email && <p style={{ fontSize: '11px', marginBottom: '6px', opacity: 0.9 }}>✉ {personal.email}</p>}
            {personal.phone && <p style={{ fontSize: '11px', marginBottom: '6px', opacity: 0.9 }}>📱 {personal.phone}</p>}
            {personal.location && <p style={{ fontSize: '11px', marginBottom: '6px', opacity: 0.9 }}>📍 {personal.location}</p>}
            {personal.linkedin && <p style={{ fontSize: '11px', opacity: 0.9 }}>💼 {personal.linkedin}</p>}
          </div>
          {skills.length > 0 && <div style={{ marginBottom: '20px' }}><h3 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.7, marginBottom: '10px' }}>Skills</h3>{skills.map(s => <div key={s.id} style={{ marginBottom: '8px' }}><p style={{ fontWeight: '600', fontSize: '11px', marginBottom: '3px' }}>{s.category}</p><p style={{ fontSize: '10px', opacity: 0.8 }}>{s.items}</p></div>)}</div>}
          {languages.length > 0 && <div style={{ marginBottom: '20px' }}><h3 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.7, marginBottom: '10px' }}>Languages</h3>{languages.map(l => <p key={l.id} style={{ fontSize: '11px', marginBottom: '4px', opacity: 0.9 }}>{l.language} — {l.level}</p>)}</div>}
          {certifications.length > 0 && <div><h3 style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.7, marginBottom: '10px' }}>Certifications</h3>{certifications.map(c => <div key={c.id} style={{ marginBottom: '8px' }}><p style={{ fontWeight: '600', fontSize: '11px' }}>{c.name}</p><p style={{ fontSize: '10px', opacity: 0.7 }}>{c.issuer}</p></div>)}</div>}
        </div>
        <div style={{ flex: 1, padding: '40px 32px' }}>
          {personal.summary && <div style={{ marginBottom: '28px', padding: '16px', background: '#f9f9f9', borderRadius: '8px', borderLeft: `4px solid ${color}` }}><p style={{ color: '#555', fontStyle: 'italic', lineHeight: '1.7' }}>{personal.summary}</p></div>}
          {experience.length > 0 && <div style={{ marginBottom: '28px' }}><h2 style={{ fontSize: '16px', fontWeight: '700', color: color, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>💼 Experience</h2>{experience.map(exp => <div key={exp.id} style={{ marginBottom: '16px', paddingLeft: '16px', borderLeft: `2px solid ${color}` }}><p style={{ fontWeight: '700', fontSize: '13px' }}>{exp.position}</p><p style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>{exp.company} | {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}</p>{exp.description && <p style={{ fontSize: '11px', color: '#555', whiteSpace: 'pre-line' }}>{exp.description}</p>}</div>)}</div>}
          {education.length > 0 && <div style={{ marginBottom: '28px' }}><h2 style={{ fontSize: '16px', fontWeight: '700', color: color, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>🎓 Education</h2>{education.map(edu => <div key={edu.id} style={{ marginBottom: '12px', paddingLeft: '16px', borderLeft: `2px solid ${color}` }}><p style={{ fontWeight: '700', fontSize: '13px' }}>{edu.degree} {edu.field && `in ${edu.field}`}</p><p style={{ color: '#888', fontSize: '11px' }}>{edu.school} | {formatDate(edu.startDate)} – {formatDate(edu.endDate)}</p></div>)}</div>}
        </div>
      </div>
    </div>
  );
}

// =================== TEMPLATE 6: ELEGANT ===================
function ElegantTemplate({ data, color }) {
  const { personal, experience, education, skills, languages, certifications } = data;
  return (
    <div style={{ fontFamily: '"Palatino Linotype", Palatino, serif', color: '#2c2c2c', fontSize: '12px', lineHeight: '1.7', background: '#fff', padding: '48px 56px', minHeight: '297mm' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ width: '100%', height: '2px', background: `linear-gradient(to right, transparent, ${color}, transparent)`, marginBottom: '24px' }}></div>
        {personal.photo && <div style={{ marginBottom: '14px' }}><img src={personal.photo} alt="" style={{ width: '85px', height: '85px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${color}` }} /></div>}
        <h1 style={{ fontSize: '32px', fontWeight: '400', margin: '0 0 6px', letterSpacing: '4px', textTransform: 'uppercase' }}>{personal.name}</h1>
        <p style={{ fontSize: '13px', color: color, margin: '0 0 16px', letterSpacing: '2px', textTransform: 'uppercase' }}>{personal.title}</p>
        <p style={{ fontSize: '11px', color: '#888', letterSpacing: '1px' }}>{[personal.email, personal.phone, personal.location].filter(Boolean).join('  ·  ')}</p>
        <div style={{ width: '100%', height: '2px', background: `linear-gradient(to right, transparent, ${color}, transparent)`, marginTop: '24px' }}></div>
      </div>
      {personal.summary && <div style={{ textAlign: 'center', marginBottom: '28px' }}><p style={{ fontStyle: 'italic', color: '#555', maxWidth: '600px', margin: '0 auto' }}>{personal.summary}</p></div>}
      {experience.length > 0 && (
        <div style={{ marginBottom: '26px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '4px', color: color, marginBottom: '16px' }}>Professional Experience</h2>
          {experience.map(exp => (
            <div key={exp.id} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <p style={{ fontWeight: '700', fontSize: '13px', letterSpacing: '1px' }}>{exp.position}</p>
                <p style={{ fontSize: '11px', color: '#888', fontStyle: 'italic' }}>{formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}</p>
              </div>
              <p style={{ color: color, fontSize: '12px', marginBottom: '6px', fontStyle: 'italic' }}>{exp.company}</p>
              {exp.description && <p style={{ color: '#555', whiteSpace: 'pre-line', paddingLeft: '12px' }}>{exp.description}</p>}
            </div>
          ))}
        </div>
      )}
      {education.length > 0 && (
        <div style={{ marginBottom: '26px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '4px', color: color, marginBottom: '16px' }}>Education</h2>
          {education.map(edu => (
            <div key={edu.id} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <div><p style={{ fontWeight: '700', fontSize: '13px' }}>{edu.degree} {edu.field && `in ${edu.field}`}</p><p style={{ fontStyle: 'italic', color: '#666', fontSize: '12px' }}>{edu.school}</p></div>
              <p style={{ fontSize: '11px', color: '#888' }}>{formatDate(edu.startDate)} — {formatDate(edu.endDate)}</p>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', borderTop: `1px solid ${color}40`, paddingTop: '20px' }}>
        {skills.length > 0 && <div><h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '3px', color: color, marginBottom: '10px' }}>Skills</h3>{skills.map(s => <div key={s.id} style={{ marginBottom: '6px' }}><p style={{ fontWeight: '600', fontSize: '11px' }}>{s.category}</p><p style={{ fontSize: '10px', color: '#777' }}>{s.items}</p></div>)}</div>}
        {languages.length > 0 && <div><h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '3px', color: color, marginBottom: '10px' }}>Languages</h3>{languages.map(l => <p key={l.id} style={{ fontSize: '11px', marginBottom: '4px' }}>{l.language} — <em style={{ color: '#888' }}>{l.level}</em></p>)}</div>}
        {certifications.length > 0 && <div><h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '3px', color: color, marginBottom: '10px' }}>Certifications</h3>{certifications.map(c => <div key={c.id} style={{ marginBottom: '6px' }}><p style={{ fontSize: '11px' }}>{c.name}</p><p style={{ fontSize: '10px', color: '#888', fontStyle: 'italic' }}>{c.issuer}</p></div>)}</div>}
      </div>
    </div>
  );
}

// =================== TEMPLATE 7: BOLD ===================
function BoldTemplate({ data, color }) {
  const { personal, experience, education, skills, languages, certifications, projects } = data;
  return (
    <div style={{ fontFamily: 'Impact, Arial Black, sans-serif', color: '#111', background: '#fff', minHeight: '297mm' }}>
      <div style={{ background: '#111', padding: '36px 40px', display: 'flex', alignItems: 'center', gap: '24px' }}>
        {personal.photo && <img src={personal.photo} alt="" style={{ width: '90px', height: '90px', borderRadius: '8px', objectFit: 'cover', border: `4px solid ${color}`, flexShrink: 0 }} />}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '36px', color: '#fff', margin: '0 0 4px', letterSpacing: '2px', textTransform: 'uppercase' }}>{personal.name}</h1>
          <p style={{ color: color, fontSize: '16px', margin: '0 0 14px', letterSpacing: '3px', textTransform: 'uppercase', fontFamily: 'Arial, sans-serif' }}>{personal.title}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '12px', color: '#aaa', fontFamily: 'Arial, sans-serif', fontWeight: 'normal' }}>
            {personal.email && <span>✉ {personal.email}</span>}
            {personal.phone && <span>📱 {personal.phone}</span>}
            {personal.location && <span>📍 {personal.location}</span>}
          </div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div style={{ padding: '28px 24px 28px 40px', borderRight: `4px solid ${color}` }}>
          {personal.summary && <div style={{ marginBottom: '24px' }}><div style={{ background: color, color: '#fff', padding: '4px 12px', fontSize: '11px', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', display: 'inline-block' }}>PROFILE</div><p style={{ fontFamily: 'Arial', fontSize: '12px', color: '#444', lineHeight: '1.7' }}>{personal.summary}</p></div>}
          {experience.length > 0 && <div style={{ marginBottom: '24px' }}><div style={{ background: color, color: '#fff', padding: '4px 12px', fontSize: '11px', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', display: 'inline-block' }}>EXPERIENCE</div>{experience.map(exp => <div key={exp.id} style={{ marginBottom: '14px' }}><p style={{ fontFamily: 'Arial', fontWeight: '700', fontSize: '13px', margin: '0' }}>{exp.position}</p><p style={{ fontFamily: 'Arial', fontSize: '11px', color: color, margin: '2px 0 4px' }}>{exp.company} | {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</p>{exp.description && <p style={{ fontFamily: 'Arial', fontSize: '11px', color: '#555', whiteSpace: 'pre-line' }}>{exp.description}</p>}</div>)}</div>}
          {projects.length > 0 && <div><div style={{ background: color, color: '#fff', padding: '4px 12px', fontSize: '11px', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', display: 'inline-block' }}>PROJECTS</div>{projects.map(p => <div key={p.id} style={{ marginBottom: '10px' }}><p style={{ fontFamily: 'Arial', fontWeight: '700', fontSize: '12px' }}>{p.name}</p><p style={{ fontFamily: 'Arial', fontSize: '11px', color: '#666' }}>{p.description}</p></div>)}</div>}
        </div>
        <div style={{ padding: '28px 40px 28px 24px' }}>
          {education.length > 0 && <div style={{ marginBottom: '24px' }}><div style={{ background: '#111', color: '#fff', padding: '4px 12px', fontSize: '11px', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', display: 'inline-block' }}>EDUCATION</div>{education.map(edu => <div key={edu.id} style={{ marginBottom: '12px' }}><p style={{ fontFamily: 'Arial', fontWeight: '700', fontSize: '13px' }}>{edu.degree}</p><p style={{ fontFamily: 'Arial', fontSize: '11px', color: '#666' }}>{edu.school} | {formatDate(edu.startDate)} - {formatDate(edu.endDate)}</p></div>)}</div>}
          {skills.length > 0 && <div style={{ marginBottom: '24px' }}><div style={{ background: '#111', color: '#fff', padding: '4px 12px', fontSize: '11px', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', display: 'inline-block' }}>SKILLS</div>{skills.map(s => <div key={s.id} style={{ marginBottom: '8px' }}><p style={{ fontFamily: 'Arial', fontWeight: '700', fontSize: '11px', marginBottom: '3px' }}>{s.category}</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>{s.items.split(',').map((sk, i) => <span key={i} style={{ background: color + '20', border: `1px solid ${color}`, color: '#333', padding: '2px 8px', borderRadius: '3px', fontSize: '10px', fontFamily: 'Arial' }}>{sk.trim()}</span>)}</div></div>)}</div>}
          {languages.length > 0 && <div style={{ marginBottom: '24px' }}><div style={{ background: '#111', color: '#fff', padding: '4px 12px', fontSize: '11px', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', display: 'inline-block' }}>LANGUAGES</div>{languages.map(l => <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontFamily: 'Arial', fontSize: '12px' }}><span>{l.language}</span><span style={{ background: color, color: '#fff', padding: '1px 8px', borderRadius: '3px', fontSize: '10px' }}>{l.level}</span></div>)}</div>}
          {certifications.length > 0 && <div><div style={{ background: '#111', color: '#fff', padding: '4px 12px', fontSize: '11px', fontFamily: 'Arial', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', display: 'inline-block' }}>CERTIFICATIONS</div>{certifications.map(c => <div key={c.id} style={{ marginBottom: '8px', fontFamily: 'Arial' }}><p style={{ fontWeight: '700', fontSize: '12px', margin: '0' }}>{c.name}</p><p style={{ fontSize: '11px', color: '#888', margin: '0' }}>{c.issuer}</p></div>)}</div>}
        </div>
      </div>
    </div>
  );
}

// =================== TEMPLATE 8: CORPORATE ===================
function CorporateTemplate({ data, color }) {
  const { personal, experience, education, skills, languages, certifications, projects } = data;
  return (
    <div style={{ fontFamily: 'Calibri, Arial, sans-serif', color: '#222', background: '#fff', minHeight: '297mm', padding: '40px 48px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `3px solid ${color}`, paddingBottom: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {personal.photo && <img src={personal.photo} alt="" style={{ width: '80px', height: '80px', borderRadius: '4px', objectFit: 'cover' }} />}
          <div><h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 4px' }}>{personal.name}</h1><p style={{ fontSize: '14px', color: color, fontWeight: '600', margin: '0', textTransform: 'uppercase', letterSpacing: '1px' }}>{personal.title}</p></div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '12px', color: '#555', lineHeight: '1.8' }}>
          {personal.email && <p style={{ margin: 0 }}>{personal.email}</p>}
          {personal.phone && <p style={{ margin: 0 }}>{personal.phone}</p>}
          {personal.location && <p style={{ margin: 0 }}>{personal.location}</p>}
          {personal.linkedin && <p style={{ margin: 0 }}>{personal.linkedin}</p>}
        </div>
      </div>
      {personal.summary && <div style={{ marginBottom: '22px', padding: '14px 18px', background: '#f8f9fa', borderLeft: `4px solid ${color}` }}><p style={{ fontSize: '13px', color: '#444', lineHeight: '1.7', margin: 0 }}>{personal.summary}</p></div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '32px' }}>
        <div>
          {experience.length > 0 && <div style={{ marginBottom: '22px' }}><h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: color, borderBottom: `1px solid #eee`, paddingBottom: '6px', marginBottom: '14px' }}>Professional Experience</h2>{experience.map(exp => <div key={exp.id} style={{ marginBottom: '16px' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><div><p style={{ fontWeight: '700', fontSize: '14px', margin: '0' }}>{exp.position}</p><p style={{ color: '#555', fontSize: '12px', margin: '2px 0 0' }}>{exp.company}</p></div><p style={{ fontSize: '11px', color: '#888', background: '#f0f0f0', padding: '3px 10px', borderRadius: '12px', whiteSpace: 'nowrap', height: 'fit-content' }}>{formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}</p></div>{exp.description && <p style={{ marginTop: '6px', fontSize: '12px', color: '#555', whiteSpace: 'pre-line', paddingLeft: '12px', borderLeft: `2px solid ${color}20` }}>{exp.description}</p>}</div>)}</div>}
          {education.length > 0 && <div style={{ marginBottom: '22px' }}><h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: color, borderBottom: `1px solid #eee`, paddingBottom: '6px', marginBottom: '14px' }}>Education</h2>{education.map(edu => <div key={edu.id} style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}><div><p style={{ fontWeight: '700', fontSize: '13px', margin: '0' }}>{edu.degree} {edu.field && `in ${edu.field}`}</p><p style={{ fontSize: '12px', color: '#666', margin: '2px 0 0' }}>{edu.school} {edu.gpa && `• GPA: ${edu.gpa}`}</p></div><p style={{ fontSize: '11px', color: '#888', whiteSpace: 'nowrap' }}>{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</p></div>)}</div>}
          {projects.length > 0 && <div><h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: color, borderBottom: `1px solid #eee`, paddingBottom: '6px', marginBottom: '14px' }}>Key Projects</h2>{projects.map(p => <div key={p.id} style={{ marginBottom: '10px' }}><p style={{ fontWeight: '700', fontSize: '13px', margin: '0' }}>{p.name} {p.tech && <span style={{ fontWeight: '400', color: '#888', fontSize: '11px' }}>• {p.tech}</span>}</p><p style={{ fontSize: '12px', color: '#555', margin: '3px 0 0' }}>{p.description}</p></div>)}</div>}
        </div>
        <div>
          {skills.length > 0 && <div style={{ marginBottom: '20px' }}><h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: color, borderBottom: `1px solid #eee`, paddingBottom: '6px', marginBottom: '12px' }}>Core Skills</h2>{skills.map(s => <div key={s.id} style={{ marginBottom: '10px' }}><p style={{ fontWeight: '600', fontSize: '12px', marginBottom: '4px' }}>{s.category}</p>{s.items.split(',').map((sk, i) => <span key={i} style={{ display: 'inline-block', background: color + '15', color: '#333', border: `1px solid ${color}40`, padding: '2px 8px', borderRadius: '12px', fontSize: '10px', margin: '2px 2px 0 0' }}>{sk.trim()}</span>)}</div>)}</div>}
          {languages.length > 0 && <div style={{ marginBottom: '20px' }}><h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: color, borderBottom: `1px solid #eee`, paddingBottom: '6px', marginBottom: '12px' }}>Languages</h2>{languages.map(l => <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}><span>{l.language}</span><span style={{ color: '#888', fontSize: '11px' }}>{l.level}</span></div>)}</div>}
          {certifications.length > 0 && <div><h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px', color: color, borderBottom: `1px solid #eee`, paddingBottom: '6px', marginBottom: '12px' }}>Certifications</h2>{certifications.map(c => <div key={c.id} style={{ marginBottom: '8px' }}><p style={{ fontWeight: '600', fontSize: '12px', margin: '0' }}>{c.name}</p><p style={{ fontSize: '11px', color: '#888', margin: '0' }}>{c.issuer} {c.date && `• ${formatDate(c.date)}`}</p></div>)}</div>}
        </div>
      </div>
    </div>
  );
}

// =================== TEMPLATE 9: DARK ===================
function DarkTemplate({ data, color }) {
  const { personal, experience, education, skills, languages, certifications, projects } = data;
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#0d1117', color: '#e6edf3', minHeight: '297mm' }}>
      <div style={{ background: '#161b22', padding: '36px 40px', borderBottom: `2px solid ${color}`, display: 'flex', alignItems: 'center', gap: '24px' }}>
        {personal.photo && <img src={personal.photo} alt="" style={{ width: '85px', height: '85px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${color}`, flexShrink: 0 }} />}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 4px', color: '#fff' }}>{personal.name}</h1>
          <p style={{ color: color, fontSize: '14px', margin: '0 0 14px', letterSpacing: '1px' }}>{personal.title}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '12px', color: '#8b949e' }}>
            {personal.email && <span>✉ {personal.email}</span>}
            {personal.phone && <span>📱 {personal.phone}</span>}
            {personal.location && <span>📍 {personal.location}</span>}
            {personal.linkedin && <span>💼 {personal.linkedin}</span>}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '35%', background: '#161b22', padding: '24px 20px', borderRight: `1px solid #30363d` }}>
          {personal.summary && <div style={{ marginBottom: '22px' }}><h3 style={{ fontSize: '11px', color: color, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', borderBottom: `1px solid #30363d`, paddingBottom: '6px' }}>About</h3><p style={{ fontSize: '12px', color: '#8b949e', lineHeight: '1.7' }}>{personal.summary}</p></div>}
          {skills.length > 0 && <div style={{ marginBottom: '22px' }}><h3 style={{ fontSize: '11px', color: color, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', borderBottom: `1px solid #30363d`, paddingBottom: '6px' }}>Skills</h3>{skills.map(s => <div key={s.id} style={{ marginBottom: '10px' }}><p style={{ fontWeight: '600', fontSize: '11px', color: '#e6edf3', marginBottom: '4px' }}>{s.category}</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>{s.items.split(',').map((sk, i) => <span key={i} style={{ background: color + '20', border: `1px solid ${color}50`, color: color, padding: '2px 8px', borderRadius: '4px', fontSize: '10px' }}>{sk.trim()}</span>)}</div></div>)}</div>}
          {languages.length > 0 && <div style={{ marginBottom: '22px' }}><h3 style={{ fontSize: '11px', color: color, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', borderBottom: `1px solid #30363d`, paddingBottom: '6px' }}>Languages</h3>{languages.map(l => <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '11px', color: '#8b949e' }}><span>{l.language}</span><span style={{ color: color }}>{l.level}</span></div>)}</div>}
          {certifications.length > 0 && <div><h3 style={{ fontSize: '11px', color: color, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', borderBottom: `1px solid #30363d`, paddingBottom: '6px' }}>Certifications</h3>{certifications.map(c => <div key={c.id} style={{ marginBottom: '8px' }}><p style={{ fontSize: '11px', color: '#e6edf3', fontWeight: '600', margin: '0' }}>{c.name}</p><p style={{ fontSize: '10px', color: '#8b949e', margin: '0' }}>{c.issuer}</p></div>)}</div>}
        </div>
        <div style={{ flex: 1, padding: '24px 32px' }}>
          {experience.length > 0 && <div style={{ marginBottom: '24px' }}><h3 style={{ fontSize: '11px', color: color, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px', borderBottom: `1px solid #30363d`, paddingBottom: '6px' }}>Experience</h3>{experience.map(exp => <div key={exp.id} style={{ marginBottom: '16px', paddingLeft: '14px', borderLeft: `2px solid ${color}50` }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}><div><p style={{ fontWeight: '700', fontSize: '13px', color: '#e6edf3', margin: '0' }}>{exp.position}</p><p style={{ color: color, fontSize: '12px', margin: '2px 0' }}>{exp.company}</p></div><p style={{ fontSize: '10px', color: '#8b949e', background: '#21262d', padding: '2px 8px', borderRadius: '12px', whiteSpace: 'nowrap' }}>{formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}</p></div>{exp.description && <p style={{ marginTop: '6px', fontSize: '11px', color: '#8b949e', whiteSpace: 'pre-line' }}>{exp.description}</p>}</div>)}</div>}
          {education.length > 0 && <div style={{ marginBottom: '24px' }}><h3 style={{ fontSize: '11px', color: color, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px', borderBottom: `1px solid #30363d`, paddingBottom: '6px' }}>Education</h3>{education.map(edu => <div key={edu.id} style={{ marginBottom: '12px', paddingLeft: '14px', borderLeft: `2px solid ${color}50` }}><p style={{ fontWeight: '700', fontSize: '13px', color: '#e6edf3', margin: '0' }}>{edu.degree} {edu.field && `in ${edu.field}`}</p><p style={{ color: '#8b949e', fontSize: '12px', margin: '2px 0 0' }}>{edu.school} | {formatDate(edu.startDate)} - {formatDate(edu.endDate)}</p></div>)}</div>}
          {projects.length > 0 && <div><h3 style={{ fontSize: '11px', color: color, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px', borderBottom: `1px solid #30363d`, paddingBottom: '6px' }}>Projects</h3>{projects.map(p => <div key={p.id} style={{ marginBottom: '12px', paddingLeft: '14px', borderLeft: `2px solid ${color}50` }}><p style={{ fontWeight: '700', fontSize: '12px', color: '#e6edf3', margin: '0' }}>{p.name} {p.tech && <span style={{ color: color, fontSize: '10px', fontWeight: '400' }}>• {p.tech}</span>}</p><p style={{ fontSize: '11px', color: '#8b949e', margin: '3px 0 0' }}>{p.description}</p></div>)}</div>}
        </div>
      </div>
    </div>
  );
}

// =================== TEMPLATE 10: TECH ===================
function TechTemplate({ data, color }) {
  const { personal, experience, education, skills, languages, certifications, projects } = data;
  const darkBg = '#0d1117';
  const cardBg = '#161b22';
  const border = '#30363d';
  return (
    <div style={{ fontFamily: '"Courier New", Courier, monospace', color: '#c9d1d9', fontSize: '12px', lineHeight: '1.6', background: darkBg, minHeight: '297mm' }}>
      <div style={{ padding: '32px 40px', borderBottom: `2px solid ${color}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {personal.photo && <img src={personal.photo} alt="" style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: `2px solid ${color}` }} />}
          <div>
            <p style={{ color: color, fontSize: '12px', margin: '0 0 4px' }}>{'// developer profile'}</p>
            <h1 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 4px', color: '#fff', letterSpacing: '1px' }}>{personal.name}</h1>
            <p style={{ color: '#8b949e', fontSize: '13px', margin: 0 }}>{personal.title}</p>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '16px', fontSize: '11px', color: '#8b949e' }}>
          {personal.email && <span style={{ background: cardBg, border: `1px solid ${border}`, padding: '3px 10px', borderRadius: '20px' }}>✉ {personal.email}</span>}
          {personal.phone && <span style={{ background: cardBg, border: `1px solid ${border}`, padding: '3px 10px', borderRadius: '20px' }}>☎ {personal.phone}</span>}
          {personal.location && <span style={{ background: cardBg, border: `1px solid ${border}`, padding: '3px 10px', borderRadius: '20px' }}>⊙ {personal.location}</span>}
          {personal.website && <span style={{ background: cardBg, border: `1px solid ${border}`, padding: '3px 10px', borderRadius: '20px' }}>⌂ {personal.website}</span>}
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ width: '36%', padding: '24px 20px', borderRight: `1px solid ${border}` }}>
          {personal.summary && <div style={{ marginBottom: '22px', padding: '12px', background: cardBg, border: `1px solid ${border}`, borderRadius: '6px' }}><p style={{ color: color, fontSize: '10px', margin: '0 0 6px' }}>{'/* about */'}</p><p style={{ fontSize: '11px', color: '#8b949e', lineHeight: '1.7', margin: 0 }}>{personal.summary}</p></div>}
          {skills.length > 0 && <div style={{ marginBottom: '22px' }}><p style={{ color: color, fontSize: '11px', margin: '0 0 10px' }}>{'const skills = {'}</p>{skills.map(s => <div key={s.id} style={{ marginBottom: '8px', paddingLeft: '12px' }}><p style={{ color: '#79c0ff', fontSize: '11px', margin: '0 0 2px' }}>{s.category}:</p><p style={{ fontSize: '10px', color: '#8b949e', paddingLeft: '12px' }}>[ {s.items.split(',').map(i => `"${i.trim()}"`).join(', ')} ]</p></div>)}<p style={{ color: color, fontSize: '11px', margin: '8px 0 0' }}>{'};'}</p></div>}
          {languages.length > 0 && <div style={{ marginBottom: '22px' }}><p style={{ color: color, fontSize: '11px', margin: '0 0 8px' }}>{'// languages'}</p>{languages.map(l => <p key={l.id} style={{ fontSize: '11px', color: '#8b949e', margin: '0 0 4px' }}><span style={{ color: '#79c0ff' }}>{l.language}</span>: <span style={{ color: '#a5d6ff' }}>"{l.level}"</span></p>)}</div>}
          {certifications.length > 0 && <div><p style={{ color: color, fontSize: '11px', margin: '0 0 8px' }}>{'// certifications'}</p>{certifications.map(c => <div key={c.id} style={{ marginBottom: '8px', padding: '8px', background: cardBg, border: `1px solid ${border}`, borderRadius: '4px' }}><p style={{ color: '#e3b341', fontSize: '10px', margin: '0 0 2px' }}>{c.name}</p><p style={{ color: '#8b949e', fontSize: '10px', margin: 0 }}>{c.issuer}</p></div>)}</div>}
        </div>
        <div style={{ flex: 1, padding: '24px 28px' }}>
          {experience.length > 0 && <div style={{ marginBottom: '22px' }}><p style={{ color: color, fontSize: '12px', margin: '0 0 14px' }}>{'function workExperience() {'}</p>{experience.map(exp => <div key={exp.id} style={{ marginBottom: '14px', padding: '12px', background: cardBg, border: `1px solid ${border}`, borderRadius: '6px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}><div><p style={{ color: '#79c0ff', fontWeight: '700', fontSize: '12px', margin: '0 0 2px' }}>{exp.position}</p><p style={{ color: color, fontSize: '11px', margin: 0 }}>{exp.company}</p></div><span style={{ background: color + '20', color: color, padding: '2px 8px', fontSize: '9px', borderRadius: '12px', border: `1px solid ${color}40`, whiteSpace: 'nowrap' }}>{formatDate(exp.startDate)} → {exp.current ? 'now' : formatDate(exp.endDate)}</span></div>{exp.description && <p style={{ marginTop: '8px', fontSize: '11px', color: '#8b949e', whiteSpace: 'pre-line', borderTop: `1px solid ${border}`, paddingTop: '8px' }}>{exp.description}</p>}</div>)}<p style={{ color: color, fontSize: '12px', margin: '8px 0 0' }}>{'}'}</p></div>}
          {education.length > 0 && <div style={{ marginBottom: '22px' }}><p style={{ color: color, fontSize: '12px', margin: '0 0 14px' }}>{'function education() {'}</p>{education.map(edu => <div key={edu.id} style={{ marginBottom: '10px', padding: '10px', background: cardBg, border: `1px solid ${border}`, borderRadius: '6px' }}><p style={{ color: '#79c0ff', fontWeight: '700', fontSize: '12px', margin: '0 0 2px' }}>{edu.degree} {edu.field && `in ${edu.field}`}</p><p style={{ color: '#8b949e', fontSize: '11px', margin: '0' }}>{edu.school} {edu.gpa && <span style={{ color: color }}>• GPA: {edu.gpa}</span>}</p><p style={{ color: '#6e7681', fontSize: '10px', margin: '4px 0 0' }}>{formatDate(edu.startDate)} → {formatDate(edu.endDate)}</p></div>)}<p style={{ color: color, fontSize: '12px', margin: '8px 0 0' }}>{'}'}</p></div>}
          {projects.length > 0 && <div><p style={{ color: color, fontSize: '12px', margin: '0 0 14px' }}>{'// projects'}</p>{projects.map(p => <div key={p.id} style={{ marginBottom: '10px', padding: '10px', background: cardBg, border: `1px solid ${border}`, borderRadius: '6px' }}><p style={{ color: '#e3b341', fontWeight: '700', fontSize: '12px', margin: '0 0 4px' }}>{p.name}</p>{p.tech && <p style={{ fontSize: '10px', color: color, margin: '0 0 4px' }}>{p.tech.split(',').map(t => `#${t.trim()}`).join(' ')}</p>}<p style={{ fontSize: '11px', color: '#8b949e', margin: 0 }}>{p.description}</p></div>)}</div>}
        </div>
      </div>
    </div>
  );
}

// =================== TEMPLATE 11: EXECUTIVE ===================
function ExecutiveTemplate({ data, color }) {
  const { personal, experience, education, skills, languages, certifications, projects } = data;
  return (
    <div style={{ fontFamily: '"Times New Roman", Times, serif', background: '#fff', color: '#1a1a1a', minHeight: '297mm' }}>
      <div style={{ background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)`, padding: '48px 56px', textAlign: 'center' }}>
        {personal.photo && <div style={{ marginBottom: '16px' }}><img src={personal.photo} alt="" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${color}` }} /></div>}
        <h1 style={{ fontSize: '34px', fontWeight: '400', color: '#fff', margin: '0 0 6px', letterSpacing: '4px', textTransform: 'uppercase' }}>{personal.name}</h1>
        <div style={{ width: '60px', height: '2px', background: color, margin: '12px auto' }}></div>
        <p style={{ color: color, fontSize: '13px', margin: '0 0 20px', letterSpacing: '3px', textTransform: 'uppercase' }}>{personal.title}</p>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px' }}>{[personal.email, personal.phone, personal.location].filter(Boolean).join('  ·  ')}</p>
      </div>
      <div style={{ padding: '36px 56px' }}>
        {personal.summary && <div style={{ marginBottom: '28px', textAlign: 'center' }}><p style={{ fontSize: '13px', color: '#555', fontStyle: 'italic', lineHeight: '1.8', maxWidth: '600px', margin: '0 auto' }}>{personal.summary}</p></div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
          <div>
            {experience.length > 0 && <div style={{ marginBottom: '24px' }}><h2 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '4px', color: color, marginBottom: '14px', borderBottom: `2px solid ${color}`, paddingBottom: '6px' }}>Executive Experience</h2>{experience.map(exp => <div key={exp.id} style={{ marginBottom: '16px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}><p style={{ fontWeight: '700', fontSize: '14px', margin: '0' }}>{exp.position}</p><p style={{ fontSize: '11px', color: '#888', fontStyle: 'italic', margin: '0', whiteSpace: 'nowrap' }}>{formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}</p></div><p style={{ color: color, fontSize: '12px', fontStyle: 'italic', margin: '3px 0 6px' }}>{exp.company}</p>{exp.description && <p style={{ fontSize: '12px', color: '#555', whiteSpace: 'pre-line', lineHeight: '1.7' }}>{exp.description}</p>}</div>)}</div>}
            {projects.length > 0 && <div><h2 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '4px', color: color, marginBottom: '14px', borderBottom: `2px solid ${color}`, paddingBottom: '6px' }}>Key Initiatives</h2>{projects.map(p => <div key={p.id} style={{ marginBottom: '10px' }}><p style={{ fontWeight: '700', fontSize: '13px', margin: '0' }}>{p.name}</p><p style={{ fontSize: '12px', color: '#555', margin: '3px 0 0', fontStyle: 'italic' }}>{p.description}</p></div>)}</div>}
          </div>
          <div>
            {education.length > 0 && <div style={{ marginBottom: '24px' }}><h2 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '4px', color: color, marginBottom: '14px', borderBottom: `2px solid ${color}`, paddingBottom: '6px' }}>Education</h2>{education.map(edu => <div key={edu.id} style={{ marginBottom: '12px' }}><p style={{ fontWeight: '700', fontSize: '13px', margin: '0' }}>{edu.degree} {edu.field && `in ${edu.field}`}</p><p style={{ fontStyle: 'italic', color: '#666', fontSize: '12px', margin: '2px 0 0' }}>{edu.school} | {formatDate(edu.endDate)}</p></div>)}</div>}
            {skills.length > 0 && <div style={{ marginBottom: '24px' }}><h2 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '4px', color: color, marginBottom: '14px', borderBottom: `2px solid ${color}`, paddingBottom: '6px' }}>Core Competencies</h2>{skills.map(s => <div key={s.id} style={{ marginBottom: '8px' }}><p style={{ fontWeight: '700', fontSize: '12px', margin: '0 0 3px' }}>{s.category}</p><p style={{ fontSize: '11px', color: '#666', fontStyle: 'italic' }}>{s.items}</p></div>)}</div>}
            {languages.length > 0 && <div style={{ marginBottom: '24px' }}><h2 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '4px', color: color, marginBottom: '14px', borderBottom: `2px solid ${color}`, paddingBottom: '6px' }}>Languages</h2>{languages.map(l => <p key={l.id} style={{ fontSize: '12px', margin: '0 0 4px' }}>{l.language} — <em style={{ color: '#888' }}>{l.level}</em></p>)}</div>}
            {certifications.length > 0 && <div><h2 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '4px', color: color, marginBottom: '14px', borderBottom: `2px solid ${color}`, paddingBottom: '6px' }}>Certifications</h2>{certifications.map(c => <div key={c.id} style={{ marginBottom: '8px' }}><p style={{ fontWeight: '700', fontSize: '12px', margin: '0' }}>{c.name}</p><p style={{ fontSize: '11px', color: '#888', fontStyle: 'italic', margin: '0' }}>{c.issuer} {c.date && `• ${formatDate(c.date)}`}</p></div>)}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// =================== TEMPLATE 12: SIMPLE ===================
function SimpleTemplate({ data, color }) {
  const { personal, experience, education, skills, languages, certifications, projects } = data;
  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', background: '#fff', color: '#333', minHeight: '297mm', padding: '40px 48px', fontSize: '13px', lineHeight: '1.6' }}>
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        {personal.photo && <img src={personal.photo} alt="" style={{ width: '75px', height: '75px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${color}`, flexShrink: 0 }} />}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '26px', fontWeight: '700', margin: '0 0 2px', color: '#111' }}>{personal.name}</h1>
          <p style={{ fontSize: '14px', color: color, margin: '0 0 10px' }}>{personal.title}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', color: '#666' }}>
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span>|  {personal.phone}</span>}
            {personal.location && <span>|  {personal.location}</span>}
            {personal.linkedin && <span>|  {personal.linkedin}</span>}
          </div>
        </div>
      </div>
      {personal.summary && <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #ddd' }}><p style={{ color: '#555', lineHeight: '1.7', margin: 0 }}>{personal.summary}</p></div>}
      {experience.length > 0 && <div style={{ marginBottom: '20px' }}><h2 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#111', borderBottom: `2px solid ${color}`, paddingBottom: '4px', marginBottom: '12px' }}>Work Experience</h2>{experience.map(exp => <div key={exp.id} style={{ marginBottom: '14px' }}><div style={{ display: 'flex', justifyContent: 'space-between' }}><div><p style={{ fontWeight: '700', fontSize: '13px', margin: '0' }}>{exp.position}</p><p style={{ color: '#666', fontSize: '12px', margin: '2px 0 0' }}>{exp.company}</p></div><p style={{ fontSize: '12px', color: '#888' }}>{formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}</p></div>{exp.description && <p style={{ marginTop: '6px', fontSize: '12px', color: '#555', whiteSpace: 'pre-line' }}>{exp.description}</p>}</div>)}</div>}
      {education.length > 0 && <div style={{ marginBottom: '20px' }}><h2 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#111', borderBottom: `2px solid ${color}`, paddingBottom: '4px', marginBottom: '12px' }}>Education</h2>{education.map(edu => <div key={edu.id} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}><div><p style={{ fontWeight: '700', fontSize: '13px', margin: '0' }}>{edu.degree} {edu.field && `in ${edu.field}`}</p><p style={{ color: '#666', fontSize: '12px', margin: '2px 0 0' }}>{edu.school} {edu.gpa && `• GPA: ${edu.gpa}`}</p></div><p style={{ fontSize: '12px', color: '#888' }}>{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</p></div>)}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        {skills.length > 0 && <div><h2 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#111', borderBottom: `2px solid ${color}`, paddingBottom: '4px', marginBottom: '10px' }}>Skills</h2>{skills.map(s => <div key={s.id} style={{ marginBottom: '6px' }}><p style={{ fontWeight: '600', fontSize: '12px', margin: '0 0 2px' }}>{s.category}</p><p style={{ fontSize: '11px', color: '#666', margin: 0 }}>{s.items}</p></div>)}</div>}
        {languages.length > 0 && <div><h2 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#111', borderBottom: `2px solid ${color}`, paddingBottom: '4px', marginBottom: '10px' }}>Languages</h2>{languages.map(l => <p key={l.id} style={{ fontSize: '12px', margin: '0 0 4px' }}>{l.language} — <span style={{ color: '#888' }}>{l.level}</span></p>)}</div>}
        {certifications.length > 0 && <div><h2 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#111', borderBottom: `2px solid ${color}`, paddingBottom: '4px', marginBottom: '10px' }}>Certifications</h2>{certifications.map(c => <div key={c.id} style={{ marginBottom: '6px' }}><p style={{ fontWeight: '600', fontSize: '12px', margin: '0' }}>{c.name}</p><p style={{ fontSize: '11px', color: '#888', margin: '0' }}>{c.issuer}</p></div>)}</div>}
      </div>
      {projects && projects.length > 0 && <div style={{ marginTop: '20px' }}><h2 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#111', borderBottom: `2px solid ${color}`, paddingBottom: '4px', marginBottom: '10px' }}>Projects</h2>{projects.map(p => <div key={p.id} style={{ marginBottom: '8px' }}><p style={{ fontWeight: '600', fontSize: '12px', margin: '0 0 2px' }}>{p.name} {p.tech && <span style={{ fontWeight: '400', color: '#888' }}>— {p.tech}</span>}</p><p style={{ fontSize: '11px', color: '#555', margin: 0 }}>{p.description}</p></div>)}</div>}
    </div>
  );
}

// =================== TEMPLATE 13: ACADEMIC PRO ===================
function AcademicTemplate({ data, color }) {
  const { personal, experience, education, skills, languages, certifications, projects } = data;
  return (
    <div style={{ fontFamily: '"Garamond", "Georgia", serif', color: '#1a202c', fontSize: '13px', lineHeight: '1.6', background: '#fff', padding: '48px 56px', minHeight: '297mm' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '500', margin: '0 0 8px', letterSpacing: '0.5px', textTransform: 'uppercase', color: '#2d3748' }}>{personal.name}</h1>
        <p style={{ fontSize: '14px', color: '#718096', margin: '0 0 12px', fontStyle: 'italic' }}>{personal.title}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', fontSize: '11px', color: '#4a5568', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '8px 0' }}>
          {personal.email && <span>Email: {personal.email}</span>}
          {personal.phone && <span>• Phone: {personal.phone}</span>}
          {personal.location && <span>• Location: {personal.location}</span>}
          {personal.website && <span>• Web: {personal.website}</span>}
          {personal.linkedin && <span>• LinkedIn: {personal.linkedin}</span>}
        </div>
      </div>
      
      {personal.summary && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `2px solid ${color}`, color: '#2d3748', paddingBottom: '3px', marginBottom: '8px' }}>Research Statement & Summary</h2>
          <p style={{ textAlign: 'justify', color: '#2d3748' }}>{personal.summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `2px solid ${color}`, color: '#2d3748', paddingBottom: '3px', marginBottom: '12px' }}>Professional Appointments</h2>
          {experience.map(exp => (
            <div key={exp.id} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                <span>{exp.position}</span>
                <span style={{ fontWeight: 'normal', fontSize: '12px', color: '#718096' }}>{formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}</span>
              </div>
              <div style={{ fontStyle: 'italic', color: '#4a5568', fontSize: '12px', marginBottom: '4px' }}>{exp.company}</div>
              {exp.description && <p style={{ color: '#2d3748', whiteSpace: 'pre-line', fontSize: '12px', paddingLeft: '8px' }}>{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `2px solid ${color}`, color: '#2d3748', paddingBottom: '3px', marginBottom: '12px' }}>Education</h2>
          {education.map(edu => (
            <div key={edu.id} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '600' }}>
                <span>{edu.degree} {edu.field && `in ${edu.field}`}</span>
                <span style={{ fontWeight: 'normal', fontSize: '12px', color: '#718096' }}>{formatDate(edu.startDate)} — {formatDate(edu.endDate)}</span>
              </div>
              <div style={{ fontStyle: 'italic', color: '#4a5568', fontSize: '12px' }}>{edu.school} {edu.gpa && `• GPA: ${edu.gpa}`}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {skills.length > 0 && (
          <div>
            <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `2px solid ${color}`, color: '#2d3748', paddingBottom: '3px', marginBottom: '10px' }}>Areas of Expertise</h2>
            {skills.map(s => (
              <p key={s.id} style={{ marginBottom: '6px', fontSize: '12px' }}>
                <strong>{s.category}:</strong> {s.items}
              </p>
            ))}
          </div>
        )}
        
        <div>
          {languages.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `2px solid ${color}`, color: '#2d3748', paddingBottom: '3px', marginBottom: '10px' }}>Languages</h2>
              {languages.map(l => (
                <p key={l.id} style={{ marginBottom: '4px', fontSize: '12px' }}>
                  {l.language} ({l.level})
                </p>
              ))}
            </div>
          )}

          {certifications.length > 0 && (
            <div>
              <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `2px solid ${color}`, color: '#2d3748', paddingBottom: '3px', marginBottom: '10px' }}>Honors & Certifications</h2>
              {certifications.map(c => (
                <p key={c.id} style={{ marginBottom: '4px', fontSize: '11px', color: '#4a5568' }}>
                  <strong>{c.name}</strong> — {c.issuer} {c.date && `(${formatDate(c.date)})`}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      {projects.length > 0 && (
        <div>
          <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: `2px solid ${color}`, color: '#2d3748', paddingBottom: '3px', marginBottom: '12px' }}>Selected Publications & Projects</h2>
          {projects.map(p => (
            <div key={p.id} style={{ marginBottom: '10px' }}>
              <p style={{ fontWeight: '600', fontSize: '12px', margin: '0' }}>{p.name} {p.tech && <span style={{ fontWeight: 'normal', color: '#718096' }}>({p.tech})</span>}</p>
              <p style={{ fontSize: '11px', color: '#4a5568', margin: '2px 0 0' }}>{p.description}</p>
              {p.link && <p style={{ fontSize: '11px', color: color }}>{p.link}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =================== TEMPLATE 14: EXECUTIVE PRO ===================
function ModernExecutiveTemplate({ data, color }) {
  const { personal, experience, education, skills, languages, certifications, projects } = data;
  return (
    <div style={{ fontFamily: '"Georgia", serif', color: '#2d3748', fontSize: '13px', lineHeight: '1.6', background: '#fff', minHeight: '297mm', display: 'flex' }}>
      {/* Sidebar: Deep Executive Blue */}
      <div style={{ width: '33%', background: '#0f172a', color: '#f8fafc', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div style={{ textAlign: 'center' }}>
          {personal.photo ? (
            <img src={personal.photo} alt="" style={{ width: '95px', height: '95px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${color}`, marginBottom: '16px' }} />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px' }}>👤</div>
          )}
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#fff', margin: '0 0 6px', fontFamily: 'system-ui, sans-serif' }}>{personal.name}</h1>
          <p style={{ fontSize: '12px', color: color, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600', fontFamily: 'system-ui, sans-serif' }}>{personal.title}</p>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
          <h3 style={{ fontSize: '11px', color: color, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', fontFamily: 'system-ui, sans-serif' }}>Contact Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', color: '#cbd5e1', fontFamily: 'system-ui, sans-serif' }}>
            {personal.email && <span>✉ {personal.email}</span>}
            {personal.phone && <span>📱 {personal.phone}</span>}
            {personal.location && <span>📍 {personal.location}</span>}
            {personal.website && <span>🌐 {personal.website}</span>}
            {personal.linkedin && <span>💼 {personal.linkedin}</span>}
          </div>
        </div>

        {skills.length > 0 && (
          <div>
            <h3 style={{ fontSize: '11px', color: color, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px', fontFamily: 'system-ui, sans-serif' }}>Expertise</h3>
            {skills.map(s => (
              <div key={s.id} style={{ marginBottom: '10px' }}>
                <p style={{ fontWeight: '600', fontSize: '11px', color: '#fff', fontFamily: 'system-ui, sans-serif', marginBottom: '4px' }}>{s.category}</p>
                <p style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'system-ui, sans-serif' }}>{s.items}</p>
              </div>
            ))}
          </div>
        )}

        {languages.length > 0 && (
          <div>
            <h3 style={{ fontSize: '11px', color: color, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', fontFamily: 'system-ui, sans-serif' }}>Languages</h3>
            {languages.map(l => (
              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#cbd5e1', fontFamily: 'system-ui, sans-serif', marginBottom: '4px' }}>
                <span>{l.language}</span>
                <span style={{ color: color }}>{l.level}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Panel: Clean White with Georgia Serif */}
      <div style={{ flex: 1, padding: '40px 32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {personal.summary && (
          <div>
            <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#0f172a', borderBottom: `2px solid ${color}`, paddingBottom: '6px', marginBottom: '10px', fontFamily: 'system-ui, sans-serif' }}>Executive Summary</h2>
            <p style={{ fontSize: '13px', color: '#334155', lineHeight: '1.7', textAlign: 'justify' }}>{personal.summary}</p>
          </div>
        )}

        {experience.length > 0 && (
          <div>
            <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#0f172a', borderBottom: `2px solid ${color}`, paddingBottom: '6px', marginBottom: '14px', fontFamily: 'system-ui, sans-serif' }}>Professional Timeline</h2>
            {experience.map(exp => (
              <div key={exp.id} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h4 style={{ fontWeight: '700', fontSize: '14px', color: '#0f172a', margin: '0' }}>{exp.position}</h4>
                  <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'system-ui, sans-serif', fontWeight: '500' }}>
                    {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                <div style={{ color: color, fontSize: '12px', fontWeight: '600', fontStyle: 'italic', margin: '2px 0 6px' }}>{exp.company}</div>
                {exp.description && <p style={{ fontSize: '12px', color: '#334155', whiteSpace: 'pre-line', lineHeight: '1.7' }}>{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {education.length > 0 && (
          <div>
            <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#0f172a', borderBottom: `2px solid ${color}`, paddingBottom: '6px', marginBottom: '12px', fontFamily: 'system-ui, sans-serif' }}>Education credentials</h2>
            {education.map(edu => (
              <div key={edu.id} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h4 style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a', margin: '0' }}>{edu.degree} {edu.field && `in ${edu.field}`}</h4>
                  <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'system-ui, sans-serif' }}>{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</span>
                </div>
                <div style={{ color: '#475569', fontSize: '12px', fontStyle: 'italic', margin: '2px 0 0' }}>{edu.school} {edu.gpa && `• GPA: ${edu.gpa}`}</div>
              </div>
            ))}
          </div>
        )}

        {certifications.length > 0 && (
          <div>
            <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#0f172a', borderBottom: `2px solid ${color}`, paddingBottom: '6px', marginBottom: '12px', fontFamily: 'system-ui, sans-serif' }}>Boards & Certifications</h2>
            {certifications.map(c => (
              <div key={c.id} style={{ marginBottom: '6px' }}>
                <p style={{ fontWeight: '700', fontSize: '12px', color: '#0f172a', margin: '0' }}>{c.name}</p>
                <p style={{ fontSize: '11px', color: '#64748b', margin: '0', fontFamily: 'system-ui, sans-serif' }}>{c.issuer} {c.date && `• ${formatDate(c.date)}`}</p>
              </div>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <div>
            <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#0f172a', borderBottom: `2px solid ${color}`, paddingBottom: '6px', marginBottom: '12px', fontFamily: 'system-ui, sans-serif' }}>Signature Initiatives</h2>
            {projects.map(p => (
              <div key={p.id} style={{ marginBottom: '10px' }}>
                <p style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a', margin: '0' }}>{p.name} {p.tech && <span style={{ fontWeight: '700', color: color, fontSize: '11px', fontFamily: 'system-ui, sans-serif' }}>• {p.tech}</span>}</p>
                <p style={{ fontSize: '12px', color: '#334155', margin: '2px 0' }}>{p.description}</p>
                {p.link && <p style={{ fontSize: '11px', color: color, fontFamily: 'system-ui, sans-serif' }}>{p.link}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =================== TEMPLATE 15: FAANG ATS ===================
function FaangAtsTemplate({ data, color }) {
  const { personal, experience, education, skills, languages, certifications, projects } = data;
  return (
    <div style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', color: '#000', fontSize: '12px', lineHeight: '1.4', background: '#fff', padding: '40px 48px', minHeight: '297mm' }}>
      <div style={{ textAlign: 'center', marginBottom: '18px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px', textTransform: 'uppercase' }}>{personal.name}</h1>
        <p style={{ fontSize: '12px', margin: '0 0 6px' }}>
          {[
            personal.location,
            personal.phone,
            personal.email,
            personal.website,
            personal.linkedin
          ].filter(Boolean).join('  |  ')}
        </p>
      </div>

      {personal.summary && (
        <div style={{ marginBottom: '14px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '6px' }}>Summary</h2>
          <p style={{ margin: '0', textAlign: 'justify' }}>{personal.summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '8px' }}>Experience</h2>
          {experience.map(exp => (
            <div key={exp.id} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>{exp.company}</span>
                <span>{formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontStyle: 'italic', marginBottom: '4px' }}>
                <span>{exp.position}</span>
                <span>{personal.location}</span>
              </div>
              {exp.description && <p style={{ margin: '0', whiteSpace: 'pre-line', paddingLeft: '10px' }}>{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '8px' }}>Education</h2>
          {education.map(edu => (
            <div key={edu.id} style={{ marginBottom: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>{edu.school}</span>
                <span>{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{edu.degree} {edu.field && `in ${edu.field}`}</span>
                {edu.gpa && <span>GPA: {edu.gpa}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {projects.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '8px' }}>Projects</h2>
          {projects.map(p => (
            <div key={p.id} style={{ marginBottom: '8px' }}>
              <div style={{ fontWeight: 'bold' }}>
                {p.name} {p.tech && <span style={{ fontWeight: 'normal', fontStyle: 'italic' }}>({p.tech})</span>}
                {p.link && <span style={{ fontWeight: 'normal', fontSize: '11px', marginLeft: '8px' }}>- {p.link}</span>}
              </div>
              <p style={{ margin: '2px 0 0', paddingLeft: '10px' }}>{p.description}</p>
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '6px' }}>Technical Skills</h2>
          {skills.map(s => (
            <div key={s.id} style={{ marginBottom: '4px' }}>
              <strong>{s.category}:</strong> {s.items}
            </div>
          ))}
        </div>
      )}

      {(languages.length > 0 || certifications.length > 0) && (
        <div>
          <h2 style={{ fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase', borderBottom: '1px solid #000', paddingBottom: '2px', marginBottom: '6px' }}>Languages & Certifications</h2>
          {languages.length > 0 && (
            <div style={{ marginBottom: '4px' }}>
              <strong>Languages:</strong> {languages.map(l => `${l.language} (${l.level})`).join(', ')}
            </div>
          )}
          {certifications.length > 0 && (
            <div>
              <strong>Certifications:</strong> {certifications.map(c => `${c.name} (${c.issuer} - ${formatDate(c.date)})`).join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =================== TEMPLATE 16: CREATIVE SIDEBAR ===================
function CreativeSidebarTemplate({ data, color }) {
  const { personal, experience, education, skills, languages, certifications, projects } = data;
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b', fontSize: '13px', lineHeight: '1.5', background: '#fff', minHeight: '297mm', display: 'flex' }}>
      <div style={{ width: '32%', background: '#f8fafc', borderRight: '1px solid #e2e8f0', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          {personal.photo ? (
            <img src={personal.photo} alt="" style={{ width: '100px', height: '100px', borderRadius: '24px', objectFit: 'cover', border: `3px solid ${color}`, marginBottom: '16px', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }} />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px', color: color }}>🎨</div>
          )}
        </div>

        <div>
          <h3 style={{ fontSize: '11px', color: color, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold', borderBottom: `2px solid ${color}30`, paddingBottom: '4px', marginBottom: '12px' }}>Personal Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px', color: '#475569' }}>
            {personal.email && <div><span style={{ color: color, marginRight: '4px' }}>✉</span> {personal.email}</div>}
            {personal.phone && <div><span style={{ color: color, marginRight: '4px' }}>📱</span> {personal.phone}</div>}
            {personal.location && <div><span style={{ color: color, marginRight: '4px' }}>📍</span> {personal.location}</div>}
            {personal.website && <div><span style={{ color: color, marginRight: '4px' }}>🌐</span> {personal.website}</div>}
            {personal.linkedin && <div><span style={{ color: color, marginRight: '4px' }}>💼</span> {personal.linkedin}</div>}
          </div>
        </div>

        {skills.length > 0 && (
          <div>
            <h3 style={{ fontSize: '11px', color: color, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold', borderBottom: `2px solid ${color}30`, paddingBottom: '4px', marginBottom: '12px' }}>Skills</h3>
            {skills.map(s => (
              <div key={s.id} style={{ marginBottom: '10px' }}>
                <p style={{ fontWeight: 'bold', fontSize: '11px', color: '#1e293b', marginBottom: '3px' }}>{s.category}</p>
                <p style={{ fontSize: '10px', color: '#64748b' }}>{s.items}</p>
              </div>
            ))}
          </div>
        )}

        {languages.length > 0 && (
          <div>
            <h3 style={{ fontSize: '11px', color: color, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold', borderBottom: `2px solid ${color}30`, paddingBottom: '4px', marginBottom: '12px' }}>Languages</h3>
            {languages.map(l => (
              <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
                <span style={{ fontWeight: '500' }}>{l.language}</span>
                <span style={{ color: color, fontWeight: 'bold' }}>{l.level}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, padding: '40px 36px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ borderBottom: `4px solid ${color}`, paddingBottom: '16px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>{personal.name}</h1>
          <p style={{ fontSize: '15px', color: color, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{personal.title}</p>
        </div>

        {personal.summary && (
          <div>
            <h2 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#0f172a', marginBottom: '8px' }}>Profile</h2>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>{personal.summary}</p>
          </div>
        )}

        {experience.length > 0 && (
          <div>
            <h2 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#0f172a', marginBottom: '12px' }}>Professional History</h2>
            {experience.map(exp => (
              <div key={exp.id} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h4 style={{ fontWeight: 'bold', fontSize: '14px', color: '#0f172a', margin: '0' }}>{exp.position}</h4>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                    {formatDate(exp.startDate)} – {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </span>
                </div>
                <div style={{ color: color, fontSize: '12px', fontWeight: 'bold', margin: '2px 0 6px' }}>{exp.company}</div>
                {exp.description && <p style={{ fontSize: '12px', color: '#475569', whiteSpace: 'pre-line' }}>{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {education.length > 0 && (
          <div>
            <h2 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#0f172a', marginBottom: '12px' }}>Education</h2>
            {education.map(edu => (
              <div key={edu.id} style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h4 style={{ fontWeight: 'bold', fontSize: '13px', color: '#0f172a', margin: '0' }}>{edu.degree} {edu.field && `in ${edu.field}`}</h4>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{formatDate(edu.startDate)} – {formatDate(edu.endDate)}</span>
                </div>
                <div style={{ color: '#475569', fontSize: '12px', margin: '2px 0 0' }}>{edu.school} {edu.gpa && `• GPA: ${edu.gpa}`}</div>
              </div>
            ))}
          </div>
        )}

        {certifications.length > 0 && (
          <div>
            <h2 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#0f172a', marginBottom: '10px' }}>Certifications</h2>
            {certifications.map(c => (
              <div key={c.id} style={{ marginBottom: '6px' }}>
                <p style={{ fontWeight: 'bold', fontSize: '12px', color: '#0f172a', margin: '0' }}>{c.name}</p>
                <p style={{ fontSize: '11px', color: '#64748b', margin: '0' }}>{c.issuer} {c.date && `• ${formatDate(c.date)}`}</p>
              </div>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <div>
            <h2 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#0f172a', marginBottom: '10px' }}>Featured Work</h2>
            {projects.map(p => (
              <div key={p.id} style={{ marginBottom: '10px' }}>
                <p style={{ fontWeight: 'bold', fontSize: '13px', color: '#0f172a', margin: '0' }}>{p.name} {p.tech && <span style={{ fontWeight: 'normal', color: color, fontSize: '11px' }}>({p.tech})</span>}</p>
                <p style={{ fontSize: '12px', color: '#475569', margin: '2px 0' }}>{p.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// =================== TEMPLATE 17: ELEGANT SERIF ===================
function ElegantSerifTemplate({ data, color }) {
  const { personal, experience, education, skills, languages, certifications, projects } = data;
  return (
    <div style={{ fontFamily: '"Georgia", Times, serif', color: '#2d3748', fontSize: '13px', lineHeight: '1.6', background: '#fff', padding: '48px 56px', minHeight: '297mm' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'normal', color: '#1a202c', margin: '0 0 6px', letterSpacing: '2px', textTransform: 'uppercase' }}>{personal.name}</h1>
        <p style={{ fontSize: '13px', color: color, margin: '0 0 12px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '600' }}>{personal.title}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', fontSize: '11px', color: '#4a5568', borderTop: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1', padding: '6px 0' }}>
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>• {personal.phone}</span>}
          {personal.location && <span>• {personal.location}</span>}
          {personal.website && <span>• {personal.website}</span>}
          {personal.linkedin && <span>• {personal.linkedin}</span>}
        </div>
      </div>

      {personal.summary && (
        <div style={{ marginBottom: '22px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a202c', marginBottom: '6px', textAlign: 'center' }}>Professional Statement</h2>
          <div style={{ width: '40px', height: '1px', background: color, margin: '0 auto 10px' }}></div>
          <p style={{ textAlign: 'justify', color: '#4a5568', fontStyle: 'italic', margin: '0' }}>{personal.summary}</p>
        </div>
      )}

      {experience.length > 0 && (
        <div style={{ marginBottom: '22px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a202c', marginBottom: '6px', textAlign: 'center' }}>Career Timeline</h2>
          <div style={{ width: '40px', height: '1px', background: color, margin: '0 auto 12px' }}></div>
          {experience.map(exp => (
            <div key={exp.id} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>{exp.position}</span>
                <span style={{ fontWeight: 'normal', fontSize: '11px', color: '#718096' }}>{formatDate(exp.startDate)} — {exp.current ? 'Present' : formatDate(exp.endDate)}</span>
              </div>
              <div style={{ fontStyle: 'italic', color: '#4a5568', fontSize: '12px', marginBottom: '4px' }}>{exp.company}</div>
              {exp.description && <p style={{ color: '#2d3748', whiteSpace: 'pre-line', fontSize: '12px', paddingLeft: '12px', borderLeft: `1px solid ${color}40` }}>{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div style={{ marginBottom: '22px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a202c', marginBottom: '6px', textAlign: 'center' }}>Academic credentials</h2>
          <div style={{ width: '40px', height: '1px', background: color, margin: '0 auto 10px' }}></div>
          {education.map(edu => (
            <div key={edu.id} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>{edu.school}</span>
                <span style={{ fontWeight: 'normal', fontSize: '11px', color: '#718096' }}>{formatDate(edu.startDate)} — {formatDate(edu.endDate)}</span>
              </div>
              <div style={{ fontStyle: 'italic', color: '#4a5568', fontSize: '12px' }}>{edu.degree} {edu.field && `in ${edu.field}`} {edu.gpa && `• GPA: ${edu.gpa}`}</div>
            </div>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <div style={{ marginBottom: '22px' }}>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a202c', marginBottom: '6px', textAlign: 'center' }}>Competencies</h2>
          <div style={{ width: '40px', height: '1px', background: color, margin: '0 auto 10px' }}></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {skills.map(s => (
              <div key={s.id} style={{ fontSize: '12px' }}>
                <strong>{s.category}:</strong> <span style={{ color: '#4a5568' }}>{s.items}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div>
          <h2 style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', color: '#1a202c', marginBottom: '6px', textAlign: 'center' }}>Key Projects</h2>
          <div style={{ width: '40px', height: '1px', background: color, margin: '0 auto 10px' }}></div>
          {projects.map(p => (
            <div key={p.id} style={{ marginBottom: '8px' }}>
              <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{p.name} {p.tech && <span style={{ fontWeight: 'normal', color: '#718096' }}>({p.tech})</span>}</div>
              <p style={{ fontSize: '12px', color: '#4a5568', margin: '2px 0 0' }}>{p.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}