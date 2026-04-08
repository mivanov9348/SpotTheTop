import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = "https://localhost:44306/api";

export default function LeaguesPage() {
    const [leagues, setLeagues] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        fetch(`${API_URL}/Leagues`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => setLeagues(data))
            .catch(err => console.error("Failed to load leagues", err));
    }, []);

    return (
        <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-primary text-white fw-bold py-3 d-flex align-items-center">
                <span className="fs-5">🏆 Global Leagues Directory</span>
            </div>
            
            <div className="list-group list-group-flush">
                {leagues.length === 0 ? (
                    <div className="p-5 text-center text-muted">No leagues found.</div>
                ) : (
                    leagues.map(l => (
                        <Link 
                            key={l.id} 
                            to={`/leagues/${l.id}`} 
                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3 text-decoration-none"
                        >
                            <div>
                                <h5 className="mb-1 fw-bold text-dark">{l.name}</h5>
                                <small className="text-muted"><i className="bi bi-geo-alt-fill me-1"></i>{l.country}</small>
                            </div>
                            <i className="bi bi-chevron-right text-muted"></i>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}