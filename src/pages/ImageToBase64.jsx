import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, AlertCircle, Loader2 } from 'lucide-react';
import './ImageToBase64.css';

const OUTPUT_TYPES = [
  { id: 'text', label: 'text' },
  { id: 'img', label: '<img>' },
  { id: 'md', label: '.md' },
];

function formatBase64(base64, type) {
  switch (type) {
    case 'text':
      return base64;
    case 'img':
      return `<img alt=\"image\" src=\"${base64}\" />`;
    case 'md':
      return `![](${base64})`;
    default:
      return base64;
  }
}

export default function ImageToBase64() {
  const [imageSrc, setImageSrc] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [base64Output, setBase64Output] = useState('');
  const [outputType, setOutputType] = useState('text');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (imageSrc) {
      setBase64Output(formatBase64(imageSrc, outputType));
    } else {
      setBase64Output('');
    }
  }, [imageSrc, outputType]);

  useEffect(() => {
    const handlePaste = (event) => {
      if (event.clipboardData?.files?.length) {
        event.preventDefault();
        processFile(event.clipboardData.files[0]);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const reset = () => {
    setImageSrc('');
    setImageUrl('');
    setBase64Output('');
    setError('');
    setIsLoading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processFile = (file) => {
    setError('');

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }

    const reader = new FileReader();
    setIsLoading(true);

    reader.onloadend = () => {
      setIsLoading(false);
      setImageSrc(reader.result);
    };

    reader.onerror = () => {
      setIsLoading(false);
      setError('Unable to read the selected file.');
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleUrlLoad = async () => {
    const url = imageUrl.trim();
    if (!url) {
      setError('Please enter an image URL.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Unable to fetch the image URL.');
      }

      const blob = await response.blob();
      if (!blob.type.startsWith('image/')) {
        throw new Error('The URL did not return an image.');
      }

      processFile(new File([blob], 'downloaded-image', { type: blob.type }));
    } catch (fetchError) {
      setIsLoading(false);
      setError(fetchError.message);
    }
  };

  const copyOutput = async () => {
    if (!base64Output) {
      return;
    }

    try {
      await navigator.clipboard.writeText(base64Output);
    } catch (clipboardError) {
      setError('Unable to copy to clipboard.');
    }
  };

  const dummyImageSrc = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

  return (
    <div className="image-to-base64-page">
      <section className="tool-header-hero">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Image to Base64</h1>
          <p>Convert images or image URLs into embeddable base64 text for HTML, Markdown, and raw output.</p>
        </motion.div>
      </section>

      <section className="workspace-container">
        <div
          className={`file-drop-area${isLoading ? ' preview-loading' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDrop}
          onDragOver={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
          onDrop={handleDrop}
        >
          <img
            className="file-input-preview"
            src={imageSrc || dummyImageSrc}
            alt="Preview"
          />
          {isLoading && (
            <div className="preview-loading-indicator">
              <Loader2 size={24} />
            </div>
          )}
          <span className="file-drop-area-text">
            <span>Drop image file</span>
            <span>(or click to browse)</span>
          </span>
          <input
            type="file"
            accept="image/*"
            hidden
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>

        <div className="image-url-row">
          <label htmlFor="image-url">Image URL</label>
          <div className="image-url-input-row">
            <input
              id="image-url"
              type="text"
              placeholder="https://example.com/photo.png"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
            />
            <button type="button" className="btn btn-secondary" onClick={handleUrlLoad}>
              Load
            </button>
          </div>
        </div>

        {error && (
          <div className="alert-card">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <textarea
          className="base64-output"
          placeholder="Base64 Output"
          value={base64Output}
          readOnly
        />

        <div className="output-footer">
          <span className="output-count">{base64Output.length.toLocaleString()} chars</span>
          <div className="output-actions">
            <div className="output-types">
              {OUTPUT_TYPES.map((option) => (
                <label key={option.id} className="output-type-label">
                  <input
                    type="radio"
                    name="base64-output-type"
                    value={option.id}
                    checked={outputType === option.id}
                    onChange={() => setOutputType(option.id)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            <button type="button" className="btn btn-primary" onClick={copyOutput}>
              <Copy size={16} /> Copy
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
