import React, { useState } from 'react';
import './SurveyForm.css';

const SurveyForm = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [consent, setConsent] = useState(false); 
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('');
    const [isSent, setIsSent] = useState(false); 
    const [isLoading, setIsLoading] = useState(false); // NOWE: do obsługi spinnera i blokady kliknięcia
    const [showPrivacy, setShowPrivacy] = useState(false);
    
    const apiUrl = import.meta.env.VITE_API_URL || "";
    
    const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleConsentChange = (e) => {
        const checked = e.target.checked;
        setConsent(checked);
        if (checked && errors.consent) {
            setErrors(prev => ({ ...prev, consent: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let tempErrors = {};

        if (!formData.name.trim()) tempErrors.name = "Imię jest wymagane";
        if (!formData.subject.trim()) tempErrors.subject = "Temat jest wymagany";
        if (!formData.message.trim()) tempErrors.message = "Wpisz treść wiadomości";
        
        if (!formData.email.trim()) {
            tempErrors.email = "E-mail jest wymagany";
        } else if (!validateEmail(formData.email)) {
            tempErrors.email = "Niepoprawny format";
        }

        if (!consent) {
            tempErrors.consent = "Zaznaczenie zgody jest wymagane";
        }

        setErrors(tempErrors);
        if (Object.keys(tempErrors).length > 0) return;

        setStatus('');         // Czyścimy poprzednie statusy (np. błędy)
        setIsLoading(true);    // Włączamy kręciołek i blokujemy przycisk

        try {
            const res = await fetch(`${apiUrl}/api/Contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData) 
            });

            if (res.ok) {
                setIsSent(true); 
                setFormData({ name: '', email: '', subject: '', message: '' });
                setConsent(false);
                setErrors({});
            } else {
                const errorData = await res.text();
                setStatus(`Błąd: ${errorData || 'Wystąpił błąd serwera.'}`);
            }
        } catch (err) {
            setStatus('Błąd połączenia z serwerem. Spróbuj później.');
        } finally {
            // ZAWSZE (sukces czy błąd) wyłączamy spinner po zakończeniu
            setIsLoading(false); 
        }
    };

    if (isSent) {
        return (
            <div className="success-page-wrapper">
                <div className="success-card">
                    <div className="success-badge">WYSŁANO!</div>
                    <h3 className="success-title">WIADOMOŚĆ DOTARŁA</h3>
                    <p className="success-text">
                        Dziękuję za kontakt. Zaraz ją odczytam i wrócę z odpowiedzią najszybciej, jak to możliwe.
                    </p>
                    
                    <div className="success-actions">
                        <button 
                            onClick={() => window.location.href = '/'} 
                            className="success-btn primary"
                        >
                            Wróć do strony głównej
                        </button>
                        
                        <button 
                            onClick={() => setIsSent(false)} 
                            className="success-btn secondary"
                        >
                            Wyślij kolejną wiadomość
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="survey-container">
            <form className="survey-form" onSubmit={handleSubmit} noValidate>
                <h2>Skontaktuj się ze mną</h2>
                
                <div className="input-group">
                    <input 
                        name="name"
                        className={errors.name ? 'error-border' : ''} 
                        type="text" 
                        maxLength="50"  
                        placeholder="Twoje Imię" 
                        value={formData.name} 
                        onChange={handleChange} 
                    />
                    {errors.name && <span className="error-msg">{errors.name}</span>}
                </div>

                <div className="input-group">
                    <input 
                        name="email"
                        className={errors.email ? 'error-border' : ''} 
                        type="email" 
                        maxLength="254"
                        placeholder="Twój E-mail" 
                        value={formData.email} 
                        onChange={handleChange} 
                    />
                    {errors.email && <span className="error-msg">{errors.email}</span>}
                </div>

                <div className="input-group">
                    <input 
                        name="subject"
                        className={errors.subject ? 'error-border' : ''} 
                        type="text" 
                        maxLength="100"
                        placeholder="Temat" 
                        value={formData.subject} 
                        onChange={handleChange} 
                    />
                    {errors.subject && <span className="error-msg">{errors.subject}</span>}
                </div>

                <div className="input-group">
                    <textarea 
                        name="message"
                        className={errors.message ? 'error-border' : ''} 
                        placeholder="Twoja wiadomość..." 
                        maxLength="2000"
                        value={formData.message} 
                        onChange={handleChange} 
                    />
                    {errors.message && <span className="error-msg">{errors.message}</span>}
                </div>

                <div className="input-group checkbox-group">
                    <label className="checkbox-label">
                        <input 
                            type="checkbox" 
                            checked={consent} 
                            onChange={handleConsentChange} 
                        />
                        <span>
                            Wyrażam zgodę na przetwarzanie danych w celu odpowiedzi na moją wiadomość. 
                            Zapoznaj się z <span onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }} className="privacy-link">polityką prywatności</span>.
                        </span>
                    </label>
                    {errors.consent && <span className="error-msg">{errors.consent}</span>}
                </div>

                {/* ZMIANA: Przycisk z obsługą stanu ładowania */}
                <button 
                    type="submit" 
                    className="sunfire-submit-btn" 
                    disabled={isLoading} // Blokada ponownego kliknięcia
                >
                    {isLoading ? (
                        <>
                            {/* Spinner definiowany w CSS */}
                            <span className="loading-spinner"></span>
                            <span>Wysyłanie...</span>
                        </>
                    ) : (
                        "Wyślij Formularz"
                    )}
                </button>

                {/* Status teraz stylowany jako komunikat o błędzie pod przyciskiem */}
                {status && <p className="form-status">{status}</p>}
            </form>

            {showPrivacy && (
                <div className="privacy-modal-overlay" onClick={() => setShowPrivacy(false)}>
                    <div className="privacy-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setShowPrivacy(false)}>×</button>
                        <div className="modal-scroll-area">
                            <h1 className="modal-title">POLITYKA PRYWATNOŚCI</h1>
                            <p className="modal-date">Ostatnia aktualizacja: 26.04.2026</p>
                            <section className="modal-section">
                                <h2><span>01.</span> Administrator Danych</h2>
                                <p>Administratorem danych osobowych serwisu <strong>Sunfire</strong> jest właściciel strony. Szanuję Twoją prywatność i nie gromadzę danych w celach marketingowych.</p>
                            </section>
                            <section className="modal-section">
                                <h2><span>02.</span> Formularz Kontaktowy</h2>
                                <p>Dane przesyłane formularzem trafiają bezpośrednio na skrzynkę e-mail i nie są zapisywane w bazie danych serwisu.</p>
                            </section>
                            <div className="modal-cookie-box">
                                <h3>Informacja o plikach Cookies</h3>
                                <p>Serwis wykorzystuje ciasteczka wyłącznie do celów technicznych.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SurveyForm;