import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { AboutSkeleton } from '../components/Skeletons';
import './AboutPage.css';

export default function AboutPage() {
    const { isAdmin } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const apiUrl = import.meta.env.VITE_API_URL || "";
    

    const [editingItem, setEditingItem] = useState(null); 
    const [tempTitle, setTempTitle] = useState('');
    const [tempAccent, setTempAccent] = useState('');
    const [tempContent, setTempContent] = useState('');
    const [tempSize, setTempSize] = useState('half');
    const [isSaving, setIsSaving] = useState(false);


    const [deletingId, setDeletingId] = useState(null);

    const fetchData = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/about`);
            const result = await res.json();
            setData(result);
        } catch (err) {
            toast.error("Błąd ładowania danych o mnie");
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

        await sendUpdate(updatedData, "Zapisano zmiany!");
    };

    const addNewSection = async () => {
        const newSec = { id: Date.now().toString(), title: "Nowa Sekcja", content: "Treść...", size: "half" };
        const updatedData = { ...data, sections: [...(data.sections || []), newSec] };
        await sendUpdate(updatedData, "Dodano nową sekcję!");
    };

    const deleteSection = (id) => {
        setDeletingId(id);
    };

    const confirmDelete = async () => {
        setIsSaving(true);
        const updatedData = { ...data, sections: data.sections.filter(s => s.id !== deletingId) };
        await sendUpdate(updatedData, "Sekcja usunięta!");
        setDeletingId(null);
    };

    const sendUpdate = async (updatedData, successMessage) => {
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
                toast.success(successMessage || "Zapisano zmiany!");
            } else {
                toast.error("Wystąpił błąd podczas zapisu.");
            }
        } catch (err) { 
            toast.error("Błąd zapisu."); 
        } finally { 
            setIsSaving(false); 
        }
    };

    if (loading) return <AboutSkeleton />;
    if (!data) return <div className="error-screen">(Błąd połączenia z serwerem).</div>;

    return (
        <div className="about-container">
            <div className="about-glow"></div>
            
            <section className="about-hero">
                <div className="editable-group">
                    <p className="about-tag">{data.manifestoTag}</p>
                    <h1 className="hero-h1">{data.title} <span>{data.titleAccent}</span></h1>
                    {isAdmin && (
                        <button className="admin-edit-btn" onClick={() => { 
                            setEditingItem('header'); 
                            setTempTitle(data.manifestoTag); 
                            setTempContent(data.title); 
                            setTempAccent(data.titleAccent);
                        }}>✎ NAGŁÓWEK</button>
                    )}
                </div>
                
                <div className="editable-group">
                    <p className="about-lead">{data.lead || "Dodaj opis..."}</p>
                    {isAdmin && (
                        <button className="edit-dot" onClick={() => { 
                            setEditingItem('lead'); 
                            setTempContent(data.lead); 
                        }}>✎</button>
                    )}
                </div>
            </section>

            <div className="about-grid">
                {data.sections && data.sections.map((section) => (
                    <div key={section.id} className={`about-card ${section.size === 'full' ? 'full-width' : ''}`}>
                        <div className="card-header">
                            <h3>{section.title}</h3>
                            {isAdmin && (
                                <div className="card-actions">
                                    <button className="edit-btn" onClick={() => { 
                                        setEditingItem(section); 
                                        setTempTitle(section.title); 
                                        setTempContent(section.content); 
                                        setTempSize(section.size || 'half');
                                    }}>✎</button>
                                    <button className="del-btn" onClick={() => deleteSection(section.id)}>×</button>
                                </div>
                            )}
                        </div>
                        <p className="bio-text">{section.content}</p>
                    </div>
                ))}
                
                {isAdmin && (
                    <button className="add-section-card" onClick={addNewSection}>
                        <span>+ DODAJ SEKCJĘ</span>
                    </button>
                )}
            </div>

            
            {editingItem && (
                <div className="modal-overlay" onClick={() => setEditingItem(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>KONFIGURACJA SEKCJI</h2>
                        
                        {editingItem === 'header' ? (
                            <div className="modal-fields">
                                <label>TAG (NAD NAGŁÓWKIEM)</label>
                                <input value={tempTitle} onChange={e => setTempTitle(e.target.value)} />
                                <label>TYTUŁ GŁÓWNY</label>
                                <input value={tempContent} onChange={e => setTempContent(e.target.value)} />
                                <label>AKCENT (KOLOROWY TEKST)</label>
                                <input value={tempAccent} onChange={e => setTempAccent(e.target.value)} />
                            </div>
                        ) : editingItem === 'lead' ? (
                            <div className="modal-fields">
                                <label>OPIS POD NAGŁÓWKIEM</label>
                                <textarea value={tempContent} onChange={e => setTempContent(e.target.value)} />
                            </div>
                        ) : (
                            <div className="modal-fields">
                                <label>TYTUŁ KARTY</label>
                                <input value={tempTitle} onChange={e => setTempTitle(e.target.value)} />
                                <label>SZEROKOŚĆ</label>
                                <div className="size-btns">
                                    <button className={tempSize === 'half' ? 'active' : ''} onClick={() => setTempSize('half')}>POŁOWA</button>
                                    <button className={tempSize === 'full' ? 'active' : ''} onClick={() => setTempSize('full')}>CAŁOŚĆ</button>
                                </div>
                                <label>TREŚĆ KARTY</label>
                                <textarea value={tempContent} onChange={e => setTempContent(e.target.value)} />
                            </div>
                        )}

                        <div className="modal-btns">
                            <button className="btn-save" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? "ZAPISYWANIE..." : "ZAPISZ ZMIANY"}
                            </button>
                            <button className="btn-cancel" onClick={() => setEditingItem(null)}>ANULUJ</button>
                        </div>
                    </div>
                </div>
            )}

            
            {deletingId && (
                <div className="modal-overlay" onClick={() => setDeletingId(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 style={{ color: '#ff4444' }}>POTWIERDŹ USUNIĘCIE</h2>
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginBottom: '30px', fontSize: '1.1rem' }}>
                            Czy na pewno chcesz bezpowrotnie usunąć tę sekcję?
                        </p>
                        <div className="modal-btns">
                            <button className="btn-delete" onClick={confirmDelete} disabled={isSaving}>
                                {isSaving ? "USUWAM..." : "USUŃ"}
                            </button>
                            <button className="btn-cancel" onClick={() => setDeletingId(null)}>ANULUJ</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

