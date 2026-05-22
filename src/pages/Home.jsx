import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { SITE_URL } from '../config/site';
import { 
  FileUp, Scissors, Zap, Lock, Shield, Image, FileText, Layers, Wand2, 
  RotateCw, Type, FileCode, FileCode2, Presentation, FileSpreadsheet,
  CheckCircle, Globe, ShieldCheck, Zap as ZapIcon, MapPin, Sparkles, PenTool, Scan
} from 'lucide-react';
import ToolCard from '../components/ToolCard';
import ToolsSearchBar, { toolMatchesQuery } from '../components/ToolsSearchBar';
import { isHotTool } from '../config/toolInstructions';
import './Home.css';

export default function Home() {
  const [toolSearch, setToolSearch] = useState('');

  const featuredTools = [
    {
      icon: Sparkles,
      title: 'AI Summarizer',
      description: 'Summarize long articles and complex PDF documents into key insights instantly using AI.',
      features: ['Llama 3 Powered', 'Key insights', 'Instant summary'],
      linkTo: '/tools/intelligence/summarizer'
    },
    {
      icon: Globe,
      title: 'Doc Translator',
      description: 'Translate documents into 100+ languages while preserving original layout and formatting.',
      features: ['PDF/DOCX support', 'Fast translation', 'Side-by-side view'],
      linkTo: '/tools/intelligence/translator'
    },
    {
      icon: MapPin,
      title: 'G-Maps Scraper',
      description: 'Automatically extract business names, emails, and contact details from Google Maps for lead generation.',
      features: ['Lead generation', 'Email extraction', 'Excel export'],
      linkTo: '/tools/automation/gmaps-scraper'
    },
    {
      icon: Scan,
      title: 'OCR',
      description: 'Extract text from scanned PDFs and images. Upload a file, pick a language, and copy or download the result.',
      features: ['Text extraction', 'Scanned PDF support', 'Download .txt'],
      linkTo: '/tools/ocr'
    },
    {
      icon: FileUp,
      title: 'Merge PDF',
      description: 'Combine multiple PDF files into a single document in seconds without losing quality or formatting.',
      features: ['Reorder files', 'Fast merging', 'High quality'],
      linkTo: '/tools/pdf-merge'
    },
    {
      icon: Shield,
      title: 'Secure Vault',
      description: 'Secure your documents with advanced AES-256 password encryption and restricted access control.',
      features: ['Unlock PDF', 'Protect PDF', 'Secure local'],
      linkTo: '/tools/pdf-vault'
    },
    {
      icon: Wand2,
      title: 'PDF Editor',
      description: 'Upload a PDF, edit it live as a Word-style document, then save back to PDF.',
      features: ['Live editing', 'Images & watermark', 'PDF export'],
      linkTo: '/tools/pdf-editor'
    }
,
    {
      icon: PenTool,
      title: 'Resume Builder',
      description: 'Create professional, ATS-friendly resumes in minutes with smart templates',
      features: ['Modern templates', 'Live preview', 'One-click PDF'],
      linkTo: '/tools/resume-builder'
    }
  ];

  const popularDisplay = useMemo(
    () => featuredTools.filter((t) => toolMatchesQuery(t, toolSearch)),
    [toolSearch, featuredTools]
  );

  const categories = [
    { name: 'Organize PDF', icon: Layers, desc: 'Merge, Split, Rotate, Remove pages' },
    { name: 'Intelligence', icon: Sparkles, desc: 'AI Summarizer, Doc Translator' },
    { name: 'Convert PDF', icon: FileUp, desc: 'Office to PDF, Images to PDF' },
    { name: 'Business Automation', icon: MapPin, desc: 'Google Maps Scraper, Lead Gen' },
    { name: 'PDF Security', icon: ShieldCheck, desc: 'Protect, Unlock, Sign' }
  ];

  return (
    <div className="home-premium">
      <SEO
        title="Free PDF Tools Online — Merge, Convert, AI Summarize & Resume Builder"
        description="ZeroWaveLabs offers free PDF merge, split, compress, PDF to Word/Excel, AI summarizer, document translator, Google Maps scraper, resume builder and 20+ document tools. No signup required."
        keywords="free pdf tools online, pdf merge free, pdf to word converter, ai document summarizer, free resume builder, zerowavelabs pdf tools"
        url={SITE_URL}
      />
      {/* Hero Section */}
      <section className="hero-premium-split">
        <div className="container hero-flex">
          {/* Left Side: Animated Image */}
          <motion.div 
            className="hero-image-container"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.img 
              src="/main.jpg" 
              alt="SwiftDocs Overview" 
              className="hero-main-img"
              animate={{ 
                y: [0, -15, 0],
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
            <div className="img-glow"></div>
          </motion.div>

          {/* Right Side: Text Content */}
          <motion.div 
            className="hero-text-container"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-badge">🚀 Welcome to SwiftDocs</div>
            <h1>
              Master Your Workflow with <br />
              <span className="gradient-text">AI-Powered Intelligence</span>
            </h1>
            <p>
              The ultimate all-in-one hub for professional PDF tools, AI summarization, global translation, and smart business automation. Fast, secure, and 100% free document management by SwiftDocs.
            </p>
            <div className="hero-cta">
              <a href="/tools" className="btn btn-primary btn-large">Get Started for Free</a>
              <p className="cta-hint">Powered by AI · Secure & Private</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categorized Preview */}
      <section className="categories-preview">
        <div className="container">
          <div className="category-grid">
            {categories.map((cat, idx) => (
              <motion.div 
                key={idx} 
                className="category-mini-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="cat-icon"><cat.icon size={24} /></div>
                <h4>{cat.name}</h4>
                <p>{cat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      <section className="featured-tools-section">
        <div className="container">
          <div className="section-title">
            <h2>Most Popular Tools</h2>
            <p>Experience the speed and efficiency of SwiftDocs</p>
          </div>
          <ToolsSearchBar value={toolSearch} onChange={setToolSearch} />
          <div className="popular-grid">
            {popularDisplay.length > 0 ? (
              popularDisplay.map((tool, idx) => (
                <ToolCard key={idx} {...tool} isHot={isHotTool(tool.linkTo)} />
              ))
            ) : (
              <p className="home-search-empty">No tools match your search.</p>
            )}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-item">
              <ShieldCheck size={40} color="var(--primary-blue)" />
              <h3>Secure & Private</h3>
              <p>We use 256-bit encryption. All processing happens locally or is deleted instantly.</p>
            </div>
            <div className="trust-item">
              <Zap size={40} color="var(--primary-blue)" />
              <h3>Lightning Fast</h3>
              <p>Built for speed. Convert large documents in seconds without quality loss.</p>
            </div>
            <div className="trust-item">
              <Globe size={40} color="var(--primary-blue)" />
              <h3>Works Everywhere</h3>
              <p>Access your tools from Windows, Mac, Linux, or your mobile devices.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
