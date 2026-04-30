import React from 'react';
import { Link } from 'react-router-dom';

const LegalInfo = () => {
    return (
        <div className="container" style={{ paddingTop: '20px', paddingBottom: '80px' }}>
            
            {/* Przycisk powrotu */}
            <div style={{ maxWidth: '900px', margin: '0 auto 30px auto' }}>
                <Link to="/" style={{ 
                    color: '#fff', 
                    textDecoration: 'none', 
                    fontSize: '0.8rem', 
                    fontWeight: '800', 
                    letterSpacing: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    opacity: '0.5',
                    transition: '0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
                >
                    <span style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>←</span> WSTECZ
                </Link>
            </div>

            <div className="privacy-card" style={{ 
                background: 'rgba(255, 255, 255, 0.02)', 
                padding: '50px', 
                borderRadius: '24px', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                maxWidth: '900px',
                margin: '0 auto'
            }}>
                <h1 style={{ 
                    color: 'var(--primary)', 
                    marginBottom: '10px', 
                    fontSize: '2.5rem',
                    fontWeight: '900',
                    textTransform: 'uppercase' 
                }}>Polityka Prywatności</h1>
                <p style={{ color: '#666', marginBottom: '40px', fontSize: '0.9rem' }}>Ostatnia aktualizacja: 29.04.2026</p>
                
                <section style={{ marginBottom: '35px' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '12px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--primary)' }}>01.</span> Administrator Danych
                    </h2>
                    <p style={{ color: '#aaa', lineHeight: '1.7' }}>
                        Administratorem Twoich danych osobowych jest <strong>[Nazwa Firmy]</strong> z siedzibą w [Miasto]. 
                        W sprawach związanych z ochroną danych możesz skontaktować się pod adresem e-mail: <strong>[E-mail]</strong>.
                    </p>
                </section>

                <section style={{ marginBottom: '35px' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '12px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--primary)' }}>02.</span> Cel i Zakres Zbierania Danych
                    </h2>
                    <p style={{ color: '#aaa', lineHeight: '1.7' }}>
                        Twoje dane (takie jak imię, nazwisko oraz adres e-mail) przetwarzane są wyłącznie w celu:
                    </p>
                    <ul style={{ color: '#aaa', lineHeight: '1.7', marginLeft: '20px' }}>
                        <li>Obsługi zapytań przesłanych przez formularz kontaktowy.</li>
                        <li>Przygotowania personalizowanej wyceny na podstawie przesłanego formularza zapotrzebowania.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '35px' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '12px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--primary)' }}>03.</span> Przechowywanie i Bezpieczeństwo
                    </h2>
                    <p style={{ color: '#aaa', lineHeight: '1.7' }}>
                        Dane przesyłane przez formularze <strong>nie są zapisywane w bazie danych</strong> na serwerze. 
                        Są one automatycznie przesyłane bezpośrednio na zabezpieczoną skrzynkę pocztową Administratora w formie wiadomości e-mail. 
                        Informacje te są przechowywane wyłącznie przez okres niezbędny do udzielenia odpowiedzi lub realizacji zlecenia.
                    </p>
                </section>

                <section style={{ marginBottom: '35px' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '12px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--primary)' }}>04.</span> Twoje Prawa (RODO)
                    </h2>
                    <p style={{ color: '#aaa', lineHeight: '1.7' }}>
                        Zgodnie z rozporządzeniem RODO, masz prawo do:
                    </p>
                    <ul style={{ color: '#aaa', lineHeight: '1.7', marginLeft: '20px' }}>
                        <li>Wglądu w treść przesłanych do mnie danych.</li>
                        <li>Sprostowania (poprawienia) swoich danych.</li>
                        <li>Żądania usunięcia danych z mojej skrzynki pocztowej ("prawo do bycia zapomnianym").</li>
                        <li>Ograniczenia przetwarzania lub wniesienia sprzeciwu.</li>
                    </ul>
                </section>

                <section style={{ padding: '25px', background: 'rgba(255, 77, 0, 0.03)', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--primary)' }}>05.</span> Informacja o Cookies
                    </h2>
                    <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>
                        Strona dba o Twoją prywatność. Serwis nie wykorzystuje, ani nie zapisuje na Twoim urządzeniu żadnych plików cookies (śledzących, analitycznych ani reklamowych).
                    </p>
                </section>
            </div>
        </div>
    );
};

export default LegalInfo;