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

// Upewnij się, że ten import istnieje, aby style układu działały
import './App.css'; 

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/api/auth/check`, { credentials: 'include' });
      const authData = await res.json();
      setIsAdmin(authData.isAuthenticated);
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAdmin(false);
    } finally {
      setAuthLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (authLoading) return <div className="loading">Weryfikacja uprawnień...</div>;

  return (
    <Router>
      {/* Cała zawartość Routera ląduje w #root (zdefiniowanym w index.html) */}
      <Navbar isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
      
      <main className="content-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
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