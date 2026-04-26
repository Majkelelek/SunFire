import React from 'react';

const LegalInfo = () => {
    return (
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
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
                <p style={{ color: '#666', marginBottom: '40px', fontSize: '0.9rem' }}>Ostatnia aktualizacja: 26.04.2026</p>
                
                <section style={{ marginBottom: '35px' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '12px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--primary)' }}>01.</span> Administrator Danych
                    </h2>
                    <p style={{ color: '#aaa', lineHeight: '1.7' }}>
                        Administratorem danych osobowych serwisu <strong>Sunfire Portfolio</strong> jest właściciel strony. 
                        Szanuję Twoją prywatność i nie gromadzę danych w celach marketingowych. 
                        Wszelkie pytania dotyczące Twoich danych możesz kierować poprzez formularz w zakładce Kontakt.
                    </p>
                </section>

                <section style={{ marginBottom: '35px' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '12px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--primary)' }}>02.</span> Formularz Kontaktowy
                    </h2>
                    <p style={{ color: '#aaa', lineHeight: '1.7' }}>
                        Dane przesyłane za pomocą formularza (imię, adres e-mail, treść wiadomości) nie są zapisywane w bazie danych serwisu. 
                        Trafiają one bezpośrednio na moją skrzynkę e-mail jako standardowa wiadomość. Przetwarzam je wyłącznie w celu 
                        udzielenia odpowiedzi na Twoje zapytanie.
                    </p>
                </section>


                <section style={{ marginBottom: '35px' }}>
                    <h2 style={{ fontSize: '1.3rem', marginBottom: '12px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--primary)' }}>03.</span> Twoje Prawa (RODO)
                    </h2>
                    <p style={{ color: '#aaa', lineHeight: '1.7' }}>
                        W każdej chwili masz prawo zażądać wglądu w naszą korespondencję mailową, jej sprostowania lub całkowitego usunięcia. 
                        Wystarczy wysłać krótką informację – szanuję Twoje "prawo do bycia zapomnianym".
                    </p>
                </section>

                <section style={{ padding: '25px', background: 'rgba(255, 77, 0, 0.03)', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#fff' }}>
                        Informacja o plikach Cookies
                    </h2>
                    <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>
                        Serwis wykorzystuje ciasteczka wyłącznie do celów technicznych. 
                        Dla zwykłego użytkownika strona nie zapisuje żadnych plików cookies śledzących.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default LegalInfo;