import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar({ isAdmin, setIsAdmin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = import.meta.env.VITE_API_URL || "";
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = async () => {
    try {
      await fetch(`${apiUrl}/api/auth/logout`, { 
        method: 'POST', 
        credentials: 'include' 
      });
      setIsAdmin(false);
      closeMenu();
      navigate('/');
    } catch (err) {
      console.error("Błąd wylogowania");
    }
  };

  const linkBase = "text-white/60 text-[1.3rem] lg:text-[0.9rem] font-medium uppercase tracking-[1.5px] relative py-[10px] transition duration-300 hover:text-white";
  const linkActive = "text-white after:w-full";
  const linkAfter = "after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-sunfire after:shadow-[0_0_10px_var(--sunfire-accent)] after:transition-all after:duration-300 hover:after:w-full";

  const getLinkClass = (path) => `${linkBase} ${linkAfter} ${location.pathname === path ? linkActive : ''}`;

  return (
    <nav className="sticky top-0 z-[1000] bg-[color-mix(in_srgb,var(--sunfire-accent),transparent_99%)] backdrop-blur-[15px] border-b-0 h-[80px] flex items-center transition-all duration-300">
      <div className="w-[90%] max-w-[1400px] mx-auto flex justify-between items-center lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <Link to="/" className="text-[1.8rem] font-black text-white tracking-[3px] transition duration-300 hover:scale-105 lg:justify-self-start" onClick={closeMenu}>
          SUN<span className="text-sunfire [text-shadow:0_0_40px_var(--sunfire-accent)]">FIRE</span>
        </Link>

        {/* Hamburger */}
        <div className="lg:hidden cursor-pointer relative z-[1001] w-[25px] h-[24px] flex flex-col justify-between" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <span 
            className={`block w-full h-[3px] rounded-[3px] transition-all duration-300 origin-center ${isMobileMenuOpen ? 'bg-sunfire' : 'bg-white'}`}
            style={{ transform: isMobileMenuOpen ? 'translateY(10.5px) rotate(45deg)' : 'none' }}
          ></span>
          <span 
            className={`block w-full h-[3px] rounded-[3px] transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0 bg-sunfire' : 'bg-white'}`}
          ></span>
          <span 
            className={`block w-full h-[3px] rounded-[3px] transition-all duration-300 origin-center ${isMobileMenuOpen ? 'bg-sunfire' : 'bg-white'}`}
            style={{ transform: isMobileMenuOpen ? 'translateY(-10.5px) rotate(-45deg)' : 'none' }}
          ></span>
        </div>

        {/* Menu */}
        <div className={`
          flex flex-col justify-start items-center fixed top-[80px] w-screen h-[calc(100vh-80px)] bg-[rgba(10,10,10,0.98)] border-t border-[rgba(255,77,0,0.2)] pt-[60px] shadow-[10px_10px_30px_rgba(0,0,0,0.8)] transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] z-[999]
          lg:contents
          ${isMobileMenuOpen ? 'left-0' : 'left-[-100%] lg:left-0'}
        `}>
          <div className="flex flex-col gap-[25px] text-center lg:flex-row lg:gap-[40px] lg:justify-self-center">
            <Link to="/" className={getLinkClass('/')} onClick={closeMenu}>Start</Link>
            <Link to="/portfolio" className={getLinkClass('/portfolio')} onClick={closeMenu}>Portfolio</Link>
            <Link to="/about" className={getLinkClass('/about')} onClick={closeMenu}>O mnie</Link>
            <Link to="/contact" className={getLinkClass('/contact')} onClick={closeMenu}>Kontakt</Link>
            
            {isAdmin && (
              <Link to="/admin" className={`${getLinkClass('/admin')} !text-sunfire !font-extrabold`} onClick={closeMenu}>Panel Admina</Link>
            )}
          </div>

          <div className="flex flex-col items-center mt-[40px] lg:mt-0 lg:flex-row lg:justify-self-end">
            {isAdmin ? (
              <button onClick={handleLogout} className="bg-transparent border-2 border-sunfire text-sunfire py-[15px] px-[24px] lg:py-[8px] rounded-[8px] font-extrabold text-[1rem] lg:text-[0.85rem] tracking-[1px] cursor-pointer transition-all duration-300 hover:bg-sunfire hover:text-black hover:shadow-[0_0_15px_color-mix(in_srgb,var(--sunfire-accent),transparent_60%)] w-[220px] lg:w-auto">
                WYLOGUJ
              </button>
            ) : (
              <Link to="/login" className="text-white text-[1rem] lg:text-[0.8rem] border border-white/20 py-[15px] px-[20px] lg:py-[8px] rounded-[20px] transition duration-300 hover:bg-white hover:text-black w-[220px] lg:w-auto text-center" onClick={closeMenu}>ZALOGUJ</Link>
            )}
          </div>
        </div>
      </div>
      <div className="absolute left-0 bottom-[-1px] w-[1000%] h-[2px] bg-gradient-to-r from-transparent via-sunfire to-transparent opacity-30"></div>
    </nav>
  );
}