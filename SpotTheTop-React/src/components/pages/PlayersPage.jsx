import React, { useEffect, useState } from 'react';
import PlayerFilters from './PlayerFilters'; // Увери се, че пътят е правилен
import PlayerProfileModal from '../dashboard-tabs/PlayerProfileModal'; 

const API_URL = "https://localhost:44306/api";

export default function PlayersPage() {
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [positions, setPositions] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    // --- СТЕЙТОВЕ ЗА ФИЛТРИТЕ ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeam, setSelectedTeam] = useState('all');
    const [selectedPosition, setSelectedPosition] = useState('all');
    const [minAge, setMinAge] = useState('');
    const [maxAge, setMaxAge] = useState('');
    const [minHeight, setMinHeight] = useState('');
    const [preferredFoot, setPreferredFoot] = useState('all');
    const [minGoals, setMinGoals] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');

        fetch(`${API_URL}/Players`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => setPlayers(data));

        fetch(`${API_URL}/Teams`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => setTeams(data));

        fetch(`${API_URL}/Positions`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => setPositions(data));
    }, []);

    // const viewProfile = async (id) => { ... }

    // ==========================================
    // ЛОГИКА ЗА ФИЛТРИРАНЕ НА ДАННИТЕ
    // ==========================================
    const filteredPlayers = players.filter(p => {
        const matchesSearch = p.fullName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPosition = selectedPosition === 'all' || p.position === selectedPosition;

        let matchesTeam = true;
        if (selectedTeam === 'free_agents') matchesTeam = p.teamId === null;
        else if (selectedTeam !== 'all') matchesTeam = p.teamId === parseInt(selectedTeam);

        const matchesMinAge = minAge === '' || p.age >= parseInt(minAge);
        const matchesMaxAge = maxAge === '' || p.age <= parseInt(maxAge);
        const matchesHeight = minHeight === '' || (p.heightCm && p.heightCm >= parseInt(minHeight));
        const matchesFoot = preferredFoot === 'all' || p.preferredFoot === preferredFoot;
        const matchesGoals = minGoals === '' || (p.totalGoals !== undefined && p.totalGoals >= parseInt(minGoals));

        return matchesSearch && matchesPosition && matchesTeam && matchesMinAge && matchesMaxAge && matchesHeight && matchesFoot && matchesGoals;
    });

    return (
        <div className="container-fluid px-0">
            <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
                <div>
                    <h2 className="fw-bold text-dark mb-1">🏃 Global Player Database</h2>
                    <p className="text-muted mb-0">Search and scout verified athletes across all leagues.</p>
                </div>
                <span className="badge bg-success fs-6 px-3 py-2 rounded-pill shadow-sm">
                    {filteredPlayers.length} Athletes Found
                </span>
            </div>

            {/* ВМЪКВАМЕ БОГАТИЯ ФИЛТЪР */}
            <PlayerFilters
                searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam}
                selectedPosition={selectedPosition} setSelectedPosition={setSelectedPosition}
                minAge={minAge} setMinAge={setMinAge}
                maxAge={maxAge} setMaxAge={setMaxAge}
                minHeight={minHeight} setMinHeight={setMinHeight}
                preferredFoot={preferredFoot} setPreferredFoot={setPreferredFoot}
                minGoals={minGoals} setMinGoals={setMinGoals}
                teams={teams} positions={positions}
            />

            {/* БОГАТА ТАБЛИЦА */}
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light text-uppercase small fw-bold text-muted">
                            <tr>
                                <th className="px-4 py-3">Athlete</th>
                                <th className="py-3">Position</th>
                                <th className="py-3">Current Club</th>
                                <th className="py-3 text-center">⚽ Goals</th>
                                <th className="py-3 text-end px-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPlayers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">
                                        <i className="bi bi-search fs-1 d-block mb-2 opacity-50"></i>
                                        No players match your specific criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredPlayers.map(p => {
                                    const playerTeam = teams.find(t => t.id === p.teamId);
                                    return (
                                        <tr key={p.id}>
                                            <td className="px-4 py-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="bg-dark rounded-circle d-flex justify-content-center align-items-center text-white me-3 fw-bold" style={{ width: '45px', height: '45px' }}>
                                                        {p.fullName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="fw-bold text-dark">{p.fullName}</div>
                                                        <div className="small text-muted">
                                                            Age: {p.age} | {p.heightCm ? `${p.heightCm} cm` : 'No height'} | Foot: {p.preferredFoot || 'Any'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className="badge bg-light text-dark border border-secondary">{p.position}</span></td>
                                            <td>
                                                {playerTeam ? <span className="fw-bold text-primary">{playerTeam.name}</span> : <span className="text-muted fst-italic">Free Agent</span>}
                                            </td>
                                            <td className="text-center fw-bold text-success fs-5">
                                                {p.totalGoals || 0}
                                            </td>
                                            <td className="text-end px-4">
                                                <button onClick={() => viewProfile(p.id)} className="btn btn-sm btn-dark fw-bold px-3 rounded-pill shadow-sm">
                                                    Profile <i className="bi bi-arrow-right ms-1"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedPlayer && <PlayerProfileModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}
        </div>
    );
}