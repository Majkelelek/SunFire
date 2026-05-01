import React, { useEffect, useState } from 'react';

const PortfolioPage = ({ isAdmin }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const apiUrl = import.meta.env.VITE_API_URL || "";
    
    // Stany dla modali
    const [expandedProject, setExpandedProject] = useState(null);
    const [editingSlot, setEditingSlot] = useState(null);
    const [projectToDelete, setProjectToDelete] = useState(null); // NOWE: do modala usuwania
    
    const [modalStep, setModalStep] = useState('choose');
    const [textInput, setTextInput] = useState('');
    const [fileInput, setFileInput] = useState(null);
    const [uploading, setUploading] = useState(false);

    const fetchData = async () => {
        try {
            const res = await fetch(`${apiUrl}/api/projects`);
            const data = await res.json();
            setProjects(data);
        } catch (err) {
            console.error("Błąd ładowania projektów");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getSlotsCount = () => {
        const slotNumbers = projects
            .map(p => parseInt(p.slotNumber, 10))
            .filter(n => !isNaN(n));
        const maxSlot = slotNumbers.length > 0 ? Math.max(...slotNumbers) : -1;
        let count = 8; 
        if (isAdmin) {
            count = Math.max(8, (Math.floor(maxSlot / 4) + 2) * 4);
        } else {
            count = (Math.floor(maxSlot / 4) + 1) * 4;
        }
        return count;
    };

    const slotsCount = getSlotsCount();

    // --- LOGIKA DODAWANIA ---
    const handleAddText = async () => {
        if (!textInput.trim()) return;
        setUploading(true);
        const newProject = {
            type: 'text',
            content: textInput,
            slotNumber: parseInt(editingSlot, 10),
            title: "Notatka"
        };
        const res = await fetch(`${apiUrl}/api/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProject),
            credentials: 'include'
        });
        if (res.ok) { resetModal(); fetchData(); }
        else { setUploading(false); }
    };

    const handleAddImage = async () => {
        if (!fileInput) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', fileInput);
        try {
            const uploadRes = await fetch(`${apiUrl}/api/cms/upload-image`, { 
                method: 'POST', body: formData, credentials: 'include' 
            });
            const { url } = await uploadRes.json();
            const newProject = {
                type: 'image',
                imageUrl: url,
                slotNumber: parseInt(editingSlot, 10),
                title: "Obraz"
            };
            await fetch(`${apiUrl}/api/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProject),
                credentials: 'include'
            });
            resetModal(); fetchData();
        } catch (err) { console.error("Błąd uploadu"); }
        finally { setUploading(false); }
    };

    // --- NOWA LOGIKA USUWANIA ---
    const confirmDelete = async () => {
        if (!projectToDelete) return;
        setUploading(true);
        try {
            await fetch(`${apiUrl}/api/projects/${projectToDelete}`, { 
                method: 'DELETE', 
                credentials: 'include' 
            });
            setProjectToDelete(null);
            fetchData();
        } catch (err) {
            console.error("Błąd usuwania");
        } finally {
            setUploading(false);
        }
    };

    const resetModal = () => {
        setEditingSlot(null); 
        setModalStep('choose'); 
        setTextInput(''); 
        setFileInput(null); 
        setUploading(false);
    };

    if (loading) return <div className="h-screen flex items-center justify-center text-[1.5rem] text-sunfire tracking-[5px] uppercase animate-[pulseGlow_2s_infinite]">Wczytywanie...</div>;

    const modalSaveBtnClass = "bg-sunfire text-black border-none px-[20px] py-[10px] rounded-[8px] font-bold cursor-pointer transition duration-300 hover:-translate-y-[3px] hover:shadow-[0_5px_15px_color-mix(in_srgb,var(--sunfire-accent),transparent_70%)]";
    const modalOptionBtnClass = "bg-white/5 border border-white/10 text-white p-[15px_25px] rounded-[12px] cursor-pointer font-bold transition duration-300 hover:bg-sunfire hover:border-sunfire hover:-translate-y-[3px] hover:shadow-[0_5px_15px_color-mix(in_srgb,var(--sunfire-accent),transparent_70%)] hover:text-black";

    return (
        <div className="p-[40px_20px] md:p-[50px_5%] max-w-[1400px] mx-auto min-h-screen text-white font-sans">
            <header className="mb-[50px] text-left border-l-[4px] border-sunfire pl-[20px]">
                <h1 className="text-[2.2rem] md:text-[3rem] font-black uppercase tracking-[5px] m-0">Portfolio</h1>
                {isAdmin && <p className="inline-block bg-[color-mix(in_srgb,var(--sunfire-accent),transparent_90%)] text-sunfire px-[15px] py-[5px] rounded-[20px] text-[0.8rem] font-bold uppercase tracking-[2px] border border-[color-mix(in_srgb,var(--sunfire-accent),transparent_70%)] mt-[10px] animate-[pulseGlow_2s_infinite]">Tryb Edycji Aktywny</p>}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-[20px] md:gap-[30px] [perspective:1000px]">
                {[...Array(slotsCount)].map((_, index) => {
                    const project = projects.find(p => parseInt(p.slotNumber, 10) === index);
                    if (!isAdmin && !project) return null;

                    return (
                        <div 
                            key={index} 
                            className={`aspect-[16/10] rounded-[15px] relative overflow-hidden transition-all duration-[400ms] ease-[cubic-bezier(0.175,0.885,0.32,1.275)] group/slot ${!project ? 'border-2 border-dashed border-white/10 bg-[color-mix(in_srgb,var(--sunfire-accent),transparent_98%)] flex items-center justify-center cursor-pointer hover:border-sunfire hover:bg-[color-mix(in_srgb,var(--sunfire-accent),transparent_95%)] group/empty' : 'bg-white/[0.03] border border-white/5 md:hover:-translate-y-[10px] md:hover:scale-105 hover:border-[color-mix(in_srgb,var(--sunfire-accent),transparent_60%)] md:hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]'}`}
                            onClick={() => {
                                if (project && (project.type === 'image' || project.Type === 'image')) {
                                    setExpandedProject(project); 
                                } else if (isAdmin && !project) {
                                    setEditingSlot(index); 
                                }
                            }}
                        >
                            {project ? (
                                <div className="w-full h-full relative">
                                    {(project.type === 'text' || project.Type === 'text') ? (
                                        <div className="whitespace-pre-wrap w-full h-full flex items-center justify-center p-[30px] text-center text-[1.1rem] leading-[1.6] bg-[linear-gradient(135deg,rgba(20,20,20,0.95),rgba(40,40,40,0.95))] text-white/80 box-border">{project.content || project.Content}</div>
                                    ) : (
                                        <img className="w-full h-full object-cover transition duration-500 group-hover/slot:scale-110" src={project.imageUrl || project.ImageUrl} alt="Projekt" />
                                    )}
                                    {isAdmin && (
                                        <button className="absolute top-[10px] md:top-[15px] right-[10px] md:right-[15px] w-[45px] md:w-[35px] h-[45px] md:h-[35px] bg-[#ff4444]/90 md:bg-sunfire text-white border-none rounded-full text-[24px] md:text-[20px] cursor-pointer z-10 opacity-100 md:opacity-0 transition duration-300 flex items-center justify-center md:shadow-[0_0_15px_color-mix(in_srgb,var(--sunfire-accent),transparent_50%)] group-hover/slot:opacity-100 hover:!bg-[#ff0000] hover:!text-black md:hover:rotate-90" onClick={(e) => {
                                            e.stopPropagation();
                                            setProjectToDelete(project.id || project.Id);
                                        }}>×</button>
                                    )}
                                </div>
                            ) : (
                                isAdmin && (
                                    <div className="relative w-[60px] h-[60px] flex items-center justify-center">
                                        <div className="text-[30px] md:text-[40px] text-[color-mix(in_srgb,var(--sunfire-accent),transparent_60%)] transition duration-300 md:group-hover/empty:text-sunfire md:group-hover/empty:scale-125">+</div>
                                        <div className="absolute w-[20px] md:w-[15px] h-[20px] md:h-[15px] border-2 border-sunfire md:border-[color-mix(in_srgb,var(--sunfire-accent),transparent_70%)] transition duration-300 md:group-hover/empty:border-sunfire md:group-hover/empty:w-[25px] md:group-hover/empty:h-[25px] top-[-10px] left-[-10px] border-r-0 border-b-0"></div>
                                        <div className="absolute w-[20px] md:w-[15px] h-[20px] md:h-[15px] border-2 border-sunfire md:border-[color-mix(in_srgb,var(--sunfire-accent),transparent_70%)] transition duration-300 md:group-hover/empty:border-sunfire md:group-hover/empty:w-[25px] md:group-hover/empty:h-[25px] top-[-10px] right-[-10px] border-l-0 border-b-0"></div>
                                        <div className="absolute w-[20px] md:w-[15px] h-[20px] md:h-[15px] border-2 border-sunfire md:border-[color-mix(in_srgb,var(--sunfire-accent),transparent_70%)] transition duration-300 md:group-hover/empty:border-sunfire md:group-hover/empty:w-[25px] md:group-hover/empty:h-[25px] bottom-[-10px] left-[-10px] border-r-0 border-t-0"></div>
                                        <div className="absolute w-[20px] md:w-[15px] h-[20px] md:h-[15px] border-2 border-sunfire md:border-[color-mix(in_srgb,var(--sunfire-accent),transparent_70%)] transition duration-300 md:group-hover/empty:border-sunfire md:group-hover/empty:w-[25px] md:group-hover/empty:h-[25px] bottom-[-10px] right-[-10px] border-l-0 border-t-0"></div>
                                    </div>
                                )
                            )}
                        </div>
                    );
                })}
            </div>

            {/* LIGHTBOX (Powiększony obraz) */}
            {expandedProject && (
                <div className="fixed inset-0 w-screen h-screen bg-black/90 backdrop-blur-[15px] flex items-center justify-center z-[2000] animate-[fadeIn_0.3s_ease] p-[20px] box-border" onClick={() => setExpandedProject(null)}>
                    <button className="fixed top-[15px] right-[15px] md:top-[20px] md:right-[20px] w-[50px] h-[50px] md:w-[70px] md:h-[70px] bg-sunfire border border-sunfire text-black rounded-full cursor-pointer flex items-center justify-center text-[30px] md:text-[40px] font-black z-[2010] shadow-[0_0_30px_rgba(0,0,0,0.6)] transition-all duration-300 hover:bg-[#e32323] hover:text-white hover:border-[#e32323] hover:rotate-180" onClick={() => setExpandedProject(null)}>×</button>
                    <div className="relative max-w-full max-h-full flex justify-center items-center" onClick={e => e.stopPropagation()}>
                        <img className="max-w-full max-h-[90vh] object-contain rounded-[10px] shadow-[0_20px_50px_rgba(0,0,0,0.8)]" src={expandedProject.imageUrl || expandedProject.ImageUrl} alt="Powiększony" />
                    </div>
                </div>
            )}

            {/* MODAL USUWANIA (NOWOŚĆ) */}
            {projectToDelete && (
                <div className="fixed inset-0 w-screen h-screen bg-black/90 backdrop-blur-[15px] flex items-center justify-center z-[2000] animate-[fadeIn_0.3s_ease] p-[20px] box-border" onClick={() => setProjectToDelete(null)}>
                    <div className="bg-[#0a0a0a] p-[40px] rounded-[25px] border border-sunfire w-[90%] max-w-[500px] text-center shadow-[0_0_50px_color-mix(in_srgb,var(--sunfire-accent),transparent_85%)]" onClick={e => e.stopPropagation()}>
                        <h2 className="text-[#ff4444] mb-[25px] uppercase tracking-[2px]">POTWIERDŹ USUNIĘCIE</h2>
                        <p className="text-white/70 mb-[30px] text-[1.1rem]">
                            Czy na pewno chcesz bezpowrotnie usunąć ten element ze swojego portfolio?
                        </p>
                        <div className="flex gap-[15px] mt-[30px]">
                            <button className="flex-1 p-[15px] border font-black rounded-[10px] cursor-pointer uppercase transition duration-300 bg-[#ff4444]/10 text-[#ff4444] !border-[#ff4444] hover:!bg-[#ff4444] hover:!text-white disabled:opacity-50 disabled:cursor-not-allowed" onClick={confirmDelete} disabled={uploading}>
                                {uploading ? "USUWAM..." : "USUŃ TRWALE"}
                            </button>
                            <button className="flex-1 p-[15px] border font-black rounded-[10px] cursor-pointer uppercase transition duration-300 bg-white/5 text-white !border-white/10 hover:!bg-white/10 hover:!border-white/30 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => setProjectToDelete(null)}>ANULUJ</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DODAWANIA PROJEKTU */}
            {editingSlot !== null && (
                <div className="fixed inset-0 w-screen h-screen bg-black/90 backdrop-blur-[15px] flex items-center justify-center z-[2000] animate-[fadeIn_0.3s_ease] p-[20px] box-border" onClick={resetModal}>
                    <div className="bg-[#0a0a0a] p-[40px] rounded-[25px] border border-sunfire w-[90%] max-w-[500px] text-center shadow-[0_0_50px_color-mix(in_srgb,var(--sunfire-accent),transparent_85%)]" onClick={e => e.stopPropagation()}>
                        <h2 className="text-sunfire mb-[25px] uppercase tracking-[2px]">Dodaj do slotu #{editingSlot + 1}</h2>
                        {modalStep === 'choose' && (
                            <div className="flex gap-[20px] justify-center">
                                <button className={modalOptionBtnClass} onClick={() => setModalStep('image')}>🖼️ Obraz</button>
                                <button className={modalOptionBtnClass} onClick={() => setModalStep('text')}>✍️ Tekst</button>
                            </div>
                        )}
                        {modalStep === 'text' && (
                            <div className="flex flex-col gap-[15px] mb-[20px]">
                                <textarea className="w-full p-[12px] bg-white/5 border border-white/20 text-white rounded-[8px] font-sans box-border min-h-[120px] resize-y" value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Wpisz treść..."/>
                                <button className={modalSaveBtnClass} onClick={handleAddText} disabled={uploading}>Zapisz</button>
                            </div>
                        )}
                        {modalStep === 'image' && (
                            <div className="flex flex-col gap-[15px] mb-[20px]">
                                <input className="w-full p-[12px] bg-white/5 border border-white/20 text-white rounded-[8px] font-sans box-border" type="file" onChange={e => setFileInput(e.target.files[0])} />
                                <button className={modalSaveBtnClass} onClick={handleAddImage} disabled={uploading}>Wyślij</button>
                            </div>
                        )}
                        <button className={`${modalOptionBtnClass} mt-[20px]`} onClick={resetModal}>Anuluj</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PortfolioPage;