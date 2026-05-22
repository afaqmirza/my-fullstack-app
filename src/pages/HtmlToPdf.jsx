import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, Code, CheckCircle, AlertCircle, FileCode } from 'lucide-react';
import { executeTool } from '../lib/api';
import './ToolsExtra.css';

export default function HtmlToPdf() {
  const [file, setFile] = useState(null);
  const [htmlCode, setHtmlCode] = useState('');
  const [mode, setMode] = useState('upload'); // 'upload' or 'paste'
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const fileInputRef = useRef(null);

  const handleConvert = async () => {
    if (mode === 'upload' && !file) return;
    if (mode === 'paste' && !htmlCode) return;

    setStatus('processing');
    const formData = new FormData();
    if (mode === 'upload') {
      formData.append('file', file);
    } else {
      formData.append('html_code', htmlCode);
    }

    try {
      const response = await executeTool('html-to-pdf', formData);

      if (!response.ok) throw new Error('Conversion failed.');
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
    setHtmlCode('');
    setStatus('idle');
    setDownloadUrl('');
  };

  return (
    <div className="html-to-pdf-page pdf-rotate-page">
      <section className="tool-header-hero">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>HTML to PDF</h1>
          <p>Convert HTML files or raw source code into PDF documents instantly.</p>
        </motion.div>
      </section>

      <section className="workspace-container">
        <div className="vault-tabs">
          <button className={mode === 'upload' ? 'active' : ''} onClick={() => setMode('upload')}>
            <FileCode size={18} /> Upload HTML
          </button>
          <button className={mode === 'paste' ? 'active' : ''} onClick={() => setMode('paste')}>
            <Code size={18} /> Paste Code
          </button>
        </div>

        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div key="options" className="rotate-options-card">
              {mode === 'upload' ? (
                <div 
                  className={`upload-zone ${file ? 'has-file' : ''}`} 
                  onClick={() => !file && fileInputRef.current.click()}
                >
                  {file ? (
                    <div className="file-info-large">
                      <FileCode size={48} color="var(--primary-blue)" />
                      <h3>{file.name}</h3>
                      <button className="btn-remove" onClick={(e) => { e.stopPropagation(); setFile(null); }}>Remove</button>
                    </div>
                  ) : (
                    <>
                      <FileUp size={48} />
                      <h2>Select HTML File</h2>
                      <p>or drag and drop here</p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} onChange={(e) => setFile(e.target.files[0])} accept=".html" style={{ display: 'none' }} />
                </div>
              ) : (
                <div className="paste-area">
                  <label>Paste HTML Code</label>
                  <textarea 
                    value={htmlCode} 
                    onChange={(e) => setHtmlCode(e.target.value)} 
                    placeholder="<html><body><h1>Hello World</h1></body></html>"
                    rows={10}
                  />
                </div>
              )}

              <button 
                className="btn btn-primary btn-large" 
                onClick={handleConvert}
                disabled={mode === 'upload' ? !file : !htmlCode}
                style={{ marginTop: '2rem' }}
              >
                Convert to PDF
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
              <h3>Converting...</h3>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div key="success" className="success-card">
              <CheckCircle size={48} color="var(--success)" />
              <h3>PDF Generated!</h3>
              <div className="success-actions">
                <a href={downloadUrl} download="converted.pdf" className="btn btn-primary">Download PDF</a>
                <button className="btn-secondary" onClick={reset}>Convert Another</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
