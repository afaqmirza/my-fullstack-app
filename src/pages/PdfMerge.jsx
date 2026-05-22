import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, FileText, CheckCircle, AlertCircle, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { executeTool } from '../lib/api';
import './PdfMerge.css';

export default function PdfMerge() {
  const [files, setFiles] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle', 'processing', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter(f => f.name.toLowerCase().endsWith('.pdf'));
    if (validFiles.length < newFiles.length) {
      setErrorMessage('Some files were skipped because they are not PDFs.');
    }
    setFiles(prev => [...prev, ...validFiles]);
    setStatus('idle');
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

  const handleMerge = async () => {
    if (files.length < 2) {
      setErrorMessage('Please add at least 2 PDF files to merge.');
      setStatus('error');
      return;
    }

    setStatus('processing');
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await executeTool('pdf-merge', formData);

      if (!response.ok) {
        throw new Error('API processing error or server is down.');
      }

      const blob = await response.blob();

      if (blob.type === 'application/json') {
        const text = await blob.text();
        const json = JSON.parse(text);
        if (json.error) {
          throw new Error(json.error);
        }
      }

      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      setStatus('success');

    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.message || 'An error occurred during merging.');
    }
  };

  const resetTool = () => {
    setFiles([]);
    setDownloadUrl('');
    setErrorMessage('');
    setStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="pdf-merge-page">
      <section className="tool-header-hero">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>PDF Merger</h1>
          <p>Combine multiple PDF files into a single document in seconds. Reorder them as you like.</p>
        </motion.div>
      </section>

      <section className="workspace-container">
        <AnimatePresence mode="wait">
          {(status === 'idle' || status === 'error') && (
            <motion.div
              key="workspace"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="merge-workspace"
            >
              {files.length === 0 ? (
                <div 
                  className={`upload-zone ${isDragActive ? 'active' : ''}`}
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="upload-icon">
                    <FileUp size={36} />
                  </div>
                  <h2>Select PDF files</h2>
                  <p>or drop PDFs here</p>
                  <button className="btn btn-primary">Select Files</button>
                </div>
              ) : (
                <div className="files-list-container">
                  <div className="list-header">
                    <h3>Files to Merge ({files.length})</h3>
                    <button className="btn-add-more" onClick={() => fileInputRef.current?.click()}>
                      <Plus size={18} /> Add More
                    </button>
                  </div>
                  
                  <div className="files-list">
                    {files.map((file, index) => (
                      <motion.div 
                        layout
                        key={`${file.name}-${index}`}
                        className="file-item"
                      >
                        <div className="file-info">
                          <span className="file-index">{index + 1}</span>
                          <FileText size={20} className="file-icon" />
                          <span className="file-name">{file.name}</span>
                        </div>
                        <div className="file-actions">
                          <button onClick={() => moveFile(index, -1)} disabled={index === 0}>
                            <ArrowUp size={18} />
                          </button>
                          <button onClick={() => moveFile(index, 1)} disabled={index === files.length - 1}>
                            <ArrowDown size={18} />
                          </button>
                          <button className="btn-remove" onClick={() => removeFile(index)}>
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="merge-actions">
                    <button className="btn btn-primary btn-large" onClick={handleMerge} disabled={files.length < 2}>
                      Merge PDFs
                    </button>
                    <button className="btn-secondary" onClick={resetTool}>Clear All</button>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="error-message-inline">
                  <AlertCircle size={20} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleChange}
                accept=".pdf,application/pdf"
                multiple
                className="file-input"
              />
            </motion.div>
          )}

          {status === 'processing' && (
            <motion.div
              key="processing"
              className="processing-card"
            >
              <div className="processing-loader"></div>
              <h3>Merging Documents...</h3>
              <p>Please wait while we combine your files.</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              key="success"
              className="success-card"
            >
              <div className="success-icon">
                <CheckCircle size={40} />
              </div>
              <h3>Merge Successful!</h3>
              <p>Your combined PDF is ready.</p>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <a
                  href={downloadUrl}
                  download="merged_document.pdf"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                >
                  <FileText size={18} /> Download Merged PDF
                </a>
                <button onClick={resetTool} className="btn-secondary">
                  Start New Merge
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
