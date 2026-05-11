import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="main-footer">
            
            <div className="footer-bottom-glow"></div>
            
            <div className="footer-content">
                <p>&copy; {currentYear} SunFire. Wszystkie prawa zastrzeżone.</p>
                <nav className="footer-nav">
                    <Link to="/polityka-prywatnosci">Polityka Prywatności</Link>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;
