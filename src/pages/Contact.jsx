import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';
import SEO from '../components/SEO';
import { SITE_URL } from '../config/site';
import { sendContactMessage } from '../lib/api';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setFormError('');

    try {
      const response = await sendContactMessage(formData);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Could not send message. Is the backend server running?');
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setFormError(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      value: 'afaqmugha754@gmail.com',
      description: 'We respond within 24 hours',
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+44 7508898159',
      description: 'Available Mon-Fri',
    },
    {
      icon: MapPin,
      title: 'Address',
      value: 'Islamabad, Pakistan',
      description: 'Pakistan',
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
    <div className="contact">
      <SEO
        title="Contact ZeroWaveLabs — PDF Tools & Support"
        description="Get in touch with the ZeroWaveLabs team for support, feedback, or business inquiries about our free PDF and document tools."
        keywords="contact zerowavelabs, pdf tools support"
        url={`${SITE_URL}/contact`}
      />
      {/* Hero Section */}
      <section className="contact-hero">
        <motion.div
          className="contact-hero-content"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1>Get in Touch</h1>
          <p>We'd love to hear from you. Send us a message!</p>
        </motion.div>
      </section>

      {/* Contact Methods */}
      <section className="contact-methods">
        <div className="methods-container">
          <motion.div
            className="methods-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {contactMethods.map((method, idx) => {
              const Icon = method.icon;
              return (
                <motion.div key={idx} className="method-card" variants={itemVariants}>
                  <div className="method-icon">
                    <Icon size={32} />
                  </div>
                  <h3>{method.title}</h3>
                  <p className="method-value">{method.value}</p>
                  <p className="method-description">{method.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="contact-form-section">
        <div className="form-container">
          <motion.div
            className="form-content"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2>Send us a Message</h2>
            <p>Have a question or feedback? Fill out the form below and we'll get back to you soon.</p>

            <form onSubmit={handleSubmit} className="form">
              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                />
              </motion.div>

              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                viewport={{ once: true }}
              >
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                />
              </motion.div>

              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Message subject"
                />
              </motion.div>

              <motion.div
                className="form-group form-group-full"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                viewport={{ once: true }}
              >
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Your message here..."
                ></textarea>
              </motion.div>

              {formError && (
                <p className="contact-form-error" role="alert">{formError}</p>
              )}

              <motion.button
                type="submit"
                className={`submit-btn ${submitted ? 'submitted' : ''}`}
                disabled={sending}
                whileHover={{ scale: sending ? 1 : 1.02 }}
                whileTap={{ scale: sending ? 1 : 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                {submitted ? (
                  <span>Message Sent ✓</span>
                ) : sending ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Send Message</span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          <motion.div
            className="form-image"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="contact-illustration">
              <div className="illustration-content">
                <Mail size={64} color="var(--primary-blue)" />
                <span>Quick Response</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
