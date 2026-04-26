import React, { useState } from 'react';
import './SurveyForm.css';

const SurveyForm = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    // NOWOŚĆ: Stan przechowujący informację, czy checkbox jest zaznaczony
    const [consent, setConsent] = useState(false); 
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('');
    const [isSent, setIsSent] = useState(false); 
    
    const apiUrl = import.meta.env.VITE_API_URL;
    
    const validateEmail = (email) => {
        return /\S+@\S+\.\S+/.test(email);
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
            tempErrors.email = "Niepoprawny format (brak @ lub kropki)";
        }

        // NOWOŚĆ: Walidacja checkboxa
        if (!consent) {
            tempErrors.consent = "Zaznaczenie zgody jest wymagane, aby wysłać wiadomość";
        }

        setErrors(tempErrors);

        if (Object.keys(tempErrors).length > 0) return;

        setStatus('Wysyłanie...');

        try {
            const res = await fetch(`${apiUrl}/api/Contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Nie wysyłamy stanu 'consent' do C#, bo backend oczekuje tylko danych wiadomości
                body: JSON.stringify(formData) 
            });

            if (res.ok) {
                setIsSent(true); 
                setFormData({ name: '', email: '', subject: '', message: '' });
                setConsent(false); // Resetujemy checkbox po udanym wysłaniu
                setErrors({});
                setStatus(''); 
            } else {
                const errorData = await res.text();
                setStatus(`Błąd: ${errorData || 'Wystąpił błąd serwera.'}`);
            }
        } catch (err) {
            setStatus('Błąd połączenia z serwerem.');
        }
    };

    if (isSent) {
        return (
            <div className="success-card">
                <div className="success-icon-wrapper">
                    <svg className="success-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                </div>
                <h3 className="success-title">Wiadomość wysłana!</h3>
                <p className="success-text">
                    Dziękuję za kontakt. Zaraz ją odczytam i wrócę z odpowiedzią najszybciej, jak to możliwe.
                </p>
                <button onClick={() => setIsSent(false)} className="success-btn">
                    Wyślij kolejną
                </button>
            </div>
        );
    }

    return (
        <form className="survey-form" onSubmit={handleSubmit} noValidate>
            <h2>Skontaktuj się ze mną</h2>
            
            <div className="input-group">
                <input className={errors.name ? 'error-border' : ''} type="text" placeholder="Twoje Imię" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                {errors.name && <span className="error-msg">{errors.name}</span>}
            </div>

            <div className="input-group">
                <input className={errors.email ? 'error-border' : ''} type="email" placeholder="Twój E-mail" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                {errors.email && <span className="error-msg">{errors.email}</span>}
            </div>

            <div className="input-group">
                <input className={errors.subject ? 'error-border' : ''} type="text" placeholder="Temat" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} />
                {errors.subject && <span className="error-msg">{errors.subject}</span>}
            </div>

            <div className="input-group">
                <textarea className={errors.message ? 'error-border' : ''} placeholder="Twoja wiadomość..." value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} />
                {errors.message && <span className="error-msg">{errors.message}</span>}
            </div>

            {/* NOWOŚĆ: Sekcja Checkboxa */}
            <div className="input-group checkbox-group">
                <label className="checkbox-label">
                    <input 
                        type="checkbox" 
                        checked={consent} 
                        onChange={(e) => setConsent(e.target.checked)} 
                    />
                    <span>Rozumiem, że dalszy kontakt odbywać się będzie drogą mailową, i wyrażam zgodę na przetwarzanie moich danych podanych w formularzu w celu odpowiedzi na moją wiadomość.</span>
                </label>
                {errors.consent && <span className="error-msg" style={{ display: 'block', marginTop: '5px' }}>{errors.consent}</span>}
            </div>

            <button type="submit">Wyślij Formularz</button>
            
            {status && <p className="form-status">{status}</p>}
        </form>
    );
};

export default SurveyForm;