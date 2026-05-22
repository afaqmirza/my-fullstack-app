import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, FileText, CheckCircle, AlertCircle, Zap, Shield, Gauge } from 'lucide-react';
import { executeTool } from '../lib/api';
import './PdfCompress.css';

export default function PdfCompress() {
  const [file, setFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle', 'processing', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [compressionInfo, setCompressionInfo] = useState(null);
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const validateAndProcessFile = (selectedFile) => {
    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setStatus('error');
      setErrorMessage('Please upload a PDF file.');
      return;
    }
    setFile(selectedFile);
    setStatus('idle');
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCompress = async () => {
    if (!file) return;

    setStatus('processing');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await executeTool('pdf-compress', formData);

      if (!response.ok) {
        throw new Error('API processing error or server is down.');
      }

      const savedPct = response.headers.get('X-Saved-Percent');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      setDownloadUrl(url);
      setCompressionInfo({
        originalSize: file.size,
        newSize: blob.size,
        savedPercent: savedPct || ((file.size - blob.size) / file.size * 100).toFixed(1)
      });
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.message || 'An error occurred during compression.');
    }
  };

  const resetTool = () => {
    setFile(null);
    setDownloadUrl('');
    setErrorMessage('');
    setStatus('idle');
    setCompressionInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="pdf-compress-page">
      <section className="tool-header-hero">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>PDF Compressor</h1>
          <p>Reduce the file size of your PDF documents while maintaining the best possible quality.</p>
        </motion.div>
      </section>

      <section className="workspace-container">
        <AnimatePresence mode="wait">
          {(status === 'idle' || status === 'error') && !file && (
            <motion.div
              key="upload"
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
              <h2>Select PDF file</h2>
              <p>or drop PDF document here</p>
              <button className="btn btn-primary">Select File</button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleChange}
                accept=".pdf,application/pdf"
                className="file-input"
              />
            </motion.div>
          )}

          {(status === 'idle' || status === 'error') && file && (
            <motion.div key="options" className="compress-options-card">
              <div className="selected-file-preview">
                <div className="file-icon-wrapper">
                  <FileText size={40} />
                </div>
                <div className="file-meta">
                  <h3>{file.name}</h3>
                  <p>{formatSize(file.size)}</p>
                </div>
                <button className="btn-remove" onClick={resetTool}>Change</button>
              </div>

              <div className="compression-features">
                <div className="feature">
                  <Shield size={20} />
                  <span>Secure Processing</span>
                </div>
                <div className="feature">
                  <Gauge size={20} />
                  <span>Smart Optimization</span>
                </div>
                <div className="feature">
                  <Zap size={20} />
                  <span>Fast Results</span>
                </div>
              </div>

              <button className="btn btn-primary btn-large" onClick={handleCompress}>
                Compress PDF
              </button>

              {status === 'error' && (
                <div className="error-message-inline">
                  <AlertCircle size={20} />
                  <span>{errorMessage}</span>
                </div>
              )}
            </motion.div>
          )}

          {status === 'processing' && (
            <motion.div key="processing" className="processing-card">
              <div className="processing-loader"></div>
              <h3>Optimizing Document...</h3>
              <p>Please wait while we reduce the file size.</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div key="success" className="success-card">
              <div className="success-icon">
                <CheckCircle size={40} />
              </div>
              <h3>Compression Successful!</h3>
              
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Original</span>
                  <span className="stat-value">{formatSize(compressionInfo.originalSize)}</span>
                </div>
                <div className="stat-divider">→</div>
                <div className="stat-item">
                  <span className="stat-label">Compressed</span>
                  <span className="stat-value highlight">{formatSize(compressionInfo.newSize)}</span>
                </div>
                <div className="savings-badge">
                  Saved {compressionInfo.savedPercent}%
                </div>
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <a
                  href={downloadUrl}
                  download={`${file?.name.split('.').slice(0, -1).join('.') || 'compressed'}_compressed.pdf`}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                >
                  <Zap size={18} /> Download Optimized PDF
                </a>
                <button onClick={resetTool} className="btn-secondary">
                  Compress Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
