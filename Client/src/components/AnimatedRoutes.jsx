import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import Home from '../pages/Home';
import ContactPage from '../pages/ContactPage';
import Admin from '../pages/Admin';
import Login from '../pages/Login';
import PortfolioPage from '../pages/PortfolioPage';
import ProtectedRoute from './ProtectedRoute';
import AboutPage from '../pages/AboutPage';
import LegalInfo from '../pages/LegalInfo';

const pageVariants = {
  initial: { opacity: 0, y: 20, filter: 'blur(10px)' },
  in: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: "easeOut" } },
  out: { opacity: 0, y: -20, filter: 'blur(10px)', transition: { duration: 0.3, ease: "easeIn" } }
};

const PageWrapper = ({ children }) => (
  <motion.div
    variants={pageVariants}
    initial="initial"
    animate="in"
    exit="out"
    className="flex-1 flex flex-col w-full h-full"
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = ({ isAdmin, setIsAdmin, checkAuth }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home isAdmin={isAdmin} /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><ContactPage /></PageWrapper>} />
        <Route path="/login" element={<PageWrapper><Login setIsAdmin={setIsAdmin} checkAuth={checkAuth} /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><AboutPage isAdmin={isAdmin} /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><ProtectedRoute isAdmin={isAdmin}><Admin /></ProtectedRoute></PageWrapper>} />
        <Route path="/polityka-prywatnosci" element={<PageWrapper><LegalInfo /></PageWrapper>} />
        <Route path="/portfolio" element={<PageWrapper><PortfolioPage isAdmin={isAdmin} /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
