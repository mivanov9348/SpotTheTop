import React, { useState, useEffect } from 'react';
import MatchCardModal from '../leagues/MatchCardModal'; 

const API_URL = "https://localhost:44306/api";

export default function MatchesPage() {
    // Взимаме днешната дата във формат YYYY-MM-DD (локално време)
    const getLocalDateString = (dateObj) => {
        return dateObj.getFullYear() + '-' + 
            String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + 
            String(dateObj.getDate()).padStart(2, '0');
    };

    const [selectedDate, setSelectedDate] = useState(getLocalDateString(new Date()));
    const [groupedMatches, setGroupedMatches] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMatchForEdit, setSelectedMatchForEdit] = useState(null);

    // Проверка на правата
    const userRoles = JSON.parse(localStorage.getItem('userRoles') || "[]");
    const canEditMatches = userRoles.some(r => ['SuperAdmin', 'Admin', 'Moderator'].includes(r));

    const fetchMatchesForDate = async (dateStr) => {
        setIsLoading(true);
        const token = localStorage.getItem('jwtToken');
        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            // 1. Взимаме всички лиги
            const leaguesRes = await fetch(`${API_URL}/Leagues`, { headers });
            const leagues = await leaguesRes.json();

            // 2. Взимаме мачовете за всяка лига (от активния й сезон)
            const matchPromises = leagues.map(l => 
                fetch(`${API_URL}/Matches?leagueId=${l.id}`, { headers })
                    .then(res => res.ok ? res.json() : null)
                    .then(data => ({ league: l, data }))
            );

            const results = await Promise.all(matchPromises);

            // 3. Филтрираме мачовете, които се играят на избраната дата
            const grouped = [];
            results.forEach(result => {
                if (result.data && result.data.matches) {
                    const dayMatches = result.data.matches.filter(m => {
                        const mDate = new Date(m.matchDate);
                        return getLocalDateString(mDate) === dateStr;
                    });

                    // Ако лигата има мачове днес, добавяме я в списъка
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

    // Навигация между дните
    const handleDateChange = (daysOffset) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + daysOffset);
        setSelectedDate(getLocalDateString(d));
    };

    const handleMatchSaved = () => {
        setSelectedMatchForEdit(null);
        fetchMatchesForDate(selectedDate);
    };

    // Форматиране на датата за показване (напр. "Thursday, April 16")
    const displayDate = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="container-fluid px-0">
            {/* HEADER И НАВИГАЦИЯ ЗА ДАТИТЕ */}
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

            {/* СПИСЪК С МАЧОВЕ */}
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
                                {/* ЗАГЛАВИЕ НА ЛИГАТА */}
                                <div className="card-header bg-dark border-bottom border-secondary py-3 px-4 d-flex align-items-center">
                                    <div className="bg-primary rounded-circle d-flex justify-content-center align-items-center text-white me-3 fs-5" style={{ width: '35px', height: '35px' }}>
                                        🏆
                                    </div>
                                    <div>
                                        <h6 className="mb-0 fw-bold text-white text-uppercase">{group.league.name}</h6>
                                        <div className="small text-info">{group.league.country}</div>
                                    </div>
                                </div>

                                {/* МАЧОВЕТЕ В ЛИГАТА */}
                                <div className="list-group list-group-flush">
                                    {group.matches.map(match => {
                                        const matchTime = new Date(match.matchDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                        return (
                                            <div key={match.id} className="list-group-item bg-transparent border-bottom border-secondary py-3 px-4 d-flex justify-content-between align-items-center hover-bg-dark transition-all">
                                                
                                                {/* ЧАС И СТАТУС */}
                                                <div className="text-center" style={{ width: '60px' }}>
                                                    <div className="fw-bold text-light opacity-75">{matchTime}</div>
                                                    {match.status === 'Finished' && <div className="badge bg-success mt-1 px-2">FT</div>}
                                                </div>

                                                {/* ОТБОРИ И РЕЗУЛТАТ */}
                                                <div className="flex-grow-1 d-flex justify-content-center align-items-center gap-2 gap-md-4 px-2">
                                                    <div className="text-end fw-bold text-white fs-6" style={{ flex: 1 }}>{match.homeTeamName}</div>
                                                    
                                                    <div className="bg-dark border border-secondary rounded px-3 py-1 d-flex justify-content-center align-items-center shadow-sm text-nowrap">
                                                        <span className="fs-5 fw-bold text-white">{match.homeScore !== null ? match.homeScore : '-'}</span>
                                                        <span className="mx-2 text-info opacity-50">-</span>
                                                        <span className="fs-5 fw-bold text-white">{match.awayScore !== null ? match.awayScore : '-'}</span>
                                                    </div>

                                                    <div className="text-start fw-bold text-white fs-6" style={{ flex: 1 }}>{match.awayTeamName}</div>
                                                </div>

                                                {/* БУТОН ЗА ДЕТАЙЛИ / РЕДАКЦИЯ */}
                                                <div className="text-end" style={{ width: '40px' }}>
                                                    <button 
                                                        onClick={() => setSelectedMatchForEdit(match)} 
                                                        className={`btn btn-sm border-0 shadow-none hover-scale ${canEditMatches ? 'btn-outline-warning' : 'btn-outline-info'}`}
                                                        title={canEditMatches ? "Edit Match Stats" : "View Match Center"}
                                                    >
                                                        <i className={`bi fs-5 ${canEditMatches ? 'bi-pencil-square' : 'bi-info-circle'}`}></i>
                                                    </button>
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

            {/* МОДАЛЪТ (Отваря се и за Admin, и за User, но вътре ще контролираме кой какво вижда) */}
            {selectedMatchForEdit && (
                <MatchCardModal 
                    match={selectedMatchForEdit} 
                    canEdit={canEditMatches} // Подаваме го, за да може модалът да скрие Save бутона за обикновени юзъри
                    onClose={() => setSelectedMatchForEdit(null)} 
                    onSave={handleMatchSaved} 
                />
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .hover-scale { transition: transform 0.1s ease; }
                .hover-scale:hover { transform: scale(1.2); }
                .hover-bg-dark:hover { background-color: #0f172a !important; cursor: pointer;}
                input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
            `}} />
        </div>
    );
}