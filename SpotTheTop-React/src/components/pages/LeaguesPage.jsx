import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = "https://localhost:44306/api";

export default function LeaguesPage() {
    const [leagues, setLeagues] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        fetch(`${API_URL}/Leagues`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                setLeagues(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load leagues", err);
                setIsLoading(false);
            });
    }, []);

    return (
        <div className="container-fluid px-0">
            {/* Хедър на страницата */}
            <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
                <div>
                    <h2 className="fw-bold text-dark mb-1">🏆 Global Competitions</h2>
                    <p className="text-muted mb-0">Explore leagues, clubs, and player statistics worldwide.</p>
                </div>
                <span className="badge bg-primary fs-6 px-3 py-2 rounded-pill shadow-sm">
                    {leagues.length} Active Leagues
                </span>
            </div>
            
            {/* Мрежа с Лиги */}
            {isLoading ? (
                <div className="text-center py-5 text-muted">Loading competitions...</div>
            ) : leagues.length === 0 ? (
                <div className="text-center py-5 bg-white rounded-4 shadow-sm text-muted">
                    No competitions available at the moment.
                </div>
            ) : (
                <div className="row g-4">
                    {leagues.map(l => (
                        <div className="col-md-6 col-lg-4 col-xl-3" key={l.id}>
                            <Link to={`/leagues/${l.id}`} className="card h-100 shadow-sm border-0 rounded-4 text-decoration-none card-hover-effect">
                                <div className="card-body p-4 d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="bg-light rounded-circle d-flex justify-content-center align-items-center text-primary fs-4" style={{ width: '50px', height: '50px' }}>
                                            ⚽
                                        </div>
                                        <span className="badge bg-light text-dark border border-secondary text-uppercase">
                                            {l.country}
                                        </span>
                                    </div>
                                    
                                    <h5 className="fw-bold text-dark mt-auto mb-3">{l.name}</h5>
                                    
                                    <div className="d-flex justify-content-between pt-3 border-top">
                                        <div className="text-center">
                                            <div className="fw-bold text-dark">{l.teamsCount}</div>
                                            <div className="small text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>Clubs</div>
                                        </div>
                                        <div className="text-center border-start ps-3">
                                            <div className="fw-bold text-dark">{l.playersCount}</div>
                                            <div className="small text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>Players</div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}

            {/* CSS ефекти */}
            <style dangerouslySetInnerHTML={{__html: `
                .card-hover-effect { transition: transform 0.2s ease, box-shadow 0.2s ease; cursor: pointer; }
                .card-hover-effect:hover { transform: translateY(-5px); box-shadow: 0 .5rem 1.5rem rgba(0,0,0,.1)!important; }
            `}} />
        </div>
    );
}