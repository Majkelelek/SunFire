import { useState } from 'react';
import { motion } from 'framer-motion';

export default function SurveyForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: 'Branding',
    message: ''
  });

  const [status, setStatus] = useState({ type: '', msg: '' });
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setStatus({ type: 'info', msg: 'Wysyłanie energii w kosmos...' });

    try {
      // PAMIĘTAJ: Zmień port na taki, jaki masz w Server/Properties/launchSettings.json
      const response = await fetch('http://localhost:5000/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setStatus({ type: 'success', msg: 'Zlecenie przyjęte! Odpalaj kawę, niedługo się odezwę.' });
        setFormData({ name: '', email: '', projectType: 'Branding', message: '' });
      } else {
        throw new Error();
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'Serwer padł... spróbuj ponownie za chwilę.' });
    } finally {
      setIsSending(false);
    }
  };

  // Warianty animacji dla wejścia sekcji
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <motion.section 
      className="survey-section"
      id="contact"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={sectionVariants}
    >
      <div className="form-header">
        <h2>Gotowy na Sunfire?</h2>
        <p>Opisz swój projekt, a ja zajmę się resztą.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input 
            type="text" 
            placeholder="Twoje Imię" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required 
          />
          <input 
            type="email" 
            placeholder="E-mail kontaktowy" 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required 
          />
        </div>

        <select 
          value={formData.projectType}
          onChange={(e) => setFormData({...formData, projectType: e.target.value})}
        >
          <option value="Branding">Logo & Branding</option>
          <option value="UI/UX">Strona Internetowa / App</option>
          <option value="Illustration">Ilustracje</option>
          <option value="Other">Inne szaleństwo</option>
        </select>

        <textarea 
          placeholder="O czym myślisz? Opisz projekt..." 
          rows="5"
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          required
        ></textarea>

        <motion.button
          type="submit"
          disabled={isSending}
          className="sunfire-submit-btn"
          whileHover={{ scale: 1.02, boxShadow: "0px 0px 25px rgba(255, 77, 0, 0.5)" }}
          whileTap={{ scale: 0.98 }}
        >
          {isSending ? 'PROCESOWANIE...' : 'ODPALAMY PROJEKT!'}
        </motion.button>
      </form>

      {status.msg && (
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className={`status-msg ${status.type}`}
        >
          {status.msg}
        </motion.p>
      )}
    </motion.section>
  );
}