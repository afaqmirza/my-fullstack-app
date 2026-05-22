import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, FileUp, Download, CheckCircle, AlertCircle, Loader2, ArrowRightLeft, Languages, FileText, Copy, Save } from 'lucide-react';
import { executeTool } from '../lib/api';
import './ToolsExtra.css';

const LANGUAGES = {
  "auto": "Auto Detect",
  "english": "English",
  "urdu": "Urdu",
  "arabic": "Arabic",
  "french": "French",
  "spanish": "Spanish",
  "german": "German",
  "hindi": "Hindi",
  "chinese": "Chinese",
  "russian": "Russian",
  "japanese": "Japanese",
  "turkish": "Turkish",
  "portuguese": "Portuguese"
};

export default function Translator() {
  const [file, setFile] = useState(null);
  const [fromLang, setFromLang] = useState('auto');
  const [toLang, setToLang] = useState('urdu');
  const [status, setStatus] = useState('idle');
  const [translatedText, setTranslatedText] = useState('');
  const [originalText, setOriginalText] = useState('');
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
        setProgress((prev) => Math.min(92, prev + Math.floor(Math.random() * 7) + 4));
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
      setTranslatedText('');
    }
  };

  const handleTranslate = async () => {
    if (!file) return;
    
    setStatus('processing');
    setErrorMessage('');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('from_lang', fromLang);
    formData.append('to_lang', toLang);

    try {
      const response = await executeTool('translate', formData);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Translation failed. Check that the server is running.');
      }
      if (!data.translated_text) {
        throw new Error(data.error || 'No translation returned. Try PDF or TXT, or re-save your Word file.');
      }
      
      setTranslatedText(data.translated_text);
      setOriginalText(data.original_text || '');
      setProgress(100);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setProgress(100);
      const msg = err.message || 'Translation failed.';
      setErrorMessage(msg.includes('image1.png') || msg.includes('word/media')
        ? 'This Word file has broken embedded images. Open it in Word → Save As → new .docx, or upload PDF/TXT instead.'
        : msg);
    }
  };

  const swapLanguages = () => {
    if (fromLang === 'auto') return;
    const temp = fromLang;
    setFromLang(toLang);
    setToLang(temp);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const fileBlob = new Blob([translatedText], {type: 'text/plain'});
    element.href = URL.createObjectURL(fileBlob);
    element.download = `translated_${toLang}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  const reset = () => {
    setFile(null);
    setStatus('idle');
    setTranslatedText('');
    setProgress(0);
  };

  return (
    <div className="translator-page pdf-rotate-page">
      <section className="tool-header-hero">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="intelligence-badge">Intelligence Tool</div>
          <h1>Google Document Translator</h1>
          <p>Translate PDFs, Word documents, and Text files into over 100 languages with high accuracy.</p>
        </motion.div>
      </section>

      <section className="workspace-container">
        <AnimatePresence mode="wait">
          {(status === 'idle' || status === 'error') && (
            <motion.div key="options" className="rotate-options-card">
              <div className="language-selector-group">
                <div className="lang-select">
                  <label>From</label>
                  <select value={fromLang} onChange={(e) => setFromLang(e.target.value)}>
                    {Object.entries(LANGUAGES).map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>

                <button className="swap-btn" onClick={swapLanguages} disabled={fromLang === 'auto'}>
                  <ArrowRightLeft size={18} />
                </button>

                <div className="lang-select">
                  <label>To</label>
                  <select value={toLang} onChange={(e) => setToLang(e.target.value)}>
                    {Object.entries(LANGUAGES).filter(([c]) => c !== 'auto').map(([code, name]) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div 
                className={`upload-zone ${file ? 'active' : ''}`}
                onClick={() => document.getElementById('translator-upload').click()}
              >
                <div className="upload-icon">
                  <FileUp size={36} />
                </div>
                <span className="upload-text">{file ? file.name : 'Select Document'}</span>
                <span className="upload-subtext">PDF, DOCX or TXT</span>
                
                <input 
                  type="file" 
                  id="translator-upload" 
                  accept=".pdf,.docx,.txt" 
                  onChange={handleFileChange}
                  hidden
                />
                
                {!file && <button className="btn btn-primary">Browse Files</button>}
              </div>

              <button 
                className="btn btn-primary btn-large" 
                onClick={handleTranslate}
                disabled={!file}
              >
                <Languages size={18} /> Translate Now
              </button>

              <div className="notice-box">
                <Loader2 className="spin" size={14} />
                <span>It may take some time, please be patient while it's fetching translation based on your input.</span>
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
              <h3>Translating Document...</h3>
              <p>Extracting text and connecting to Google Translate. Please wait.</p>
              <div className="status-indicator">
                <Loader2 className="spin" size={16} />
                <span>Processing chunks...</span>
              </div>
              <div className="progress-row">
                <span>{progress}% complete</span>
                <span>Translating your document</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div key="success" className="translation-result-card">
              <div className="result-grid-side">
                <div className="text-panel">
                  <div className="panel-header">Original</div>
                  <div className="panel-body">{originalText}</div>
                </div>
                <div className="text-panel translated">
                  <div className="panel-header">
                    <span>Translated ({LANGUAGES[toLang]})</span>
                    <div className="panel-actions">
                      <button onClick={handleCopy}><Copy size={16} /></button>
                      <button onClick={handleDownload}><Save size={16} /></button>
                    </div>
                  </div>
                  <div className="panel-body">{translatedText}</div>
                </div>
              </div>
              <div className="success-actions-footer">
                <button className="btn-secondary" onClick={reset}>Translate Another</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
