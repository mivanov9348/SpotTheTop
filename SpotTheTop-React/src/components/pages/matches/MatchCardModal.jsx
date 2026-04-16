import React, { useState, useEffect } from 'react';

const API_URL = "https://localhost:44306/api";

export default function MatchCardModal({ match, onClose, onSave, canEdit }) {
    const [activeTab, setActiveTab] = useState('stats');
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Стейтове за данните
    const [homePlayers, setHomePlayers] = useState([]);
    const [awayPlayers, setAwayPlayers] = useState([]);
    const [playerStats, setPlayerStats] = useState({}); // Оптимизиран обект { playerId: { stats } }
    const [events, setEvents] = useState([]);

    // Стейт за формата за ново събитие
    const [newEvent, setNewEvent] = useState({ minute: '', eventType: 'Goal', teamId: match.homeTeamId, primaryPlayerId: '', secondaryPlayerId: '' });

    useEffect(() => {
        loadMatchDetails();
    }, []);

    const loadMatchDetails = async () => {
        const token = localStorage.getItem('jwtToken');
        try {
            const res = await fetch(`${API_URL}/Matches/${match.id}/edit-details`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setHomePlayers(data.homePlayers);
                setAwayPlayers(data.awayPlayers);
                setEvents(data.existingEvents || []);

                // Инициализираме статистиките: първо нули за всички, после презаписваме със съществуващите
                const statsObj = {};
                const initPlayer = (p, tId) => {
                    statsObj[p.id] = { playerId: p.id, teamId: tId, minutesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, isRedCard: false };
                };
                data.homePlayers.forEach(p => initPlayer(p, match.homeTeamId));
                data.awayPlayers.forEach(p => initPlayer(p, match.awayTeamId));
                
                if (data.existingStats) {
                    data.existingStats.forEach(s => { statsObj[s.playerId] = { ...s }; });
                }
                setPlayerStats(statsObj);
            }
        } catch (err) {
            console.error("Error loading match details", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatChange = (playerId, field, value) => {
        if (!canEdit) return;
        setPlayerStats(prev => ({
            ...prev,
            [playerId]: { ...prev[playerId], [field]: value }
        }));
    };

    const handleAddEvent = () => {
        if (!newEvent.minute || !newEvent.primaryPlayerId) return alert("Minute and Main Player are required.");
        setEvents(prev => [...prev, { ...newEvent, minute: parseInt(newEvent.minute), primaryPlayerId: parseInt(newEvent.primaryPlayerId), secondaryPlayerId: newEvent.secondaryPlayerId ? parseInt(newEvent.secondaryPlayerId) : null, teamId: parseInt(newEvent.teamId) }]);
        setNewEvent({ ...newEvent, minute: '', primaryPlayerId: '', secondaryPlayerId: '' }); // Reset
    };

    const removeEvent = (index) => {
        setEvents(prev => prev.filter((_, i) => i !== index));
    };

    const saveMatchData = async () => {
        if (!canEdit) return;
        setIsSaving(true);
        const token = localStorage.getItem('jwtToken');

        // Превръщаме обекта обратно в масив, премахвайки играчи с 0 минути, 0 гола и т.н.
        const statsArray = Object.values(playerStats).filter(s => s.minutesPlayed > 0 || s.goals > 0 || s.yellowCards > 0 || s.isRedCard);

        try {
            const res = await fetch(`${API_URL}/Matches/${match.id}/stats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ playerStats: statsArray, events: events })
            });

            if (res.ok) {
                onSave(); 
            } else {
                alert(await res.text() || "Failed to save match data.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    // Изчисляваме временния резултат на база на въведените голове
    const calcHomeGoals = Object.values(playerStats).filter(s => s.teamId === match.homeTeamId).reduce((sum, s) => sum + (parseInt(s.goals) || 0), 0);
    const calcAwayGoals = Object.values(playerStats).filter(s => s.teamId === match.awayTeamId).reduce((sum, s) => sum + (parseInt(s.goals) || 0), 0);

    const getPlayerName = (id) => {
        const p = [...homePlayers, ...awayPlayers].find(x => x.id === id);
        return p ? p.name : 'Unknown';
    };

    return (
        <>
            <div className="modal-backdrop fade show" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}></div>
            
            <div className="modal fade show d-block" tabIndex="-1" onClick={onClose}>
                <div className="modal-dialog modal-dialog-centered modal-xl" onClick={e => e.stopPropagation()}>
                    <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
                        
                        {/* ХЕДЪР */}
                        <div className="modal-header border-0 text-white p-4 d-flex flex-column align-items-stretch" style={{ background: 'linear-gradient(45deg, #1e293b, #0f172a)' }}>
                            <div className="d-flex justify-content-between w-100 mb-3">
                                <span className="badge bg-secondary">Match Center | Round {match.round}</span>
                                <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
                            </div>

                            <div className="d-flex justify-content-between align-items-center w-100 px-lg-5">
                                <h3 className="fw-bold mb-0 text-end w-25 text-truncate">{match.homeTeamName}</h3>
                                
                                <div className="bg-dark border border-secondary rounded-4 px-4 py-3 d-flex justify-content-center align-items-center shadow-sm">
                                    <span className="fs-2 fw-bold text-white">{calcHomeGoals}</span>
                                    <span className="mx-3 text-info fw-bold fs-4">:</span>
                                    <span className="fs-2 fw-bold text-white">{calcAwayGoals}</span>
                                </div>

                                <h3 className="fw-bold mb-0 text-start w-25 text-truncate">{match.awayTeamName}</h3>
                            </div>
                            <div className="text-center mt-2 small text-warning opacity-75">
                                * Score is calculated automatically based on player goals.
                            </div>
                        </div>

                        {/* НАВИГАЦИЯ */}
                        <div className="bg-dark border-bottom border-secondary px-4 pt-3">
                            <ul className="nav nav-tabs border-0">
                                <li className="nav-item">
                                    <button className={`nav-link border-0 fw-bold pb-3 ${activeTab === 'stats' ? 'bg-transparent text-info border-bottom border-3 border-info' : 'text-light opacity-50'}`} onClick={() => setActiveTab('stats')}>
                                        Player Statistics
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button className={`nav-link border-0 fw-bold pb-3 ${activeTab === 'timeline' ? 'bg-transparent text-info border-bottom border-3 border-info' : 'text-light opacity-50'}`} onClick={() => setActiveTab('timeline')}>
                                        Match Timeline (Events)
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* СЪДЪРЖАНИЕ */}
                        <div className="modal-body p-0 text-light custom-scrollbar" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                            {isLoading ? (
                                <div className="text-center py-5 opacity-50"><div className="spinner-border"></div></div>
                            ) : (
                                <>
                                    {/* РАЗДЕЛ СТАТИСТИКИ */}
                                    {activeTab === 'stats' && (
                                        <div className="row g-0">
                                            {/* HOME TEAM */}
                                            <div className="col-md-6 border-end border-secondary p-3">
                                                <h5 className="text-center fw-bold text-info mb-3">{match.homeTeamName}</h5>
                                                <div className="table-responsive">
                                                    <table className="table table-dark table-sm align-middle text-center mb-0">
                                                        <thead className="opacity-75">
                                                            <tr>
                                                                <th className="text-start">Player</th>
                                                                <th title="Minutes">Min</th>
                                                                <th title="Goals">⚽</th>
                                                                <th title="Assists">🤝</th>
                                                                <th title="Yellow Cards">🟨</th>
                                                                <th title="Red Card">🟥</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {homePlayers.map(p => (
                                                                <tr key={p.id}>
                                                                    <td className="text-start small fw-bold">{p.name} <span className="text-muted ms-1">({p.position})</span></td>
                                                                    <td><input type="number" min="0" max="120" className="form-control form-control-sm bg-dark text-white border-secondary text-center px-1" style={{width:'50px'}} value={playerStats[p.id]?.minutesPlayed || ''} onChange={e => handleStatChange(p.id, 'minutesPlayed', parseInt(e.target.value)||0)} disabled={!canEdit} /></td>
                                                                    <td><input type="number" min="0" className="form-control form-control-sm bg-dark text-white border-secondary text-center px-1" style={{width:'45px'}} value={playerStats[p.id]?.goals || ''} onChange={e => handleStatChange(p.id, 'goals', parseInt(e.target.value)||0)} disabled={!canEdit} /></td>
                                                                    <td><input type="number" min="0" className="form-control form-control-sm bg-dark text-white border-secondary text-center px-1" style={{width:'45px'}} value={playerStats[p.id]?.assists || ''} onChange={e => handleStatChange(p.id, 'assists', parseInt(e.target.value)||0)} disabled={!canEdit} /></td>
                                                                    <td><input type="number" min="0" max="2" className="form-control form-control-sm bg-dark text-white border-secondary text-center px-1" style={{width:'45px'}} value={playerStats[p.id]?.yellowCards || ''} onChange={e => handleStatChange(p.id, 'yellowCards', parseInt(e.target.value)||0)} disabled={!canEdit} /></td>
                                                                    <td><input type="checkbox" className="form-check-input" checked={playerStats[p.id]?.isRedCard || false} onChange={e => handleStatChange(p.id, 'isRedCard', e.target.checked)} disabled={!canEdit} /></td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            {/* AWAY TEAM */}
                                            <div className="col-md-6 p-3">
                                                <h5 className="text-center fw-bold text-info mb-3">{match.awayTeamName}</h5>
                                                <div className="table-responsive">
                                                    <table className="table table-dark table-sm align-middle text-center mb-0">
                                                        <thead className="opacity-75">
                                                            <tr>
                                                                <th className="text-start">Player</th>
                                                                <th title="Minutes">Min</th>
                                                                <th title="Goals">⚽</th>
                                                                <th title="Assists">🤝</th>
                                                                <th title="Yellow Cards">🟨</th>
                                                                <th title="Red Card">🟥</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {awayPlayers.map(p => (
                                                                <tr key={p.id}>
                                                                    <td className="text-start small fw-bold">{p.name} <span className="text-muted ms-1">({p.position})</span></td>
                                                                    <td><input type="number" min="0" max="120" className="form-control form-control-sm bg-dark text-white border-secondary text-center px-1" style={{width:'50px'}} value={playerStats[p.id]?.minutesPlayed || ''} onChange={e => handleStatChange(p.id, 'minutesPlayed', parseInt(e.target.value)||0)} disabled={!canEdit} /></td>
                                                                    <td><input type="number" min="0" className="form-control form-control-sm bg-dark text-white border-secondary text-center px-1" style={{width:'45px'}} value={playerStats[p.id]?.goals || ''} onChange={e => handleStatChange(p.id, 'goals', parseInt(e.target.value)||0)} disabled={!canEdit} /></td>
                                                                    <td><input type="number" min="0" className="form-control form-control-sm bg-dark text-white border-secondary text-center px-1" style={{width:'45px'}} value={playerStats[p.id]?.assists || ''} onChange={e => handleStatChange(p.id, 'assists', parseInt(e.target.value)||0)} disabled={!canEdit} /></td>
                                                                    <td><input type="number" min="0" max="2" className="form-control form-control-sm bg-dark text-white border-secondary text-center px-1" style={{width:'45px'}} value={playerStats[p.id]?.yellowCards || ''} onChange={e => handleStatChange(p.id, 'yellowCards', parseInt(e.target.value)||0)} disabled={!canEdit} /></td>
                                                                    <td><input type="checkbox" className="form-check-input" checked={playerStats[p.id]?.isRedCard || false} onChange={e => handleStatChange(p.id, 'isRedCard', e.target.checked)} disabled={!canEdit} /></td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* РАЗДЕЛ TIMELINE (СЪБИТИЯ) */}
                                    {activeTab === 'timeline' && (
                                        <div className="p-4">
                                            {canEdit && (
                                                <div className="card bg-dark border-secondary mb-4 p-3 rounded-4 shadow-sm">
                                                    <h6 className="text-warning fw-bold mb-3">➕ Add New Event</h6>
                                                    <div className="row g-2 align-items-end">
                                                        <div className="col-md-2">
                                                            <label className="small text-muted">Minute</label>
                                                            <input type="number" className="form-control form-control-sm bg-transparent text-white border-secondary shadow-none" placeholder="e.g. 45" value={newEvent.minute} onChange={e => setNewEvent({...newEvent, minute: e.target.value})} />
                                                        </div>
                                                        <div className="col-md-2">
                                                            <label className="small text-muted">Type</label>
                                                            <select className="form-select form-select-sm bg-transparent text-white border-secondary shadow-none" value={newEvent.eventType} onChange={e => setNewEvent({...newEvent, eventType: e.target.value})}>
                                                                <option value="Goal">Goal ⚽</option>
                                                                <option value="YellowCard">Yellow Card 🟨</option>
                                                                <option value="RedCard">Red Card 🟥</option>
                                                                <option value="Substitution">Substitution 🔄</option>
                                                            </select>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <label className="small text-muted">Team</label>
                                                            <select className="form-select form-select-sm bg-transparent text-white border-secondary shadow-none" value={newEvent.teamId} onChange={e => setNewEvent({...newEvent, teamId: parseInt(e.target.value), primaryPlayerId: '', secondaryPlayerId: ''})}>
                                                                <option value={match.homeTeamId}>{match.homeTeamName}</option>
                                                                <option value={match.awayTeamId}>{match.awayTeamName}</option>
                                                            </select>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <label className="small text-muted">Main Player</label>
                                                            <select className="form-select form-select-sm bg-transparent text-white border-secondary shadow-none" value={newEvent.primaryPlayerId} onChange={e => setNewEvent({...newEvent, primaryPlayerId: e.target.value})}>
                                                                <option value="">Select...</option>
                                                                {(newEvent.teamId === match.homeTeamId ? homePlayers : awayPlayers).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="col-md-2">
                                                            <button className="btn btn-sm btn-warning w-100 fw-bold" onClick={handleAddEvent}>Add</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="timeline-container">
                                                {events.length === 0 ? (
                                                    <div className="text-center text-muted py-3">No events recorded yet.</div>
                                                ) : (
                                                    events.sort((a, b) => a.minute - b.minute).map((ev, idx) => (
                                                        <div key={idx} className={`d-flex align-items-center mb-3 ${ev.teamId === match.homeTeamId ? 'justify-content-start' : 'justify-content-end'}`}>
                                                            <div className={`card bg-dark border-secondary p-2 d-flex flex-row align-items-center shadow-sm ${ev.teamId === match.awayTeamId ? 'flex-row-reverse text-end' : ''}`} style={{minWidth: '250px'}}>
                                                                <div className="fw-bold text-info fs-5 mx-2">{ev.minute}'</div>
                                                                <div>
                                                                    <div className="fw-bold text-white">
                                                                        {ev.eventType === 'Goal' && '⚽ '}
                                                                        {ev.eventType === 'YellowCard' && '🟨 '}
                                                                        {ev.eventType === 'RedCard' && '🟥 '}
                                                                        {ev.eventType === 'Substitution' && '🔄 '}
                                                                        {getPlayerName(ev.primaryPlayerId)}
                                                                    </div>
                                                                    {ev.eventType === 'Goal' && ev.secondaryPlayerId && <div className="small text-muted">Assist: {getPlayerName(ev.secondaryPlayerId)}</div>}
                                                                </div>
                                                                {canEdit && (
                                                                    <button className="btn btn-sm btn-link text-danger ms-auto shadow-none" onClick={() => removeEvent(idx)}><i className="bi bi-trash"></i></button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* ФУТЪР С БУТОНИ */}
                        <div className="modal-footer border-secondary bg-dark d-flex justify-content-between">
                            <button type="button" className="btn btn-outline-secondary rounded-pill px-4 fw-bold shadow-none" onClick={onClose}>Close</button>
                            
                            {canEdit && (
                                <button type="button" className="btn btn-info text-dark rounded-pill px-5 fw-bold shadow-none" onClick={saveMatchData} disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save & Publish Stats'}
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
            `}} />
        </>
    );
}