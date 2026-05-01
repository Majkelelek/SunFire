import React, { useState } from 'react';

const SurveyForm = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [consent, setConsent] = useState(false); 
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('');
    const [isSent, setIsSent] = useState(false); 
    const [isLoading, setIsLoading] = useState(false); 
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

        setStatus('');         
        setIsLoading(true);    

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
            setIsLoading(false); 
        }
    };

    if (isSent) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)] w-full p-[20px] box-border">
                <div className="w-full max-w-[600px] p-[60px_40px] md:p-[25px] md:my-[20px] bg-white/[0.03] backdrop-blur-[15px] border border-[color-mix(in_srgb,var(--sunfire-accent),transparent_85%)] rounded-[20px] text-center shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col items-center gap-[20px] animate-[fadeInForm_0.6s_ease-out]">
                    <div className="bg-sunfire text-black px-[20px] py-[8px] rounded-[50px] font-black text-[0.85rem] tracking-[2px] uppercase">WYSŁANO!</div>
                    <h3 className="text-white text-[2rem] font-black m-0 uppercase">WIADOMOŚĆ DOTARŁA</h3>
                    <p className="text-[#b0b0b0] leading-[1.6] text-[1.1rem] mb-[10px]">
                        Dziękuję za kontakt. Zaraz ją odczytam i wrócę z odpowiedzią najszybciej, jak to możliwe.
                    </p>
                    
                    <div className="flex flex-col gap-[15px] w-full max-w-[300px] mt-[10px]">
                        <button 
                            onClick={() => window.location.href = '/'} 
                            className="w-full py-[14px] px-[25px] rounded-[12px] font-extrabold uppercase cursor-pointer transition-all duration-300 text-[0.9rem] tracking-[0.5px] bg-sunfire border-2 border-sunfire text-black hover:brightness-120 hover:shadow-[0_0_20px_color-mix(in_srgb,var(--sunfire-accent),transparent_50%)] hover:-translate-y-[2px]"
                        >
                            Wróć do strony głównej
                        </button>
                        
                        <button 
                            onClick={() => setIsSent(false)} 
                            className="w-full py-[14px] px-[25px] rounded-[12px] font-extrabold uppercase cursor-pointer transition-all duration-300 text-[0.9rem] tracking-[0.5px] bg-transparent border-2 border-white/20 text-white hover:border-sunfire hover:text-sunfire hover:bg-white/5 hover:shadow-[0_0_20px_color-mix(in_srgb,var(--sunfire-accent),transparent_50%)] hover:bg-sunfire hover:!text-black"
                        >
                            Wyślij kolejną wiadomość
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const inputClasses = "w-full p-[15px] bg-black/30 border-2 border-white/5 rounded-[12px] text-white text-[1rem] transition duration-300 box-border focus:outline-none focus:border-sunfire focus:bg-black/50 focus:shadow-[0_0_15px_color-mix(in_srgb,var(--sunfire-accent),transparent_80%)]";
    const errorInputClasses = "!border-[#ff3333] !bg-[#ff0000]/[0.07]";
    const errorMsgClasses = "text-[#ff3333] text-[0.85rem] font-extrabold mt-[5px] flex items-center gap-[6px] uppercase animate-[shakeError_0.4s_ease-in-out] before:content-['!'] before:inline-flex before:items-center before:justify-center before:w-[16px] before:h-[16px] before:bg-[#ff3333] before:text-black before:rounded-full before:text-[12px] before:font-black";

    return (
        <div className="w-full">
            <form className="w-full max-w-[600px] mx-auto my-[40px] md:my-[20px] md:w-[92%] p-[40px] md:p-[25px] bg-white/[0.03] backdrop-blur-[15px] border border-[color-mix(in_srgb,var(--sunfire-accent),transparent_85%)] rounded-[20px] shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col gap-[20px] box-border" onSubmit={handleSubmit} noValidate>
                <h2 className="text-sunfire text-center text-[2rem] font-black uppercase tracking-[2px] mb-[10px] [text-shadow:0_0_20px_color-mix(in_srgb,var(--sunfire-accent),transparent_60%)]">Skontaktuj się ze mną</h2>
                
                <div className="flex flex-col gap-[8px] text-left w-full">
                    <input 
                        name="name"
                        className={`${inputClasses} ${errors.name ? errorInputClasses : ''}`} 
                        type="text" 
                        maxLength="50"  
                        placeholder="Twoje Imię" 
                        value={formData.name} 
                        onChange={handleChange} 
                    />
                    {errors.name && <span className={errorMsgClasses}>{errors.name}</span>}
                </div>

                <div className="flex flex-col gap-[8px] text-left w-full">
                    <input 
                        name="email"
                        className={`${inputClasses} ${errors.email ? errorInputClasses : ''}`} 
                        type="email" 
                        maxLength="254"
                        placeholder="Twój E-mail" 
                        value={formData.email} 
                        onChange={handleChange} 
                    />
                    {errors.email && <span className={errorMsgClasses}>{errors.email}</span>}
                </div>

                <div className="flex flex-col gap-[8px] text-left w-full">
                    <input 
                        name="subject"
                        className={`${inputClasses} ${errors.subject ? errorInputClasses : ''}`} 
                        type="text" 
                        maxLength="100"
                        placeholder="Temat" 
                        value={formData.subject} 
                        onChange={handleChange} 
                    />
                    {errors.subject && <span className={errorMsgClasses}>{errors.subject}</span>}
                </div>

                <div className="flex flex-col gap-[8px] text-left w-full">
                    <textarea 
                        name="message"
                        className={`${inputClasses} h-[150px] resize-none ${errors.message ? errorInputClasses : ''}`} 
                        placeholder="Twoja wiadomość..." 
                        maxLength="2000"
                        value={formData.message} 
                        onChange={handleChange} 
                    />
                    {errors.message && <span className={errorMsgClasses}>{errors.message}</span>}
                </div>

                <div className="flex flex-col gap-[8px] text-left w-full mt-[10px] mb-[20px] flex-row items-start !flex-row">
                    <label className="flex items-start gap-[12px] text-[0.85rem] text-[#b0b0b0] cursor-pointer leading-[1.4] transition-colors duration-200 select-none">
                        <input 
                            type="checkbox" 
                            className="appearance-none min-w-[20px] max-w-[20px] h-[20px] border-2 border-[#444] rounded-[6px] grid place-content-center cursor-pointer bg-white/[0.02] m-0 shrink-0 before:content-[''] before:w-[10px] before:h-[10px] before:scale-0 before:bg-sunfire before:[clip-path:polygon(14%_44%,0_65%,50%_100%,100%_16%,80%_0%,43%_62%)] before:transition-transform before:duration-120 checked:border-sunfire checked:before:scale-100"
                            checked={consent} 
                            onChange={handleConsentChange} 
                        />
                        <span>
                            Wyrażam zgodę na przetwarzanie danych w celu odpowiedzi na moją wiadomość. 
                            Zapoznaj się z <span onClick={(e) => { e.preventDefault(); setShowPrivacy(true); }} className="text-sunfire no-underline font-bold transition duration-200 hover:underline hover:brightness-125">polityką prywatności</span>.
                        </span>
                    </label>
                    {errors.consent && <span className={errorMsgClasses}>{errors.consent}</span>}
                </div>

                <button 
                    type="submit" 
                    className="relative bg-transparent text-sunfire p-[18px] border-2 border-sunfire rounded-[12px] text-[1.5rem] font-extrabold uppercase tracking-[1px] cursor-pointer transition-all duration-300 mt-[10px] shadow-[0_0_43px_color-mix(in_srgb,var(--sunfire-accent),transparent_85%)] flex justify-center items-center gap-[12px] w-full disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-[#333] disabled:shadow-none hover:not(:disabled):-translate-y-[3px] hover:not(:disabled):shadow-[0_0_50px_color-mix(in_srgb,var(--sunfire-accent),transparent_80%)] hover:not(:disabled):text-black hover:not(:disabled):bg-sunfire hover:not(:disabled):brightness-110" 
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="w-[18px] h-[18px] border-[3px] border-white/30 border-t-white rounded-full animate-spin inline-block"></span>
                            <span>Wysyłanie...</span>
                        </>
                    ) : (
                        "Wyślij Formularz"
                    )}
                </button>

                {status && <p className="text-center text-[0.9rem] font-bold mt-[15px] text-[#ff3333] opacity-90 animate-[fadeInForm_0.3s_ease]">{status}</p>}
            </form>

            {showPrivacy && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-[10px] flex justify-center items-center z-[10000] p-[20px]" onClick={() => setShowPrivacy(false)}>
                    <div className="bg-[#0d0d0d] w-full max-w-[650px] max-h-[85vh] rounded-[24px] relative p-[40px] border border-[color-mix(in_srgb,var(--sunfire-accent),transparent_85%)] shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-auto" onClick={(e) => e.stopPropagation()}>
                        <button className="absolute top-[20px] right-[20px] w-[40px] h-[40px] bg-[#1a1a1a] border border-[#333] text-white rounded-full cursor-pointer flex items-center justify-center z-10 transition-all duration-300 hover:bg-sunfire hover:!text-black hover:rotate-90" onClick={() => setShowPrivacy(false)}>×</button>
                        <div>
                            <h1 className="text-sunfire mb-[25px] text-[1.8rem] text-left">POLITYKA PRYWATNOŚCI</h1>
                            <p className="text-[#aaa] mb-[35px]">Ostatnia aktualizacja: 29.04.2026</p>
                            
                            <section className="mb-[35px]">
                            <h2 className="text-[1.3rem] mb-[12px] text-white flex items-center gap-[10px]">
                                <span className="text-sunfire">01.</span> Administrator Danych
                            </h2>
                            <p className="text-[#aaa] leading-[1.7]">
                                Administratorem Twoich danych osobowych jest <strong>[Nazwa Firmy]</strong> z siedzibą w [Miasto]. 
                                W sprawach związanych z ochroną danych możesz skontaktować się pod adresem e-mail: <strong>[E-mail]</strong>.
                            </p>
                        </section>

                        <section className="mb-[35px]">
                            <h2 className="text-[1.3rem] mb-[12px] text-white flex items-center gap-[10px]">
                                <span className="text-sunfire">02.</span> Cel i Zakres Zbierania Danych
                            </h2>
                            <p className="text-[#aaa] leading-[1.7]">
                                Twoje dane (takie jak imię, nazwisko oraz adres e-mail) przetwarzane są wyłącznie w celu:
                            </p>
                            <ul className="text-[#aaa] leading-[1.7] ml-[20px] list-disc">
                                <li>Obsługi zapytań przesłanych przez formularz kontaktowy.</li>
                                <li>Przygotowania personalizowanej wyceny na podstawie przesłanego formularza zapotrzebowania.</li>
                            </ul>
                        </section>

                        <section className="mb-[35px]">
                            <h2 className="text-[1.3rem] mb-[12px] text-white flex items-center gap-[10px]">
                                <span className="text-sunfire">03.</span> Przechowywanie i Bezpieczeństwo
                            </h2>
                            <p className="text-[#aaa] leading-[1.7]">
                                Dane przesyłane przez formularze <strong>nie są zapisywane w bazie danych</strong> na serwerze. 
                                Są one automatycznie przesyłane bezpośrednio na zabezpieczoną skrzynkę pocztową Administratora w formie wiadomości e-mail. 
                                Informacje te są przechowywane wyłącznie przez okres niezbędny do udzielenia odpowiedzi lub realizacji zlecenia.
                            </p>
                        </section>

                        <section className="mb-[35px]">
                            <h2 className="text-[1.3rem] mb-[12px] text-white flex items-center gap-[10px]">
                                <span className="text-sunfire">04.</span> Twoje Prawa (RODO)
                            </h2>
                            <p className="text-[#aaa] leading-[1.7]">
                                Zgodnie z rozporządzeniem RODO, masz prawo do:
                            </p>
                            <ul className="text-[#aaa] leading-[1.7] ml-[20px] list-disc">
                                <li>Wglądu w treść przesłanych do mnie danych.</li>
                                <li>Sprostowania (poprawienia) swoich danych.</li>
                                <li>Żądania usunięcia danych z mojej skrzynki pocztowej ("prawo do bycia zapomnianym").</li>
                                <li>Ograniczenia przetwarzania lub wniesienia sprzeciwu.</li>
                            </ul>
                        </section>

                        <section className="p-[25px] bg-[rgba(255,77,0,0.03)] rounded-[12px] border-l-[4px] border-sunfire">
                            <h2 className="text-[1.1rem] mb-[8px] text-white flex items-center gap-[10px]">
                                <span className="text-sunfire">05.</span> Informacja o Cookies
                            </h2>
                            <p className="text-[#888] text-[0.9rem] m-0">
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