import React, { useEffect, useState } from 'react';

export default function AboutPage({ isAdmin }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const apiUrl = import.meta.env.VITE_API_URL || "";
    
    // Modal State - Edycja
    const [editingItem, setEditingItem] = useState(null); 
    const [tempTitle, setTempTitle] = useState('');
    const [tempAccent, setTempAccent] = useState('');
    const [tempContent, setTempContent] = useState('');
    const [tempSize, setTempSize] = useState('half');
    const [isSaving, setIsSaving] = useState(false);

    // Modal State - Usuwanie
    const [deletingId, setDeletingId] = useState(null);

    const fetchData = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/about`);
            const result = await res.json();
            setData(result);
        } catch (err) {
            console.error("Błąd ładowania danych o mnie:", err);
        }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSave = async () => {
        setIsSaving(true);
        let updatedData = { ...data };

        if (editingItem === 'header') {
            updatedData.manifestoTag = tempTitle;
            updatedData.title = tempContent;
            updatedData.titleAccent = tempAccent;
        } else if (editingItem === 'lead') {
            updatedData.lead = tempContent;
        } else {
            updatedData.sections = data.sections.map(s => 
                s.id === editingItem.id ? { ...s, title: tempTitle, content: tempContent, size: tempSize } : s
            );
        }

        await sendUpdate(updatedData);
    };

    const addNewSection = async () => {
        const newSec = { id: Date.now().toString(), title: "Nowa Sekcja", content: "Treść...", size: "half" };
        const updatedData = { ...data, sections: [...(data.sections || []), newSec] };
        await sendUpdate(updatedData);
    };

    const deleteSection = (id) => {
        setDeletingId(id);
    };

    const confirmDelete = async () => {
        setIsSaving(true);
        const updatedData = { ...data, sections: data.sections.filter(s => s.id !== deletingId) };
        await sendUpdate(updatedData);
        setDeletingId(null);
    };

    const sendUpdate = async (updatedData) => {
        try {
            const res = await fetch(`${apiUrl}/api/about`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
                credentials: 'include'
            });
            if (res.ok) {
                setData(updatedData);
                setEditingItem(null);
            }
        } catch (err) { alert("Błąd zapisu"); }
        finally { setIsSaving(false); }
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-[1.5rem] text-sunfire tracking-[5px] uppercase animate-[pulseGlow_2s_infinite]">Wczytywanie...</div>;
    if (!data) return <div className="fixed inset-0 bg-[#050505] flex justify-center items-center z-[9999] text-white font-black tracking-[10px] text-xl">(Błąd połączenia z serwerem).</div>;

    const inputClasses = "w-full bg-[#1a1a1a] border border-[#333] p-[12px] rounded-[8px] text-white mb-[15px] focus:border-sunfire focus:outline-none";

    return (
        <div className="min-h-[calc(100vh-80px)] p-[40px_3%] max-w-[1400px] w-full mx-auto text-white relative font-sans box-border overflow-x-visible">
            <div className="absolute top-[5%] right-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,var(--sunfire-accent)_0%,transparent_70%)] blur-[120px] z-[0] pointer-events-none opacity-20"></div>
            
            <section className="mb-[80px] relative z-[2]">
                <div className="relative w-fit group">
                    <p className="text-sunfire font-extrabold tracking-[6px] text-[0.85rem] mb-[20px] uppercase">{data.manifestoTag}</p>
                    <h1 className="text-[3rem] md:text-[clamp(2.5rem,8vw,4.5rem)] font-black m-0 tracking-[-2px] leading-[1.1]">{data.title} <span className="text-sunfire [text-shadow:0_0_30px_color-mix(in_srgb,var(--sunfire-accent),transparent_50%)]">{data.titleAccent}</span></h1>
                    {isAdmin && (
                        <button className="mt-[15px] bg-[#1a1a1a] border border-[#333] text-white p-[5px_12px] rounded-[4px] text-[11px] font-extrabold cursor-pointer hover:bg-sunfire hover:text-black" onClick={() => { 
                            setEditingItem('header'); 
                            setTempTitle(data.manifestoTag); 
                            setTempContent(data.title); 
                            setTempAccent(data.titleAccent);
                        }}>✎ NAGŁÓWEK</button>
                    )}
                </div>
                
                <div className="relative w-fit group mt-[35px]">
                    <p className="text-[1.4rem] text-white/70 leading-[1.6] max-w-[900px] font-light">{data.lead || "Dodaj opis..."}</p>
                    {isAdmin && (
                        <button className="absolute top-0 right-[-40px] bg-sunfire border-none text-black w-[25px] h-[25px] rounded-full cursor-pointer text-[14px] flex items-center justify-center opacity-50 transition duration-300 group-hover:opacity-100" onClick={() => { 
                            setEditingItem('lead'); 
                            setTempContent(data.lead); 
                        }}>✎</button>
                    )}
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[30px] w-full relative z-[2]">
                {data.sections && data.sections.map((section) => (
                    <div key={section.id} className={`bg-[#0f0f0f]/60 backdrop-blur-[20px] border border-white/5 p-[30px] md:p-[40px] rounded-[25px] transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] relative overflow-visible hover:border-[color-mix(in_srgb,var(--sunfire-accent),transparent_60%)] hover:-translate-y-[5px] hover:bg-[#141414]/80 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] ${section.size === 'full' ? 'md:col-span-2' : ''}`}>
                        <div className="flex justify-between items-center mb-[25px] pb-[15px] border-b border-[color-mix(in_srgb,var(--sunfire-accent),transparent_80%)]">
                            <h3 className="m-0 text-sunfire text-[0.9rem] font-black tracking-[3px] uppercase">{section.title}</h3>
                            {isAdmin && (
                                <div className="flex gap-[8px]">
                                    <button className="bg-white/5 border border-white/10 text-white w-[32px] h-[32px] rounded-[8px] cursor-pointer flex items-center justify-center transition duration-300 hover:bg-sunfire hover:border-sunfire hover:scale-110" onClick={() => { 
                                        setEditingItem(section); 
                                        setTempTitle(section.title); 
                                        setTempContent(section.content); 
                                        setTempSize(section.size || 'half');
                                    }}>✎</button>
                                    <button className="bg-white/5 border border-white/10 text-white w-[32px] h-[32px] rounded-[8px] cursor-pointer flex items-center justify-center transition duration-300 text-[#ff4444] hover:!bg-[#ff4444] hover:!text-white hover:!border-[#ff4444] hover:scale-110" onClick={() => deleteSection(section.id)}>×</button>
                                </div>
                            )}
                        </div>
                        <p className="text-white/70 leading-[1.7] text-[1rem] m-0">{section.content}</p>
                    </div>
                ))}
                
                {isAdmin && (
                    <button className="col-span-1 bg-white/[0.02] border-2 border-dashed border-white/10 rounded-[25px] min-h-[200px] cursor-pointer transition duration-300 flex items-center justify-center hover:border-sunfire hover:bg-[color-mix(in_srgb,var(--sunfire-accent),transparent_96%)] group" onClick={addNewSection}>
                        <span className="text-white/30 font-black tracking-[2px] group-hover:text-sunfire">+ DODAJ SEKCJĘ</span>
                    </button>
                )}
            </div>

            {/* MODAL EDYCJI */}
            {editingItem && (
                <div className="fixed inset-0 w-full h-full bg-black/85 backdrop-blur-[10px] flex justify-center items-center z-[1000]" onClick={() => setEditingItem(null)}>
                    <div className="bg-[#0f0f0f] border border-sunfire p-[40px] rounded-[25px] w-[90%] max-w-[700px] shadow-[0_0_50px_color-mix(in_srgb,var(--sunfire-accent),transparent_80%)]" onClick={e => e.stopPropagation()}>
                        <h2 className="text-sunfire uppercase mb-[25px] text-xl font-bold">KONFIGURACJA SEKCJI</h2>
                        
                        {editingItem === 'header' ? (
                            <div className="flex flex-col">
                                <label className="text-[0.8rem] mb-2 text-white/50 font-bold">TAG (NAD NAGŁÓWKIEM)</label>
                                <input className={inputClasses} value={tempTitle} onChange={e => setTempTitle(e.target.value)} />
                                <label className="text-[0.8rem] mb-2 text-white/50 font-bold">TYTUŁ GŁÓWNY</label>
                                <input className={inputClasses} value={tempContent} onChange={e => setTempContent(e.target.value)} />
                                <label className="text-[0.8rem] mb-2 text-white/50 font-bold">AKCENT (KOLOROWY TEKST)</label>
                                <input className={inputClasses} value={tempAccent} onChange={e => setTempAccent(e.target.value)} />
                            </div>
                        ) : editingItem === 'lead' ? (
                            <div className="flex flex-col">
                                <label className="text-[0.8rem] mb-2 text-white/50 font-bold">OPIS POD NAGŁÓWKIEM</label>
                                <textarea className={`${inputClasses} min-h-[120px] resize-y`} value={tempContent} onChange={e => setTempContent(e.target.value)} />
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                <label className="text-[0.8rem] mb-2 text-white/50 font-bold">TYTUŁ KARTY</label>
                                <input className={inputClasses} value={tempTitle} onChange={e => setTempTitle(e.target.value)} />
                                <label className="text-[0.8rem] mb-2 text-white/50 font-bold">SZEROKOŚĆ</label>
                                <div className="flex gap-[10px] mb-[20px]">
                                    <button className={`flex-1 p-[10px] rounded-[8px] cursor-pointer font-bold ${tempSize === 'half' ? '!bg-sunfire !text-white !border-sunfire border' : 'bg-[#1a1a1a] border border-[#333] text-[#666]'}`} onClick={() => setTempSize('half')}>POŁOWA</button>
                                    <button className={`flex-1 p-[10px] rounded-[8px] cursor-pointer font-bold ${tempSize === 'full' ? '!bg-sunfire !text-white !border-sunfire border' : 'bg-[#1a1a1a] border border-[#333] text-[#666]'}`} onClick={() => setTempSize('full')}>CAŁOŚĆ</button>
                                </div>
                                <label className="text-[0.8rem] mb-2 text-white/50 font-bold">TREŚĆ KARTY</label>
                                <textarea className={`${inputClasses} min-h-[120px] resize-y`} value={tempContent} onChange={e => setTempContent(e.target.value)} />
                            </div>
                        )}

                        <div className="flex gap-[15px] mt-[30px]">
                            <button className="flex-1 p-[15px] border-none font-black rounded-[10px] cursor-pointer uppercase transition duration-300 bg-sunfire text-black hover:bg-white" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? "ZAPISYWANIE..." : "ZAPISZ ZMIANY"}
                            </button>
                            <button className="flex-1 p-[15px] border border-white/10 font-black rounded-[10px] cursor-pointer uppercase transition duration-300 bg-white/5 text-white hover:bg-white/10 hover:border-white/30" onClick={() => setEditingItem(null)}>ANULUJ</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL POTWIERDZENIA USUNIĘCIA */}
            {deletingId && (
                <div className="fixed inset-0 w-full h-full bg-black/85 backdrop-blur-[10px] flex justify-center items-center z-[1000]" onClick={() => setDeletingId(null)}>
                    <div className="bg-[#0f0f0f] border border-sunfire p-[40px] rounded-[25px] w-[90%] max-w-[700px] shadow-[0_0_50px_color-mix(in_srgb,var(--sunfire-accent),transparent_80%)]" onClick={e => e.stopPropagation()}>
                        <h2 className="text-[#ff4444] text-xl font-bold mb-[25px]">POTWIERDŹ USUNIĘCIE</h2>
                        <p className="text-white/70 mb-[30px] text-[1.1rem]">
                            Czy na pewno chcesz bezpowrotnie usunąć tę sekcję?
                        </p>
                        <div className="flex gap-[15px] mt-[30px]">
                            <button className="flex-1 p-[15px] border border-[#ff4444] font-black rounded-[10px] cursor-pointer uppercase transition duration-300 !bg-[#db0707] text-[#ff4444] hover:!bg-[#ff4444] hover:!text-white" onClick={confirmDelete} disabled={isSaving}>
                                {isSaving ? "USUWAM..." : "USUŃ"}
                            </button>
                            <button className="flex-1 p-[15px] border border-white/10 font-black rounded-[10px] cursor-pointer uppercase transition duration-300 bg-white/5 text-white hover:bg-white/10 hover:border-white/30" onClick={() => setDeletingId(null)}>ANULUJ</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}