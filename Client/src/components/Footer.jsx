import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full py-[15px] bg-[color-mix(in_srgb,var(--sunfire-accent),transparent_99%)] border-t border-[color-mix(in_srgb,var(--sunfire-accent),transparent_90%)] backdrop-blur-[10px] h-auto max-h-[80px] relative overflow-hidden">
            <div className="absolute top-[-1px] left-0 w-[500%] h-[3px] bg-gradient-to-r from-transparent via-sunfire to-transparent opacity-30"></div>
            
            <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-[10px] text-[#666] text-[0.9rem] relative z-[1]">
                <p>&copy; {currentYear} SunFire. Wszystkie prawa zastrzeżone.</p>
                <nav>
                    <Link to="/polityka-prywatnosci" className="text-sunfire font-medium transition-all duration-300 hover:opacity-100 hover:[text-shadow:0_0_10px_var(--sunfire-accent)]">
                        Polityka Prywatności
                    </Link>
                </nav>
            </div>
        </footer>
    );
};

export default Footer;