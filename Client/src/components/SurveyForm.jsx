import React, { useState } from 'react';
import './SurveyForm.css';

const SurveyForm = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('');

    // Prosta weryfikacja formatu e-mail
    const validateEmail = (email) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let tempErrors = {};

        // Sprawdzanie czy pola nie są puste
        if (!formData.name.trim()) tempErrors.name = "Imię jest wymagane";
        if (!formData.subject.trim()) tempErrors.subject = "Temat jest wymagany";
        if (!formData.message.trim()) tempErrors.message = "Wpisz treść wiadomości";
        
        // Weryfikacja e-maila
        if (!formData.email.trim()) {
            tempErrors.email = "E-mail jest wymagany";
        } else if (!validateEmail(formData.email)) {
            tempErrors.email = "Niepoprawny format (brak @ lub kropki)";
        }

        setErrors(tempErrors);

        // Jeśli są błędy, nie wysyłaj
        if (Object.keys(tempErrors).length > 0) return;

        setStatus('Wysyłanie...');

        try {
            // Tutaj wpisz swój kod z Formspree
            const res = await fetch('https://formspree.io/f/TWOJ_ID', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setStatus('Wiadomość wysłana! Zaraz ją odczytam.');
                setFormData({ name: '', email: '', subject: '', message: '' });
                setErrors({});
            } else {
                setStatus('Wystąpił błąd serwera.');
            }
        } catch (err) {
            setStatus('Błąd połączenia.');
        }
    };

    return (
        <form className="survey-form" onSubmit={handleSubmit} noValidate>
            <h2>Skontaktuj się ze mną</h2>
            
            <div className="input-group">
                <input 
                    className={errors.name ? 'error-border' : ''}
                    type="text" placeholder="Twoje Imię" 
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
                />
                {errors.name && <span className="error-msg">{errors.name}</span>}
            </div>

            <div className="input-group">
                <input 
                    className={errors.email ? 'error-border' : ''}
                    type="email" placeholder="Twój E-mail" 
                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} 
                />
                {errors.email && <span className="error-msg">{errors.email}</span>}
            </div>

            <div className="input-group">
                <input 
                    className={errors.subject ? 'error-border' : ''}
                    type="text" placeholder="Temat" 
                    value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} 
                />
                {errors.subject && <span className="error-msg">{errors.subject}</span>}
            </div>

            <div className="input-group">
                <textarea 
                    className={errors.message ? 'error-border' : ''}
                    placeholder="Twoja wiadomość..." 
                    value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
                {errors.message && <span className="error-msg">{errors.message}</span>}
            </div>

            <button type="submit">Wyślij Formularz</button>
            
            {status && <p className="form-status">{status}</p>}

            {/* TWOJA INFORMACJA O PRYWATNOŚCI */}
            <p className="privacy-note">
                Dane z tego formularza nie są zapisywane w bazie danych – trafiają bezpośrednio na moją skrzynkę e-mail.
            </p>
        </form>
    );
};

export default SurveyForm;