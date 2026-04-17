import React, { useState, useEffect } from 'react';
import MatchCardModal from '../matches/MatchCardModal'; 

const API_URL = "https://localhost:44306/api";

export default function LeagueMatchesTab({ leagueId }) {
    const [matchesData, setMatchesData] = useState({ matches: [], availableRounds: [] });
    const [selectedRound, setSelectedRound] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Стейтове за модала
    const [selectedMatchForEdit, setSelectedMatchForEdit] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false); // НОВО

    const userRoles = JSON.parse(localStorage.getItem('userRoles') || "[]");
    const hasAdminAccess = userRoles.some(r => ['SuperAdmin', 'Admin', 'Moderator'].includes(r));

    const fetchMatches = async (roundToFetch = null) => {
        setIsLoading(true);
        const token = localStorage.getItem('jwtToken');
        let url = `${API_URL}/Matches?leagueId=${leagueId}`;
        if (roundToFetch) url += `&round=${roundToFetch}`;

        try {
            const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setMatchesData(data);

                if (!roundToFetch && data.availableRounds && data.availableRounds.length > 0) {
                    setSelectedRound(data.availableRounds[0]);
                } else if (roundToFetch) {
                    setSelectedRound(roundToFetch);
                }
            }
        } catch (err) {
            console.error("Error fetching matches", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, [leagueId]);

    const handleRoundChange = (e) => {
        const round = parseInt(e.target.value, 10);
        fetchMatches(round);
    };

    const handleMatchSaved = () => {
        setSelectedMatchForEdit(null); 
        fetchMatches(selectedRound); 
    };

    // Функция за отваряне на модала
    const openModal = (match, editMode) => {
        setIsEditMode(editMode);
        setSelectedMatchForEdit(match);
    };

    if (isLoading) return <div className="text-center py-5 text-light opacity-50"><div className="spinner-border mb-2"></div><div>Loading fixtures...</div></div>;

    return (
        <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ backgroundColor: '#1e293b' }}>
            <div className="card-header bg-transparent border-bottom border-secondary py-3 d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold text-white text-uppercase">Fixtures & Results</h6>

                <div className="d-flex align-items-center gap-2">
                    <span className="text-light opacity-75 small fw-bold">Matchday:</span>
                    <select
                        className="form-select form-select-sm bg-dark text-white border-secondary shadow-none"
                        value={selectedRound || ''}
                        onChange={handleRoundChange}
                        style={{ width: '100px' }}
                    >
                        {matchesData.availableRounds && matchesData.availableRounds.length > 0 ? (
                            matchesData.availableRounds.map(r => (
                                <option key={r} value={r}>Round {r}</option>
                            ))
                        ) : (
                            <option value="">N/A</option>
                        )}
                    </select>
                </div>
            </div>

            <div className="card-body p-0">
                <div className="list-group list-group-flush">
                    {!matchesData.matches || matchesData.matches.length === 0 ? (
                        <div className="text-center py-5 text-light opacity-50">No matches found for this round.</div>
                    ) : (
                        matchesData.matches.map(match => {
                            const matchDate = new Date(match.matchDate);

                            return (
                                <div key={match.id} className="list-group-item bg-transparent border-bottom border-secondary py-4 d-flex flex-column flex-md-row justify-content-between align-items-center hover-bg-dark transition-all">

                                    <div className="text-light opacity-50 small text-center mb-2 mb-md-0" style={{ width: '100px' }}>
                                        <div className="fw-bold">{matchDate.toLocaleDateString()}</div>
                                        <div>{matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        {match.status === 'Finished' && <div className="badge bg-success mt-1">FT</div>}
                                    </div>

                                    <div className="flex-grow-1 d-flex justify-content-center align-items-center gap-2 gap-md-4 w-100">
                                        <div className="text-end fw-bold text-white fs-5" style={{ width: '35%' }}>{match.homeTeamName}</div>

                                        <div className="bg-dark border border-secondary rounded-pill px-4 py-2 d-flex justify-content-center align-items-center shadow-sm">
                                            <span className="fs-4 fw-bold text-white">{match.homeScore !== null ? match.homeScore : '-'}</span>
                                            <span className="mx-3 text-info fw-bold">:</span>
                                            <span className="fs-4 fw-bold text-white">{match.awayScore !== null ? match.awayScore : '-'}</span>
                                        </div>

                                        <div className="text-start fw-bold text-white fs-5" style={{ width: '35%' }}>{match.awayTeamName}</div>
                                    </div>

                                    {/* НОВО: ДВАТА БУТОНА */}
                                    <div className="d-flex gap-2 mt-3 mt-md-0">
                                        {/* Бутон за преглед (видим за всички) */}
                                        <button 
                                            onClick={() => openModal(match, false)} 
                                            className="btn btn-sm btn-outline-info border-0 shadow-none hover-scale"
                                            title="View Match Center"
                                        >
                                            <i className="bi bi-info-circle fs-5"></i>
                                        </button>

                                        {/* Бутон за редакция (видим САМО за Админи) */}
                                        {hasAdminAccess && (
                                            <button 
                                                onClick={() => openModal(match, true)} 
                                                className="btn btn-sm btn-outline-warning border-0 shadow-none hover-scale"
                                                title="Edit Match Stats"
                                            >
                                                <i className="bi bi-pencil-square fs-5"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {selectedMatchForEdit && (
                <MatchCardModal 
                    match={selectedMatchForEdit} 
                    canEdit={isEditMode} // Подаваме стейта isEditMode
                    onClose={() => setSelectedMatchForEdit(null)} 
                    onSave={handleMatchSaved} 
                />
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .hover-scale { transition: transform 0.1s ease; }
                .hover-scale:hover { transform: scale(1.2); }
                .hover-bg-dark:hover { background-color: #0f172a !important;}
            `}} />
        </div>
    );
}