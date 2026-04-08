import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PlayerProfileModal from '../PlayerProfileModal';

const API_URL = "https://localhost:44306/api";

export default function TeamDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [team, setTeam] = useState(null);
    const [players, setPlayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // За отваряне на профила на играч
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');

        // 1. Детайли за Отбора
        const fetchTeam = fetch(`${API_URL}/Teams/${id}`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        }).then(res => {
            if (!res.ok) throw new Error("Team not found");
            return res.json();
        });

        // 2. Играчите на този отбор
        const fetchPlayers = fetch(`${API_URL}/Players?teamId=${id}`, { 
            headers: { 'Authorization': `Bearer ${token}` } 
        }).then(res => res.json());

        Promise.all([fetchTeam, fetchPlayers])
            .then(([teamData, playersData]) => {
                setTeam(teamData);
                setPlayers(playersData);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                alert("Team not found.");
                navigate('/leagues');
            });
    }, [id, navigate]);

    const viewProfile = async (playerId) => {
        const token = localStorage.getItem('jwtToken');
        const res = await fetch(`${API_URL}/Players/${playerId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setSelectedPlayer(await res.json());
    };

    if (isLoading) return <div className="text-center p-5 text-muted">Loading team data...</div>;

    return (
        <div>
            {/* Бутон за назад към лигата */}
            <button onClick={() => navigate(-1)} className="btn btn-link text-decoration-none text-muted mb-3 ps-0">
                <i className="bi bi-arrow-left me-1"></i> Back
            </button>

            <div className="row g-4">
                {/* ЛЯВА КОЛОНА (80%) - ТАБЛИЦА С ИГРАЧИ */}
                <div className="col-lg-9">
                    <div className="card shadow-sm border-0 rounded-4 overflow-hidden h-100">
                        <div className="card-header bg-success text-white fw-bold py-3 d-flex justify-content-between align-items-center">
                            <span className="fs-5">🏃 Active Roster</span>
                            <span className="badge bg-light text-success fs-6 rounded-pill px-3">{players.length} Players</span>
                        </div>
                        
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light text-uppercase small fw-bold text-muted">
                                    <tr>
                                        <th className="px-4 py-3">Player Name</th>
                                        <th className="py-3">Position</th>
                                        <th className="py-3">Age</th>
                                        <th className="py-3 text-end px-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {players.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-5 text-muted">
                                                No players registered for this team yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        players.map(p => (
                                            <tr key={p.id}>
                                                <td className="px-4 py-3">
                                                    <div className="d-flex align-items-center">
                                                        <div className="bg-secondary rounded-circle d-flex justify-content-center align-items-center text-white me-3 fw-bold" style={{ width: '40px', height: '40px' }}>
                                                            {p.fullName.charAt(0)}
                                                        </div>
                                                        <span className="fw-bold text-dark">{p.fullName}</span>
                                                    </div>
                                                </td>
                                                <td><span className="badge bg-light text-dark border border-secondary">{p.position}</span></td>
                                                <td>{p.age} yrs</td>
                                                <td className="text-end px-4">
                                                    <button onClick={() => viewProfile(p.id)} className="btn btn-sm btn-outline-dark fw-bold rounded-pill px-3">
                                                        Profile <i className="bi bi-arrow-right ms-1"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ДЯСНА КОЛОНА (20%) - ИНФО ЗА ОТБОРА */}
                <div className="col-lg-3">
                    <div className="card shadow-sm border-0 rounded-4 bg-light">
                        <div className="card-body p-4 text-center border-bottom border-white">
                            <div className="bg-success rounded-circle d-flex justify-content-center align-items-center text-white mx-auto mb-3 shadow-sm" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                                {team.name.charAt(0)}
                            </div>
                            <h4 className="fw-bold text-dark mb-0">{team.name}</h4>
                            <span className="badge bg-primary mt-2">{team.leagueName}</span>
                        </div>
                        <div className="card-body p-4">
                            <h6 className="fw-bold text-muted text-uppercase small mb-3">Club Details</h6>
                            
                            <div className="mb-3">
                                <div className="small text-muted"><i className="bi bi-geo-alt-fill me-1"></i> City</div>
                                <div className="fw-bold">{team.city || 'Unknown'}</div>
                            </div>
                            
                            <div className="mb-3">
                                <div className="small text-muted"><i className="bi bi-house-fill me-1"></i> Stadium</div>
                                <div className="fw-bold">{team.stadium || 'Unknown'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Модал за профила */}
            {selectedPlayer && <PlayerProfileModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}
        </div>
    );
}