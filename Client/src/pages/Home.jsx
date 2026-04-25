import { motion } from 'framer-motion';
import Header from '../components/Header';
import AnimatedButton from '../components/AnimatedButton';
import { Link } from 'react-router-dom';


const Home = () => {
  return (
    <motion.div 
      className="home-container"
      initial={{ opacity: 0, x: -100 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Header />
      
      <motion.div 
        style={{ textAlign: 'center', marginTop: '50px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Link to="/portfolio">
          <AnimatedButton>Odkryj moje projekty</AnimatedButton>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default Home;