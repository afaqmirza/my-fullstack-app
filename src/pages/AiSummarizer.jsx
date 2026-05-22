import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, Sparkles, Download, CheckCircle, AlertCircle, Loader2, FileText, Copy, Save } from 'lucide-react';
import { executeTool } from '../lib/api';
import './ToolsExtra.css';

export default function AiSummarizer() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle');
  const [summary, setSummary] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const progressTimer = useRef(null);

  useEffect(() => {
    if (status === 'processing') {
      setProgress(10);
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
      progressTimer.current = window.setInterval(() => {
        setProgress((prev) => Math.min(90, prev + Math.floor(Math.random() * 8) + 3));
      }, 650);
    }

    return () => {
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
        progressTimer.current = null;
      }
      if (status !== 'processing' && status !== 'success') {
        setProgress(0);
      }
    };
  }, [status]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus('idle');
      setSummary('');
    }
  };

  const handleSummarize = async () => {
    if (!file) return;
    
    setStatus('processing');
    setErrorMessage('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await executeTool('summarize', formData);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Summarization failed. Check that the server is running and GROQ_API_KEY is set.');
      }
      if (!data.summary) {
        throw new Error(data.error || 'No summary was returned. Try a PDF or TXT file, or re-save your Word document.');
      }
      
      setSummary(data.summary);
      setProgress(100);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setProgress(100);
      const msg = err.message || 'Summarization failed.';
      setErrorMessage(msg.includes('image1.png') || msg.includes('word/media')
        ? 'This Word file has broken embedded images. Open it in Word → Save As → new .docx, or upload PDF/TXT instead.'
        : msg);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    // Could add a toast here
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const fileBlob = new Blob([summary], {type: 'text/plain'});
    element.href = URL.createObjectURL(fileBlob);
    element.download = "summary.txt";
    document.body.appendChild(element);
    element.click();
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setSummary('');
    setProgress(0);
  };

  return (
    <div className="ai-summarizer-page pdf-rotate-page">
      <section className="tool-header-hero">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="intelligence-badge">AI Intelligence</div>
          <h1>AI Document Summarizer</h1>
          <p>Instantly extract key insights and summaries from PDFs, DOCX, and Text files using Llama 3 AI.</p>
        </motion.div>
      </section>

      <section className="workspace-container">
        <AnimatePresence mode="wait">
          {(status === 'idle' || status === 'error') && (
            <motion.div key="upload" className="intelligence-workspace">
              <div 
                className={`upload-zone ${file ? 'active' : ''}`}
                onClick={() => document.getElementById('summarizer-upload').click()}
              >
                <div className="upload-icon">
                  <FileUp size={36} />
                </div>
                <span className="upload-text">{file ? file.name : 'Select Document'}</span>
                <span className="upload-subtext">PDF, DOCX or TXT (Max 10MB)</span>
                
                <input 
                  type="file" 
                  id="summarizer-upload" 
                  accept=".pdf,.docx,.txt" 
                  onChange={handleFileChange}
                  hidden
                />
                
                {!file && <button className="btn btn-primary">Browse Files</button>}
              </div>

              {file && (
                <motion.button 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }}
                  className="btn btn-primary btn-large summarize-btn" 
                  onClick={handleSummarize}
                >
                  <Sparkles size={18} /> Generate AI Summary
                </motion.button>
              )}

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
              <div className="ai-pulse-loader"></div>
              <h3>Analyzing Document...</h3>
              <p>Extracting text and generating insights with Llama 3 AI. This usually takes 5-10 seconds.</p>
              <div className="status-indicator">
                <Loader2 className="spin" size={16} />
                <span>Reading pages...</span>
              </div>
              <div className="progress-row">
                <span>{progress}% complete</span>
                <span>Generating summary</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div key="success" className="summary-result-card">
              <div className="result-header">
                <div className="title-area">
                  <CheckCircle size={24} color="var(--success)" />
                  <h3>AI Generated Summary</h3>
                </div>
                <div className="action-buttons">
                  <button onClick={handleCopy} title="Copy to Clipboard"><Copy size={18} /></button>
                  <button onClick={handleDownload} title="Download as Text"><Save size={18} /></button>
                </div>
              </div>
              
              <div className="summary-content">
                {summary.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>

              <div className="success-actions-footer">
                <button className="btn-secondary" onClick={reset}>Summarize Another Document</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="features-info">
        <div className="feature-info-grid">
          <div className="f-item">
            <Sparkles size={24} />
            <h4>Llama 3 Powered</h4>
            <p>Utilizes the latest AI models for deep understanding and high-quality summaries.</p>
          </div>
          <div className="f-item">
            <FileText size={24} />
            <h4>Multi-Format</h4>
            <p>Supports PDF documents, Word files, and plain text effortlessly.</p>
          </div>
          <div className="f-item">
            <CheckCircle size={24} />
            <h4>Concise & Accurate</h4>
            <p>Get the main points without the fluff, saving you hours of reading time.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
