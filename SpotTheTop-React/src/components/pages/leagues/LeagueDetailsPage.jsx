import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PlayerProfileModal from '../../PlayerProfileModal';

const API_URL = "https://localhost:44306/api";

export default function LeagueDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Данни
    const [league, setLeague] = useState(null);
    const [teams, setTeams] = useState([]);
    const [leaguePlayers, setLeaguePlayers] = useState([]);
    const [standingsData, setStandingsData] = useState(null); 
    
    const [isLoading, setIsLoading] = useState(true);

    // UI Стейтове
    const [activeTab, setActiveTab] = useState('standings'); 
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const fetchLeague = fetch(`${API_URL}/Leagues/${id}`, { headers }).then(res => res.ok ? res.json() : Promise.reject());
        const fetchTeams = fetch(`${API_URL}/Teams?leagueId=${id}`, { headers }).then(res => res.json());
        const fetchPlayers = fetch(`${API_URL}/Players?leagueId=${id}`, { headers }).then(res => res.json());
        
        const fetchStandings = fetch(`${API_URL}/Leagues/${id}/standings`, { headers })
            .then(res => res.ok ? res.json() : null)
            .catch(() => null); 

        Promise.all([fetchLeague, fetchTeams, fetchPlayers, fetchStandings])
            .then(([leagueData, teamsData, playersData, standingsResponse]) => {
                setLeague(leagueData);
                setTeams(teamsData);
                setLeaguePlayers(playersData);
                setStandingsData(standingsResponse);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                alert("League not found.");
                navigate('/leagues');
            });
    }, [id, navigate]);

    const viewProfile = async (playerId) => {
        const token = localStorage.getItem('jwtToken');
        const res = await fetch(`${API_URL}/Players/${playerId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setSelectedPlayer(await res.json());
    };

    if (isLoading) return <div className="text-center p-5 text-muted">Loading league data...</div>;

    return (
        <div>
            {/* БУТОН НАЗАД */}
            <button onClick={() => navigate('/leagues')} className="btn btn-link text-decoration-none text-muted mb-3 ps-0">
                <i className="bi bi-arrow-left me-1"></i> Back to Leagues
            </button>

            {/* ХЕДЪР НА ЛИГАТА */}
            <div className="card shadow-sm border-0 rounded-4 mb-4 bg-primary text-white" style={{ backgroundImage: 'linear-gradient(45deg, #0d6efd, #0dcaf0)' }}>
                <div className="card-body p-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h2 className="fw-bold mb-1 text-shadow">{league.name}</h2>
                        <div className="opacity-75"><i className="bi bi-geo-alt-fill me-1"></i>{league.country}</div>
                    </div>
                    <div className="d-flex gap-4 border-start border-light border-opacity-25 ps-4 text-center">
                        <div>
                            <h3 className="fw-bold mb-0">{teams.length}</h3>
                            <div className="small opacity-75 text-uppercase">Clubs</div>
                        </div>
                        <div>
                            <h3 className="fw-bold mb-0">{leaguePlayers.length}</h3>
                            <div className="small opacity-75 text-uppercase">Players</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ТАБОВЕ ЗА НАВИГАЦИЯ */}
            <ul className="nav nav-pills mb-4 pb-2 border-bottom">
                <li className="nav-item">
                    <button 
                        className={`nav-link fw-bold px-4 rounded-pill me-2 ${activeTab === 'standings' ? 'active shadow-sm' : 'text-dark'}`} 
                        onClick={() => setActiveTab('standings')}
                    >
                        📋 Standings
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link fw-bold px-4 rounded-pill me-2 ${activeTab === 'clubs' ? 'active shadow-sm' : 'text-dark'}`} 
                        onClick={() => setActiveTab('clubs')}
                    >
                        🛡️ Clubs
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link fw-bold px-4 rounded-pill ${activeTab === 'stats' ? 'active bg-warning text-dark shadow-sm' : 'text-dark'}`} 
                        onClick={() => setActiveTab('stats')}
                    >
                        📊 Statistics
                    </button>
                </li>
            </ul>

            {/* РЕНДИРАНЕ СПОРЕД ИЗБРАНИЯ ТАБ */}
            
            {/* ТАБ 1: КЛАСИРАНЕ (STANDINGS) */}
            {activeTab === 'standings' && (
                <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white">
                    <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 fw-bold text-dark text-uppercase">League Table</h6>
                        {standingsData && <span className="badge bg-light text-primary border border-primary">Season: {standingsData.seasonName}</span>}
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light small fw-bold text-muted text-center">
                                <tr>
                                    <th className="px-4 py-3 text-start" style={{ width: '5%' }}>#</th>
                                    <th className="py-3 text-start" style={{ width: '35%' }}>Club</th>
                                    <th className="py-3" title="Played">MP</th>
                                    <th className="py-3" title="Wins">W</th>
                                    <th className="py-3" title="Draws">D</th>
                                    <th className="py-3" title="Losses">L</th>
                                    <th className="py-3" title="Goals">G</th>
                                    <th className="py-3" title="Goal Difference">GD</th>
                                    <th className="py-3 px-4 fs-6 text-dark" title="Points">Pts</th>
                                </tr>
                            </thead>
                            <tbody className="text-center">
                                {!standingsData || !standingsData.standings || standingsData.standings.length === 0 ? (
                                    <tr><td colSpan="9" className="py-5 text-muted">No active season or standings available.</td></tr>
                                ) : (
                                    standingsData.standings.map((row, index) => (
                                        <tr key={row.teamId}>
                                            <td className="px-4 text-start fw-bold text-muted">{index + 1}</td>
                                            <td className="text-start">
                                                <Link to={`/teams/${row.teamId}`} className="fw-bold text-dark text-decoration-none d-flex align-items-center">
                                                    <div className="bg-success rounded-circle d-flex justify-content-center align-items-center text-white me-2" style={{ width: '25px', height: '25px', fontSize: '10px' }}>
                                                        {row.teamName.charAt(0)}
                                                    </div>
                                                    {row.teamName}
                                                </Link>
                                            </td>
                                            <td>{row.matchesPlayed}</td>
                                            <td className="text-success">{row.wins}</td>
                                            <td className="text-warning">{row.draws}</td>
                                            <td className="text-danger">{row.losses}</td>
                                            <td className="text-muted">{row.goalsFor}:{row.goalsAgainst}</td>
                                            <td className="fw-bold">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                                            <td className="px-4 fs-5 fw-bold text-primary">{row.points}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ТАБ 2: ОТБОРИ (CLUBS) */}
            {activeTab === 'clubs' && (
                <div className="row g-3">
                    {teams.length === 0 ? (
                        <div className="col-12 text-center text-muted p-5 bg-white rounded-4 shadow-sm">No teams registered in this league yet.</div>
                    ) : (
                        teams.map(t => (
                            <div className="col-md-6 col-lg-4" key={t.id}>
                                <Link to={`/teams/${t.id}`} className="card h-100 shadow-sm border-0 rounded-4 text-decoration-none card-hover-effect">
                                    <div className="card-body d-flex align-items-center">
                                        <div className="bg-success rounded-circle d-flex justify-content-center align-items-center text-white me-3 fw-bold flex-shrink-0" style={{ width: '50px', height: '50px' }}>
                                            {t.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h6 className="fw-bold text-dark mb-1">{t.name}</h6>
                                            <div className="small text-muted">{t.city ? <span><i className="bi bi-building me-1"></i>{t.city}</span> : 'Location unknown'}</div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ТАБ 3: СТАТИСТИКА (STATS) */}
            {activeTab === 'stats' && (
                <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white">
                    <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 fw-bold text-muted text-uppercase">League Top Performers</h6>
                    </div>
                    <div className="card-body">
                        {leaguePlayers.length === 0 ? (
                            <div className="text-center py-5 text-muted">No players found in this league.</div>
                        ) : (
                            <div className="row g-4">
                                {/* ТОП ГОЛМАЙСТОРИ */}
                                <div className="col-md-6">
                                    <h6 className="fw-bold text-dark mb-3"><i className="bi bi-star-fill text-warning me-2"></i>Top Scorers</h6>
                                    <ul className="list-group list-group-flush">
                                        {/* Бекендът вече ги връща сортирани по голове */}
                                        {leaguePlayers.slice(0, 5).map((p, index) => (
                                            <li key={`goal_${p.id}`} className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center border-0 border-bottom">
                                                <div className="d-flex align-items-center cursor-pointer" onClick={() => viewProfile(p.id)}>
                                                    <span className="fw-bold text-muted me-3" style={{ width: '20px' }}>{index + 1}.</span>
                                                    <div className="bg-dark rounded-circle d-flex justify-content-center align-items-center text-white me-3 fw-bold" style={{ width: '35px', height: '35px', fontSize: '12px' }}>
                                                        {p.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark hover-primary">{p.fullName}</div>
                                                        <div className="small text-muted">{p.teamName}</div>
                                                    </div>
                                                </div>
                                                <div className="fw-bold fs-5 text-success">{p.totalGoals} ⚽</div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* ТОП АСИСТЕНТИ */}
                                <div className="col-md-6">
                                    <h6 className="fw-bold text-dark mb-3"><i className="bi bi-lightning-fill text-info me-2"></i>Top Assists</h6>
                                    <ul className="list-group list-group-flush">
                                        {/* Сортираме копие на масива по асистенции за този списък */}
                                        {[...leaguePlayers].sort((a, b) => b.totalAssists - a.totalAssists).slice(0, 5).map((p, index) => (
                                            <li key={`assist_${p.id}`} className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center border-0 border-bottom">
                                                <div className="d-flex align-items-center cursor-pointer" onClick={() => viewProfile(p.id)}>
                                                    <span className="fw-bold text-muted me-3" style={{ width: '20px' }}>{index + 1}.</span>
                                                    <div className="bg-dark rounded-circle d-flex justify-content-center align-items-center text-white me-3 fw-bold" style={{ width: '35px', height: '35px', fontSize: '12px' }}>
                                                        {p.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark hover-primary">{p.fullName}</div>
                                                        <div className="small text-muted">{p.teamName}</div>
                                                    </div>
                                                </div>
                                                <div className="fw-bold fs-5 text-info">{p.totalAssists} 🤝</div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="col-12 mt-4 text-center">
                                    {/* БУТОН КЪМ ГЛОБАЛНАТА ТЪРСАЧКА */}
                                    <button 
                                        onClick={() => navigate(`/players?leagueId=${id}`)} 
                                        className="btn btn-dark px-5 py-2 fw-bold rounded-pill shadow-sm"
                                    >
                                        View All Player Statistics <i className="bi bi-arrow-right ms-2"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* МОДАЛ ЗА ПРОФИЛА */}
            {selectedPlayer && <PlayerProfileModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}
            
            {/* CSS ЗА КАРТИТЕ */}
            <style dangerouslySetInnerHTML={{__html: `
                .card-hover-effect { transition: transform 0.2s ease, box-shadow 0.2s ease; }
                .card-hover-effect:hover { transform: translateY(-3px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; }
                .text-shadow { text-shadow: 1px 1px 3px rgba(0,0,0,0.3); }
                .cursor-pointer { cursor: pointer; }
                .hover-primary:hover { color: #0d6efd !important; }
            `}} />
        </div>
    );
}