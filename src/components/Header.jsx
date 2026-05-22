import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Globe, Shield, Zap, FileText, Scissors, MapPin, Sparkles, QrCode } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Logo = () => (
  <motion.img 
    src="/logo.png" 
    alt="SWIFTDOCS Logo" 
    whileHover={{ scale: 1.04 }}
    transition={{ duration: 0.2 }}
    style={{ height: '76px', width: 'auto', display: 'block' }}
  />
);

const menuData = {
  Home: { path: '/' },
  Tools: {
    path: '/tools',
    categories: {
      Organize: [
        { name: 'Merge PDF', path: '/tools/pdf-merge' },
        { name: 'Split PDF', path: '/tools/pdf-split' },
        { name: 'Rotate PDF', path: '/tools/pdf-rotate' }
      ],
      Optimize: [
        { name: 'Compress PDF', path: '/tools/pdf-compress' }
      ],
      Convert: [
        { name: 'PDF to Word', path: '/tools/pdf-to-word' },
        { name: 'PDF to PPT', path: '/tools/pdf-to-ppt' },
        { name: 'PDF to Excel', path: '/tools/pdf-to-excel' },
        { name: 'Word to PDF', path: '/tools/word-to-pdf' },
        { name: 'JPG to PDF', path: '/tools/image-to-pdf' },
        { name: 'HTML to PDF', path: '/tools/html-to-pdf' },
        { name: 'Word to Excel', path: '/tools/word-to-excel' }
      ],
      Edit: [
        { name: 'PDF Editor', path: '/tools/pdf-editor' },
        { name: 'Watermark', path: '/tools/pdf-watermark' }
      ],
      Security: [
        { name: 'Unlock PDF', path: '/tools/pdf-vault' },
        { name: 'Protect PDF', path: '/tools/pdf-vault' }
      ],
      Automation: [
        { name: 'G-Maps Scraper', path: '/tools/automation/gmaps-scraper' }
      ],
      Intelligence: [
        { name: 'AI Summarizer', path: '/tools/intelligence/summarizer' },
        { name: 'Document Translator', path: '/tools/intelligence/translator' },
        { name: 'AI Resume Builder', path: '/tools/resume-builder' },
        { name: 'QR Studio', path: '/tools/qr-studio' },
        { name: 'OCR', path: '/tools/ocr' }
      ]
    }
  },
  About: { path: '/about' },
  Contact: { path: '/contact' }
};

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close menu if user clicks outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
        setHoveredItem(null);
        setHoveredCategory(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLinkClick = (path) => {
    navigate(path);
    setIsOpen(false);
    setHoveredItem(null);
    setHoveredCategory(null);
  };

  return (
    <motion.header
      className="header"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="header-container">
        <div className="header-left-content">
          <div className="brand-group">
            <motion.div
              className="logo"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to="/" className="brand-link">
                <div className="logo-wrapper">
                  <Logo />
                </div>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* The Three-Line Attracting Drop Down Menu Trigger */}
        <div className="header-right-content" ref={menuRef}>
          <nav className="header-inline-links">
            <Link to="/" className="inline-nav-link">Home</Link>
            <Link to="/tools" className="inline-nav-link">Tools</Link>
            <Link to="/about" className="inline-nav-link">About</Link>
            <Link to="/contact" className="inline-nav-link">Contact</Link>
          </nav>

          <div 
            className="menu-trigger-container"
            onMouseEnter={() => setIsOpen(true)}
          >
            <button 
              className={`three-line-toggle ${isOpen ? 'active' : ''}`}
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <span className="line line-1"></span>
              <span className="line line-2"></span>
              <span className="line line-3"></span>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div 
                  className="attracting-dropdown"
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <div className="dropdown-panel-wrapper">
                    {/* Level 1: Main Menu Links */}
                    <div className="dropdown-column main-nav-column">
                      {Object.keys(menuData).map((key) => {
                        const item = menuData[key];
                        const hasSub = !!item.categories;
                        return (
                          <div 
                            key={key} 
                            className={`main-nav-item ${hoveredItem === key ? 'active' : ''}`}
                            onMouseEnter={() => {
                              setHoveredItem(key);
                              setHoveredCategory(null);
                            }}
                          >
                            {hasSub ? (
                              <div className="nav-item-link-container">
                                <span>{key}</span>
                                <ChevronRight size={16} className="arrow-icon" />
                              </div>
                            ) : (
                              <div onClick={() => handleLinkClick(item.path)} className="nav-item-link-container no-sub">
                                {key}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Level 2: Categories (Organize, Optimize, etc.) */}
                    <AnimatePresence>
                      {hoveredItem === 'Tools' && (
                        <motion.div 
                          className="dropdown-column category-column"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {Object.keys(menuData.Tools.categories).map((catName) => (
                            <div 
                              key={catName}
                              className={`category-nav-item ${hoveredCategory === catName ? 'active' : ''}`}
                              onMouseEnter={() => setHoveredCategory(catName)}
                            >
                              <span>{catName}</span>
                              <ChevronRight size={14} className="arrow-icon" />
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Level 3: Sub Tools List */}
                    <AnimatePresence>
                      {hoveredItem === 'Tools' && hoveredCategory && (
                        <motion.div 
                          className="dropdown-column tools-column"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="tools-list-header">{hoveredCategory} Tools</div>
                          <div className="tools-list-items">
                            {menuData.Tools.categories[hoveredCategory].map((tool) => (
                              <div 
                                key={tool.name} 
                                className="tool-nav-item"
                                onClick={() => handleLinkClick(tool.path)}
                              >
                                {tool.name}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
