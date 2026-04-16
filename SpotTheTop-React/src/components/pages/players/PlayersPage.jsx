import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom'; 
import PlayerFilters from './PlayerFilters'; 
import PlayerProfileModal from '../../pages/PlayerProfileModal';

const API_URL = "https://localhost:44306/api";

export default function PlayersPage() {
    const [searchParams] = useSearchParams();
    const initialLeagueId = searchParams.get('leagueId') || 'all';

    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [positions, setPositions] = useState([]);
    const [leagues, setLeagues] = useState([]); 
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- Basic Filters ---
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLeague, setSelectedLeague] = useState(initialLeagueId); 
    const [selectedTeam, setSelectedTeam] = useState('all');
    const [selectedPosition, setSelectedPosition] = useState('all');
    
    // --- Advanced Filters ---
    const [minAge, setMinAge] = useState('');
    const [maxAge, setMaxAge] = useState('');
    const [minHeight, setMinHeight] = useState('');
    const [preferredFoot, setPreferredFoot] = useState('all');
    const [nationality, setNationality] = useState('');
    const [minMarketValue, setMinMarketValue] = useState('');

    const [minMatches, setMinMatches] = useState('');
    const [maxCards, setMaxCards] = useState('');
    const [minGoals, setMinGoals] = useState('');
    const [minAssists, setMinAssists] = useState('');
    const [minPassAccuracy, setMinPassAccuracy] = useState('');
    const [minTackles, setMinTackles] = useState('');
    const [minCleanSheets, setMinCleanSheets] = useState('');
    const [minSaves, setMinSaves] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        const headers = { 'Authorization': `Bearer ${token}` };

        const fetchPlayers = fetch(`${API_URL}/Players`, { headers }).then(res => res.json());
        const fetchTeams = fetch(`${API_URL}/Teams`, { headers }).then(res => res.json());
        const fetchPositions = fetch(`${API_URL}/Positions`, { headers }).then(res => res.json());
        const fetchLeagues = fetch(`${API_URL}/Leagues`, { headers }).then(res => res.json()); 

        Promise.all([fetchPlayers, fetchTeams, fetchPositions, fetchLeagues])
            .then(([pData, tData, posData, lData]) => {
                setPlayers(pData); 
                setTeams(tData); 
                setPositions(posData);
                setLeagues(lData); 
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, []);

    const viewProfile = async (id) => {
        const token = localStorage.getItem('jwtToken');
        const res = await fetch(`${API_URL}/Players/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setSelectedPlayer(await res.json());
    };

    const filteredPlayers = players.filter(p => {
        // Basic filtering
        const matchesSearch = p.fullName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPosition = selectedPosition === 'all' || p.position === selectedPosition;
        
        let matchesLeague = true;
        if (selectedLeague !== 'all') {
            const playerTeam = teams.find(t => t.id === p.teamId);
            matchesLeague = playerTeam && playerTeam.leagueId === parseInt(selectedLeague, 10);
        }

        let matchesTeam = true;
        if (selectedTeam === 'free_agents') matchesTeam = p.teamId === null;
        else if (selectedTeam !== 'all') matchesTeam = p.teamId === parseInt(selectedTeam, 10);

        // Advanced Bio & Physical
        const pAge = p.age || 0;
        const matchesMinAge = minAge === '' || pAge >= parseInt(minAge, 10);
        const matchesMaxAge = maxAge === '' || pAge <= parseInt(maxAge, 10);
        const matchesHeight = minHeight === '' || (p.heightCm && p.heightCm >= parseInt(minHeight, 10));
        const matchesFoot = preferredFoot === 'all' || p.preferredFoot === preferredFoot;
        const matchesNationality = nationality === '' || (p.nationality && p.nationality.toLowerCase().includes(nationality.toLowerCase()));
        const matchesMarketValue = minMarketValue === '' || (p.marketValueEuro && p.marketValueEuro >= parseInt(minMarketValue, 10));

        // Advanced Performance
        const matchesApps = minMatches === '' || (p.matchesPlayed || 0) >= parseInt(minMatches, 10);
        const totalCards = (p.totalYellowCards || 0) + (p.totalRedCards || 0);
        const matchesCards = maxCards === '' || totalCards <= parseInt(maxCards, 10);
        const matchesGoals = minGoals === '' || (p.totalGoals || 0) >= parseInt(minGoals, 10);
        const matchesAssists = minAssists === '' || (p.totalAssists || 0) >= parseInt(minAssists, 10);
        const matchesPassAcc = minPassAccuracy === '' || (p.averagePassAccuracy || 0) >= parseInt(minPassAccuracy, 10);
        
        // Advanced Defensive/GK
        const matchesTackles = minTackles === '' || (p.totalTacklesWon || 0) >= parseInt(minTackles, 10);
        const matchesCleanSheets = minCleanSheets === '' || (p.totalCleanSheets || 0) >= parseInt(minCleanSheets, 10);
        const matchesSaves = minSaves === '' || (p.totalSaves || 0) >= parseInt(minSaves, 10);

        return matchesSearch && matchesLeague && matchesPosition && matchesTeam && 
               matchesMinAge && matchesMaxAge && matchesHeight && matchesFoot && 
               matchesNationality && matchesMarketValue && matchesApps && matchesCards && 
               matchesGoals && matchesAssists && matchesPassAcc && matchesTackles && 
               matchesCleanSheets && matchesSaves;
    });

    if (isLoading) return <div className="text-center p-5 text-light opacity-50">Loading player database...</div>;

    return (
        <div className="container-fluid px-0">
            <div className="d-flex justify-content-between align-items-end mb-4 border-bottom border-secondary pb-3">
                <div>
                    <h2 className="fw-bold text-white mb-1">
                        {selectedLeague !== 'all' && leagues.length > 0 
                            ? `🏃 Players in ${leagues.find(l => l.id === parseInt(selectedLeague, 10))?.name}` 
                            : '🏃 Global Player Database'}
                    </h2>
                    <p className="text-light opacity-75 mb-0">Search and scout verified athletes across all leagues.</p>
                </div>
                <span className="badge bg-success fs-6 px-3 py-2 rounded-pill shadow-sm">
                    {filteredPlayers.length} Athletes Found
                </span>
            </div>

            <PlayerFilters
                searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                selectedLeague={selectedLeague} setSelectedLeague={setSelectedLeague} 
                selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam}
                selectedPosition={selectedPosition} setSelectedPosition={setSelectedPosition}
                // Bio Props
                minAge={minAge} setMinAge={setMinAge} maxAge={maxAge} setMaxAge={setMaxAge}
                minHeight={minHeight} setMinHeight={setMinHeight}
                preferredFoot={preferredFoot} setPreferredFoot={setPreferredFoot}
                nationality={nationality} setNationality={setNationality}
                minMarketValue={minMarketValue} setMinMarketValue={setMinMarketValue}
                // Stats Props
                minGoals={minGoals} setMinGoals={setMinGoals}
                minAssists={minAssists} setMinAssists={setMinAssists}
                minMatches={minMatches} setMinMatches={setMinMatches}
                maxCards={maxCards} setMaxCards={setMaxCards}
                minPassAccuracy={minPassAccuracy} setMinPassAccuracy={setMinPassAccuracy}
                minTackles={minTackles} setMinTackles={setMinTackles}
                minCleanSheets={minCleanSheets} setMinCleanSheets={setMinCleanSheets}
                minSaves={minSaves} setMinSaves={setMinSaves}
                // Data Props
                leagues={leagues} teams={teams} positions={positions}
            />

            <div className="card border-0 rounded-4 overflow-hidden shadow-lg" style={{ backgroundColor: '#1e293b' }}>
                <div className="table-responsive">
                    <table className="table table-dark table-hover align-middle mb-0 text-center" style={{ backgroundColor: 'transparent' }}>
                        <thead className="text-uppercase small fw-bold text-light opacity-75 border-bottom border-secondary">
                            <tr>
                                <th className="px-4 py-3 text-start bg-transparent">Athlete</th>
                                <th className="py-3 text-start bg-transparent">Club</th>
                                <th className="py-3 bg-transparent" title="Matches Played">MP</th>
                                <th className="py-3 bg-transparent" title="Minutes Played">MIN</th>
                                <th className="py-3 text-success bg-transparent" title="Goals">⚽ G</th>
                                <th className="py-3 text-info bg-transparent" title="Assists">🤝 A</th>
                                <th className="py-3 text-warning bg-transparent" title="Yellow Cards">🟨 YC</th>
                                <th className="py-3 text-danger bg-transparent" title="Red Cards">🟥 RC</th>
                                <th className="py-3 text-end px-4 bg-transparent">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPlayers.length === 0 ? (
                                <tr><td colSpan="9" className="text-center py-5 text-light opacity-50 bg-transparent">No players match your criteria.</td></tr>
                            ) : (
                                filteredPlayers.map(p => (
                                    <tr key={p.id}>
                                        <td className="px-4 py-3 text-start bg-transparent border-secondary">
                                            <div className="d-flex align-items-center">
                                                <div className="bg-dark rounded-circle d-flex justify-content-center align-items-center text-white me-3 fw-bold flex-shrink-0" style={{ width: '45px', height: '45px', fontSize: '1.2rem' }}>
                                                    {p.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="fw-bold text-white">{p.fullName}</div>
                                                    <div className="small text-light opacity-50">
                                                        {p.position} | Age: {p.age}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-start bg-transparent border-secondary">
                                            {p.teamName !== "Free Agent" ? <span className="fw-bold text-info">{p.teamName}</span> : <span className="text-muted fst-italic">Free Agent</span>}
                                        </td>
                                        <td className="fw-bold bg-transparent border-secondary text-white">{p.matchesPlayed}</td>
                                        <td className="text-light opacity-75 bg-transparent border-secondary">{p.minutesPlayed}'</td>
                                        <td className="fw-bold text-success fs-5 bg-transparent border-secondary">{p.totalGoals}</td>
                                        <td className="fw-bold text-info fs-5 bg-transparent border-secondary">{p.totalAssists}</td>
                                        <td className="fw-bold text-warning bg-transparent border-secondary">{p.totalYellowCards}</td>
                                        <td className="fw-bold text-danger bg-transparent border-secondary">{p.totalRedCards}</td>
                                        <td className="text-end px-4 bg-transparent border-secondary">
                                            <button onClick={() => viewProfile(p.id)} className="btn btn-sm btn-info text-dark fw-bold px-3 rounded-pill shadow-sm">
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