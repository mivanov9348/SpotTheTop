import React, { useState, useEffect } from 'react';
import MatchCardModal from '../matches/MatchCardModal'; 

const API_URL = "https://localhost:44306/api";

export default function LeagueMatchesTab({ leagueId, canEditMatches }) {
    const [matchesData, setMatchesData] = useState({ matches: [], availableRounds: [] });
    const [selectedRound, setSelectedRound] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Стейт за избрания мач, който ще се редактира в модала
    const [selectedMatchForEdit, setSelectedMatchForEdit] = useState(null);

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

    // Тази функция се вика от модала, когато запишем успешно резултата
    const handleMatchSaved = () => {
        setSelectedMatchForEdit(null); // Затваря модала
        fetchMatches(selectedRound); // Презарежда мачовете
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
                                <div key={match.id} className="list-group-item bg-transparent border-bottom border-secondary py-4 d-flex justify-content-between align-items-center">

                                    {/* ДАТА И ЧАС */}
                                    <div className="text-light opacity-50 small text-center" style={{ width: '100px' }}>
                                        <div className="fw-bold">{matchDate.toLocaleDateString()}</div>
                                        <div>{matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        {match.status === 'Finished' && <div className="badge bg-success mt-1">FT</div>}
                                    </div>

                                    {/* ОТБОРИ И РЕЗУЛТАТ */}
                                    <div className="flex-grow-1 d-flex justify-content-center align-items-center gap-4">
                                        <div className="text-end fw-bold text-white fs-5" style={{ width: '35%' }}>{match.homeTeamName}</div>

                                        {/* ПОКАЗВАНЕ НА РЕЗУЛТАТА (или тирета, ако не е игран) */}
                                        <div className="bg-dark border border-secondary rounded-pill px-4 py-2 d-flex justify-content-center align-items-center shadow-sm">
                                            <span className="fs-4 fw-bold text-white">{match.homeScore !== null ? match.homeScore : '-'}</span>
                                            <span className="mx-3 text-info fw-bold">:</span>
                                            <span className="fs-4 fw-bold text-white">{match.awayScore !== null ? match.awayScore : '-'}</span>
                                        </div>

                                        <div className="text-start fw-bold text-white fs-5" style={{ width: '35%' }}>{match.awayTeamName}</div>
                                    </div>

                                    {/* БУТОН РЕДАКЦИЯ (ОТВАРЯ МОДАЛА) */}
                                    <div style={{ width: '50px' }} className="text-end flex-shrink-0">
                                        {canEditMatches && (
                                            <button 
                                                onClick={() => setSelectedMatchForEdit(match)} 
                                                className="btn btn-sm btn-outline-info border-0 shadow-none hover-scale" 
                                                title="Match Center & Stats"
                                            >
                                                <i className="bi bi-file-earmark-bar-graph fs-5"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Рендиране на модала, ако има избран мач */}
            {selectedMatchForEdit && (
                <MatchCardModal 
                    match={selectedMatchForEdit} 
                    onClose={() => setSelectedMatchForEdit(null)} 
                    onSave={handleMatchSaved} 
                />
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .hover-scale { transition: transform 0.1s ease; }
                .hover-scale:hover { transform: scale(1.1); color: #fff !important; }
            `}} />
        </div>
    );
}