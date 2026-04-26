import { useState } from 'react'; // 1. Dodajemy import useState
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

export default function Navbar({ isAdmin, setIsAdmin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = import.meta.env.VITE_API_URL;
  
  // 2. Dodajemy stan dla mobilnego menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 3. Funkcja pomocnicza do zamykania menu po kliknięciu w link
  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    try {
      await fetch(`${apiUrl}/api/auth/logout`, { 
        method: 'POST', 
        credentials: 'include' 
      });
      setIsAdmin(false);
      closeMenu(); // Zamykamy menu po wylogowaniu
      navigate('/');
    } catch (err) {
      console.error("Błąd wylogowania");
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          SUN<span>FIRE</span>
        </Link>

        {/* 4. Przycisk Hamburgera (widoczny tylko na telefonach) */}
        <div className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>

        {/* 5. Pakujemy linki i przyciski w nowy div .nav-menu */}
        <div className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="nav-links">
            <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={closeMenu}>
              Start
            </Link>
            <Link to="/portfolio" className={location.pathname === '/portfolio' ? 'active' : ''} onClick={closeMenu}>
              Portfolio
            </Link>
            <Link to="/about" className={location.pathname === '/about' ? 'active' : ''} onClick={closeMenu}>
              O mnie
            </Link>
            <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''} onClick={closeMenu}>
              Kontakt
            </Link>
            
            {isAdmin && (
              <Link to="/admin" className={`nav-admin-link ${location.pathname === '/admin' ? 'active' : ''}`} onClick={closeMenu}>
                Panel Admina
              </Link>
            )}
          </div>

          <div className="nav-actions">
            {isAdmin ? (
              <button onClick={handleLogout} className="logout-btn">
                WYLOGUJ
              </button>
            ) : (
              <Link to="/login" className="login-link" onClick={closeMenu}>ZALOGUJ</Link>
            )}
          </div>
        </div>
      </div>
      <div className="nav-bottom-glow"></div>
    </nav>
  );
}