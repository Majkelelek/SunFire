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

// Style
import './App.css'; 
import './Loading.css'; 

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL || "";

  // 1. Sprawdzanie autoryzacji
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

  // 2. Pobieranie konfiguracji wyglądu
  const fetchSiteConfig = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/cms`);
      if (res.ok) {
        const config = await res.json();
        
        // Ustawianie koloru akcentu
        if (config.primaryColor) {
          document.documentElement.style.setProperty('--sunfire-accent', config.primaryColor);
        }

        // Ustawianie tła (obrazek lub kolor)
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

  // INICJALIZACJA APLIKACJI
  useEffect(() => {
    const initApp = async () => {
      // Wykonujemy oba żądania równolegle, żeby było szybciej
      await Promise.all([
        checkAuth(),
        fetchSiteConfig()
      ]);

      // Dodajemy małe sztuczne opóźnienie (300ms), żeby przejście było płynne
      setTimeout(() => {
        setIsInitialLoading(false);
      }, 300);
    };

    initApp();
  }, [checkAuth, fetchSiteConfig]);

  // EKRAN ŁADOWANIA (Ukrywa błyski kolorów i weryfikację)
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
      <Navbar isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
      
      <main className="content-wrapper">
        <Routes>
          <Route path="/" element={<Home isAdmin={isAdmin} />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route 
            path="/login" 
            element={<Login setIsAdmin={setIsAdmin} checkAuth={checkAuth} />} 
          />
          <Route path="/about" element={<AboutPage isAdmin={isAdmin} />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute isAdmin={isAdmin}>
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route path="/polityka-prywatnosci" element={<LegalInfo />} />
          <Route path="/portfolio" element={<PortfolioPage isAdmin={isAdmin} />} />
        </Routes>
      </main>

      <Footer />
    </Router>
  );
}

export default App;