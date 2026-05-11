import { motion } from 'framer-motion';

export default function AnimatedButton({ children, type = "button" }) {
  return (
    <motion.button
      type={type}
      className="sunfire-btn"

      whileHover={{ 
        scale: 1.05, 
        boxShadow: "0px 0px 20px rgb(255, 77, 0)",
        backgroundColor: "#ff5e1a" 
      }}

      whileTap={{ scale: 0.95 }}

      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {children}
    </motion.button>
  );
}
