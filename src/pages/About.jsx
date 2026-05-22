import { motion } from 'framer-motion';
import { CheckCircle, Users, Target, Zap } from 'lucide-react';
import SEO from '../components/SEO';
import { SITE_URL } from '../config/site';
import './About.css';

export default function About() {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description: 'To provide the most intuitive and powerful PDF tools that make document management effortless for everyone.',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'We constantly innovate to bring cutting-edge features that solve real-world PDF challenges.',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'We believe in building a community where users can share, learn, and grow together.',
    },
    {
      icon: CheckCircle,
      title: 'Quality',
      description: 'Every tool is crafted with precision to ensure the highest quality output for our users.',
    },
  ];

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
    <div className="about">
      <SEO
        title="About SwiftDocs — Modern Document Tools for Every Workflow"
        description="Learn about SwiftDocs: a modern document tool suite delivering fast, intuitive PDF, image, and text utilities with secure, professional workflows."
        keywords="about swiftdocs, document tools, pdf converter, online document suite"
        url={`${SITE_URL}/about`}
      />
      {/* Hero Section */}
      <section className="about-hero">
        <motion.div
          className="about-hero-content"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>About SwiftDocs</h1>
          <p>Powerful, elegant document tools built for speed, privacy, and everyday productivity.</p>
        </motion.div>
      </section>

      {/* Story Section */}
      <section className="story">
        <div className="story-container">
          <motion.div
            className="story-content"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Our Story</h2>
            <p>
              SwiftDocs was created to bring modern document tools to every user, whether you're editing contracts,
              converting files, or optimizing content for sharing. We combine fast performance with a clean, approachable interface.
            </p>
            <p>
              This website is more than a collection of utilities — it is a curated toolkit for working with PDFs, images,
              text, and documents in one place. Every feature is designed to save time while preserving quality and control.
            </p>
            <p>
              Our team is dedicated to excellence. We continually refine SwiftDocs based on real feedback, delivering dependable
              document workflows that feel professional and intuitive.
            </p>
          </motion.div>

          <motion.div
            className="story-image"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="image-placeholder">
              <div className="placeholder-content">
                <span>Est. 2020</span>
                <span>100+ Team Members</span>
                <span>50+ Countries</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2>Our Values</h2>
          <p>What drives us every day</p>
        </motion.div>

        <motion.div
          className="values-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {values.map((value, idx) => {
            const Icon = value.icon;
            return (
              <motion.div key={idx} className="value-card" variants={itemVariants}>
                <motion.div
                  className="value-icon"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Icon size={40} />
                </motion.div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

    </div>
  );
}
