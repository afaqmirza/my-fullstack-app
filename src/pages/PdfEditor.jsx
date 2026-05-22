import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { executeTool } from '../lib/api';
import LiveDocEditor from '../components/LiveDocEditor';
import './PdfEditor.css';
import './ToolsExtra.css';

const PHASE = {
  IDLE: 'idle',
  PROCESSING: 'processing',
  EDITING: 'editing',
  EXPORTING: 'exporting',
  SUCCESS: 'success',
  ERROR: 'error',
};

async function parseErrorResponse(response) {
  const blob = await response.blob();
  if (blob.type?.includes('json') || blob.size < 5000) {
    try {
      const text = await blob.text();
      const json = JSON.parse(text);
      if (json.error) return json.error;
    } catch {
      /* not json */
    }
  }
  return 'Server error. Make sure the backend is running.';
}

export default function PdfEditor() {
  const [pdfFile, setPdfFile] = useState(null);
  const [docxBlob, setDocxBlob] = useState(null);
  const [phase, setPhase] = useState(PHASE.IDLE);
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const reset = () => {
    setPdfFile(null);
    setDocxBlob(null);
    setPhase(PHASE.IDLE);
    setErrorMessage('');
    setDownloadUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const convertPdfToWord = async (file) => {
    setPhase(PHASE.PROCESSING);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await executeTool('pdf-to-word', formData);
      if (!response.ok) throw new Error(await parseErrorResponse(response));

      const blob = await response.blob();
      if (blob.type === 'application/json') {
        const json = JSON.parse(await blob.text());
        if (json.error) throw new Error(json.error);
      }

      setDocxBlob(blob);
      setPhase(PHASE.EDITING);
    } catch (err) {
      setPhase(PHASE.ERROR);
      setErrorMessage(err.message || 'Could not prepare document for editing.');
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (ext !== '.pdf') {
      setPhase(PHASE.ERROR);
      setErrorMessage('Please upload a PDF file.');
      return;
    }
    setPdfFile(file);
    convertPdfToWord(file);
  };

  const handleExportToPdf = async (html) => {
    setPhase(PHASE.EXPORTING);
    setErrorMessage('');

    try {
      const docxForm = new FormData();
      docxForm.append('task', 'html-to-docx');
      docxForm.append('html', html);

      const docxRes = await executeTool('html-to-docx', docxForm);
      if (!docxRes.ok) throw new Error(await parseErrorResponse(docxRes));

      let docxOut = await docxRes.blob();
      if (docxOut.type === 'application/json') {
        const json = JSON.parse(await docxOut.text());
        if (json.error) throw new Error(json.error);
      }

      const baseName = pdfFile?.name?.replace(/\.pdf$/i, '') || 'edited';
      const docxFile = new File([docxOut], `${baseName}.docx`, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });

      const pdfForm = new FormData();
      pdfForm.append('file', docxFile);

      const pdfRes = await executeTool('word-to-pdf', pdfForm);
      if (!pdfRes.ok) throw new Error(await parseErrorResponse(pdfRes));

      const pdfBlob = await pdfRes.blob();
      if (pdfBlob.type === 'application/json') {
        const json = JSON.parse(await pdfBlob.text());
        if (json.error) throw new Error(json.error);
      }

      setDownloadUrl(URL.createObjectURL(pdfBlob));
      setPhase(PHASE.SUCCESS);
    } catch (err) {
      setPhase(PHASE.ERROR);
      setErrorMessage(
        err.message ||
          'Export failed. Word to PDF requires Microsoft Word on the server (Windows).'
      );
    }
  };

  return (
    <div className="pdf-editor-page pdf-editor-full">
      <section className="tool-header-hero">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>PDF Editor</h1>
          <p>
            Upload a PDF — we convert it to an editable document, let you change text and images,
            then convert back to PDF.
          </p>
        </motion.div>
      </section>

      <section className={`workspace-container ${phase === PHASE.EDITING ? 'workspace-wide' : ''}`}>
        <AnimatePresence mode="wait">
          {phase === PHASE.IDLE && (
            <motion.div
              key="upload"
              className={`upload-zone ${isDragActive ? 'active' : ''}`}
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
              <h2>Upload PDF to Edit</h2>
              <p className="upload-subtext">Your file is converted for editing, then back to PDF when you save</p>
              <button type="button" className="btn btn-primary">Select PDF</button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,application/pdf"
                style={{ display: 'none' }}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </motion.div>
          )}

          {phase === PHASE.PROCESSING && (
            <motion.div key="processing" className="processing-card">
              <div className="processing-loader" />
              <h3>Processing…</h3>
              <p>Converting your PDF to an editable document. This may take a moment.</p>
              {pdfFile && <span className="processing-filename">{pdfFile.name}</span>}
            </motion.div>
          )}

          {phase === PHASE.EDITING && docxBlob && (
            <motion.div key="editing" className="editor-workspace" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="editor-top-bar">
                <FileText size={20} />
                <span>{pdfFile?.name}</span>
                <button type="button" className="btn-secondary" onClick={reset}>
                  New file
                </button>
              </div>
              <LiveDocEditor
                docxBlob={docxBlob}
                onExportHtml={handleExportToPdf}
                exportLabel="Save as PDF"
              />
            </motion.div>
          )}

          {phase === PHASE.EXPORTING && (
            <motion.div key="exporting" className="processing-card">
              <div className="processing-loader" />
              <h3>Processing…</h3>
              <p>Building your document and converting back to PDF.</p>
            </motion.div>
          )}

          {phase === PHASE.SUCCESS && (
            <motion.div key="success" className="success-card">
              <CheckCircle size={48} color="var(--success)" />
              <h3>PDF Ready!</h3>
              <p>Your edited document has been saved as a PDF.</p>
              <div className="success-actions">
                <a
                  href={downloadUrl}
                  download={`edited_${pdfFile?.name || 'document.pdf'}`}
                  className="btn btn-primary"
                >
                  Download PDF
                </a>
                <button type="button" className="btn-secondary" onClick={reset}>
                  Edit Another
                </button>
              </div>
            </motion.div>
          )}

          {phase === PHASE.ERROR && (
            <motion.div key="error" className="error-card">
              <AlertCircle size={40} />
              <h3>Something went wrong</h3>
              <p>{errorMessage}</p>
              <button type="button" className="btn-secondary" onClick={reset}>
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
