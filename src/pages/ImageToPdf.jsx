import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, Image as ImageIcon, CheckCircle, AlertCircle, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { executeTool } from '../lib/api';
import './ImageToPdf.css';

export default function ImageToPdf() {
  const [files, setFiles] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle', 'processing', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const addFiles = (newFiles) => {
    const validFiles = newFiles.filter(f => 
      ['image/jpeg', 'image/png', 'image/webp', 'image/bmp'].includes(f.type)
    );
    if (validFiles.length < newFiles.length) {
      setErrorMessage('Some files were skipped. Only JPG, PNG, WEBP, and BMP are supported.');
    }
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const moveFile = (index, direction) => {
    const newFiles = [...files];
    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < files.length) {
      [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
      setFiles(newFiles);
    }
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setStatus('processing');
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    try {
      const response = await executeTool('image-to-pdf', formData);

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
    setFiles([]);
    setStatus('idle');
    setDownloadUrl('');
    setErrorMessage('');
  };

  return (
    <div className="image-to-pdf-page">
      <section className="tool-header-hero">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>Image to PDF</h1>
          <p>Convert your photos and images to a high-quality PDF document instantly.</p>
        </motion.div>
      </section>

      <section className="workspace-container">
        <AnimatePresence mode="wait">
          {status === 'idle' && files.length === 0 && (
            <motion.div 
              key="upload" 
              className={`upload-zone ${isDragActive ? 'active' : ''}`}
              onDragOver={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
            >
              <FileUp size={48} />
              <h2>Select Images</h2>
              <p>or drop JPG, PNG, WEBP here</p>
              <input 
                type="file" 
                multiple 
                ref={fileInputRef} 
                onChange={(e) => addFiles(Array.from(e.target.files))}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </motion.div>
          )}

          {status === 'idle' && files.length > 0 && (
            <motion.div key="list" className="file-list-container">
              <div className="list-header">
                <h3>{files.length} Images Selected</h3>
                <button className="btn-add-more" onClick={() => fileInputRef.current.click()}>+ Add More</button>
              </div>
              <div className="images-grid">
                {files.map((file, idx) => (
                  <div key={idx} className="image-card">
                    <div className="image-preview-placeholder">
                      <ImageIcon size={24} />
                    </div>
                    <div className="image-info">
                      <span className="file-name">{file.name}</span>
                    </div>
                    <div className="image-actions">
                      <button onClick={() => moveFile(idx, -1)} disabled={idx === 0}><ArrowUp size={16}/></button>
                      <button onClick={() => moveFile(idx, 1)} disabled={idx === files.length - 1}><ArrowDown size={16}/></button>
                      <button className="btn-remove" onClick={() => removeFile(idx)}><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="action-bar">
                <button className="btn btn-primary btn-large" onClick={handleConvert}>Convert to PDF</button>
                <button className="btn-secondary" onClick={reset}>Clear All</button>
              </div>
            </motion.div>
          )}

          {status === 'processing' && (
            <motion.div key="processing" className="processing-card">
              <div className="processing-loader"></div>
              <h3>Generating PDF...</h3>
              <p>Wrapping your images into a beautiful document.</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div key="success" className="success-card">
              <CheckCircle size={48} color="var(--success)" />
              <h3>PDF Ready!</h3>
              <div className="success-actions">
                <a href={downloadUrl} download="images_converted.pdf" className="btn btn-primary">Download PDF</a>
                <button className="btn-secondary" onClick={reset}>Convert More</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
