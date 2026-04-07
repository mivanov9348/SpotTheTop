import React, { useEffect, useState } from 'react';
import PlayerProfileModal from '../PlayerProfileModal';
import PlayerFilters from './PlayerFilters';

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
    
    // Advanced Filters
    const [minAge, setMinAge] = useState('');
    const [maxAge, setMaxAge] = useState('');
    const [minHeight, setMinHeight] = useState('');
    const [preferredFoot, setPreferredFoot] = useState('all');
    const [minGoals, setMinGoals] = useState(''); // За статистиката

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

    const viewProfile = async (id) => {
        const token = localStorage.getItem('jwtToken');
        const res = await fetch(`${API_URL}/Players/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setSelectedPlayer(await res.json());
    };

    // ==========================================
    // ЛОГИКА ЗА ФИЛТРИРАНЕ НА ДАННИТЕ
    // ==========================================
    const filteredPlayers = players.filter(p => {
        // 1. Основни филтри
        const matchesSearch = p.fullName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPosition = selectedPosition === 'all' || p.position === selectedPosition;
        
        let matchesTeam = true;
        if (selectedTeam === 'free_agents') matchesTeam = p.teamId === null;
        else if (selectedTeam !== 'all') matchesTeam = p.teamId === parseInt(selectedTeam);

        // 2. Разширени филтри (Advanced)
        // Проверяваме възрастта (ако потребителят е въвел нещо)
        const matchesMinAge = minAge === '' || p.age >= parseInt(minAge);
        const matchesMaxAge = maxAge === '' || p.age <= parseInt(maxAge);
        
        // Проверяваме ръста (Предполага се, че бекендът ще връща p.heightCm)
        const matchesHeight = minHeight === '' || (p.heightCm && p.heightCm >= parseInt(minHeight));

        // Проверяваме предпочитания крак
        const matchesFoot = preferredFoot === 'all' || p.preferredFoot === preferredFoot;

        // Проверяваме Головете (Предполага се, че бекендът ще връща сумарани p.totalGoals)
        const matchesGoals = minGoals === '' || (p.totalGoals !== undefined && p.totalGoals >= parseInt(minGoals));

        // Ако всички условия са TRUE, играчът остава в списъка
        return matchesSearch && matchesPosition && matchesTeam && matchesMinAge && matchesMaxAge && matchesHeight && matchesFoot && matchesGoals;
    });

    return (
        <div className="container-fluid px-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-dark mb-0">🏃 Global Player Database</h3>
                <span className="badge bg-success fs-6 px-3 py-2 rounded-pill shadow-sm">
                    {filteredPlayers.length} Athletes Found
                </span>
            </div>

            {/* КОМПОНЕНТ ЗА ФИЛТРИ */}
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

            {/* ТАБЛИЦАТА С РЕЗУЛТАТИ */}
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light text-uppercase small fw-bold text-muted">
                            <tr>
                                <th className="px-4 py-3">Athlete</th>
                                <th className="py-3">Position</th>
                                <th className="py-3">Current Club</th>
                                <th className="py-3">Key Stats</th>
                                <th className="py-3 text-end px-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPlayers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">
                                        <i className="bi bi-search fs-1 d-block mb-2 opacity-50"></i>
                                        No players match your exact criteria.
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
                                                            Age: {p.age} | {p.heightCm ? `${p.heightCm}cm` : 'No Height Data'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td><span className="badge bg-light text-dark border border-secondary">{p.position}</span></td>

                                            <td>
                                                {playerTeam ? <span className="fw-bold text-primary">{playerTeam.name}</span> : <span className="text-muted fst-italic">Free Agent</span>}
                                            </td>

                                            {/* НОВО: Показваме головете в таблицата */}
                                            <td>
                                                <div className="small fw-bold">
                                                    ⚽ Goals: <span className="text-success">{p.totalGoals || 0}</span>
                                                </div>
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