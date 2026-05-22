import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, FileText, CheckCircle, AlertCircle, Scissors, Settings, List, Grid } from 'lucide-react';
import { executeTool } from '../lib/api';
import './PdfSplit.css';

export default function PdfSplit() {
  const [file, setFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle', 'processing', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [splitMode, setSplitMode] = useState('range'); // 'range', 'each', 'parts'
  const [rangeStr, setRangeStr] = useState('');
  const [partsCount, setPartsCount] = useState(2);
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

  const handleSplit = async () => {
    if (!file) return;

    if (splitMode === 'range' && !rangeStr.trim()) {
      setStatus('error');
      setErrorMessage('Please enter a page range (e.g., 1,3,5-8).');
      return;
    }

    setStatus('processing');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', splitMode);
    if (splitMode === 'range') formData.append('range_str', rangeStr);
    if (splitMode === 'parts') formData.append('parts_count', partsCount);

    try {
      const response = await executeTool('pdf-split', formData);

      if (!response.ok) {
        throw new Error('API processing error or server is down.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      setStatus('success');
    } catch (error) {
      console.error(error);
      setStatus('error');
      setErrorMessage(error.message || 'An error occurred during splitting.');
    }
  };

  const resetTool = () => {
    setFile(null);
    setDownloadUrl('');
    setErrorMessage('');
    setStatus('idle');
    setRangeStr('');
    setPartsCount(2);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="pdf-split-page">
      <section className="tool-header-hero">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>PDF Splitter</h1>
          <p>Extract specific pages, split into individual pages, or divide your PDF into equal parts.</p>
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
            <motion.div key="options" className="split-options-card">
              <div className="selected-file-info">
                <FileText size={24} />
                <span>{file.name}</span>
                <button className="btn-remove" onClick={resetTool}>Change</button>
              </div>

              <div className="mode-selector">
                <h3>Select Split Mode</h3>
                <div className="modes-grid">
                  <button 
                    className={`mode-btn ${splitMode === 'range' ? 'active' : ''}`}
                    onClick={() => setSplitMode('range')}
                  >
                    <Settings size={20} />
                    <span>Custom Range</span>
                  </button>
                  <button 
                    className={`mode-btn ${splitMode === 'each' ? 'active' : ''}`}
                    onClick={() => setSplitMode('each')}
                  >
                    <List size={20} />
                    <span>Split Each Page</span>
                  </button>
                  <button 
                    className={`mode-btn ${splitMode === 'parts' ? 'active' : ''}`}
                    onClick={() => setSplitMode('parts')}
                  >
                    <Grid size={20} />
                    <span>Equal Parts</span>
                  </button>
                </div>
              </div>

              <div className="mode-settings">
                {splitMode === 'range' && (
                  <div className="setting-group">
                    <label>Enter page ranges (e.g., 1,3,5-8):</label>
                    <input 
                      type="text" 
                      placeholder="1, 3, 5-10" 
                      value={rangeStr}
                      onChange={(e) => setRangeStr(e.target.value)}
                    />
                  </div>
                )}
                {splitMode === 'parts' && (
                  <div className="setting-group">
                    <label>Number of equal parts:</label>
                    <input 
                      type="number" 
                      min="2" 
                      value={partsCount}
                      onChange={(e) => setPartsCount(parseInt(e.target.value) || 2)}
                    />
                  </div>
                )}
              </div>

              <button className="btn btn-primary btn-large" onClick={handleSplit}>
                Split PDF
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
              <h3>Splitting Document...</h3>
              <p>Please wait while we process your PDF.</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div key="success" className="success-card">
              <div className="success-icon">
                <CheckCircle size={40} />
              </div>
              <h3>Split Successful!</h3>
              <p>Your document has been split according to your settings.</p>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <a
                  href={downloadUrl}
                  download={splitMode === 'range' ? 'split_document.pdf' : 'split_documents.zip'}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                >
                  <FileText size={18} /> Download {splitMode === 'range' ? 'PDF' : 'ZIP'}
                </a>
                <button onClick={resetTool} className="btn-secondary">
                  Split Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
