import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import './SurveyForm.css';

const SurveyForm = () => {
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
        defaultValues: { consent: false }
    });
    
    const [isSent, setIsSent] = useState(false); 
    const [showPrivacy, setShowPrivacy] = useState(false);
    
    const apiUrl = import.meta.env.VITE_API_URL || "";

    const onSubmit = async (data) => {
        try {
            const res = await fetch(`${apiUrl}/api/Contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data) 
            });

            if (res.ok) {
                setIsSent(true); 
                reset();
                toast.success('Wiadomość została wysłana!');
            } else {
                const errorData = await res.text();
                toast.error(`Błąd: ${errorData || 'Wystąpił błąd serwera.'}`);
            }
        } catch (err) {
            toast.error('Błąd połączenia z serwerem. Spróbuj później.');
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
            <form className="survey-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                <h2>Skontaktuj się ze mną</h2>
                
                <div className="input-group">
                    <input 
                        className={errors.name ? 'error-border' : ''} 
                        type="text" 
                        maxLength="50"  
                        placeholder="Twoje Imię" 
                        {...register("name", { required: "Imię jest wymagane" })}
                    />
                    {errors.name && <span className="error-msg">{errors.name.message}</span>}
                </div>

                <div className="input-group">
                    <input 
                        className={errors.email ? 'error-border' : ''} 
                        type="email" 
                        maxLength="254"
                        placeholder="Twój E-mail" 
                        {...register("email", { 
                            required: "E-mail jest wymagany",
                            pattern: {
                                value: /\S+@\S+\.\S+/,
                                message: "Niepoprawny format"
                            }
                        })}
                    />
                    {errors.email && <span className="error-msg">{errors.email.message}</span>}
                </div>

                <div className="input-group">
                    <input 
                        className={errors.subject ? 'error-border' : ''} 
                        type="text" 
                        maxLength="100"
                        placeholder="Temat" 
                        {...register("subject", { required: "Temat jest wymagany" })}
                    />
                    {errors.subject && <span className="error-msg">{errors.subject.message}</span>}
                </div>

                <div className="input-group">
                    <textarea 
                        className={errors.message ? 'error-border' : ''} 
                        placeholder="Twoja wiadomość..." 
                        maxLength="2000"
                        {...register("message", { required: "Wpisz treść wiadomości" })}
                    />
                    {errors.message && <span className="error-msg">{errors.message.message}</span>}
                </div>

                <div className="input-group checkbox-group">
                    <label className="checkbox-label">
                        <input 
                            type="checkbox" 
                            {...register("consent", { required: "Zaznaczenie zgody jest wymagane" })}
                        />
                        <span>
                            Wyrażam zgodę na przetwarzanie danych w celu odpowiedzi na moją wiadomość. 
                            Zapoznaj się z <span onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }} className="privacy-link">polityką prywatności</span>.
                        </span>
                    </label>
                    {errors.consent && <span className="error-msg">{errors.consent.message}</span>}
                </div>

                <button 
                    type="submit" 
                    className="sunfire-submit-btn" 
                    disabled={isSubmitting} 
                >
                    {isSubmitting ? (
                        <>
                            <span className="loading-spinner"></span>
                            <span>Wysyłanie...</span>
                        </>
                    ) : (
                        "Wyślij Formularz"
                    )}
                </button>
            </form>

            {showPrivacy && (
                <div className="privacy-modal-overlay" onClick={() => setShowPrivacy(false)}>
                    <div className="privacy-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setShowPrivacy(false)}>×</button>
                        <div className="modal-scroll-area">
                            <h1 className="modal-title">POLITYKA PRYWATNOŚCI</h1>
                            <p className="modal-date">Ostatnia aktualizacja: 29.04.2026</p>
                            
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
                </div>
            )}
        </div>
    );
};

export default SurveyForm;