import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Home from '../pages/Home';
import ContactPage from '../pages/ContactPage';
import Admin from '../pages/Admin';
import Login from '../pages/Login';
import PortfolioPage from '../pages/PortfolioPage';
import ProtectedRoute from './ProtectedRoute';
import AboutPage from '../pages/AboutPage';
import LegalInfo from '../pages/LegalInfo';
import PageTransition from './PageTransition';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
        <Route 
          path="/admin" 
          element={
            <PageTransition>
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            </PageTransition>
          } 
        />
        <Route path="/polityka-prywatnosci" element={<PageTransition><LegalInfo /></PageTransition>} />
        <Route path="/portfolio" element={<PageTransition><PortfolioPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
