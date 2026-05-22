import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ExternalLink, Share2, Code } from 'lucide-react';
import './Footer.css';

const Logo = () => (
  <motion.img 
    src="/logo.png" 
    alt="SWIFTDOCS Logo" 
    whileHover={{ scale: 1.04 }}
    transition={{ duration: 0.2 }}
    style={{ height: '76px', width: 'auto', display: 'block' }}
  />
);

export default function Footer() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.footer
      className="footer"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <div className="footer-container">
        <div className="footer-grid">
          <motion.div className="footer-section brand-section" variants={itemVariants}>
            <div className="footer-logo">
              <Logo />
            </div>
            <p>
              Your professional powerhouse for all document tasks. AI Summarizer, Document Translator, 
              Google Maps Scraper, and all the PDF tools you need.
            </p>
            <p className="footer-zerowave">
              Powered by{' '}
              <a
                href="https://zerowavelabs.com/"
                target="_blank"
                rel="noopener noreferrer"
                title="ZeroWaveLabs — Free Website Templates, 3D Models, Python Tools & IT Services"
              >
                ZeroWaveLabs
              </a>
            </p>
          </motion.div>

          <motion.div className="footer-section" variants={itemVariants}>
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/tools">Tools</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </motion.div>

          <motion.div className="footer-section" variants={itemVariants}>
            <h3>Contact Info</h3>
            <div className="contact-info">
              <div className="contact-item">
                <Mail size={18} />
                <span>afaqmugha754@gmail.com</span>
              </div>
              <div className="contact-item">
                <Phone size={18} />
                <span>+44 7508898159</span>
              </div>
              <div className="contact-item">
                <MapPin size={18} />
                <span>Islamabad, Pakistan</span>
              </div>
            </div>
          </motion.div>

          <motion.div className="footer-section" variants={itemVariants}>
            <h3>Follow Us</h3>
            <div className="social-links">
              <motion.a href="#" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                <Code size={20} />
              </motion.a>
              <motion.a href="#" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                <Share2 size={20} />
              </motion.a>
              <motion.a href="#" whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                <ExternalLink size={20} />
              </motion.a>
            </div>
          </motion.div>
        </div>

        <motion.div className="footer-bottom" variants={itemVariants}>
          <div className="divider"></div>
          <div className="footer-bottom-flex">
            <p>
              <a
                href="https://zerowavelabs.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                ZeroWaveLabs.com
              </a>
              {' '}| Privacy Policy | Terms of Service
            </p>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}
