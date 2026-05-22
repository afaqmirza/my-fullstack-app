import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import { SITE_URL } from '../config/site';
import { 
  FileUp, Scissors, Zap, Lock, Shield, Image, FileText, Layers, Wand2, 
  RotateCw, Type, FileCode, FileCode2, Presentation, FileSpreadsheet,
  Layout, Search, Filter, ArrowRight, ShieldCheck, Cpu, PenTool,
  Plus, Trash2, Hash, Scan, FileSearch, Trash, MapPin, Database, Sparkles, Globe, Languages, QrCode
} from 'lucide-react';
import ToolCard from '../components/ToolCard';
import ToolsSearchBar, { toolMatchesQuery } from '../components/ToolsSearchBar';
import { isHotTool } from '../config/toolInstructions';
import './Tools.css';

export default function Tools() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'All', 'Organize', 'Optimize', 'Convert', 'Edit', 'Security', 'Automation', 'Intelligence', 'OCR'
  ];

  const allTools = [
    // OCR
    {
      icon: Scan,
      title: 'OCR',
      description: 'Extract text from scanned PDFs and images. Upload a file, pick a language, and copy or download the result.',
      features: ['Ready · 2 language(s)'],
      linkTo: '/tools/ocr',
      category: 'OCR'
    },

    // Automation
    {
      icon: MapPin,
      title: 'G-Maps Scraper',
      description: 'Automatically extract business names, emails, and contact details from Google Maps for lead generation.',
      features: ['Industry search', 'Location based', 'Email extraction', 'Excel export'],
      linkTo: '/tools/automation/gmaps-scraper',
      category: 'Automation'
    },

    // Organize
    {
      icon: FileUp,
      title: 'Merge PDF',
      description: 'Combine multiple PDF files into a single document in seconds without losing quality or formatting.',
      features: ['Reorder files', 'Fast merging', 'High quality'],
      linkTo: '/tools/pdf-merge',
      category: 'Organize'
    },
    {
      icon: Scissors,
      title: 'Split PDF',
      description: 'Extract specific pages or split a large PDF into separate files while maintaining original document quality.',
      features: ['Page selection', 'Custom ranges', 'Split all'],
      linkTo: '/tools/pdf-split',
      category: 'Organize'
    },
    {
      icon: RotateCw,
      title: 'Rotate PDF',
      description: 'Permanently rotate PDF pages to any orientation (portrait or landscape) for one or multiple files at once.',
      features: ['Single page', 'All pages', 'Save as new'],
      linkTo: '/tools/pdf-rotate',
      category: 'Organize'
    },

    // Optimize
    {
      icon: Zap,
      title: 'Compress PDF',
      description: 'Reduce PDF file size for easier sharing and faster uploads with smart optimization for maximum quality.',
      features: ['Smart compression', 'Batch process', 'Fast download'],
      linkTo: '/tools/pdf-compress',
      category: 'Optimize'
    },

    // Convert
    {
      icon: FileText,
      title: 'PDF to Word',
      description: 'Turn your PDF documents back into editable Word files (DOCX) with precise layout and formatting retention.',
      features: ['Maintains layout', 'Fast conversion', 'Editable'],
      linkTo: '/tools/pdf-to-word',
      category: 'Convert'
    },
    {
      icon: Presentation,
      title: 'PDF to PPT',
      description: 'Convert PDF documents into editable PowerPoint presentations for professional viewing and slide editing.',
      features: ['High quality', 'Formatting preserved', 'Quick'],
      linkTo: '/tools/pdf-to-ppt',
      category: 'Convert'
    },
    {
      icon: FileSpreadsheet,
      title: 'PDF to Excel',
      description: 'Extract data from PDF tables and convert them into organized Excel spreadsheets in just a few seconds.',
      features: ['Maintains tables', 'Accurate data', 'Fast'],
      linkTo: '/tools/pdf-to-excel',
      category: 'Convert'
    },
    {
      icon: FileCode2,
      title: 'Word to PDF',
      description: 'Convert Microsoft Word (DOCX/DOC) documents to high-quality PDF files online with perfect layout preservation.',
      features: ['Perfect layout', 'Fast', 'Secure'],
      linkTo: '/tools/word-to-pdf',
      category: 'Convert'
    },
    {
      icon: FileSpreadsheet,
      title: 'Word to Excel',
      description: 'Extract tables and structured data from Word documents directly into organized Excel sheets.',
      features: ['Table extraction', 'Sheet segmentation', 'Auto columns fit'],
      linkTo: '/tools/word-to-excel',
      category: 'Convert'
    },
    {
      icon: Image,
      title: 'JPG to PDF',
      description: 'Convert JPG, PNG, and WebP images into a single professional PDF document with customizable orientation.',
      features: ['Batch convert', 'Reorder', 'High quality'],
      linkTo: '/tools/image-to-pdf',
      category: 'Convert'
    },
    {
      icon: Image,
      title: 'Image to Base64',
      description: 'Convert image files or image URLs into embeddable Base64 strings for HTML, Markdown, and raw usage.',
      features: ['File upload', 'URL import', '<img> & Markdown'],
      linkTo: '/tools/image-to-base64',
      category: 'Convert'
    },
    {
      icon: FileCode,
      title: 'HTML to PDF',
      description: 'Convert any webpage or raw HTML code into a perfectly formatted PDF document with a single click.',
      features: ['Paste code', 'Upload file', 'Clean layout'],
      linkTo: '/tools/html-to-pdf',
      category: 'Convert'
    },

    // Edit
    {
      icon: Wand2,
      title: 'PDF Editor',
      description: 'Upload a PDF, edit it live as a document (text, images, watermark), then save back to PDF using our PDF↔Word converters.',
      features: ['Live doc edit', 'Images & watermark', 'Save as PDF'],
      linkTo: '/tools/pdf-editor',
      category: 'Edit'
    },
    {
      icon: Type,
      title: 'Watermark',
      description: 'Add custom text or image watermarks to your PDFs to protect your brand and digital content securely.',
      features: ['Custom text', 'Transparency', 'Positioning'],
      linkTo: '/tools/pdf-watermark',
      category: 'Edit'
    },

    // Security
    {
      icon: Shield,
      title: 'Unlock PDF',
      description: 'Remove passwords and security restrictions from protected PDF files to regain full access and editing rights.',
      features: ['Secure removal', 'Local processing', 'Fast'],
      linkTo: '/tools/pdf-vault',
      category: 'Security'
    },
    {
      icon: Lock,
      title: 'Protect PDF',
      description: 'Secure your sensitive documents with advanced AES-256 password encryption and restricted access control.',
      features: ['Strong encryption', 'Password protection', 'AES-256'],
      linkTo: '/tools/pdf-vault',
      category: 'Security'
    },

    // Intelligence
    {
      icon: Sparkles,
      title: 'AI Summarizer',
      description: 'Summarize long articles and complex PDF documents into key insights instantly using Llama 3 AI technology.',
      features: ['Llama 3 Powered', 'PDF/DOCX/TXT', 'Key Insights', 'Fast generation'],
      linkTo: '/tools/intelligence/summarizer',
      category: 'Intelligence'
    },
    {
      icon: Globe,
      title: 'Google Document Translator',
      description: 'Translate PDFs, Word documents, and Text files into over 100 languages with high accuracy.',
      features: ['PDF/DOCX/TXT', '100+ Languages', 'High accuracy', 'Side-by-side view'],
      linkTo: '/tools/intelligence/translator',
      category: 'Intelligence'
    },
    {
      icon: PenTool,
      title: 'AI Resume Builder',
      description: 'Create professional, ATS-friendly resumes in minutes with smart templates and professional layout guidance.',
      features: ['Multiple templates', 'Live preview', 'One-click PDF', 'Professional layout'],
      linkTo: '/tools/resume-builder',
      category: 'Intelligence'
    },

    {
      icon: QrCode,
      title: 'QR Studio',
      description: 'Scan QR codes from images or camera, and generate custom QR codes with color options and SVG/PNG export.',
      features: ['Upload & Decode', 'Live camera scan', 'Custom colors', 'PNG & SVG export'],
      linkTo: '/tools/qr-studio',
      category: 'Intelligence'
    }
  ];

  const filteredTools = useMemo(() => {
    let list = activeCategory === 'All' ? allTools : allTools.filter((t) => t.category === activeCategory);
    if (searchQuery.trim()) {
      list = list.filter((t) => toolMatchesQuery(t, searchQuery));
    }
    return list;
  }, [activeCategory, searchQuery, allTools]);

  return (
    <div className="tools-page-categorized">
      <SEO
        title="All Free PDF & Document Tools — Merge, Convert, AI & Automation"
        description="Browse 20+ free tools: PDF merge, split, compress, convert to Word/Excel/PPT, AI summarizer, translator, G-Maps scraper, resume builder, QR studio and more."
        keywords="pdf tools list, free document converter, online pdf merge split, ai summarizer tool, resume builder free"
        url={`${SITE_URL}/tools`}
      />
      <section className="tools-hero-premium">
        <div className="container">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            The Complete <span className="gradient-text">Document Toolkit</span> for Business Success
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            Empower your productivity with pro-grade PDF tools, Llama 3 AI intelligence, and high-speed automation. 100% Free lead generation and document control.
          </motion.p>
        </div>
      </section>

      <section className="tools-filtering">
        <div className="filter-tabs">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={activeCategory === cat ? 'active' : ''}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="tools-display">
        <div className="container">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeCategory}
              className="tools-grid-premium"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {filteredTools.length === 0 ? (
                <p className="tools-search-empty tools-search-empty-full">No tools found. Try another keyword or category.</p>
              ) : (
                filteredTools.map((tool, idx) => (
                  <ToolCard key={idx} {...tool} isHot={isHotTool(tool.linkTo)} />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
