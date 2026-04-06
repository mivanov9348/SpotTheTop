import React, { useEffect, useState } from 'react';
import PlayerProfileModal from '../PlayerProfileModal';

const API_URL = "https://localhost:44306/api";

export default function PlayersPage() {
    const [players, setPlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        fetch(`${API_URL}/Players`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => setPlayers(data));
    }, []);

    const viewProfile = async (id) => {
        const token = localStorage.getItem('jwtToken');
        const res = await fetch(`${API_URL}/Players/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setSelectedPlayer(await res.json());
    };

    return (
        <>
            <div className="card shadow border-0 rounded-4">
                <div className="card-header bg-success text-white fw-bold py-3">
                    🏃 Verified Players Database
                </div>
                <div className="list-group list-group-flush">
                    {players.map(p => (
                        <button key={p.id} onClick={() => viewProfile(p.id)} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3">
                            <div>
                                <span className="fw-bold fs-5">{p.fullName}</span> 
                                <span className="badge bg-secondary ms-2">{p.position}</span>
                            </div>
                            <span className="badge bg-success rounded-pill">View Profile ➔</span>
                        </button>
                    ))}
                </div>
            </div>

            {selectedPlayer && <PlayerProfileModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}
        </>
    );
}