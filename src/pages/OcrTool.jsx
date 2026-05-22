import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileUp,
  ScanText,
  CheckCircle,
  AlertCircle,
  Copy,
  Download,
  Loader2,
  FileText,
} from 'lucide-react';
import { executeTool } from '../lib/api';
import './OcrTool.css';
import './ToolsExtra.css';

const LANGUAGES = [
  { code: 'eng', label: 'English' },
  { code: 'ara', label: 'Arabic' },
  { code: 'urd', label: 'Urdu' },
  { code: 'hin', label: 'Hindi' },
  { code: 'fra', label: 'French' },
  { code: 'deu', label: 'German' },
  { code: 'spa', label: 'Spanish' },
  { code: 'chi_sim', label: 'Chinese (Simplified)' },
];

const ACCEPT = '.pdf,.png,.jpg,.jpeg,.tif,.tiff,.bmp,.webp';

export default function OcrTool() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [lang, setLang] = useState('eng');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [tesseractReady, setTesseractReady] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressTimer = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const form = new FormData();
    form.append('task', 'ocr-status');
    executeTool('ocr-status', form)
      .then((r) => r.json())
      .then((d) => setTesseractReady(d))
      .catch(() => setTesseractReady({ installed: false }));
  }, []);

  useEffect(() => {
    if (status === 'processing') {
      setProgress(10);
      if (progressTimer.current) {
        clearInterval(progressTimer.current);
      }
      progressTimer.current = window.setInterval(() => {
        setProgress((prev) => Math.min(90, prev + Math.floor(Math.random() * 7) + 3));
      }, 600);
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

  const handleFile = (f) => {
    if (!f) return;
    const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
    const allowed = ['.pdf', '.png', '.jpg', '.jpeg', '.tif', '.tiff', '.bmp', '.webp'];
    if (!allowed.includes(ext)) {
      setStatus('error');
      setErrorMessage('Upload a PDF or image (PNG, JPG, TIFF, BMP, WebP).');
      return;
    }
    setFile(f);
    setResult(null);
    setStatus('idle');
    setErrorMessage('');
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  };

  const runOcr = async () => {
    if (!file) return;
    setStatus('processing');
    setErrorMessage('');
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('lang', lang);
    formData.append('output_type', 'json');

    try {
      const response = await executeTool('ocr-tesseract', formData);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || data.details || 'OCR failed.');
      }
      if (!data.text && !data.pages?.length) {
        throw new Error('No text was detected in this file.');
      }
      setResult(data);
      setProgress(100);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setProgress(100);
      let msg = err.message || 'OCR failed.';
      if (msg.includes('not installed') || msg.includes('traineddata')) {
        msg +=
          ' Run scripts/setup-tesseract.ps1 in the project folder, or install Tesseract from https://github.com/UB-Mannheim/tesseract/wiki';
      }
      setErrorMessage(msg);
    }
  };

  const downloadTxt = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('lang', lang);
    formData.append('output_type', 'txt');
    formData.append('task', 'ocr-tesseract');

    const response = await executeTool('ocr-tesseract', formData);
    if (!response.ok) return;
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name.replace(/\.[^.]+$/, '')}_ocr.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyText = () => {
    if (!result?.text) return;
    navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setStatus('idle');
    setErrorMessage('');
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="ocr-tool-page">
      <section className="tool-header-hero">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="ocr-badge">
            <ScanText size={14} /> OCR
          </div>
          <h1>OCR</h1>
          <p>
            Extract text from scanned PDFs and images. Upload a file, pick a language, and copy or download the result.
          </p>
          {tesseractReady && (
            <p className={`ocr-engine-status ${tesseractReady.installed ? 'ok' : 'warn'}`}>
              {tesseractReady.installed
                ? `Ready${tesseractReady.languages?.length ? ` · ${tesseractReady.languages.length} language(s)` : ''}`
                : 'OCR engine not detected on server — run setup script after installing'}
            </p>
          )}
        </motion.div>
      </section>

      <section className="workspace-container">
        <AnimatePresence mode="wait">
          {(status === 'idle' || (status === 'error' && !result)) && !file && (
            <motion.div
              key="upload"
              className={`upload-zone ocr-upload ${isDragActive ? 'active' : ''}`}
              onDragEnter={(e) => { e.preventDefault(); setIsDragActive(true); }}
              onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragActive(false); }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragActive(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp size={48} />
              <h2>Upload image or PDF</h2>
              <p className="upload-subtext">PNG, JPG, TIFF, WebP, or scanned PDF</p>
              <button type="button" className="btn btn-primary">Select File</button>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT}
                style={{ display: 'none' }}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </motion.div>
          )}

          {file && (status === 'idle' || status === 'error') && (
            <motion.div key="config" className="ocr-options-card">
              <div className="file-preview-strip">
                <ScanText size={24} color="var(--primary-blue)" />
                <span className="file-name">{file.name}</span>
                <button type="button" className="btn-remove" onClick={reset}>
                  Change
                </button>
              </div>

              {preview && (
                <div className="ocr-preview-wrap">
                  <img src={preview} alt="Upload preview" />
                </div>
              )}

              <div className="ocr-lang-row">
                <label htmlFor="ocr-lang">OCR language</label>
                <select id="ocr-lang" value={lang} onChange={(e) => setLang(e.target.value)}>
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.label}
                    </option>
                  ))}
                </select>
                <span className="ocr-lang-hint">
                  Extra languages: download .traineddata into python-backend/tessdata
                </span>
              </div>

              <button type="button" className="btn btn-primary btn-large" onClick={runOcr}>
                <ScanText size={18} /> Extract Text
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
              <Loader2 size={40} className="spin" />
              <h3>Processing OCR…</h3>
              <p>Running OCR on your document. This may take a minute for PDFs.</p>
              <div className="progress-row">
                <span>{progress}% complete</span>
                <span>Scanning file</span>
              </div>
              <div className="ocr-loading-bar">
                <div className="ocr-loading-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </motion.div>
          )}

          {status === 'success' && result && (
            <motion.div key="success" className="ocr-result-card">
              <div className="ocr-result-header">
                <CheckCircle size={28} color="var(--success)" />
                <div>
                  <h3>Text extracted</h3>
                  <p>
                    {result.page_count > 1
                      ? `${result.page_count} pages processed`
                      : '1 page processed'}
                    {result.language ? ` · ${result.language}` : ''}
                  </p>
                </div>
              </div>

              <div className="ocr-text-output" role="region" aria-label="OCR result">
                {result.text}
              </div>

              <div className="ocr-result-actions">
                <button type="button" className="btn btn-primary" onClick={copyText}>
                  <Copy size={16} /> {copied ? 'Copied!' : 'Copy text'}
                </button>
                <button type="button" className="btn-secondary" onClick={downloadTxt}>
                  <Download size={16} /> Download .txt
                </button>
                <button type="button" className="btn-secondary" onClick={reset}>
                  <FileText size={16} /> Scan another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
