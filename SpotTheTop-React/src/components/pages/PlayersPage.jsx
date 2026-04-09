import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; // НОВО: За да хващаме параметрите от URL-а
import PlayerFilters from './PlayerFilters'; 
import PlayerProfileModal from '../PlayerProfileModal';

const API_URL = "https://localhost:44306/api";

export default function PlayersPage() {
    const [searchParams] = useSearchParams();
    const initialLeagueId = searchParams.get('leagueId') || 'all';

    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [positions, setPositions] = useState([]);
    const [leagues, setLeagues] = useState([]); // НОВО: Стейт за лигите
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Стейтове за филтрите
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLeague, setSelectedLeague] = useState(initialLeagueId); // НОВО: Избраната лига
    const [selectedTeam, setSelectedTeam] = useState('all');
    const [selectedPosition, setSelectedPosition] = useState('all');
    const [minAge, setMinAge] = useState('');
    const [maxAge, setMaxAge] = useState('');
    const [minHeight, setMinHeight] = useState('');
    const [preferredFoot, setPreferredFoot] = useState('all');
    const [minGoals, setMinGoals] = useState('');
    const [minAssists, setMinAssists] = useState('');
    const [minMatches, setMinMatches] = useState('');
    const [maxCards, setMaxCards] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        const headers = { 'Authorization': `Bearer ${token}` };

        const fetchPlayers = fetch(`${API_URL}/Players`, { headers }).then(res => res.json());
        const fetchTeams = fetch(`${API_URL}/Teams`, { headers }).then(res => res.json());
        const fetchPositions = fetch(`${API_URL}/Positions`, { headers }).then(res => res.json());
        const fetchLeagues = fetch(`${API_URL}/Leagues`, { headers }).then(res => res.json()); // НОВО: Дърпаме лигите

        Promise.all([fetchPlayers, fetchTeams, fetchPositions, fetchLeagues])
            .then(([pData, tData, posData, lData]) => {
                setPlayers(pData); 
                setTeams(tData); 
                setPositions(posData);
                setLeagues(lData); // Сетваме лигите
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    const viewProfile = async (id) => {
        const token = localStorage.getItem('jwtToken');
        const res = await fetch(`${API_URL}/Players/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setSelectedPlayer(await res.json());
    };

    // ЛОГИКА ЗА ФИЛТРИРАНЕ НА ДАННИТЕ
    const filteredPlayers = players.filter(p => {
        const matchesSearch = p.fullName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPosition = selectedPosition === 'all' || p.position === selectedPosition;
        
        // НОВО: Филтър по Лига (Връзваме играча с отбора, а отбора с лигата)
        let matchesLeague = true;
        if (selectedLeague !== 'all') {
            const playerTeam = teams.find(t => t.id === p.teamId);
            matchesLeague = playerTeam && playerTeam.leagueId === parseInt(selectedLeague, 10);
        }

        let matchesTeam = true;
        if (selectedTeam === 'free_agents') matchesTeam = p.teamId === null;
        else if (selectedTeam !== 'all') matchesTeam = p.teamId === parseInt(selectedTeam, 10);

        const pAge = p.age || 0;
        const matchesMinAge = minAge === '' || pAge >= parseInt(minAge, 10);
        const matchesMaxAge = maxAge === '' || pAge <= parseInt(maxAge, 10);
        const matchesHeight = minHeight === '' || (p.heightCm && p.heightCm >= parseInt(minHeight, 10));
        const matchesFoot = preferredFoot === 'all' || p.preferredFoot === preferredFoot;

        const matchesGoals = minGoals === '' || (p.totalGoals || 0) >= parseInt(minGoals, 10);
        const matchesAssists = minAssists === '' || (p.totalAssists || 0) >= parseInt(minAssists, 10);
        const matchesApps = minMatches === '' || (p.matchesPlayed || 0) >= parseInt(minMatches, 10);
        const totalCards = (p.totalYellowCards || 0) + (p.totalRedCards || 0);
        const matchesCards = maxCards === '' || totalCards <= parseInt(maxCards, 10);

        // ВРЪЩАМЕ ВСИЧКО ВКЛЮЧИТЕЛНО matchesLeague
        return matchesSearch && matchesLeague && matchesPosition && matchesTeam && matchesMinAge && matchesMaxAge && 
            matchesHeight && matchesFoot && matchesGoals && matchesAssists && matchesApps && matchesCards;
    });

    if (isLoading) return <div className="text-center p-5 text-muted">Loading player database...</div>;

    return (
        <div className="container-fluid px-0">
            <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
                <div>
                    {/* Динамично заглавие според избраната лига */}
                    <h2 className="fw-bold text-dark mb-1">
                        {selectedLeague !== 'all' && leagues.length > 0 
                            ? `🏃 Players in ${leagues.find(l => l.id === parseInt(selectedLeague, 10))?.name}` 
                            : '🏃 Global Player Database'}
                    </h2>
                    <p className="text-muted mb-0">Search and scout verified athletes across all leagues.</p>
                </div>
                <span className="badge bg-success fs-6 px-3 py-2 rounded-pill shadow-sm">
                    {filteredPlayers.length} Athletes Found
                </span>
            </div>

            <PlayerFilters
                searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                selectedLeague={selectedLeague} setSelectedLeague={setSelectedLeague} // Подаваме лигата
                selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam}
                selectedPosition={selectedPosition} setSelectedPosition={setSelectedPosition}
                minAge={minAge} setMinAge={setMinAge} maxAge={maxAge} setMaxAge={setMaxAge}
                minHeight={minHeight} setMinHeight={setMinHeight}
                preferredFoot={preferredFoot} setPreferredFoot={setPreferredFoot}
                minGoals={minGoals} setMinGoals={setMinGoals}
                minAssists={minAssists} setMinAssists={setMinAssists}
                minMatches={minMatches} setMinMatches={setMinMatches}
                maxCards={maxCards} setMaxCards={setMaxCards}
                leagues={leagues} // Подаваме лигите
                teams={teams} positions={positions}
            />

            {/* БОГАТА ТАБЛИЦА */}
            <div className="card shadow-sm border-0 rounded-4 overflow-hidden bg-white">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 text-center">
                        <thead className="table-light text-uppercase small fw-bold text-muted">
                            <tr>
                                <th className="px-4 py-3 text-start">Athlete</th>
                                <th className="py-3 text-start">Club</th>
                                <th className="py-3" title="Matches Played">MP</th>
                                <th className="py-3" title="Minutes Played">MIN</th>
                                <th className="py-3 text-success" title="Goals">⚽ G</th>
                                <th className="py-3 text-info" title="Assists">🤝 A</th>
                                <th className="py-3 text-warning" title="Yellow Cards">🟨 YC</th>
                                <th className="py-3 text-danger" title="Red Cards">🟥 RC</th>
                                <th className="py-3 text-end px-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPlayers.length === 0 ? (
                                <tr><td colSpan="9" className="text-center py-5 text-muted">No players match your criteria.</td></tr>
                            ) : (
                                filteredPlayers.map(p => (
                                    <tr key={p.id}>
                                        <td className="px-4 py-3 text-start">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-dark rounded-circle d-flex justify-content-center align-items-center text-white me-3 fw-bold flex-shrink-0" style={{ width: '45px', height: '45px', fontSize: '1.2rem' }}>
                                                    {p.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-dark">{p.fullName}</div>
                                                    <div className="small text-muted">
                                                        {p.position} | Age: {p.age}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-start">
                                            {p.teamName !== "Free Agent" ? <span className="fw-bold text-primary">{p.teamName}</span> : <span className="text-muted fst-italic">Free Agent</span>}
                                        </td>
                                        <td className="fw-bold">{p.matchesPlayed}</td>
                                        <td className="text-muted">{p.minutesPlayed}'</td>
                                        <td className="fw-bold text-success fs-5">{p.totalGoals}</td>
                                        <td className="fw-bold text-info fs-5">{p.totalAssists}</td>
                                        <td className="fw-bold text-warning">{p.totalYellowCards}</td>
                                        <td className="fw-bold text-danger">{p.totalRedCards}</td>
                                        <td className="text-end px-4">
                                            <button onClick={() => viewProfile(p.id)} className="btn btn-sm btn-dark fw-bold px-3 rounded-pill shadow-sm">
                                                Profile
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {selectedPlayer && <PlayerProfileModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}
        </div>
    );
}