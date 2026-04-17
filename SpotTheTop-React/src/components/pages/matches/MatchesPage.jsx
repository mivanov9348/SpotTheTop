import React, { useState, useEffect } from 'react';
import MatchCardModal from './MatchCardModal'; 

const API_URL = "https://localhost:44306/api";

export default function MatchesPage() {
    const getLocalDateString = (dateObj) => {
        return dateObj.getFullYear() + '-' + 
            String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + 
            String(dateObj.getDate()).padStart(2, '0');
    };

    const [selectedDate, setSelectedDate] = useState(getLocalDateString(new Date()));
    const [groupedMatches, setGroupedMatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Стейтове за модала
    const [selectedMatchForEdit, setSelectedMatchForEdit] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false); // НОВО: Режим на модала

    const userRoles = JSON.parse(localStorage.getItem('userRoles') || "[]");
    const hasAdminAccess = userRoles.some(r => ['SuperAdmin', 'Admin', 'Moderator'].includes(r));

    const fetchMatchesForDate = async (dateStr) => {
        setIsLoading(true);
        const token = localStorage.getItem('jwtToken');
        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            const leaguesRes = await fetch(`${API_URL}/Leagues`, { headers });
            const leagues = await leaguesRes.json();

            const matchPromises = leagues.map(l => 
                fetch(`${API_URL}/Matches?leagueId=${l.id}`, { headers })
                    .then(res => res.ok ? res.json() : null)
                    .then(data => ({ league: l, data }))
            );

            const results = await Promise.all(matchPromises);

            const grouped = [];
            results.forEach(result => {
                if (result.data && result.data.matches) {
                    const dayMatches = result.data.matches.filter(m => {
                        const mDate = new Date(m.matchDate);
                        return getLocalDateString(mDate) === dateStr;
                    });

                    if (dayMatches.length > 0) {
                        grouped.push({
                            league: result.league,
                            matches: dayMatches
                        });
                    }
                }
            });

            setGroupedMatches(grouped);
        } catch (err) {
            console.error("Error loading daily matches", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMatchesForDate(selectedDate);
    }, [selectedDate]);

    const handleDateChange = (daysOffset) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + daysOffset);
        setSelectedDate(getLocalDateString(d));
    };

    const handleMatchSaved = () => {
        setSelectedMatchForEdit(null);
        fetchMatchesForDate(selectedDate);
    };

    // Функция за отваряне на модала
    const openModal = (match, editMode) => {
        setIsEditMode(editMode);
        setSelectedMatchForEdit(match);
    };

    const displayDate = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="container-fluid px-0">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 border-bottom border-secondary pb-3">
                <div className="mb-3 mb-md-0">
                    <h2 className="fw-bold text-white mb-1">📅 Match Center</h2>
                    <p className="text-light opacity-75 mb-0">Live scores, results, and fixtures.</p>
                </div>
                
                <div className="d-flex align-items-center gap-2 bg-dark p-2 rounded-pill border border-secondary shadow-sm">
                    <button onClick={() => handleDateChange(-1)} className="btn btn-sm btn-dark text-info rounded-pill px-3 shadow-none">
                        <i className="bi bi-chevron-left"></i> Prev
                    </button>
                    
                    <input 
                        type="date" 
                        className="form-control form-control-sm bg-transparent text-white border-0 text-center fw-bold shadow-none" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ width: '140px', cursor: 'pointer' }}
                    />
                    
                    <button onClick={() => handleDateChange(1)} className="btn btn-sm btn-dark text-info rounded-pill px-3 shadow-none">
                        Next <i className="bi bi-chevron-right"></i>
                    </button>
                </div>
            </div>

            <h5 className="text-center text-light opacity-75 mb-4 fw-bold">{displayDate}</h5>

            {isLoading ? (
                <div className="text-center py-5 text-light opacity-50">
                    <div className="spinner-border mb-3"></div>
                    <div>Loading matches...</div>
                </div>
            ) : groupedMatches.length === 0 ? (
                <div className="text-center py-5 rounded-4 shadow-sm text-light opacity-50" style={{ backgroundColor: '#1e293b' }}>
                    <i className="bi bi-calendar-x fs-1 d-block mb-2"></i>
                    No matches scheduled for this date.
                </div>
            ) : (
                <div className="row justify-content-center">
                    <div className="col-lg-10 col-xl-8">
                        {groupedMatches.map(group => (
                            <div key={group.league.id} className="card shadow-sm border-0 rounded-4 overflow-hidden mb-4" style={{ backgroundColor: '#1e293b' }}>
                                <div className="card-header bg-dark border-bottom border-secondary py-3 px-4 d-flex align-items-center">
                                    <div className="bg-primary rounded-circle d-flex justify-content-center align-items-center text-white me-3 fs-5" style={{ width: '35px', height: '35px' }}>
                                        🏆
                                    </div>
                                    <div>
                                        <h6 className="mb-0 fw-bold text-white text-uppercase">{group.league.name}</h6>
                                        <div className="small text-info">{group.league.country}</div>
                                    </div>
                                </div>

                                <div className="list-group list-group-flush">
                                    {group.matches.map(match => {
                                        const matchTime = new Date(match.matchDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        return (
                                            <div key={match.id} className="list-group-item bg-transparent border-bottom border-secondary py-3 px-4 d-flex flex-column flex-md-row justify-content-between align-items-center hover-bg-dark transition-all">
                                                
                                                <div className="text-center mb-2 mb-md-0" style={{ width: '60px' }}>
                                                    <div className="fw-bold text-light opacity-75">{matchTime}</div>
                                                    {match.status === 'Finished' && <div className="badge bg-success mt-1 px-2">FT</div>}
                                                </div>

                                                <div className="flex-grow-1 d-flex justify-content-center align-items-center gap-2 gap-md-4 px-2 w-100">
                                                    <div className="text-end fw-bold text-white fs-6" style={{ flex: 1 }}>{match.homeTeamName}</div>
                                                    
                                                    <div className="bg-dark border border-secondary rounded px-3 py-1 d-flex justify-content-center align-items-center shadow-sm text-nowrap">
                                                        <span className="fs-5 fw-bold text-white">{match.homeScore !== null ? match.homeScore : '-'}</span>
                                                        <span className="mx-2 text-info opacity-50">-</span>
                                                        <span className="fs-5 fw-bold text-white">{match.awayScore !== null ? match.awayScore : '-'}</span>
                                                    </div>

                                                    <div className="text-start fw-bold text-white fs-6" style={{ flex: 1 }}>{match.awayTeamName}</div>
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
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
            `}} />
        </div>
    );
}