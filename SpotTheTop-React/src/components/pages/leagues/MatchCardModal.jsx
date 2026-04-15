import React, { useState } from 'react';

const API_URL = "https://localhost:44306/api";

export default function MatchCardModal({ match, onClose, onSave }) {
    // Табове: "general" (резултат) | "stats" (играчи) | "timeline" (събития)
    const [activeTab, setActiveTab] = useState('general');
    const [homeScore, setHomeScore] = useState(match.homeScore || 0);
    const [awayScore, setAwayScore] = useState(match.awayScore || 0);
    const [isSaving, setIsSaving] = useState(false);

    // TODO: Тук ще държим масив с играчите и техните статистики
    // const [playerStats, setPlayerStats] = useState([]);

    const saveMatchData = async () => {
        setIsSaving(true);
        const token = localStorage.getItem('jwtToken');

        // ЗАБЕЛЕЖКА: Засега запазваме САМО резултата (за да работи UI-а). 
        // По-късно тук ще пращаме и масива с playerStats към новия endpoint!
        try {
            const res = await fetch(`${API_URL}/Matches/${match.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ homeScore, awayScore, status: "Finished" })
            });

            if (res.ok) {
                onSave(); // Извиква handleMatchSaved в родителя
            } else {
                alert("Failed to save match data.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className="modal-backdrop fade show" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}></div>
            
            <div className="modal fade show d-block" tabIndex="-1" onClick={onClose}>
                <div className="modal-dialog modal-dialog-centered modal-xl" onClick={e => e.stopPropagation()}>
                    <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
                        
                        {/* ХЕДЪР - Отборите и Резултата */}
                        <div className="modal-header border-0 text-white p-4 d-flex flex-column align-items-stretch" style={{ background: 'linear-gradient(45deg, #1e293b, #0f172a)' }}>
                            <div className="d-flex justify-content-between w-100 mb-3">
                                <span className="badge bg-secondary">Round {match.round}</span>
                                <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                            </div>

                            <div className="d-flex justify-content-between align-items-center w-100 px-5">
                                <h3 className="fw-bold mb-0 text-end w-25">{match.homeTeamName}</h3>
                                
                                <div className="d-flex align-items-center gap-3">
                                    <input 
                                        type="number" min="0" className="form-control bg-dark text-white border-info text-center fw-bold fs-3 shadow-none rounded-3" style={{ width: '80px', height: '80px' }}
                                        value={homeScore} onChange={e => setHomeScore(parseInt(e.target.value) || 0)}
                                    />
                                    <span className="text-muted fs-4">:</span>
                                    <input 
                                        type="number" min="0" className="form-control bg-dark text-white border-info text-center fw-bold fs-3 shadow-none rounded-3" style={{ width: '80px', height: '80px' }}
                                        value={awayScore} onChange={e => setAwayScore(parseInt(e.target.value) || 0)}
                                    />
                                </div>

                                <h3 className="fw-bold mb-0 text-start w-25">{match.awayTeamName}</h3>
                            </div>
                        </div>

                        {/* НАВИГАЦИЯ (ТАБОВЕ В МОДАЛА) */}
                        <div className="bg-dark border-bottom border-secondary px-4 pt-3">
                            <ul className="nav nav-tabs border-0">
                                <li className="nav-item">
                                    <button className={`nav-link border-0 fw-bold pb-3 ${activeTab === 'general' ? 'bg-transparent text-info border-bottom border-3 border-info' : 'text-light opacity-50'}`} onClick={() => setActiveTab('general')}>
                                        General Info
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button className={`nav-link border-0 fw-bold pb-3 ${activeTab === 'stats' ? 'bg-transparent text-info border-bottom border-3 border-info' : 'text-light opacity-50'}`} onClick={() => setActiveTab('stats')}>
                                        Player Statistics
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button className={`nav-link border-0 fw-bold pb-3 ${activeTab === 'timeline' ? 'bg-transparent text-info border-bottom border-3 border-info' : 'text-light opacity-50'}`} onClick={() => setActiveTab('timeline')}>
                                        Match Timeline
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* СЪДЪРЖАНИЕ */}
                        <div className="modal-body p-4 text-light custom-scrollbar" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            
                            {activeTab === 'general' && (
                                <div className="text-center py-5">
                                    <h5 className="text-muted">Match Result Editor</h5>
                                    <p className="opacity-50">Set the final score in the header above.</p>
                                </div>
                            )}

                            {activeTab === 'stats' && (
                                <div className="text-center py-5">
                                    <h5 className="text-warning"><i className="bi bi-tools me-2"></i>Under Construction</h5>
                                    <p className="opacity-50">Here we will render the list of players for both teams with inputs for their goals, assists, and minutes played.</p>
                                </div>
                            )}

                            {activeTab === 'timeline' && (
                                <div className="text-center py-5">
                                    <h5 className="text-warning"><i className="bi bi-tools me-2"></i>Under Construction</h5>
                                    <p className="opacity-50">Here we will add the minute-by-minute events (Goals, Cards, Substitutions).</p>
                                </div>
                            )}

                        </div>

                        {/* ФУТЪР С БУТОНИ */}
                        <div className="modal-footer border-secondary bg-dark">
                            <button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-bold shadow-none" onClick={onClose}>Cancel</button>
                            <button type="button" className="btn btn-info text-dark rounded-pill px-5 fw-bold shadow-none" onClick={saveMatchData} disabled={isSaving}>
                                {isSaving ? 'Saving...' : 'Save Match Data'}
                            </button>
                        </div>

                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
            `}} />
        </>
    );
}