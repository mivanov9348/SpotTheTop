import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = "https://localhost:44306/api";

export default function Home() {
    const [statsData, setStatsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch(`${API_URL}/Stats/dashboard`);
                if (res.ok) {
                    const data = await res.json();
                    setStatsData(data);
                }
            } catch (err) {
                console.error("Error loading dashboard data", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '60vh' }}>
                <div className="spinner-border text-info mb-3" style={{ width: '3rem', height: '3rem' }}></div>
                <div className="text-light opacity-50 fw-bold tracking-wider text-uppercase">Loading global stats...</div>
            </div>
        );
    }

    return (
        <div className="container-fluid px-0">
            
            {/* HERO SECTION */}
            <div className="card border-0 rounded-4 overflow-hidden mb-4 shadow-lg position-relative" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'radial-gradient(circle at top right, rgba(56, 189, 248, 0.15), transparent 60%)' }}></div>
                <div className="card-body p-4 p-md-5 position-relative z-1 d-flex flex-column flex-lg-row justify-content-between align-items-center gap-4">
                    <div>
                        <h1 className="fw-bolder text-white mb-2" style={{ letterSpacing: '-1px' }}>Welcome to SpotTheTop <span className="text-info">HQ</span></h1>
                        <p className="fs-5 text-light opacity-75 mb-0">The ultimate database for football statistics, scouting, and community discussions.</p>
                    </div>
                    <div className="d-flex gap-3">
                        <Link to="/matches" className="btn btn-info text-dark fw-bold rounded-pill px-4 shadow hover-scale">Live Matches</Link>
                        <Link to="/players" className="btn btn-outline-light rounded-pill px-4 fw-bold hover-scale">Find Players</Link>
                    </div>
                </div>
            </div>

            {/* ОБЩА СТАТИСТИКА (БРОЯЧИ) - ПОПРАВЕНИ ЦВЕТОВЕ */}
            <div className="row g-3 mb-4">
                <div className="col-6 col-md-3">
                    <div className="card bg-dark border-secondary rounded-4 text-center p-3 p-lg-4 shadow-sm hover-bg-dark transition-all h-100">
                        <i className="bi bi-people-fill fs-2 text-info mb-2 opacity-75"></i>
                        <h2 className="fw-bold text-white mb-1">{statsData?.platformStats.totalPlayers || 0}</h2>
                        {/* Използвам text-light opacity-75 вместо text-muted за по-добър контраст */}
                        <div className="small text-light opacity-75 text-uppercase fw-bold tracking-wider">Players</div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card bg-dark border-secondary rounded-4 text-center p-3 p-lg-4 shadow-sm hover-bg-dark transition-all h-100">
                        <i className="bi bi-shield-fill fs-2 text-success mb-2 opacity-75"></i>
                        <h2 className="fw-bold text-white mb-1">{statsData?.platformStats.totalTeams || 0}</h2>
                        <div className="small text-light opacity-75 text-uppercase fw-bold tracking-wider">Clubs</div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card bg-dark border-secondary rounded-4 text-center p-3 p-lg-4 shadow-sm hover-bg-dark transition-all h-100">
                        <i className="bi bi-trophy-fill fs-2 text-warning mb-2 opacity-75"></i>
                        <h2 className="fw-bold text-white mb-1">{statsData?.platformStats.totalLeagues || 0}</h2>
                        <div className="small text-light opacity-75 text-uppercase fw-bold tracking-wider">Competitions</div>
                    </div>
                </div>
                <div className="col-6 col-md-3">
                    <div className="card bg-dark border-secondary rounded-4 text-center p-3 p-lg-4 shadow-sm hover-bg-dark transition-all h-100">
                        <i className="bi bi-stopwatch-fill fs-2 text-danger mb-2 opacity-75"></i>
                        <h2 className="fw-bold text-white mb-1">{statsData?.platformStats.totalMatchesPlayed || 0}</h2>
                        <div className="small text-light opacity-75 text-uppercase fw-bold tracking-wider">Matches Played</div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                
                {/* ЛЯВА КОЛОНА: МАЧОВЕ (Последни + Предстоящи) */}
                <div className="col-lg-7 d-flex flex-column gap-4">
                    
                    {/* Последни Резултати */}
                    <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold text-white mb-0"><i className="bi bi-check-circle-fill text-success me-2"></i>Recent Results</h5>
                            <Link to="/matches" className="btn btn-sm btn-link text-info text-decoration-none shadow-none">View All</Link>
                        </div>

                        <div className="card shadow-sm border-0 rounded-4 overflow-hidden" style={{ backgroundColor: '#1e293b' }}>
                            <div className="list-group list-group-flush">
                                {statsData?.recentMatches && statsData.recentMatches.length > 0 ? (
                                    statsData.recentMatches.map((match) => (
                                        <div key={`recent-${match.id}`} className="list-group-item bg-transparent border-bottom border-secondary py-3 px-4 d-flex justify-content-between align-items-center hover-bg-dark transition-all">
                                            
                                            <div className="text-center" style={{ width: '80px' }}>
                                                <div className="small text-info fw-bold text-truncate" title={match.leagueName}>{match.leagueName}</div>
                                                <div className="text-light opacity-50" style={{ fontSize: '0.7rem' }}>{formatDate(match.matchDate)}</div>
                                            </div>

                                            <div className="flex-grow-1 d-flex justify-content-center align-items-center gap-3 px-2">
                                                <div className="text-end fw-bold text-white text-truncate" style={{ flex: 1, fontSize: '0.95rem' }}>{match.homeTeam}</div>
                                                
                                                <div className="bg-dark border border-secondary rounded px-3 py-1 d-flex justify-content-center align-items-center shadow-sm">
                                                    <span className="fs-5 fw-bold text-white">{match.homeScore}</span>
                                                    <span className="mx-2 text-light opacity-50">-</span>
                                                    <span className="fs-5 fw-bold text-white">{match.awayScore}</span>
                                                </div>

                                                <div className="text-start fw-bold text-white text-truncate" style={{ flex: 1, fontSize: '0.95rem' }}>{match.awayTeam}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-light opacity-50 small">No recent matches found.</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Предстоящи Мачове (НОВО) */}
                    <div>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="fw-bold text-white mb-0"><i className="bi bi-calendar-event-fill text-warning me-2"></i>Upcoming Fixtures</h5>
                        </div>

                        <div className="card shadow-sm border-0 rounded-4 overflow-hidden" style={{ backgroundColor: '#1e293b' }}>
                            <div className="list-group list-group-flush">
                                {statsData?.upcomingMatches && statsData.upcomingMatches.length > 0 ? (
                                    statsData.upcomingMatches.map((match) => (
                                        <div key={`upcoming-${match.id}`} className="list-group-item bg-transparent border-bottom border-secondary py-3 px-4 d-flex justify-content-between align-items-center hover-bg-dark transition-all">
                                            
                                            <div className="text-center" style={{ width: '80px' }}>
                                                <div className="small text-warning fw-bold text-truncate" title={match.leagueName}>{match.leagueName}</div>
                                                <div className="text-light opacity-50" style={{ fontSize: '0.7rem' }}>{formatDate(match.matchDate)}</div>
                                            </div>

                                            <div className="flex-grow-1 d-flex justify-content-center align-items-center gap-3 px-2">
                                                <div className="text-end fw-bold text-white text-truncate" style={{ flex: 1, fontSize: '0.95rem' }}>{match.homeTeam}</div>
                                                
                                                <div className="bg-dark border border-secondary rounded px-3 py-1 d-flex justify-content-center align-items-center shadow-sm">
                                                    <span className="fs-6 fw-bold text-light opacity-75 px-1">vs</span>
                                                </div>

                                                <div className="text-start fw-bold text-white text-truncate" style={{ flex: 1, fontSize: '0.95rem' }}>{match.awayTeam}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4 text-light opacity-50 small">No upcoming fixtures scheduled.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ДЯСНА КОЛОНА: ТОП ГОЛМАЙСТОРИ */}
                <div className="col-lg-5">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold text-white mb-0"><i className="bi bi-star-fill text-warning me-2"></i>Top Scorers</h5>
                        <Link to="/players" className="btn btn-sm btn-link text-info text-decoration-none shadow-none">View Players</Link>
                    </div>

                    <div className="card shadow-sm border-0 rounded-4 overflow-hidden p-2" style={{ backgroundColor: '#1e293b' }}>
                        {statsData?.topScorers && statsData.topScorers.length > 0 ? (
                            statsData.topScorers.map((scorer, index) => (
                                <Link to={`/players/${scorer.playerId}`} key={`scorer-${scorer.playerId}`} className="d-flex align-items-center p-3 text-decoration-none hover-bg-dark rounded-4 transition-all">
                                    {/* Медал за Топ 3 */}
                                    <div className="fw-bold fs-4 me-3 text-center" style={{ width: '30px' }}>
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : <span className="text-light opacity-50 fs-5">{index + 1}</span>}
                                    </div>
                                    
                                    {/* Аватар */}
                                    <div className="rounded-circle overflow-hidden bg-dark d-flex justify-content-center align-items-center me-3 border border-secondary" style={{ width: '45px', height: '45px', flexShrink: 0 }}>
                                        {scorer.imageUrl ? (
                                            <img src={scorer.imageUrl} alt="Player" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                                        ) : (
                                            <i className="bi bi-person-fill text-light opacity-50 fs-4"></i>
                                        )}
                                    </div>

                                    {/* Име и Отбор */}
                                    <div className="flex-grow-1">
                                        <div className="fw-bold text-white lh-sm mb-1">{scorer.name}</div>
                                        {/* Сменен цвят от text-info opacity-75 на text-light opacity-75 за по-чист вид */}
                                        <div className="text-light opacity-75 small text-truncate" style={{ maxWidth: '150px' }}>{scorer.team}</div>
                                    </div>

                                    {/* Голове */}
                                    <div className="text-end">
                                        <div className="fs-4 fw-bolder text-white lh-1">{scorer.totalGoals}</div>
                                        <div className="text-info opacity-75" style={{ fontSize: '0.65rem' }}>in {scorer.matchesPlayed} matches</div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-4 text-light opacity-50 small">No goals recorded yet.</div>
                        )}
                    </div>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .hover-scale { transition: transform 0.2s ease, box-shadow 0.2s ease; }
                .hover-scale:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(56, 189, 248, 0.3) !important; }
                .hover-bg-dark:hover { background-color: #0f172a !important; cursor: pointer; }
                .transition-all { transition: all 0.2s ease; }
                .tracking-wider { letter-spacing: 0.05em; }
            `}} />
        </div>
    );
}