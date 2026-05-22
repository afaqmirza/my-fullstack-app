import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import jsQR from 'jsqr';
import {
  QrCode, Upload, Camera, Wand2, Download, Copy, ExternalLink,
  CheckCircle, AlertCircle, X, Loader2, RefreshCw, ScanLine,
  Palette, Maximize2, ToggleLeft, ToggleRight
} from 'lucide-react';
import { qrDecode, qrGenerate } from '../lib/api';
import './QrStudio.css';
const TABS = ['scan-upload', 'scan-camera', 'generate'];

export default function QrStudio() {
  const [tab, setTab] = useState('scan-upload');

  return (
    <div className="qr-page">
      {/* Hero */}
      <section className="qr-hero">
        <motion.div className="qr-hero-inner" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="qr-badge"><QrCode size={13} /> QR Studio</div>
          <h1>QR <span className="qr-accent">Studio</span></h1>
          <p>Scan QR codes from images or your camera, and generate custom QR codes in seconds.</p>
          <div className="qr-hero-pills">
            <span><ScanLine size={12}/> Upload &amp; Decode</span>
            <span><Camera size={12}/> Live Camera Scan</span>
            <span><Wand2 size={12}/> Generate QR</span>
            <span><Download size={12}/> PNG &amp; SVG Export</span>
          </div>
        </motion.div>
      </section>

      {/* Tab bar */}
      <div className="qr-tab-bar">
        <button id="tab-scan-upload" className={`qr-tab ${tab==='scan-upload'?'active':''}`} onClick={()=>setTab('scan-upload')}>
          <Upload size={15}/> Upload &amp; Scan
        </button>
        <button id="tab-scan-camera" className={`qr-tab ${tab==='scan-camera'?'active':''}`} onClick={()=>setTab('scan-camera')}>
          <Camera size={15}/> Camera Scan
        </button>
        <button id="tab-generate" className={`qr-tab ${tab==='generate'?'active':''}`} onClick={()=>setTab('generate')}>
          <Wand2 size={15}/> Generate QR
        </button>
      </div>

      {/* Panels */}
      <div className="qr-panel-wrap">
        <AnimatePresence mode="wait">
          {tab === 'scan-upload' && <UploadScan key="upload" />}
          {tab === 'scan-camera' && <CameraScan key="camera" />}
          {tab === 'generate'    && <GenerateQr  key="generate" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   TAB 1 — UPLOAD & SCAN
   ════════════════════════════════════════════════ */
function UploadScan() {
  const [file, setFile]       = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus]   = useState('idle'); // idle|loading|done|error
  const [result, setResult]   = useState(null);
  const [copied, setCopied]   = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setStatus('idle');
  };

  const decode = async () => {
    if (!file) return;
    setStatus('loading');
    const fd = new FormData();
    fd.append('image', file);
    try {
      const r = await qrDecode(fd);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Decode failed');
      setResult(d);
      setStatus('done');
    } catch (e) {
      setResult({ error: e.message });
      setStatus('error');
    }
  };

  const copy = () => {
    if (!result?.text) return;
    navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openUrl = () => {
    const t = result?.text || '';
    if (t.startsWith('http')) window.open(t, '_blank');
  };

  const reset = () => { setFile(null); setPreview(null); setResult(null); setStatus('idle'); };

  return (
    <motion.div className="qr-panel" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}>
      <div className="qr-two-col">
        {/* Left */}
        <div className="qr-col">
          <h3 className="qr-col-title"><Upload size={16}/> Upload Image</h3>
          <div
            id="qr-upload-dropzone"
            className={`qr-dropzone ${dragging?'dragging':''} ${preview?'has-file':''}`}
            onDragOver={e=>{e.preventDefault();setDragging(true);}}
            onDragLeave={()=>setDragging(false)}
            onDrop={e=>{e.preventDefault();setDragging(false);handleFile(e.dataTransfer.files[0]);}}
            onClick={()=>inputRef.current.click()}
          >
            <input ref={inputRef} id="qr-file-input" type="file" accept="image/*" hidden onChange={e=>handleFile(e.target.files[0])}/>
            {preview
              ? <img src={preview} alt="uploaded" className="qr-preview-img"/>
              : <>
                  <div className="qr-dz-icon"><QrCode size={40}/></div>
                  <p className="qr-dz-title">Drop QR image here</p>
                  <p className="qr-dz-sub">PNG · JPG · BMP · WEBP</p>
                </>
            }
          </div>
          <div className="qr-btn-row">
            {file && <button id="qr-decode-btn" className="btn-qr-primary" onClick={decode} disabled={status==='loading'}>
              {status==='loading' ? <><Loader2 size={15} className="spin"/> Decoding…</> : <><ScanLine size={15}/> Decode QR</>}
            </button>}
            {file && <button className="btn-qr-ghost" onClick={reset}><X size={14}/> Clear</button>}
            {!file && <button className="btn-qr-primary" onClick={()=>inputRef.current.click()}><Upload size={15}/> Browse Image</button>}
          </div>
        </div>

        {/* Right */}
        <div className="qr-col">
          <h3 className="qr-col-title"><CheckCircle size={16}/> Decoded Result</h3>
          <div className={`qr-result-box ${status==='done'?'success':status==='error'?'error':''}`}>
            {status === 'idle'    && <p className="qr-result-placeholder">Upload an image and click Decode QR</p>}
            {status === 'loading' && <div className="qr-loading"><Loader2 className="spin" size={28}/><span>Reading QR…</span></div>}
            {status === 'done'    && result?.text && <p className="qr-result-text">{result.text}</p>}
            {status === 'done'    && !result?.text && <p className="qr-result-none">No QR code found in image.</p>}
            {status === 'error'   && <p className="qr-result-error"><AlertCircle size={16}/> {result?.error}</p>}
          </div>
          {status === 'done' && result?.text && (
            <div className="qr-btn-row">
              <button className="btn-qr-primary" onClick={copy}>
                {copied ? <><CheckCircle size={14}/> Copied!</> : <><Copy size={14}/> Copy</>}
              </button>
              {result.text.startsWith('http') && (
                <button className="btn-qr-ghost" onClick={openUrl}><ExternalLink size={14}/> Open URL</button>
              )}
            </div>
          )}
          {status === 'done' && result?.count > 1 && (
            <div className="qr-all-codes">
              <p className="qr-all-title">All {result.count} codes found:</p>
              {result.all.map((t,i) => <p key={i} className="qr-all-item">#{i+1} {t}</p>)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════
   TAB 2 — CAMERA SCAN (client-side jsQR)
   ════════════════════════════════════════════════ */
function CameraScan() {
  const videoRef  = useRef();
  const canvasRef = useRef();
  const rafRef    = useRef();
  const [active, setActive]   = useState(false);
  const [decoded, setDecoded] = useState('');
  const [copied, setCopied]   = useState(false);
  const [err, setErr]         = useState('');

  const tick = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(tick); return;
    }
    const ctx = canvas.getContext('2d');
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
    if (code) {
      // Draw border
      const loc = code.location;
      ctx.beginPath();
      ctx.moveTo(loc.topLeftCorner.x,     loc.topLeftCorner.y);
      ctx.lineTo(loc.topRightCorner.x,    loc.topRightCorner.y);
      ctx.lineTo(loc.bottomRightCorner.x, loc.bottomRightCorner.y);
      ctx.lineTo(loc.bottomLeftCorner.x,  loc.bottomLeftCorner.y);
      ctx.closePath();
      ctx.lineWidth   = 4;
      ctx.strokeStyle = '#00e5ff';
      ctx.stroke();
      setDecoded(code.data);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = async () => {
    setErr('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setActive(true);
      rafRef.current = requestAnimationFrame(tick);
    } catch (e) {
      setErr('Camera access denied or not available: ' + e.message);
    }
  };

  const stop = () => {
    cancelAnimationFrame(rafRef.current);
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach(t => t.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  };

  useEffect(() => () => stop(), []);

  const copy = () => {
    if (!decoded) return;
    navigator.clipboard.writeText(decoded);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div className="qr-panel" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}>
      <div className="qr-two-col">
        {/* Left — camera feed */}
        <div className="qr-col">
          <h3 className="qr-col-title"><Camera size={16}/> Camera Feed</h3>
          <div className="qr-cam-container">
            <video ref={videoRef} className="qr-video" playsInline muted style={{display: active?'block':'none'}}/>
            <canvas ref={canvasRef} className="qr-canvas" style={{display: active?'block':'none'}}/>
            {!active && (
              <div className="qr-cam-off">
                <Camera size={48}/>
                <p>Camera is off</p>
              </div>
            )}
          </div>
          {err && <p className="qr-cam-err"><AlertCircle size={14}/> {err}</p>}
          <div className="qr-btn-row">
            {!active
              ? <button id="qr-start-cam-btn" className="btn-qr-primary btn-green" onClick={start}><Camera size={15}/> Start Camera</button>
              : <button id="qr-stop-cam-btn"  className="btn-qr-danger" onClick={stop}><X size={15}/> Stop Camera</button>
            }
          </div>
        </div>

        {/* Right — live result */}
        <div className="qr-col">
          <h3 className="qr-col-title"><ScanLine size={16}/> Live Decode</h3>
          <div className={`qr-result-box ${decoded?'success':''}`}>
            {!active && !decoded && <p className="qr-result-placeholder">Start camera and point at a QR code</p>}
            {active && !decoded && (
              <div className="qr-scanning-anim">
                <div className="qr-scan-line"/>
                <p>Scanning for QR codes…</p>
              </div>
            )}
            {decoded && <p className="qr-result-text">{decoded}</p>}
          </div>
          {decoded && (
            <div className="qr-btn-row">
              <button className="btn-qr-primary" onClick={copy}>
                {copied ? <><CheckCircle size={14}/> Copied!</> : <><Copy size={14}/> Copy</>}
              </button>
              {decoded.startsWith('http') && (
                <button className="btn-qr-ghost" onClick={()=>window.open(decoded,'_blank')}><ExternalLink size={14}/> Open URL</button>
              )}
              <button className="btn-qr-ghost" onClick={()=>setDecoded('')}><RefreshCw size={14}/> Clear</button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════
   TAB 3 — GENERATE QR
   ════════════════════════════════════════════════ */
function GenerateQr() {
  const [text,       setText]       = useState('');
  const [size,       setSize]       = useState(10);
  const [border,     setBorder]     = useState(4);
  const [fillColor,  setFillColor]  = useState('#000000');
  const [backColor,  setBackColor]  = useState('#ffffff');
  const [format,     setFormat]     = useState('png');
  const [status,     setStatus]     = useState('idle'); // idle|loading|done|error
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errMsg,     setErrMsg]     = useState('');

  const generate = async () => {
    if (!text.trim()) return;
    setStatus('loading');
    setErrMsg('');
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    try {
      const r = await qrGenerate({
        text, size, border,
        fill_color: fillColor,
        back_color: backColor,
        format
      });
      if (!r.ok) {
        const d = await r.json();
        throw new Error(d.error || 'Generation failed');
      }
      const blob = await r.blob();
      setPreviewUrl(URL.createObjectURL(blob));
      setStatus('done');
    } catch (e) {
      setErrMsg(e.message);
      setStatus('error');
    }
  };

  const download = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = `qr_code.${format}`;
    a.click();
  };

  return (
    <motion.div className="qr-panel" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}>
      <div className="qr-two-col">
        {/* Left — options */}
        <div className="qr-col">
          <h3 className="qr-col-title"><Wand2 size={16}/> Enter URL or Text</h3>

          <textarea
            id="qr-text-input"
            className="qr-textarea"
            placeholder="https://example.com  or any text…"
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
          />

          <div className="qr-options-grid">
            <label className="qr-opt-label">
              <span>Box Size <em>{size}</em></span>
              <input type="range" min={3} max={30} value={size} onChange={e=>setSize(+e.target.value)} className="qr-slider"/>
            </label>
            <label className="qr-opt-label">
              <span>Border <em>{border}</em></span>
              <input type="range" min={1} max={10} value={border} onChange={e=>setBorder(+e.target.value)} className="qr-slider"/>
            </label>
            <label className="qr-opt-label">
              <span><Palette size={13}/> QR Color</span>
              <div className="qr-color-row">
                <input type="color" value={fillColor} onChange={e=>setFillColor(e.target.value)} className="qr-color-swatch"/>
                <span className="qr-color-hex">{fillColor}</span>
              </div>
            </label>
            <label className="qr-opt-label">
              <span><Palette size={13}/> Background</span>
              <div className="qr-color-row">
                <input type="color" value={backColor} onChange={e=>setBackColor(e.target.value)} className="qr-color-swatch"/>
                <span className="qr-color-hex">{backColor}</span>
              </div>
            </label>
          </div>

          {/* Format toggle */}
          <div className="qr-format-row">
            <span>Export format:</span>
            <button className={`qr-fmt-btn ${format==='png'?'active':''}`} onClick={()=>setFormat('png')}>PNG</button>
            <button className={`qr-fmt-btn ${format==='svg'?'active':''}`} onClick={()=>setFormat('svg')}>SVG</button>
          </div>

          {status === 'error' && <p className="qr-gen-err"><AlertCircle size={14}/> {errMsg}</p>}

          <button
            id="qr-generate-btn"
            className="btn-qr-primary btn-full"
            onClick={generate}
            disabled={status==='loading' || !text.trim()}
          >
            {status==='loading'
              ? <><Loader2 size={15} className="spin"/> Generating…</>
              : <><Wand2 size={15}/> Generate QR Code</>}
          </button>
        </div>

        {/* Right — preview */}
        <div className="qr-col">
          <h3 className="qr-col-title"><Maximize2 size={16}/> Preview</h3>
          <div className={`qr-preview-box ${status==='done'?'has-qr':''}`}
               style={{ background: status==='done' ? backColor : undefined }}>
            {status === 'idle'    && <div className="qr-preview-placeholder"><QrCode size={52}/><p>QR preview will appear here</p></div>}
            {status === 'loading' && <div className="qr-preview-placeholder"><Loader2 size={40} className="spin"/><p>Generating…</p></div>}
            {status === 'done'    && <img src={previewUrl} alt="Generated QR" className="qr-gen-img"/>}
          </div>

          {status === 'done' && (
            <div className="qr-btn-row">
              <button id="qr-download-btn" className="btn-qr-primary" onClick={download}>
                <Download size={15}/> Download {format.toUpperCase()}
              </button>
              <button className="btn-qr-ghost" onClick={()=>{setStatus('idle');setPreviewUrl(null);}}>
                <RefreshCw size={14}/> Reset
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
