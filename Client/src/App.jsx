import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react'; // Dodano useState
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ContactPage from './pages/ContactPage';
import Admin from './pages/Admin';
import Login from './pages/Login';
import PortfolioPage from './pages/PortfolioPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // --- DEFINIUJEMY STAN LOGOWANIA DLA CAŁEJ APKI ---
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 1. Pobieranie konfiguracji wyglądu strony
    fetch('http://localhost:5150/api/cms')
      .then(res => res.json())
      .then(data => {
        if (data && data.primaryColor) {
          document.documentElement.style.setProperty('--primary', data.primaryColor);
          document.documentElement.style.setProperty('--dark-bg', data.backgroundColor);
          if (data.backgroundImageUrl) {
            document.body.style.backgroundImage = `url(${data.backgroundImageUrl})`;
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundAttachment = "fixed";
          }
        }
      })
      .catch(() => console.log("Czekam na konfigurację serwera..."));

    // 2. SPRAWDZANIE CZY JESTEŚ ZALOGOWANY (Ciche, bez błędu 401 w konsoli)
    fetch('http://localhost:5150/api/auth/check', { credentials: 'include' })
      .then(res => res.json())
      .then(authData => {
        if (authData.isAuthenticated) {
          setIsAdmin(true);
        }
      })
      .catch(() => setIsAdmin(false));
  }, []);

  return (
    <Router>
      {/* Przekazujemy isAdmin do Navbara, żeby mógł wyświetlić przycisk "Wyloguj" */}
      <Navbar isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
      
      <div className="content-wrapper">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          
          {/* Przekazujemy isAdmin do PortfolioPage jako prop */}
          <Route path="/portfolio" element={<PortfolioPage isAdmin={isAdmin} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;