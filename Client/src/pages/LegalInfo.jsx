import React from 'react';
import { Link } from 'react-router-dom';

const LegalInfo = () => {
    return (
        <div className="w-full max-w-[1200px] mx-auto px-[20px] pt-[20px] pb-[80px]">
            
            {/* Przycisk powrotu */}
            <div className="max-w-[900px] mx-auto mb-[30px]">
                <Link to="/" className="text-white no-underline text-[0.8rem] font-extrabold tracking-[2px] flex items-center gap-[10px] opacity-50 transition-opacity duration-300 hover:opacity-100">
                    <span className="text-[1.2rem] text-sunfire">←</span> WSTECZ
                </Link>
            </div>

            <div className="bg-white/[0.02] p-[50px] md:p-[30px] rounded-[24px] border border-white/5 backdrop-blur-[10px] max-w-[900px] mx-auto">
                <h1 className="text-sunfire mb-[10px] text-[2.5rem] md:text-[2rem] font-black uppercase">Polityka Prywatności</h1>
                <p className="text-[#666] mb-[40px] text-[0.9rem]">Ostatnia aktualizacja: 29.04.2026</p>
                
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
                    <ul className="text-[#aaa] leading-[1.7] ml-[20px] list-disc mt-[10px]">
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
                    <ul className="text-[#aaa] leading-[1.7] ml-[20px] list-disc mt-[10px]">
                        <li>Wglądu w treść przesłanych do mnie danych.</li>
                        <li>Sprostowania (poprawienia) swoich danych.</li>
                        <li>Żądania usunięcia danych z mojej skrzynki pocztowej ("prawo do bycia zapomnianym").</li>
                        <li>Ograniczenia przetwarzania lub wniesienia sprzeciwu.</li>
                    </ul>
                </section>

                <section className="p-[25px] bg-[color-mix(in_srgb,var(--sunfire-accent),transparent_97%)] rounded-[12px] border-l-[4px] border-sunfire">
                    <h2 className="text-[1.1rem] mb-[8px] text-white flex items-center gap-[10px]">
                        <span className="text-sunfire">05.</span> Informacja o Cookies
                    </h2>
                    <p className="text-[#888] text-[0.9rem] m-0">
                        Strona dba o Twoją prywatność. Serwis nie wykorzystuje, ani nie zapisuje na Twoim urządzeniu żadnych plików cookies (śledzących, analitycznych ani reklamowych).
                    </p>
                </section>
            </div>
        </div>
    );
};

export default LegalInfo;