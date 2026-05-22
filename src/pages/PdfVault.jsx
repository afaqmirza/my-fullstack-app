import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, Lock, Unlock, Shield, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { executeTool } from '../lib/api';
import './PdfVault.css';

export default function PdfVault() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState('protect'); // 'protect' or 'unlock'
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
    }
  };

  const handleProcess = async () => {
    if (!file || !password) return;
    setStatus('processing');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);

    const endpoint = mode === 'protect' ? 'pdf-protect' : 'pdf-unlock';

    try {
      const response = await executeTool(endpoint, formData);

      const data = await response.clone().json().catch(() => null);
      if (data && data.error) throw new Error(data.error);
      if (!response.ok) throw new Error('Processing failed.');

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
    setFile(null);
    setPassword('');
    setStatus('idle');
    setDownloadUrl('');
    setErrorMessage('');
  };

  return (
    <div className="pdf-vault-page">
      <section className="tool-header-hero">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>PDF Vault</h1>
          <p>Secure your documents with AES-256 encryption or remove passwords from protected PDFs.</p>
        </motion.div>
      </section>

      <section className="workspace-container">
        <div className="vault-tabs">
          <button className={mode === 'protect' ? 'active' : ''} onClick={() => setMode('protect')}>
            <Lock size={18} /> Protect PDF
          </button>
          <button className={mode === 'unlock' ? 'active' : ''} onClick={() => setMode('unlock')}>
            <Unlock size={18} /> Unlock PDF
          </button>
        </div>

        <AnimatePresence mode="wait">
          {status === 'idle' && !file && (
            <motion.div 
              key="upload" 
              className="upload-zone"
              onClick={() => fileInputRef.current.click()}
            >
              <FileUp size={48} />
              <h2>Select PDF to {mode}</h2>
              <p>Everything is processed locally for maximum privacy.</p>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" style={{ display: 'none' }} />
            </motion.div>
          )}

          {(status === 'idle' || status === 'error') && file && (
            <motion.div key="options" className="vault-options-card">
              <div className="file-preview">
                <Shield size={24} color="var(--primary-blue)" />
                <span className="file-name">{file.name}</span>
                <button className="btn-remove" onClick={reset}>Change</button>
              </div>

              <div className="password-input-group">
                <label>{mode === 'protect' ? 'Set Encryption Password' : 'Enter Document Password'}</label>
                <div className="input-wrapper">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {mode === 'protect' && <p className="hint">Make sure to remember this password; it cannot be recovered.</p>}
              </div>

              <button 
                className={`btn btn-primary btn-large ${mode === 'unlock' ? 'btn-unlock' : ''}`} 
                onClick={handleProcess}
                disabled={!password}
              >
                {mode === 'protect' ? 'Protect PDF Now' : 'Unlock PDF Now'}
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
              <div className="processing-loader"></div>
              <h3>{mode === 'protect' ? 'Encrypting...' : 'Decrypting...'}</h3>
              <p>Applying security layers to your document.</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div key="success" className="success-card">
              <CheckCircle size={48} color="var(--success)" />
              <h3>Success!</h3>
              <p>Your {mode === 'protect' ? 'protected' : 'unlocked'} file is ready.</p>
              <div className="success-actions">
                <a href={downloadUrl} download={`${mode}_${file.name}`} className="btn btn-primary">Download File</a>
                <button className="btn-secondary" onClick={reset}>Go Back</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
