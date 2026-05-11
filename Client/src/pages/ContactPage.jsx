import { motion } from 'framer-motion';
import SurveyForm from '../components/SurveyForm';

const ContactPage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }}
    >
      <SurveyForm />
    </motion.div>
  );
};


export default ContactPage;
