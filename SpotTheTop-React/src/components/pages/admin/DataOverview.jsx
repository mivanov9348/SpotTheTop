import React, { useState, useEffect } from 'react';

const API_URL = "https://localhost:44306/api";

export default function DataOverview() {
    const [data, setData] = useState({
        leagues: [],
        teams: [],
        positions: [],
        players: [],
        seasons: []
    });
    const [isLoading, setIsLoading] = useState(true);

    const loadAllData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('jwtToken');
        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            const [resL, resT, resP, resPl, resS] = await Promise.all([
                fetch(`${API_URL}/Leagues`, { headers }),
                fetch(`${API_URL}/Teams`, { headers }),
                fetch(`${API_URL}/Positions`, { headers }),
                fetch(`${API_URL}/Players`, { headers }),
                fetch(`${API_URL}/Seasons`, { headers })
            ]);

            setData({
                leagues: resL.ok ? await resL.json() : [],
                teams: resT.ok ? await resT.json() : [],
                positions: resP.ok ? await resP.json() : [],
                players: resPl.ok ? await resPl.json() : [],
                seasons: resS.ok ? await resS.json() : []
            });
        } catch (err) {
            console.error("Error loading overview data", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const handleDelete = async (endpoint, id) => {
        if (!window.confirm(`Are you sure you want to delete this record?`)) return;

        const token = localStorage.getItem('jwtToken');
        try {
            const res = await fetch(`${API_URL}/${endpoint}/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                loadAllData(); 
            } else {
                alert(await res.text() || "Error deleting record. It might be in use.");
            }
        } catch (err) {
            alert("Network error.");
        }
    };

    if (isLoading) return <div className="text-center p-5 text-light opacity-50"><div className="spinner-border"></div></div>;

    const renderListCard = (title, icon, items, endpoint, renderItemContent) => {
        return (
            <div className="col-md-6 col-xl-4">
                <div className="card shadow-sm border-0 rounded-4 h-100 d-flex flex-column" style={{ backgroundColor: '#1e293b' }}>
                    <div className="card-header bg-dark text-white fw-bold py-3 d-flex justify-content-between align-items-center border-secondary">
                        <span>{icon} {title}</span>
                        <span className="badge bg-secondary text-light">{items.length}</span>
                    </div>
                    <div className="card-body p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <ul className="list-group list-group-flush">
                            {items.length === 0 ? (
                                <li className="list-group-item bg-transparent text-light opacity-50 text-center py-4 border-0">No records found.</li>
                            ) : (
                                items.map(item => (
                                    <li key={item.id} className="list-group-item bg-transparent border-bottom border-secondary px-3 py-2 d-flex justify-content-between align-items-center">
                                        
                                        {/* Контейнер за текста (гъвкав, но се свива ако е дълъг) */}
                                        <div className="text-light text-truncate pe-3" style={{ flex: 1, minWidth: 0 }}>
                                            {renderItemContent(item)}
                                        </div>
                                        
                                        {/* Бутонът за триене (Гарантирано видим!) */}
                                        <button 
                                            onClick={() => handleDelete(endpoint, item.id)} 
                                            className="btn btn-sm btn-outline-danger border-0 flex-shrink-0 rounded-circle d-flex align-items-center justify-content-center"
                                            style={{ width: '32px', height: '32px' }}
                                            title="Delete"
                                        >
                                            <span className="fw-bold fs-6">✖</span>
                                        </button>
                                        
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="row g-4 pb-5">
            {renderListCard("Leagues", "🏆", data.leagues, "Leagues", 
                (l) => <><span className="fw-bold">{l.name}</span> <span className="opacity-50 small">({l.country})</span></>
            )}

            {renderListCard("Seasons", "📅", data.seasons, "Seasons", 
                (s) => <><span className="fw-bold">{s.name}</span> {s.isActive ? <span className="badge bg-success ms-1 p-1">Active</span> : ''}</>
            )}

            {renderListCard("Teams", "🛡️", data.teams, "Teams", 
                (t) => <><span className="fw-bold">{t.name}</span> <span className="opacity-50 small d-block">Lg ID: {t.leagueId}</span></>
            )}

            {renderListCard("Positions", "🏃", data.positions, "Positions", 
                (p) => <><span className="badge bg-info text-dark me-2">{p.abbreviation}</span>{p.name}</>
            )}

            {renderListCard("Players", "⚽", data.players, "Players", 
                (p) => <><span className="fw-bold">{p.fullName}</span> <span className="opacity-50 small d-block">{p.position}</span></>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                .card-body::-webkit-scrollbar { width: 5px; }
                .card-body::-webkit-scrollbar-track { background: transparent; }
                .card-body::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
                .card-body::-webkit-scrollbar-thumb:hover { background: #64748b; }
            `}} />
        </div>
    );
}