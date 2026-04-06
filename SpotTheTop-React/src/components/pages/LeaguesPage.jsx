import React, { useEffect, useState } from 'react';

const API_URL = "https://localhost:44306/api";

export default function LeaguesPage() {
    const [leagues, setLeagues] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        fetch(`${API_URL}/Leagues`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => setLeagues(data));
    }, []);

    return (
        <div className="card shadow border-0 rounded-4">
            <div className="card-header bg-primary text-white fw-bold py-3">
                🏆 Leagues Directory
            </div>
            <div className="list-group list-group-flush">
                {leagues.map(l => (
                    <div key={l.id} className="list-group-item d-flex justify-content-between align-items-center p-3">
                        <div>
                            <h5 className="mb-1 fw-bold">{l.name}</h5>
                            <small className="text-muted">📍 {l.country}</small>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}