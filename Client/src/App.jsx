import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ContactPage from './pages/ContactPage';
import Admin from './pages/Admin';
import Login from './pages/Login';
import PortfolioPage from './pages/PortfolioPage';
import ProtectedRoute from './components/ProtectedRoute';
import AboutPage from './pages/AboutPage';
import Footer from './components/Footer';
import LegalInfo from './pages/LegalInfo';
import ScrollToTop from './components/ScrollToTop'; // IMPORT SCROLL FIX

// Style
function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL || "";

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/auth/check`, { credentials: 'include' });
      const authData = await res.json();
      setIsAdmin(authData.isAuthenticated);
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAdmin(false);
    }
  }, [apiUrl]);

  const fetchSiteConfig = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/cms`);
      if (res.ok) {
        const config = await res.json();
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
    }
  }, [apiUrl]);

  useEffect(() => {
    const initApp = async () => {
      await Promise.all([checkAuth(), fetchSiteConfig()]);
      setTimeout(() => { setIsInitialLoading(false); }, 300);
    };
    initApp();
  }, [checkAuth, fetchSiteConfig]);

  if (isInitialLoading) {
    return (
      <div className="fixed inset-0 w-screen h-screen bg-[#050505] flex justify-center items-center z-[99999]">
        <div className="text-center flex flex-col items-center gap-[20px]">
          <div className="w-[50px] h-[50px] border-[3px] border-white/5 border-t-white rounded-full animate-spin"></div>
          <h1 className="text-white text-[2rem] tracking-[10px] font-black m-0 uppercase">SUN<span className="text-[#333]">FIRE</span></h1>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop /> {/* SCROLL FIX UMIESZCZONY W ROUTERZE */}
      <Navbar isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
      
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Home isAdmin={isAdmin} />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<Login setIsAdmin={setIsAdmin} checkAuth={checkAuth} />} />
          <Route path="/about" element={<AboutPage isAdmin={isAdmin} />} />
          <Route path="/admin" element={<ProtectedRoute isAdmin={isAdmin}><Admin /></ProtectedRoute>} />
          <Route path="/polityka-prywatnosci" element={<LegalInfo />} />
          <Route path="/portfolio" element={<PortfolioPage isAdmin={isAdmin} />} />
        </Routes>
      </main>

      <Footer />
    </Router>
  );
}

export default App;