import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { executeTool } from '../lib/api';
import './WordToExcel.css';

export default function WordToExcel() {
  const [file, setFile] = useState(null);
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
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndProcessFile(droppedFile);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const validateAndProcessFile = (selectedFile) => {
    const validExtensions = ['.doc', '.docx'];
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setStatus('error');
      setErrorMessage('Invalid file format. Please upload a .doc or .docx file.');
      return;
    }
    
    setFile(selectedFile);
    uploadAndConvert(selectedFile);
  };

  const uploadAndConvert = async (fileToProcess) => {
    setStatus('processing');
    
    const formData = new FormData();
    formData.append('file', fileToProcess);

    try {
      // Connect to Python API endpoint
      const response = await executeTool('word-to-excel', formData);

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
      setErrorMessage(error.message || 'An error occurred during conversion.');
    }
  };

  const resetTool = () => {
    setFile(null);
    setDownloadUrl('');
    setErrorMessage('');
    setStatus('idle');
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="word-to-excel-page">
      <section className="tool-header-hero">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Word to Excel Converter</h1>
          <p>Extract tables and content from Word documents directly into organized Excel sheets.</p>
        </motion.div>
      </section>

      <section className="workspace-container">
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
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
              <h2 className="upload-text">Select Word file</h2>
              <p className="upload-subtext">or drop Word documents here</p>
              <button className="btn btn-primary">Select File</button>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleChange} 
                accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                className="file-input" 
              />
            </motion.div>
          )}

          {status === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="processing-card"
            >
              <div className="processing-loader"></div>
              <h3>Converting to Excel...</h3>
              <p>Extracting paragraphs and parsing tables from your document.</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="success-card"
            >
              <div className="success-icon">
                <CheckCircle size={40} />
              </div>
              <h3>Conversion Successful!</h3>
              <p>Your Excel sheet is ready for download.</p>
              
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <a 
                  href={downloadUrl} 
                  download={`${file?.name.substring(0, file?.name.lastIndexOf('.')) || 'converted'}.xlsx`}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                >
                  <FileSpreadsheet size={18} /> Download Excel
                </a>
                <button onClick={resetTool} className="btn-secondary">
                  Convert Another
                </button>
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="error-card"
            >
              <div className="error-icon">
                <AlertCircle size={40} />
              </div>
              <h3>Conversion Failed</h3>
              <p>{errorMessage}</p>
              
              <button onClick={resetTool} className="btn-secondary">
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
