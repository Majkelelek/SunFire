import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop'; // IMPORT SCROLL FIX
import AnimatedRoutes from './components/AnimatedRoutes';
import { useAuth } from './context/AuthContext';
import { cmsService } from './services/cmsService';

// Style
import './App.css'; 
import './Loading.css'; 

import { Toaster } from 'react-hot-toast';

function App() {
  const { isAuthLoading } = useAuth();
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const fetchSiteConfig = useCallback(async () => {
    try {
      const config = await cmsService.getSiteConfig();
      if (config) {
        if (config.primaryColor) {
          document.documentElement.style.setProperty('--sunfire-accent', config.primaryColor);
        }
        if (config.backgroundImageUrl) {
          document.body.style.backgroundImage = `url(${config.backgroundImageUrl})`;
          document.body.style.backgroundSize = "cover";
          document.body.style.backgroundPosition = "center";
          document.body.style.backgroundAttachment = "fixed";
        } else {
          document.body.style.backgroundImage = "none";
          if (config.backgroundColor) {
            document.body.style.backgroundColor = config.backgroundColor;
          }
        }
      }
    } catch (error) {
      console.error("Nie udało się pobrać konfiguracji wyglądu:", error);
    } finally {
      setIsConfigLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSiteConfig();
  }, [fetchSiteConfig]);

  useEffect(() => {
    if (!isAuthLoading && !isConfigLoading) {
      setTimeout(() => { setIsInitialLoading(false); }, 300);
    }
  }, [isAuthLoading, isConfigLoading]);

  if (isInitialLoading) {
    return (
      <div className="sunfire-loader-overlay">
        <div className="sunfire-loader">
          <div className="loader-circle"></div>
          <h1 className="loader-logo">SUN<span>FIRE</span></h1>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop /> {/* SCROLL FIX UMIESZCZONY W ROUTERZE */}
      <Navbar />
      
      <main className="content-wrapper">
        <AnimatedRoutes />
      </main>

      <Footer />

      {/* Global Toaster Configuration */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#111',
            color: '#fff',
            border: '1px solid #333',
            fontFamily: 'Inter, sans-serif'
          },
          success: {
            iconTheme: {
              primary: 'var(--sunfire-accent)',
              secondary: '#111',
            },
          },
        }} 
      />
    </Router>
  );
}

export default App;