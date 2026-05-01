import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home({ isAdmin }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL || "";

  // Stany edycji i modali
  const [editingItem, setEditingItem] = useState(null); // 'hero' lub {type: 'focus', index}
  const [itemToDelete, setItemToDelete] = useState(null); // index elementu
  const [tempData, setTempData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/home`);
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Błąd ładowania strony głównej:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- FUNKCJE POMOCNICZE ---

  const openEdit = (type, index = null) => {
    const deepCopy = JSON.parse(JSON.stringify(data));
    setTempData(deepCopy);
    setEditingItem(index !== null ? { type, index } : type);
  };

  const handleSave = async (dataToSave = tempData) => {
    setIsSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/home`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
        credentials: 'include'
      });
      if (res.ok) {
        setData(dataToSave);
        setEditingItem(null);
        setItemToDelete(null);
      }
    } catch (err) {
      alert("Błąd połączenia z serwerem.");
    } finally {
      setIsSaving(false);
    }
  };

  const addNewFocusItem = () => {
    const newItem = { title: "NOWA USŁUGA", description: "Opis...", size: "1-3" };
    const updatedData = { ...data, focusItems: [...(data.focusItems || []), newItem] };
    handleSave(updatedData);
  };

  const confirmDelete = () => {
    const newItems = data.focusItems.filter((_, i) => i !== itemToDelete);
    const updatedData = { ...data, focusItems: newItems };
    handleSave(updatedData);
  };

  if (loading) return <div className="fixed inset-0 bg-[#050505] flex justify-center items-center z-[9999] text-white font-black tracking-[10px] text-xl">INITIALIZING SUNFIRE...</div>;
  if (!data) return <div className="fixed inset-0 bg-[#050505] flex justify-center items-center z-[9999] text-white font-black tracking-[10px] text-xl">DATABASE ERROR.</div>;

  return (
    <div className="min-h-[calc(100vh-80px)] text-white flex flex-col items-center relative overflow-x-hidden p-[30px_5%] pt-[60px] md:pt-[30px] font-sans">
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none z-[1]"></div>
      <div className="absolute top-[15%] w-[800px] h-[800px] bg-[radial-gradient(circle,var(--sunfire-accent)_0%,transparent_70%)] opacity-[0.12] blur-[120px] z-[0]"></div>

      {/* --- SEKCJA HERO --- */}
      <section className="relative z-[2] text-center w-full max-w-[1200px] mb-[40px]">
        <div>
          <div className="relative p-[20px] transition duration-300 rounded-[20px] hover:bg-transparent group/edit">
            <p className="text-[0.9rem] tracking-[10px] text-sunfire font-extrabold mb-[25px] uppercase opacity-90">{data.tagline}</p>
            <h1 className="text-[3.5rem] md:text-[clamp(4rem,15vw,10rem)] font-black m-0 tracking-[-5px] leading-[0.85] uppercase">
              {data.titleStart}
              <span className="text-sunfire [text-shadow:0_0_40px_color-mix(in_srgb,var(--sunfire-accent),transparent_40%)]">{data.titleAccent}</span>
            </h1>
            <p className="text-[1.4rem] max-w-[600px] mx-auto my-[45px] text-white/50 font-light leading-[1.6]">{data.motto}</p>
            {isAdmin && (
              <button className="absolute bottom-[-15px] left-1/2 -translate-x-1/2 bg-sunfire text-black border-none px-[25px] py-[10px] rounded-[50px] font-black text-[0.75rem] cursor-pointer transition-all duration-300 shadow-[0_5px_15px_rgba(0,0,0,0.3)] opacity-0 group-hover/edit:opacity-100 group-hover/edit:bottom-0 z-10" onClick={() => openEdit('hero')}>✎ EDYTUJ</button>
            )}
          </div>
          <div className="flex flex-col md:flex-row gap-[25px] justify-center mt-[50px] items-center md:items-stretch">
            <Link to="/portfolio" className="bg-white text-black px-[50px] py-[22px] font-black tracking-[2px] rounded-[50px] transition-all duration-[400ms] hover:bg-sunfire hover:-translate-y-[5px] hover:shadow-[0_15px_35px_color-mix(in_srgb,var(--sunfire-accent),transparent_60%)] w-full md:w-auto max-w-[320px] text-center">ZOBACZ PRACE</Link>
            <Link to="/contact" className="border border-white/20 text-white px-[50px] py-[22px] font-bold tracking-[2px] rounded-[50px] transition-all duration-[400ms] hover:border-sunfire hover:text-sunfire hover:bg-[color-mix(in_srgb,var(--sunfire-accent),transparent_97%)] w-full md:w-auto max-w-[320px] text-center">POROZMAWIAJMY</Link>
          </div>
        </div>
      </section>

      {/* --- SEKCJA FOCUS (SIATKA) --- */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-[30px] md:gap-[40px] w-full max-w-[1200px] z-[2] border-t border-white/10 pt-[50px]">
        {data.focusItems && data.focusItems.map((item, index) => {
          let colSpanClass = "col-span-1";
          if (item.size === '2-3') colSpanClass = "md:col-span-2 col-span-1";
          if (item.size === '3-3') colSpanClass = "md:col-span-3 col-span-1";
          
          return (
            <div key={index} className={`relative text-left p-[30px] rounded-[20px] transition duration-300 bg-white/5 hover:bg-white/10 group ${colSpanClass}`}>
              <span className="text-sunfire font-black text-[0.85rem] block mb-[20px] tracking-[2px]">0{index + 1}</span>
              <h3 className="text-[1.6rem] tracking-[2px] mb-[15px] uppercase">{item.title}</h3>
              <p className="text-white/40 text-[1rem] leading-[1.6]">{item.description}</p>
              {isAdmin && (
                <div className="absolute top-[15px] right-[55px] flex flex-row items-center gap-[8px] z-[20] opacity-0 transition duration-300 group-hover:opacity-100">
                    <button className="w-[35px] h-[35px] rounded-full border-none cursor-pointer flex items-center justify-center text-[16px] transition duration-200 text-white shadow-[0_4px_10px_rgba(0,0,0,0.3)] opacity-90 hover:scale-110 bg-[#ff4444]" onClick={() => setItemToDelete(index)}>
                        ×
                    </button>
                    <button className="w-[35px] h-[35px] rounded-full border-none cursor-pointer flex items-center justify-center text-[16px] transition duration-200 shadow-[0_4px_10px_rgba(0,0,0,0.3)] opacity-90 hover:scale-110 bg-orange-500 text-black" onClick={() => openEdit('focus', index)}>
                        ✎
                    </button>
                </div>
              )}
            </div>
          );
        })}
        {isAdmin && (
          <button className="border-2 border-dashed border-white/10 bg-transparent rounded-[20px] min-h-[160px] flex items-center justify-center cursor-pointer transition duration-300 hover:border-sunfire hover:bg-[color-mix(in_srgb,var(--sunfire-accent),transparent_97%)] col-span-1 md:col-span-1" onClick={addNewFocusItem}>
            <span className="text-white/20 font-black text-[0.8rem] tracking-[3px]">+ DODAJ SEKCJĘ</span>
          </button>
        )}
      </section>

      {/* --- MODAL USUWANIA --- */}
      {itemToDelete !== null && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-[10px] flex justify-center items-center z-[1000] p-[20px]" onClick={() => setItemToDelete(null)}>
          <div className="bg-[#0c0c0c] p-[45px] rounded-[30px] border border-sunfire w-full max-w-[550px] shadow-[0_0_50px_color-mix(in_srgb,var(--sunfire-accent),transparent_85%)]" onClick={e => e.stopPropagation()}>
            <h2 className="text-red-500 text-2xl font-black mb-[15px]">POTWIERDŹ USUNIĘCIE</h2>
            <p className="text-white/70 mb-[30px]">Czy na pewno chcesz usunąć: <strong className="text-white">{data.focusItems[itemToDelete]?.title}</strong>?</p>
            <div className="flex justify-end gap-[15px]">
              <button className="bg-red-500 text-white px-[30px] py-[12px] rounded-[10px] font-bold cursor-pointer hover:bg-red-600 transition" onClick={confirmDelete} disabled={isSaving}>USUŃ</button>
              <button className="bg-white/10 text-white px-[30px] py-[12px] rounded-[10px] font-bold cursor-pointer hover:bg-white/20 transition" onClick={() => setItemToDelete(null)}>ANULUJ</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL EDYCJI --- */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-[10px] flex justify-center items-center z-[1000] p-[20px]" onClick={() => setEditingItem(null)}>
          <div className="bg-[#0c0c0c] p-[45px] rounded-[30px] border border-sunfire w-full max-w-[550px] shadow-[0_0_50px_color-mix(in_srgb,var(--sunfire-accent),transparent_85%)] max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black text-white mb-[30px] uppercase">{editingItem === 'hero' ? "EDYTUJ HERO" : "EDYTUJ CECHĘ"}</h2>
            
            {editingItem === 'hero' ? (
              <div className="flex flex-col">
                <label className="block text-sunfire text-[0.75rem] font-black mb-[10px] tracking-[2px]">TAGLINE</label>
                <input className="w-full bg-[#151515] border border-[#252525] rounded-[12px] p-[15px] text-white mb-[25px] font-sans focus:outline-none focus:border-sunfire focus:bg-[#222] focus:ring-[4px] focus:ring-sunfire/10" value={tempData.tagline} onChange={e => setTempData({...tempData, tagline: e.target.value})} />
                <label className="block text-sunfire text-[0.75rem] font-black mb-[10px] tracking-[2px]">TYTUŁ (GŁÓWNY)</label>
                <input className="w-full bg-[#151515] border border-[#252525] rounded-[12px] p-[15px] text-white mb-[25px] font-sans focus:outline-none focus:border-sunfire focus:bg-[#222] focus:ring-[4px] focus:ring-sunfire/10" value={tempData.titleStart} onChange={e => setTempData({...tempData, titleStart: e.target.value})} />
                <label className="block text-sunfire text-[0.75rem] font-black mb-[10px] tracking-[2px]">TYTUŁ (AKCENT)</label>
                <input className="w-full bg-[#151515] border border-[#252525] rounded-[12px] p-[15px] text-white mb-[25px] font-sans focus:outline-none focus:border-sunfire focus:bg-[#222] focus:ring-[4px] focus:ring-sunfire/10" value={tempData.titleAccent} onChange={e => setTempData({...tempData, titleAccent: e.target.value})} />
                <label className="block text-sunfire text-[0.75rem] font-black mb-[10px] tracking-[2px]">MOTTO</label>
                <textarea className="w-full bg-[#151515] border border-[#252525] rounded-[12px] p-[15px] text-white mb-[25px] font-sans focus:outline-none focus:border-sunfire focus:bg-[#222] focus:ring-[4px] focus:ring-sunfire/10 min-h-[100px]" value={tempData.motto} onChange={e => setTempData({...tempData, motto: e.target.value})} />
              </div>
            ) : (
              <div className="flex flex-col">
                <label className="block text-sunfire text-[0.75rem] font-black mb-[10px] tracking-[2px]">TYTUŁ CECHY</label>
                <input className="w-full bg-[#151515] border border-[#252525] rounded-[12px] p-[15px] text-white mb-[25px] font-sans focus:outline-none focus:border-sunfire focus:bg-[#222] focus:ring-[4px] focus:ring-sunfire/10" value={tempData.focusItems[editingItem.index].title} 
                       onChange={e => {
                         const items = [...tempData.focusItems];
                         items[editingItem.index].title = e.target.value;
                         setTempData({...tempData, focusItems: items});
                       }} />
                
                <label className="block text-sunfire text-[0.75rem] font-black mb-[10px] tracking-[2px]">SZEROKOŚĆ (GRID)</label>
                <div className="flex gap-[10px] mb-[25px]">
                  {['1-3', '2-3', '3-3'].map(s => {
                    const isActive = tempData.focusItems[editingItem.index].size === s;
                    return (
                      <button 
                        key={s}
                        className={`flex-1 p-[12px] rounded-[8px] cursor-pointer font-extrabold transition-all duration-200 ${isActive ? 'bg-sunfire text-black border-sunfire shadow-[0_0_20px_color-mix(in_srgb,var(--sunfire-accent),transparent_50%)] scale-105' : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white'}`} 
                        onClick={() => {
                          const items = [...tempData.focusItems];
                          items[editingItem.index].size = s;
                          setTempData({...tempData, focusItems: items});
                        }}
                      >
                        {s === '1-3' ? '1/3' : s === '2-3' ? '2/3' : '3/3'}
                      </button>
                    );
                  })}
                </div>

                <label className="block text-sunfire text-[0.75rem] font-black mb-[10px] tracking-[2px]">OPIS</label>
                <textarea className="w-full bg-[#151515] border border-[#252525] rounded-[12px] p-[15px] text-white mb-[25px] font-sans focus:outline-none focus:border-sunfire focus:bg-[#222] focus:ring-[4px] focus:ring-sunfire/10 min-h-[100px]" value={tempData.focusItems[editingItem.index].description} 
                          onChange={e => {
                            const items = [...tempData.focusItems];
                            items[editingItem.index].description = e.target.value;
                            setTempData({...tempData, focusItems: items});
                          }} />
              </div>
            )}
            <div className="flex justify-end gap-[15px] mt-[10px]">
              <button className="bg-sunfire text-black px-[30px] py-[12px] rounded-[10px] font-bold cursor-pointer hover:brightness-110 transition" onClick={() => handleSave()} disabled={isSaving}>ZAPISZ</button>
              <button className="bg-white/10 text-white px-[30px] py-[12px] rounded-[10px] font-bold cursor-pointer hover:bg-white/20 transition" onClick={() => setEditingItem(null)}>ANULUJ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}