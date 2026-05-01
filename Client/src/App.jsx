import { BrowserRouter as Router } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop'; // IMPORT SCROLL FIX
import AnimatedBackground from './components/AnimatedBackground'; // IMPORT TŁA
import AnimatedRoutes from './components/AnimatedRoutes'; // IMPORT PŁYNNYCH PRZEJŚĆ

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [siteConfig, setSiteConfig] = useState(null); // Nowy stan dla tła
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
        setSiteConfig(config); // Zapisujemy config do stanu

        if (config.primaryColor) {
          document.documentElement.style.setProperty('--sunfire-accent', config.primaryColor);
        }
        // Usuwamy bezposrednie ruszanie document.body
        document.body.style.backgroundImage = "none";
        document.body.style.backgroundColor = "transparent";
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
          <div className="w-[50px] h-[50px] border-[3px] border-white/5 border-t-[var(--sunfire-accent,#ff4d00)] rounded-full animate-spin"></div>
          <h1 className="text-white text-[2rem] tracking-[10px] font-black m-0 uppercase">SUN<span className="text-white/30">FIRE</span></h1>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop /> {/* SCROLL FIX UMIESZCZONY W ROUTERZE */}
      
      {/* INTELIGENTNE TŁO */}
      <AnimatedBackground 
        backgroundImageUrl={siteConfig?.backgroundImageUrl} 
        backgroundColor={siteConfig?.backgroundColor} 
      />

      <Navbar isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
      
      <main className="flex-1 flex flex-col relative z-[1]">
        {/* WSZYSTKIE STRONY I ICH PŁYNNE PRZEJŚCIA */}
        <AnimatedRoutes isAdmin={isAdmin} setIsAdmin={setIsAdmin} checkAuth={checkAuth} />
      </main>

      <Footer />
    </Router>
  );
}

export default App;