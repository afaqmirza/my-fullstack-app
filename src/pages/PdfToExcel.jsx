import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { executeTool } from '../lib/api';
import './PdfToExcel.css';

export default function PdfToExcel() {
  const [file, setFile] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle', 'uploading', 'processing', 'success', 'error'
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
    const validExtensions = ['.pdf'];
    const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      setStatus('error');
      setErrorMessage('Invalid file format. Please upload a .pdf file.');
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
      // Call the same backend port (8000) as PdfToPpt
      const response = await executeTool('pdf-to-excel', formData);

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
    <div className="pdf-to-excel-page">
      <section className="tool-header-hero">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>PDF to Excel Converter</h1>
          <p>Convert your PDF files to Excel spreadsheets (XLSX) directly from your browser.</p>
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
              <h2 className="upload-text">Select PDF file</h2>
              <p className="upload-subtext">or drop PDF documents here</p>
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
              <h3>Converting to XLSX...</h3>
              <p>Please wait while we process your document.</p>
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
              <p>Your Excel spreadsheet is ready for download.</p>

              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <a
                  href={downloadUrl}
                  download={`${file?.name.substring(0, file?.name.lastIndexOf('.')) || 'converted'}.xlsx`}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
                >
                  <FileText size={18} /> Download XLSX
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
