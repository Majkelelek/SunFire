import React, { useEffect, useState } from 'react';
import './AboutPage.css';

export default function AboutPage({ isAdmin }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const apiUrl = import.meta.env.VITE_API_URL;
    // Modal State
    const [editingItem, setEditingItem] = useState(null); 
    const [tempTitle, setTempTitle] = useState('');
    const [tempAccent, setTempAccent] = useState('');
    const [tempContent, setTempContent] = useState('');
    const [tempSize, setTempSize] = useState('half');
    const [isSaving, setIsSaving] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/about`);
            const result = await res.json();
            setData(result);
        } catch (err) { console.error(err); }
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
        } else if (editingItem === 'philosophy') {
            updatedData.philosophy = tempContent;
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

    const deleteSection = async (id) => {
        if (!window.confirm("Usunąć tę sekcję?")) return;
        const updatedData = { ...data, sections: data.sections.filter(s => s.id !== id) };
        await sendUpdate(updatedData);
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

    if (loading) return <div className="loading">SYSTEM LOADING...</div>;

    return (
        <div className="about-container">
            <div className="about-bg-noise"></div>
            <div className="about-glow"></div>

            <section className="about-hero">
                <div className="editable-group">
                    <p className="about-tag">{data.manifestoTag}</p>
                    <h1 className="hero-h1">{data.title} <span>{data.titleAccent}</span>.</h1>
                    {isAdmin && <button className="admin-edit-btn" onClick={() => { 
                        setEditingItem('header'); setTempTitle(data.manifestoTag); setTempContent(data.title); setTempAccent(data.titleAccent);
                    }}>✎ NAGŁÓWEK</button>}
                </div>
                <div className="editable-group">
                    <p className="about-lead">{data.lead || "Dodaj opis..."}</p>
                    {isAdmin && <button className="edit-dot" onClick={() => { setEditingItem('lead'); setTempContent(data.lead); }}>✎</button>}
                </div>
            </section>

            <div className="about-grid">
                {data.sections && data.sections.map((section) => (
                    <div key={section.id} className={`about-card ${section.size === 'full' ? 'full-width' : ''}`}>
                        <div className="card-header">
                            <h3>{section.title}</h3>
                            {isAdmin && (
                                <div className="card-actions">
                                    <button onClick={() => { 
                                        setEditingItem(section); setTempTitle(section.title); setTempContent(section.content); setTempSize(section.size || 'half');
                                    }}>✎</button>
                                    <button className="del-btn" onClick={() => deleteSection(section.id)}>×</button>
                                </div>
                            )}
                        </div>
                        <p className="bio-text">{section.content}</p>
                    </div>
                ))}
                {isAdmin && <button className="add-section-card" onClick={addNewSection}>+ DODAJ SEKCJĘ</button>}
            </div>
            {editingItem && (
                <div className="modal-overlay" onClick={() => setEditingItem(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>KONFIGURACJA SEKCJI</h2>
                        {editingItem === 'header' ? (
                            <>
                                <label className="modal-label">TAG</label>
                                <input className="admin-input" value={tempTitle} onChange={e => setTempTitle(e.target.value)} />
                                <label className="modal-label">TYTUŁ</label>
                                <input className="admin-input" value={tempContent} onChange={e => setTempContent(e.target.value)} />
                                <label className="modal-label">AKCENT</label>
                                <input className="admin-input" value={tempAccent} onChange={e => setTempAccent(e.target.value)} />
                            </>
                        ) : (
                            <>
                                {typeof editingItem === 'object' && (
                                    <>
                                        <label className="modal-label">TYTUŁ SEKCJI</label>
                                        <input className="admin-input" value={tempTitle} onChange={e => setTempTitle(e.target.value)} />
                                        <label className="modal-label">SZEROKOŚĆ</label>
                                        <div className="size-btns">
                                            <button className={tempSize === 'half' ? 'active' : ''} onClick={() => setTempSize('half')}>POŁOWA</button>
                                            <button className={tempSize === 'full' ? 'active' : ''} onClick={() => setTempSize('full')}>CAŁOŚĆ</button>
                                        </div>
                                    </>
                                )}
                                <label className="modal-label">TREŚĆ</label>
                                <textarea className="admin-textarea" value={tempContent} onChange={e => setTempContent(e.target.value)} />
                            </>
                        )}
                        <div className="modal-btns">
                            <button onClick={handleSave} disabled={isSaving}>{isSaving ? "..." : "ZAPISZ"}</button>
                            <button onClick={() => setEditingItem(null)} className="btn-cancel">ANULUJ</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}