import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PlayerProfileModal from '../../pages/PlayerProfileModal';

const API_URL = "https://localhost:44306/api";

export default function LeagueDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Основни Данни
    const [league, setLeague] = useState(null);
    const [teams, setTeams] = useState([]);
    const [leaguePlayers, setLeaguePlayers] = useState([]);
    const [standingsData, setStandingsData] = useState(null); 
    
    // Данни за Мачове
    const [matchesData, setMatchesData] = useState({ matches: [], availableRounds: [] });
    const [selectedRound, setSelectedRound] = useState(null);
    
    // State за Inline Editing (само за админи)
    const [editingMatchId, setEditingMatchId] = useState(null);
    const [editScores, setEditScores] = useState({ home: 0, away: 0 });

    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('standings'); 
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    // Права на потребителя
    const userRoles = JSON.parse(localStorage.getItem('userRoles') || "[]");
    const canEditMatches = userRoles.some(r => ['SuperAdmin', 'Admin', 'Moderator'].includes(r));

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const fetchLeague = fetch(`${API_URL}/Leagues/${id}`, { headers }).then(res => res.ok ? res.json() : Promise.reject());
        const fetchTeams = fetch(`${API_URL}/Teams?leagueId=${id}`, { headers }).then(res => res.json());
        const fetchPlayers = fetch(`${API_URL}/Players?leagueId=${id}`, { headers }).then(res => res.json());
        const fetchStandings = fetch(`${API_URL}/Leagues/${id}/standings`, { headers }).then(res => res.ok ? res.json() : null).catch(() => null); 

        Promise.all([fetchLeague, fetchTeams, fetchPlayers, fetchStandings])
            .then(([leagueData, teamsData, playersData, standingsResponse]) => {
                setLeague(leagueData);
                setTeams(teamsData);
                setLeaguePlayers(playersData);
                setStandingsData(standingsResponse);
                setIsLoading(false);
                
                // Извикваме мачовете едва след като знаем, че лигата съществува
                fetchMatches();
            })
            .catch(err => {
                console.error(err);
                alert("League not found.");
                navigate('/leagues');
            });
    }, [id, navigate]);

    // Функция за зареждане на мачове (поддържа филтър по кръг)
    const fetchMatches = async (roundToFetch = null) => {
        const token = localStorage.getItem('jwtToken');
        let url = `${API_URL}/Leagues/${id}/matches`;
        if (roundToFetch) url += `?round=${roundToFetch}`;

        try {
            const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) {
                const data = await res.json();
                setMatchesData(data);
                // Ако няма избран кръг (първо зареждане) и има налични кръгове, избираме първия
                if (!roundToFetch && data.availableRounds && data.availableRounds.length > 0) {
                    setSelectedRound(data.availableRounds[0]);
                } else if (roundToFetch) {
                    setSelectedRound(roundToFetch);
                }
            }
        } catch (err) {
            console.error("Error fetching matches", err);
        }
    };

    // Слушател: Когато цъкнем на друг кръг, дърпаме мачовете за него
    const handleRoundChange = (e) => {
        const round = parseInt(e.target.value, 10);
        fetchMatches(round);
    };

    const viewProfile = async (playerId) => {
        const token = localStorage.getItem('jwtToken');
        const res = await fetch(`${API_URL}/Players/${playerId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setSelectedPlayer(await res.json());
    };

    // INLINE EDITING LOGIC
    const startEditing = (match) => {
        setEditingMatchId(match.id);
        setEditScores({ home: match.homeScore || 0, away: match.awayScore || 0 });
    };

    const saveMatchResult = async (matchId) => {
        const token = localStorage.getItem('jwtToken');
        try {
            const res = await fetch(`${API_URL}/Leagues/${id}/matches/${matchId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ homeScore: editScores.home, awayScore: editScores.away, status: "Finished" })
            });

            if (res.ok) {
                setEditingMatchId(null);
                fetchMatches(selectedRound); // Презареждаме мачовете, за да видим новия резултат
            } else {
                alert("Failed to save match result.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (isLoading) return <div className="text-center p-5 text-light opacity-50">Loading league data...</div>;

    return (
        <div className="container-fluid px-0">
            <button onClick={() => navigate('/leagues')} className="btn btn-link text-decoration-none text-light opacity-75 mb-3 ps-0 hover-opacity-100 shadow-none">
                <i className="bi bi-arrow-left me-1"></i> Back to Leagues
            </button>

            {/* ХЕДЪР НА ЛИГАТА */}
            <div className="card shadow-sm border-0 rounded-4 mb-4" style={{ background: 'linear-gradient(45deg, #1e293b, #0f172a)' }}>
                <div className="card-body p-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h2 className="fw-bold mb-1 text-white">{league.name}</h2>
                        <div className="text-light opacity-75"><i className="bi bi-geo-alt-fill me-1 text-info"></i>{league.country}</div>
                    </div>
                    <div className="d-flex gap-4 border-start border-secondary ps-4 text-center">
                        <div>
                            <h3 className="fw-bold mb-0 text-info">{teams.length}</h3>
                            <div className="small text-light opacity-50 text-uppercase">Clubs</div>
                        </div>
                        <div>
                            <h3 className="fw-bold mb-0 text-info">{leaguePlayers.length}</h3>
                            <div className="small text-light opacity-50 text-uppercase">Players</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ТАБОВЕ ЗА НАВИГАЦИЯ */}
            <ul className="nav nav-pills mb-4 pb-2 border-bottom border-secondary">
                <li className="nav-item">
                    <button className={`nav-link fw-bold px-4 rounded-pill me-2 shadow-none ${activeTab === 'standings' ? 'bg-info text-dark' : 'text-light opacity-75'}`} onClick={() => setActiveTab('standings')}>
                        📋 Standings
                    </button>
                </li>
                {/* НОВИЯТ ТАБ МАЧОВЕ */}
                <li className="nav-item">
                    <button className={`nav-link fw-bold px-4 rounded-pill me-2 shadow-none ${activeTab === 'matches' ? 'bg-info text-dark' : 'text-light opacity-75'}`} onClick={() => setActiveTab('matches')}>
                        📅 Matches
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link fw-bold px-4 rounded-pill me-2 shadow-none ${activeTab === 'clubs' ? 'bg-info text-dark' : 'text-light opacity-75'}`} onClick={() => setActiveTab('clubs')}>
                        🛡️ Clubs
                    </button>
                </li>
                <li className="nav-item">
                    <button className={`nav-link fw-bold px-4 rounded-pill shadow-none ${activeTab === 'stats' ? 'bg-info text-dark' : 'text-light opacity-75'}`} onClick={() => setActiveTab('stats')}>
                        📊 Statistics
                    </button>
                </li>
            </ul>

            {/* РЕНДИРАНЕ СПОРЕД ИЗБРАНИЯ ТАБ */}

            {/* ТАБ 1: КЛАСИРАНЕ (STANDINGS) */}
            {activeTab === 'standings' && (
                <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ backgroundColor: '#1e293b' }}>
                    <div className="card-header bg-transparent border-bottom border-secondary py-3 d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 fw-bold text-white text-uppercase">League Table</h6>
                        {standingsData && <span className="badge bg-dark text-info border border-secondary shadow-none">Season: {standingsData.seasonName}</span>}
                    </div>
                    <div className="table-responsive">
                        <table className="table table-dark table-hover align-middle mb-0 bg-transparent text-center">
                            <thead className="small fw-bold text-light opacity-75 border-secondary">
                                <tr>
                                    <th className="px-4 py-3 text-start bg-transparent" style={{ width: '5%' }}>#</th>
                                    <th className="py-3 text-start bg-transparent" style={{ width: '35%' }}>Club</th>
                                    <th className="py-3 bg-transparent" title="Played">MP</th>
                                    <th className="py-3 bg-transparent" title="Wins">W</th>
                                    <th className="py-3 bg-transparent" title="Draws">D</th>
                                    <th className="py-3 bg-transparent" title="Losses">L</th>
                                    <th className="py-3 bg-transparent" title="Goals">G</th>
                                    <th className="py-3 bg-transparent" title="Goal Difference">GD</th>
                                    <th className="py-3 px-4 fs-6 text-white bg-transparent" title="Points">Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {!standingsData || !standingsData.standings || standingsData.standings.length === 0 ? (
                                    <tr><td colSpan="9" className="py-5 text-light opacity-50 bg-transparent">No active season or standings available.</td></tr>
                                ) : (
                                    standingsData.standings.map((row, index) => (
                                        <tr key={row.teamId}>
                                            <td className="px-4 text-start fw-bold text-muted bg-transparent border-secondary">{index + 1}</td>
                                            <td className="text-start bg-transparent border-secondary">
                                                <Link to={`/teams/${row.teamId}`} className="fw-bold text-white text-decoration-none d-flex align-items-center">
                                                    <div className="bg-primary rounded-circle d-flex justify-content-center align-items-center text-white me-2 shadow-sm" style={{ width: '25px', height: '25px', fontSize: '10px' }}>
                                                        {row.teamName.charAt(0)}
                                                    </div>
                                                    {row.teamName}
                                                </Link>
                                            </td>
                                            <td className="bg-transparent border-secondary">{row.matchesPlayed}</td>
                                            <td className="text-success bg-transparent border-secondary">{row.wins}</td>
                                            <td className="text-warning bg-transparent border-secondary">{row.draws}</td>
                                            <td className="text-danger bg-transparent border-secondary">{row.losses}</td>
                                            <td className="text-light opacity-75 bg-transparent border-secondary">{row.goalsFor}:{row.goalsAgainst}</td>
                                            <td className="fw-bold bg-transparent border-secondary">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                                            <td className="px-4 fs-5 fw-bold text-info bg-transparent border-secondary">{row.points}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* НОВ ТАБ 2: МАЧОВЕ (MATCHES & FIXTURES) */}
            {activeTab === 'matches' && (
                <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ backgroundColor: '#1e293b' }}>
                    <div className="card-header bg-transparent border-bottom border-secondary py-3 d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 fw-bold text-white text-uppercase">Fixtures & Results</h6>
                        
                        {/* Избор на Кръг */}
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
                                            
                                            {/* Дата и статус */}
                                            <div className="text-light opacity-50 small text-center" style={{ width: '100px' }}>
                                                <div className="fw-bold">{matchDate.toLocaleDateString()}</div>
                                                <div>{matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                {match.status === 'Finished' && <div className="badge bg-success mt-1">FT</div>}
                                            </div>

                                            {/* Отбори и Резултат (или Inline Editor) */}
                                            <div className="flex-grow-1 d-flex justify-content-center align-items-center gap-4">
                                                <div className="text-end fw-bold text-white fs-5" style={{ width: '35%' }}>{match.homeTeamName}</div>
                                                
                                                {isEditing ? (
                                                    <div className="d-flex gap-2 align-items-center">
                                                        <input 
                                                            type="number" min="0" className="form-control bg-dark text-white border-info text-center fw-bold fs-5 p-1 shadow-none" 
                                                            style={{ width: '50px' }}
                                                            value={editScores.home} onChange={e => setEditScores({ ...editScores, home: parseInt(e.target.value) || 0 })}
                                                        />
                                                        <span className="text-light">-</span>
                                                        <input 
                                                            type="number" min="0" className="form-control bg-dark text-white border-info text-center fw-bold fs-5 p-1 shadow-none" 
                                                            style={{ width: '50px' }}
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

                                            {/* Моливче за редакция (Само за Админи) */}
                                            <div style={{ width: '50px' }} className="text-end">
                                                {canEditMatches && !isEditing && (
                                                    <button onClick={() => startEditing(match)} className="btn btn-sm btn-outline-info border-0 shadow-none" title="Edit Result">
                                                        <i className="bi bi-pencil-square"></i>
                                                    </button>
                                                )}
                                            </div>

                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ТАБ 3: ОТБОРИ (CLUBS) */}
            {activeTab === 'clubs' && (
                <div className="row g-3">
                    {teams.length === 0 ? (
                        <div className="col-12 text-center p-5 rounded-4 shadow-sm text-light opacity-75" style={{ backgroundColor: '#1e293b' }}>No teams registered in this league yet.</div>
                    ) : (
                        teams.map(t => (
                            <div className="col-md-6 col-lg-4" key={t.id}>
                                <Link to={`/teams/${t.id}`} className="card h-100 shadow-sm border-0 rounded-4 text-decoration-none card-hover-effect" style={{ backgroundColor: '#1e293b' }}>
                                    <div className="card-body d-flex align-items-center">
                                        <div className="bg-primary rounded-circle d-flex justify-content-center align-items-center text-white me-3 fw-bold flex-shrink-0 shadow-sm" style={{ width: '50px', height: '50px' }}>
                                            {t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h6 className="fw-bold text-white mb-1">{t.name}</h6>
                                            <div className="small text-light opacity-50">{t.city ? <span><i className="bi bi-building me-1"></i>{t.city}</span> : 'Location unknown'}</div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ТАБ 4: СТАТИСТИКА (STATS) */}
            {activeTab === 'stats' && (
                <div className="card shadow-lg border-0 rounded-4 overflow-hidden" style={{ backgroundColor: '#1e293b' }}>
                    <div className="card-header bg-transparent border-bottom border-secondary py-3 d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 fw-bold text-white text-uppercase">League Top Performers</h6>
                    </div>
                    <div className="card-body">
                        {leaguePlayers.length === 0 ? (
                            <div className="text-center py-5 text-light opacity-50">No players found in this league.</div>
                        ) : (
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <h6 className="fw-bold text-white mb-3"><i className="bi bi-star-fill text-warning me-2"></i>Top Scorers</h6>
                                    <ul className="list-group list-group-flush bg-transparent">
                                        {leaguePlayers.slice(0, 5).map((p, index) => (
                                            <li key={`goal_${p.id}`} className="list-group-item bg-transparent px-0 py-3 d-flex justify-content-between align-items-center border-secondary">
                                                <div className="d-flex align-items-center cursor-pointer" onClick={() => viewProfile(p.id)}>
                                                    <span className="fw-bold text-light opacity-50 me-3" style={{ width: '20px' }}>{index + 1}.</span>
                                                    <div className="bg-dark rounded-circle d-flex justify-content-center align-items-center text-white me-3 fw-bold" style={{ width: '35px', height: '35px', fontSize: '12px' }}>
                                                        {p.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-white hover-info">{p.fullName}</div>
                                                        <div className="small text-light opacity-50">{p.teamName}</div>
                                                    </div>
                                                </div>
                                                <div className="fw-bold fs-5 text-success">{p.totalGoals} ⚽</div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="col-md-6">
                                    <h6 className="fw-bold text-white mb-3"><i className="bi bi-lightning-fill text-info me-2"></i>Top Assists</h6>
                                    <ul className="list-group list-group-flush bg-transparent">
                                        {[...leaguePlayers].sort((a, b) => b.totalAssists - a.totalAssists).slice(0, 5).map((p, index) => (
                                            <li key={`assist_${p.id}`} className="list-group-item bg-transparent px-0 py-3 d-flex justify-content-between align-items-center border-secondary">
                                                <div className="d-flex align-items-center cursor-pointer" onClick={() => viewProfile(p.id)}>
                                                    <span className="fw-bold text-light opacity-50 me-3" style={{ width: '20px' }}>{index + 1}.</span>
                                                    <div className="bg-dark rounded-circle d-flex justify-content-center align-items-center text-white me-3 fw-bold" style={{ width: '35px', height: '35px', fontSize: '12px' }}>
                                                        {p.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-white hover-info">{p.fullName}</div>
                                                        <div className="small text-light opacity-50">{p.teamName}</div>
                                                    </div>
                                                </div>
                                                <div className="fw-bold fs-5 text-info">{p.totalAssists} 🤝</div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="col-12 mt-4 text-center">
                                    <button onClick={() => navigate(`/players?leagueId=${id}`)} className="btn btn-info text-dark px-5 py-2 fw-bold rounded-pill shadow-none">
                                        View All Player Statistics <i className="bi bi-arrow-right ms-2"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {selectedPlayer && <PlayerProfileModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}
            
            <style dangerouslySetInnerHTML={{__html: `
                .card-hover-effect { transition: transform 0.2s ease, box-shadow 0.2s ease; }
                .card-hover-effect:hover { transform: translateY(-3px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.3)!important; }
                .cursor-pointer { cursor: pointer; }
                .hover-info:hover { color: #0dcaf0 !important; transition: color 0.2s; }
                
                /* Премахваме гадните outline-и при клик върху input/select в Dark Mode */
                .form-control:focus, .form-select:focus { box-shadow: 0 0 0 0.25rem rgba(13, 202, 240, 0.25); border-color: #0dcaf0; }
            `}} />
        </div>
    );
}