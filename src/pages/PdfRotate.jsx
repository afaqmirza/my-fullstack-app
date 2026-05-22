import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, RotateCw, CheckCircle, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { executeTool } from '../lib/api';
import './ToolsExtra.css';

export default function PdfRotate() {
  const [file, setFile] = useState(null);
  const [angle, setAngle] = useState(90);
  const [pages, setPages] = useState('ALL');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const fileInputRef = useRef(null);

  const handleProcess = async () => {
    if (!file) return;
    setStatus('processing');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('angle', angle);
    formData.append('pages', pages);

    try {
      const response = await executeTool('pdf-rotate', formData);

      if (!response.ok) throw new Error('Rotation failed.');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setDownloadUrl('');
    setPages('ALL');
  };

  return (
    <div className="pdf-rotate-page">
      <section className="tool-header-hero">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>Rotate PDF</h1>
          <p>Rotate specific pages or the entire document to the perfect orientation.</p>
        </motion.div>
      </section>

      <section className="workspace-container">
        <AnimatePresence mode="wait">
          {status === 'idle' && !file && (
            <motion.div key="upload" className="upload-zone" onClick={() => fileInputRef.current.click()}>
              <FileUp size={48} />
              <h2>Select PDF file</h2>
              <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} accept=".pdf" style={{ display: 'none' }} />
            </motion.div>
          )}

          {(status === 'idle' || status === 'error') && file && (
            <motion.div key="options" className="rotate-options-card">
              <div className="file-preview-strip">
                <RefreshCw size={24} color="var(--primary-blue)" />
                <span className="file-name">{file.name}</span>
                <button className="btn-remove" onClick={reset}>Change</button>
              </div>

              <div className="options-grid">
                <div className="option-group">
                  <label>Rotation Angle</label>
                  <div className="angle-picker">
                    {[90, 180, 270].map(a => (
                      <button key={a} className={angle === a ? 'active' : ''} onClick={() => setAngle(a)}>
                        {a}°
                      </button>
                    ))}
                  </div>
                </div>

                <div className="option-group">
                  <label>Pages to Rotate</label>
                  <div className="page-input-wrapper">
                    <Layers size={18} />
                    <input type="text" value={pages} onChange={(e) => setPages(e.target.value)} placeholder="e.g. 1, 3, 5-10 or ALL" />
                  </div>
                </div>
              </div>

              <button className="btn btn-primary btn-large" onClick={handleProcess}>
                Rotate PDF
              </button>

              {status === 'error' && (
                <div className="error-message-inline">
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}
            </motion.div>
          )}

          {status === 'processing' && (
            <motion.div key="processing" className="processing-card">
              <div className="processing-loader"></div>
              <h3>Rotating Pages...</h3>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div key="success" className="success-card">
              <CheckCircle size={48} color="var(--success)" />
              <h3>PDF Rotated!</h3>
              <div className="success-actions">
                <a href={downloadUrl} download={`rotated_${file.name}`} className="btn btn-primary">Download PDF</a>
                <button className="btn-secondary" onClick={reset}>Rotate Another</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
