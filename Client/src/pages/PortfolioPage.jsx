import { motion } from 'framer-motion';
import Portfolio from '../components/Portfolio';

const PortfolioPage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 1.2 }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
    >
      <h1 className="page-title">Wyselekcjonowane Prace</h1>
      <Portfolio />
    </motion.div>
  );
};

export default PortfolioPage;