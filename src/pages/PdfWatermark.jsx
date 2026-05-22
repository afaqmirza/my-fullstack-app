import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, Type, CheckCircle, AlertCircle, Droplets } from 'lucide-react';
import { executeTool } from '../lib/api';
import './ToolsExtra.css';

export default function PdfWatermark() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [opacity, setOpacity] = useState(0.3);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const fileInputRef = useRef(null);

  const handleProcess = async () => {
    if (!file || !text) return;
    setStatus('processing');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('text', text);
    formData.append('opacity', opacity);

    try {
      const response = await executeTool('pdf-watermark', formData);

      if (!response.ok) throw new Error('Watermark failed.');
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
    setText('');
  };

  return (
    <div className="pdf-watermark-page">
      <section className="tool-header-hero">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>PDF Watermark</h1>
          <p>Add secure text watermarks to your PDF documents with custom transparency.</p>
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
            <motion.div key="options" className="watermark-options-card">
              <div className="file-preview-strip">
                <Type size={24} color="var(--primary-blue)" />
                <span className="file-name">{file.name}</span>
                <button className="btn-remove" onClick={reset}>Change</button>
              </div>

              <div className="input-group">
                <label>Watermark Text</label>
                <input 
                  type="text" 
                  value={text} 
                  onChange={(e) => setText(e.target.value)} 
                  placeholder="e.g. CONFIDENTIAL"
                  className="main-text-input"
                />
              </div>

              <div className="input-group">
                <div className="label-with-value">
                  <label>Opacity</label>
                  <span>{Math.round(opacity * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.0" 
                  step="0.1" 
                  value={opacity} 
                  onChange={(e) => setOpacity(parseFloat(e.target.value))} 
                />
              </div>

              <button className="btn btn-primary btn-large" onClick={handleProcess} disabled={!text}>
                Apply Watermark
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
              <h3>Applying Watermark...</h3>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div key="success" className="success-card">
              <CheckCircle size={48} color="var(--success)" />
              <h3>Success!</h3>
              <div className="success-actions">
                <a href={downloadUrl} download={`watermarked_${file.name}`} className="btn btn-primary">Download PDF</a>
                <button className="btn-secondary" onClick={reset}>Watermark Another</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
