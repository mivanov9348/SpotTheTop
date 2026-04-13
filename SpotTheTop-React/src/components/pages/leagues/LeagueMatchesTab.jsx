import React, { useState, useEffect } from 'react';

const API_URL = "https://localhost:44306/api";

export default function LeagueMatchesTab({ leagueId, canEditMatches }) {
    const [matchesData, setMatchesData] = useState({ matches: [], availableRounds: [] });
    const [selectedRound, setSelectedRound] = useState(null);
    const [editingMatchId, setEditingMatchId] = useState(null);
    const [editScores, setEditScores] = useState({ home: 0, away: 0 });
    const [isLoading, setIsLoading] = useState(true);

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

    const startEditing = (match) => {
        setEditingMatchId(match.id);
        setEditScores({ home: match.homeScore || 0, away: match.awayScore || 0 });
    };

    const saveMatchResult = async (matchId) => {
        const token = localStorage.getItem('jwtToken');
        try {
            const res = await fetch(`${API_URL}/Matches/${matchId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ homeScore: editScores.home, awayScore: editScores.away, status: "Finished" })
            });

            if (res.ok) {
                setEditingMatchId(null);
                fetchMatches(selectedRound); // Презареждаме
            } else {
                alert("Failed to save match result.");
            }
        } catch (err) {
            console.error(err);
        }
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
                            const isEditing = editingMatchId === match.id;

                            return (
                                <div key={match.id} className="list-group-item bg-transparent border-bottom border-secondary py-4 d-flex justify-content-between align-items-center">

                                    {/* ДАТА */}
                                    <div className="text-light opacity-50 small text-center" style={{ width: '100px' }}>
                                        <div className="fw-bold">{matchDate.toLocaleDateString()}</div>
                                        <div>{matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        {match.status === 'Finished' && <div className="badge bg-success mt-1">FT</div>}
                                    </div>

                                    {/* ОТБОРИ И РЕЗУЛТАТ */}
                                    <div className="flex-grow-1 d-flex justify-content-center align-items-center gap-4">
                                        <div className="text-end fw-bold text-white fs-5" style={{ width: '35%' }}>{match.homeTeamName}</div>

                                        {isEditing ? (
                                            <div className="d-flex gap-2 align-items-center">
                                                <input
                                                    type="number" min="0" className="form-control bg-dark text-white border-info text-center fw-bold fs-5 p-1 shadow-none" style={{ width: '60px' }}
                                                    value={editScores.home} onChange={e => setEditScores({ ...editScores, home: parseInt(e.target.value) || 0 })}
                                                />
                                                <span className="text-light">-</span>
                                                <input
                                                    type="number" min="0" className="form-control bg-dark text-white border-info text-center fw-bold fs-5 p-1 shadow-none" style={{ width: '60px' }}
                                                    value={editScores.away} onChange={e => setEditScores({ ...editScores, away: parseInt(e.target.value) || 0 })}
                                                />
                                                <button onClick={() => saveMatchResult(match.id)} className="btn btn-sm btn-success ms-2 rounded-circle shadow-none" title="Save">
                                                    <i className="bi bi-check-lg"></i>
                                                </button>
                                                <button onClick={() => setEditingMatchId(null)} className="btn btn-sm btn-danger rounded-circle shadow-none" title="Cancel">
                                                    <i className="bi bi-x-lg"></i>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="bg-dark border border-secondary rounded-pill px-4 py-2 d-flex justify-content-center align-items-center shadow-sm">
                                                <span className="fs-4 fw-bold text-white">{match.homeScore !== null ? match.homeScore : '-'}</span>
                                                <span className="mx-3 text-info fw-bold">:</span>
                                                <span className="fs-4 fw-bold text-white">{match.awayScore !== null ? match.awayScore : '-'}</span>
                                            </div>
                                        )}

                                        <div className="text-start fw-bold text-white fs-5" style={{ width: '35%' }}>{match.awayTeamName}</div>
                                    </div>

                                    {/* БУТОН РЕДАКЦИЯ */}
                                    {/* БУТОН РЕДАКЦИЯ (Брониран срещу смачкване) */}
                                    <div style={{ width: '50px' }} className="text-end flex-shrink-0">
                                        {canEditMatches && !isEditing && (
                                            <button onClick={() => startEditing(match)} className="btn btn-sm btn-outline-info border-0 shadow-none hover-scale" title="Edit Result">
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
            <style dangerouslySetInnerHTML={{
                __html: `
                .hover-scale { transition: transform 0.1s ease; }
                .hover-scale:hover { transform: scale(1.1); color: #fff !important; }
            `}} />
        </div>
    );
}