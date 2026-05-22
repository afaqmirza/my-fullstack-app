import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './ToolCard.css';

export default function ToolCard({ icon: Icon, title, description, features, linkTo, isHot }) {
  const cardContent = (
    <motion.div
      className={`tool-card${isHot ? ' tool-card-hot' : ''}`}
      whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(37, 99, 235, 0.15)' }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      {isHot && <span className="hot-tool-badge">🔥 Hot</span>}
      <div className="card-header">
        <motion.div
          className="card-icon"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <Icon size={32} />
        </motion.div>
        <h3>{title}</h3>
      </div>

      <p className="card-description">{description}</p>

      <div className="card-features">
        {features.map((feature, idx) => (
          <div key={idx} className="feature">
            <span className="feature-dot"></span>
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <motion.button
        className="card-button"
        whileHover={{ paddingRight: '1.5rem', gap: '1rem' }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <span>Try Now</span>
        <ArrowRight size={18} />
      </motion.button>
    </motion.div>
  );

  if (linkTo) {
    return <Link to={linkTo} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>{cardContent}</Link>;
  }
  
  return cardContent;
}
