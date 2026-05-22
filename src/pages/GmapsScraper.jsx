import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Briefcase, Download, CheckCircle, AlertCircle, Loader2, Globe } from 'lucide-react';
import { executeTool } from '../lib/api';
import StepperControl from '../components/StepperControl';
import './ToolsExtra.css';

export default function GmapsScraper() {
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [maxResults, setMaxResults] = useState(10);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const progressTimer = useRef(null);

  useEffect(() => {
    if (status === 'processing') {
      setProgress(12);
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
      progressTimer.current = window.setInterval(() => {
        setProgress((prev) => Math.min(88, prev + Math.floor(Math.random() * 8) + 4));
      }, 700);
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

  const handleStartScraping = async () => {
    if (!industry || !location) return;
    
    setStatus('processing');
    setErrorMessage('');
    
    const formData = new FormData();
    formData.append('industry', industry);
    formData.append('location', location);
    formData.append('max_results', maxResults);

    try {
      // Note: This might take a while, so we use a high timeout or background task
      const response = await executeTool('gmaps-scraper', formData);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Scraping failed.');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      setProgress(100);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setProgress(100);
      setErrorMessage(err.message);
    }
  };

  const reset = () => {
    setIndustry('');
    setLocation('');
    setStatus('idle');
    setDownloadUrl('');
    setProgress(0);
  };

  return (
    <div className="gmaps-scraper-page pdf-rotate-page">
      <section className="tool-header-hero">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="automation-badge">Automation Tool</div>
          <h1>Google Maps Scraper</h1>
          <p>Extract business leads including names, phones, websites, and emails from Google Maps.</p>
        </motion.div>
      </section>

      <section className="workspace-container">
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div key="options" className="rotate-options-card">
              <div className="editor-controls">
                <div className="control-section">
                  <label><Briefcase size={16} /> Industry / Business Type</label>
                  <input 
                    type="text" 
                    value={industry} 
                    onChange={(e) => setIndustry(e.target.value)} 
                    placeholder="e.g. Restaurants, Dentists, Plumbers"
                  />
                </div>

                <div className="control-section">
                  <label><MapPin size={16} /> Location</label>
                  <input 
                    type="text" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    placeholder="e.g. New York, London, Paris"
                  />
                </div>

                <div className="control-section">
                  <label><Search size={16} /> Max Results (1–100)</label>
                  <StepperControl
                    large
                    value={maxResults}
                    onChange={setMaxResults}
                    min={1}
                    max={100}
                    step={5}
                  />
                </div>
              </div>

              <button 
                className="btn btn-primary btn-large" 
                onClick={handleStartScraping}
                disabled={!industry || !location}
              >
                Start Data Extraction
              </button>

              <div className="notice-box">
                <Loader2 className="spin" size={14} />
                <span>It may take some time, please be patient while it's fetching data based on your input.</span>
              </div>

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
              <h3>Scraping Data...</h3>
              <p>Extracting listings and visiting websites for emails. Please wait.</p>
              <div className="status-indicator">
                <Loader2 className="spin" size={16} />
                <span>Navigating Google Maps...</span>
              </div>
              <div className="progress-row">
                <span>{progress}% complete</span>
                <span>Collecting leads</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div key="success" className="success-card">
              <CheckCircle size={48} color="var(--success)" />
              <h3>Extraction Complete!</h3>
              <p>We found the business data you requested.</p>
              <div className="success-actions">
                <a href={downloadUrl} download={`leads_${industry}_${location}.xlsx`} className="btn btn-primary">
                  <Download size={18} /> Download Excel Report
                </a>
                <button className="btn-secondary" onClick={reset}>New Search</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
