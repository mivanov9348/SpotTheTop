import React, { useState, useEffect } from 'react';

const API_URL = "https://localhost:44306/api";

export default function DataManagement({ leagues, teams, loadData }) {
    const [newLeague, setNewLeague] = useState({ name: '', country: '' });
    const [newTeam, setNewTeam] = useState({ name: '', city: '', stadium: '', leagueId: '' });
    
    // НОВО: Пълният стейт за играч
    const initialPlayerState = { 
        firstName: '', lastName: '', dateOfBirth: '', nationality: '', 
        heightCm: '', weightKg: '', preferredFoot: '', profileImageUrl: '', 
        jerseyNumber: '', marketValueEuro: '', contractEndDate: '', agentName: '', 
        positionId: '', teamId: '' 
    };
    const [newPlayer, setNewPlayer] = useState(initialPlayerState);
    
    const [newPosition, setNewPosition] = useState({ name: '', abbreviation: '', category: '' });
    const [newMatch, setNewMatch] = useState({ leagueId: '', seasonId: '', round: 1, homeTeamId: '', awayTeamId: '', matchDate: '' });
    const [newSeason, setNewSeason] = useState({ name: '', leagueIds: [], startDate: '', endDate: '', isActive: true });

    const [positions, setPositions] = useState([]);
    const [recentPlayers, setRecentPlayers] = useState([]);
    const [seasons, setSeasons] = useState([]); 
    const baseCategories = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

    useEffect(() => { loadLocalData(); }, []);

    const loadLocalData = async () => {
        const token = localStorage.getItem('jwtToken');
        fetch(`${API_URL}/Positions`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()).then(data => setPositions(data)).catch(err => console.log(err));
        fetch(`${API_URL}/Players`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()).then(data => setRecentPlayers(data)).catch(err => console.log(err));
        fetch(`${API_URL}/Seasons`, { headers: { 'Authorization': `Bearer ${token}` } }).then(res => res.json()).then(data => setSeasons(data)).catch(err => console.log(err));
    };

    const csvToJson = (csvStr, expectedHeaders) => {
        const lines = csvStr.split('\n').filter(line => line.trim().length > 0);
        if (lines.length < 2) return []; 
        const delimiter = lines[0].includes(';') ? ';' : ',';
        return lines.slice(1).map(line => {
            const values = line.split(delimiter).map(v => v.trim());
            let obj = {};
            expectedHeaders.forEach((header, index) => { obj[header] = values[index]; });
            return obj;
        });
    };

    const handleImportCSV = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const csvText = event.target.result;
            let payload = [];
            let endpoint = '';

            try {
                if (type === 'leagues') {
                    payload = csvToJson(csvText, ['name', 'country']);
                    endpoint = `${API_URL}/Leagues/bulk`;
                } else if (type === 'teams') {
                    payload = csvToJson(csvText, ['leagueId', 'name', 'city', 'stadium']).map(p => ({...p, leagueId: parseInt(p.leagueId)}));
                    endpoint = `${API_URL}/Teams/bulk`;
                } else if (type === 'positions') {
                    payload = csvToJson(csvText, ['name', 'abbreviation', 'category']);
                    endpoint = `${API_URL}/Positions/bulk`;
                } else if (type === 'players') {
                    // Обновен масив за CSV (ако искат да качват масово)
                    payload = csvToJson(csvText, ['firstName', 'lastName', 'dateOfBirth', 'nationality', 'positionId', 'teamId', 'heightCm', 'weightKg', 'preferredFoot', 'jerseyNumber', 'marketValueEuro', 'contractEndDate', 'agentName'])
                               .map(p => ({
                                   ...p, 
                                   positionId: parseInt(p.positionId), 
                                   teamId: p.teamId ? parseInt(p.teamId) : null,
                                   heightCm: p.heightCm ? parseInt(p.heightCm) : null,
                                   weightKg: p.weightKg ? parseInt(p.weightKg) : null,
                                   jerseyNumber: p.jerseyNumber ? parseInt(p.jerseyNumber) : null,
                                   marketValueEuro: p.marketValueEuro ? parseFloat(p.marketValueEuro) : null,
                                   contractEndDate: p.contractEndDate || null,
                               }));
                    endpoint = `${API_URL}/Players/bulk`;
                } else if (type === 'matches') {
                    payload = csvToJson(csvText, ['leagueId', 'seasonId', 'round', 'homeTeamId', 'awayTeamId', 'matchDate'])
                               .map(m => ({
                                   leagueId: parseInt(m.leagueId), seasonId: parseInt(m.seasonId), round: parseInt(m.round),
                                   homeTeamId: parseInt(m.homeTeamId), awayTeamId: parseInt(m.awayTeamId), matchDate: m.matchDate
                               }));
                    endpoint = `${API_URL}/Matches/bulk`;
                }

                if (payload.length === 0) return alert("CSV is empty or invalid format.");

                const token = localStorage.getItem('jwtToken');
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });

                alert(await res.text());
                if (res.ok) { loadData(); loadLocalData(); }
            } catch (err) { alert("Error parsing CSV or sending data."); }
            e.target.value = null; 
        };
        reader.readAsText(file);
    };

    const postData = async (endpoint, data, resetFn) => {
        const token = localStorage.getItem('jwtToken');
        const res = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        if (res.ok) { resetFn(); loadData(); loadLocalData(); }
        else alert(await res.text());
    };

    const handleAddLeague = (e) => { e.preventDefault(); postData('Leagues', newLeague, () => setNewLeague({ name: '', country: '' })); };
    const handleAddTeam = (e) => { e.preventDefault(); postData('Teams', { ...newTeam, leagueId: parseInt(newTeam.leagueId) }, () => setNewTeam({ name: '', city: '', stadium: '', leagueId: '' })); };
    const handleAddPosition = (e) => { e.preventDefault(); postData('Positions', newPosition, () => setNewPosition({ name: '', abbreviation: '', category: '' })); };
    
    // НОВО: Изпращане на данните за играч с правилните типове (числа, null)
    const handleAddPlayer = (e) => { 
        e.preventDefault(); 
        const payload = {
            ...newPlayer,
            positionId: parseInt(newPlayer.positionId),
            teamId: newPlayer.teamId ? parseInt(newPlayer.teamId) : null,
            heightCm: newPlayer.heightCm ? parseInt(newPlayer.heightCm) : null,
            weightKg: newPlayer.weightKg ? parseInt(newPlayer.weightKg) : null,
            jerseyNumber: newPlayer.jerseyNumber ? parseInt(newPlayer.jerseyNumber) : null,
            marketValueEuro: newPlayer.marketValueEuro ? parseFloat(newPlayer.marketValueEuro) : null,
            contractEndDate: newPlayer.contractEndDate || null,
            preferredFoot: newPlayer.preferredFoot || null,
            agentName: newPlayer.agentName || null,
            profileImageUrl: newPlayer.profileImageUrl || null
        };
        postData('Players', payload, () => setNewPlayer(initialPlayerState)); 
    };
    
    const handleAddSeason = (e) => {
        e.preventDefault();
        if (newSeason.leagueIds.length === 0) return alert("Please select at least one league.");
        postData('Seasons', newSeason, () => setNewSeason({ name: '', leagueIds: [], startDate: '', endDate: '', isActive: true }));
    };

    const handleLeagueToggle = (leagueId) => {
        setNewSeason(prev => {
            const isSelected = prev.leagueIds.includes(leagueId);
            if (isSelected) return { ...prev, leagueIds: prev.leagueIds.filter(id => id !== leagueId) };
            else return { ...prev, leagueIds: [...prev.leagueIds, leagueId] };
        });
    };

    const handleAddMatch = (e) => {
        e.preventDefault();
        if (newMatch.homeTeamId === newMatch.awayTeamId) return alert("Home and Away teams must be different!");
        postData('Matches', {
            ...newMatch,
            leagueId: parseInt(newMatch.leagueId), seasonId: parseInt(newMatch.seasonId), round: parseInt(newMatch.round),
            homeTeamId: parseInt(newMatch.homeTeamId), awayTeamId: parseInt(newMatch.awayTeamId)
        }, () => setNewMatch({ leagueId: '', seasonId: '', round: 1, homeTeamId: '', awayTeamId: '', matchDate: '' }));
    };

    const filteredTeamsForMatch = teams.filter(t => t.leagueId === parseInt(newMatch.leagueId));
    const filteredSeasonsForMatch = seasons.filter(s => s.leagueId === parseInt(newMatch.leagueId));

    return (
        <div className="row g-4">
            
            {/* 1. ДОБАВЯНЕ НА ЛИГА */}
            <div className="col-md-6 col-xl-3">
                <div className="card shadow-sm border-0 rounded-4 h-100 d-flex flex-column" style={{ backgroundColor: '#1e293b' }}>
                    <div className="card-header bg-primary text-white fw-bold py-3">➕ Add League</div>
                    <div className="card-body">
                        <form onSubmit={handleAddLeague}>
                            <input className="form-control mb-3 bg-dark text-white border-secondary shadow-none" placeholder="League Name" required 
                                value={newLeague.name} onChange={e => setNewLeague({...newLeague, name: e.target.value})} />
                            <input className="form-control mb-3 bg-dark text-white border-secondary shadow-none" placeholder="Country" required 
                                value={newLeague.country} onChange={e => setNewLeague({...newLeague, country: e.target.value})} />
                            
                            <div className="d-flex gap-2 mb-3">
                                <button type="submit" className="btn btn-primary w-100 fw-bold shadow-sm">Save</button>
                                <label className="btn btn-outline-primary shadow-sm mb-0 px-3" title="Import CSV">
                                    <i className="bi bi-filetype-csv"></i>
                                    <input type="file" accept=".csv" hidden onChange={(e) => handleImportCSV(e, 'leagues')} />
                                </label>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* 2. ДОБАВЯНЕ НА ОТБОР */}
            <div className="col-md-6 col-xl-3">
                <div className="card shadow-sm border-0 rounded-4 h-100 d-flex flex-column" style={{ backgroundColor: '#1e293b' }}>
                    <div className="card-header bg-success text-white fw-bold py-3">➕ Add Team</div>
                    <div className="card-body">
                        <form onSubmit={handleAddTeam}>
                            <select className="form-select mb-3 bg-dark text-white border-success shadow-none" required value={newTeam.leagueId} onChange={e => setNewTeam({...newTeam, leagueId: e.target.value})}>
                                <option value="">-- Select League --</option>
                                {leagues.map(l => <option key={l.id} value={l.id}>[{l.id}] {l.name}</option>)}
                            </select>
                            <input className="form-control mb-3 bg-dark text-white border-secondary shadow-none" placeholder="Team Name" required 
                                value={newTeam.name} onChange={e => setNewTeam({...newTeam, name: e.target.value})} />
                            <input className="form-control mb-3 bg-dark text-white border-secondary shadow-none" placeholder="City" 
                                value={newTeam.city} onChange={e => setNewTeam({...newTeam, city: e.target.value})} />
                            <input className="form-control mb-3 bg-dark text-white border-secondary shadow-none" placeholder="Stadium" 
                                value={newTeam.stadium} onChange={e => setNewTeam({...newTeam, stadium: e.target.value})} />
                            
                            <div className="d-flex gap-2 mb-3">
                                <button type="submit" className="btn btn-success w-100 fw-bold shadow-sm">Save</button>
                                <label className="btn btn-outline-success shadow-sm mb-0 px-3" title="Import CSV">
                                    <i className="bi bi-filetype-csv"></i>
                                    <input type="file" accept=".csv" hidden onChange={(e) => handleImportCSV(e, 'teams')} />
                                </label>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* 3. ДОБАВЯНЕ НА ПОЗИЦИЯ */}
            <div className="col-md-6 col-xl-3">
                <div className="card shadow-sm border-0 rounded-4 h-100 d-flex flex-column" style={{ backgroundColor: '#1e293b' }}>
                    <div className="card-header bg-info text-dark fw-bold py-3">➕ Add Position</div>
                    <div className="card-body">
                        <form onSubmit={handleAddPosition}>
                            <input className="form-control mb-3 bg-dark text-white border-secondary shadow-none" placeholder="Position Name" required 
                                value={newPosition.name} onChange={e => setNewPosition({...newPosition, name: e.target.value})} />
                            <input className="form-control mb-3 bg-dark text-white border-secondary shadow-none" placeholder="Abbreviation (e.g. LW)" required maxLength="4"
                                value={newPosition.abbreviation} onChange={e => setNewPosition({...newPosition, abbreviation: e.target.value})} />
                            <select className="form-select mb-3 bg-dark text-white border-secondary shadow-none" required value={newPosition.category} onChange={e => setNewPosition({...newPosition, category: e.target.value})}>
                                <option value="">-- Category --</option>
                                {baseCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            
                            <div className="d-flex gap-2 mb-3">
                                <button type="submit" className="btn btn-info text-dark w-100 fw-bold shadow-sm">Save</button>
                                <label className="btn btn-outline-info shadow-sm mb-0 px-3" title="Import CSV">
                                    <i className="bi bi-filetype-csv"></i>
                                    <input type="file" accept=".csv" hidden onChange={(e) => handleImportCSV(e, 'positions')} />
                                </label>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* 4. ДОБАВЯНЕ НА ИГРАЧ (РАЗШИРЕНА ФОРМА) */}
            <div className="col-md-6 col-xl-3">
                <div className="card shadow-sm border-0 rounded-4 h-100 d-flex flex-column" style={{ backgroundColor: '#1e293b' }}>
                    <div className="card-header bg-warning text-dark fw-bold py-3">➕ Add Player</div>
                    <div className="card-body custom-scrollbar" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <form onSubmit={handleAddPlayer}>
                            
                            {/* Основни Данни */}
                            <div className="row g-2 mb-2">
                                <div className="col-6">
                                    <input className="form-control form-control-sm bg-dark text-white border-secondary placeholder-gray shadow-none" placeholder="First Name" required 
                                        value={newPlayer.firstName} onChange={e => setNewPlayer({...newPlayer, firstName: e.target.value})} />
                                </div>
                                <div className="col-6">
                                    <input className="form-control form-control-sm bg-dark text-white border-secondary placeholder-gray shadow-none" placeholder="Last Name" required 
                                        value={newPlayer.lastName} onChange={e => setNewPlayer({...newPlayer, lastName: e.target.value})} />
                                </div>
                            </div>
                            
                            <div className="row g-2 mb-2">
                                <div className="col-6">
                                    <input type="date" className="form-control form-control-sm bg-dark text-white border-secondary shadow-none" required title="Date of Birth"
                                        value={newPlayer.dateOfBirth} onChange={e => setNewPlayer({...newPlayer, dateOfBirth: e.target.value})} />
                                </div>
                                <div className="col-6">
                                    <input className="form-control form-control-sm bg-dark text-white border-secondary placeholder-gray shadow-none" placeholder="Nationality" required 
                                        value={newPlayer.nationality} onChange={e => setNewPlayer({...newPlayer, nationality: e.target.value})} />
                                </div>
                            </div>

                            <div className="row g-2 mb-3">
                                <div className="col-6">
                                    <select className="form-select form-select-sm bg-dark text-white border-warning shadow-none" required value={newPlayer.positionId} onChange={e => setNewPlayer({...newPlayer, positionId: e.target.value})}>
                                        <option value="">-- Position --</option>
                                        {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-6">
                                    <select className="form-select form-select-sm bg-dark text-white border-secondary shadow-none" value={newPlayer.teamId} onChange={e => setNewPlayer({...newPlayer, teamId: e.target.value})}>
                                        <option value="">Free Agent</option>
                                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Физически Данни */}
                            <div className="row g-2 mb-2 border-top border-secondary pt-2">
                                <div className="col-4">
                                    <input type="number" className="form-control form-control-sm bg-dark text-white border-secondary placeholder-gray shadow-none" placeholder="Height cm" 
                                        value={newPlayer.heightCm} onChange={e => setNewPlayer({...newPlayer, heightCm: e.target.value})} />
                                </div>
                                <div className="col-4">
                                    <input type="number" className="form-control form-control-sm bg-dark text-white border-secondary placeholder-gray shadow-none" placeholder="Weight kg" 
                                        value={newPlayer.weightKg} onChange={e => setNewPlayer({...newPlayer, weightKg: e.target.value})} />
                                </div>
                                <div className="col-4">
                                    <select className="form-select form-select-sm bg-dark text-white border-secondary shadow-none" value={newPlayer.preferredFoot} onChange={e => setNewPlayer({...newPlayer, preferredFoot: e.target.value})}>
                                        <option value="">Foot</option><option value="Right">Right</option><option value="Left">Left</option><option value="Both">Both</option>
                                    </select>
                                </div>
                            </div>

                            {/* Договор и Мениджър */}
                            <div className="row g-2 mb-2">
                                <div className="col-4">
                                    <input type="number" className="form-control form-control-sm bg-dark text-white border-secondary placeholder-gray shadow-none" placeholder="Shirt #" 
                                        value={newPlayer.jerseyNumber} onChange={e => setNewPlayer({...newPlayer, jerseyNumber: e.target.value})} />
                                </div>
                                <div className="col-8">
                                    <input type="number" step="0.01" className="form-control form-control-sm bg-dark text-white border-secondary placeholder-gray shadow-none" placeholder="Market Value (€)" 
                                        value={newPlayer.marketValueEuro} onChange={e => setNewPlayer({...newPlayer, marketValueEuro: e.target.value})} />
                                </div>
                                <div className="col-6">
                                    <input type="text" className="form-control form-control-sm bg-dark text-white border-secondary placeholder-gray shadow-none" placeholder="Agent Name" 
                                        value={newPlayer.agentName} onChange={e => setNewPlayer({...newPlayer, agentName: e.target.value})} />
                                </div>
                                <div className="col-6">
                                    <input type="date" className="form-control form-control-sm bg-dark text-white border-secondary shadow-none" title="Contract End Date"
                                        value={newPlayer.contractEndDate} onChange={e => setNewPlayer({...newPlayer, contractEndDate: e.target.value})} />
                                </div>
                            </div>

                            <input type="text" className="form-control form-control-sm mb-3 bg-dark text-white border-secondary placeholder-gray shadow-none" placeholder="Profile Image URL (Optional)" 
                                value={newPlayer.profileImageUrl} onChange={e => setNewPlayer({...newPlayer, profileImageUrl: e.target.value})} />

                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-warning text-dark w-100 fw-bold shadow-sm">Save</button>
                                <label className="btn btn-outline-warning shadow-sm mb-0 px-3" title="Import CSV">
                                    <i className="bi bi-filetype-csv"></i>
                                    <input type="file" accept=".csv" hidden onChange={(e) => handleImportCSV(e, 'players')} />
                                </label>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* 5. ДОБАВЯНЕ НА СЕЗОН (С ОТМЕТКИ ЗА ЛИГИТЕ) */}
            <div className="col-md-6 col-xl-3">
                <div className="card shadow-sm border-0 rounded-4 h-100 d-flex flex-column" style={{ backgroundColor: '#1e293b' }}>
                    <div className="card-header bg-secondary text-white fw-bold py-3">📅 Add Season & Standings</div>
                    <div className="card-body">
                        <form onSubmit={handleAddSeason}>
                            
                            <input className="form-control mb-2 bg-dark text-white border-secondary shadow-none" placeholder="Season Name (e.g. 2024/2025)" required 
                                value={newSeason.name} onChange={e => setNewSeason({...newSeason, name: e.target.value})} />
                            
                            <div className="d-flex gap-2 mb-2">
                                <div className="w-50">
                                    <label className="text-light opacity-75 small">Start</label>
                                    <input type="date" className="form-control form-control-sm bg-dark text-white border-secondary shadow-none" required 
                                        value={newSeason.startDate} onChange={e => setNewSeason({...newSeason, startDate: e.target.value})} />
                                </div>
                                <div className="w-50">
                                    <label className="text-light opacity-75 small">End</label>
                                    <input type="date" className="form-control form-control-sm bg-dark text-white border-secondary shadow-none" required 
                                        value={newSeason.endDate} onChange={e => setNewSeason({...newSeason, endDate: e.target.value})} />
                                </div>
                            </div>
                            
                            <div className="form-check form-switch mb-2">
                                <input className="form-check-input" type="checkbox" role="switch" id="activeSeasonSwitch" 
                                    checked={newSeason.isActive} onChange={e => setNewSeason({...newSeason, isActive: e.target.checked})} />
                                <label className="form-check-label text-light opacity-75 small" htmlFor="activeSeasonSwitch">Is Current Season?</label>
                            </div>

                            {/* ИЗБОР НА ЛИГИ (Чекбоксове) */}
                            <div className="mb-3 border border-secondary rounded p-2 custom-scrollbar" style={{ maxHeight: '110px', overflowY: 'auto' }}>
                                <label className="text-info small fw-bold mb-1 d-block">Select Leagues for this season:</label>
                                {leagues.length === 0 ? <div className="small text-muted">No leagues available.</div> : 
                                    leagues.map(l => (
                                        <div className="form-check" key={l.id}>
                                            <input className="form-check-input" type="checkbox" 
                                                id={`league_${l.id}`} 
                                                checked={newSeason.leagueIds.includes(l.id)} 
                                                onChange={() => handleLeagueToggle(l.id)} 
                                            />
                                            <label className="form-check-label text-white small" htmlFor={`league_${l.id}`}>
                                                {l.name}
                                            </label>
                                        </div>
                                    ))
                                }
                            </div>
                            <div className="form-text text-warning small mb-3 lh-sm" style={{fontSize: '0.7rem'}}>
                                All teams in the selected leagues will automatically be enrolled in the standings with 0 points.
                            </div>

                            <button type="submit" className="btn btn-secondary w-100 fw-bold shadow-sm">Create Season(s)</button>
                        </form>
                    </div>
                </div>
            </div>

            {/* 6. ДОБАВЯНЕ НА МАЧ (FIXTURE) */}
            <div className="col-md-6 col-xl-3">
                <div className="card shadow-sm border-0 rounded-4 h-100 d-flex flex-column" style={{ backgroundColor: '#1e293b' }}>
                    <div className="card-header bg-danger text-white fw-bold py-3">⚔️ Add Match Fixture</div>
                    <div className="card-body">
                        <form onSubmit={handleAddMatch}>
                            
                            <select className="form-select form-select-sm mb-2 bg-dark text-white border-danger shadow-none" required value={newMatch.leagueId} onChange={e => setNewMatch({...newMatch, leagueId: e.target.value, homeTeamId: '', awayTeamId: '', seasonId: ''})}>
                                <option value="">-- Select League --</option>
                                {leagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>

                            <select className="form-select form-select-sm mb-2 bg-dark text-white border-secondary shadow-none" required value={newMatch.seasonId} onChange={e => setNewMatch({...newMatch, seasonId: e.target.value})} disabled={!newMatch.leagueId}>
                                <option value="">-- Select Season --</option>
                                {filteredSeasonsForMatch.map(s => <option key={s.id} value={s.id}>{s.name} {s.isActive ? '(Current)' : ''}</option>)}
                            </select>

                            <input type="number" className="form-control form-control-sm mb-2 bg-dark text-white border-secondary shadow-none" placeholder="Round" required min="1"
                                value={newMatch.round} onChange={e => setNewMatch({...newMatch, round: e.target.value})} title="Matchday/Round" />

                            <select className="form-select form-select-sm mb-2 bg-dark text-white border-secondary shadow-none" required value={newMatch.homeTeamId} onChange={e => setNewMatch({...newMatch, homeTeamId: e.target.value})} disabled={!newMatch.leagueId}>
                                <option value="">-- Home Team --</option>
                                {filteredTeamsForMatch.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>

                            <select className="form-select form-select-sm mb-2 bg-dark text-white border-secondary shadow-none" required value={newMatch.awayTeamId} onChange={e => setNewMatch({...newMatch, awayTeamId: e.target.value})} disabled={!newMatch.leagueId}>
                                <option value="">-- Away Team --</option>
                                {filteredTeamsForMatch.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>

                            <input type="datetime-local" className="form-control form-control-sm mb-3 bg-dark text-white border-secondary shadow-none" required 
                                value={newMatch.matchDate} onChange={e => setNewMatch({...newMatch, matchDate: e.target.value})} />

                            <div className="d-flex gap-2 mb-2">
                                <button type="submit" className="btn btn-danger w-100 fw-bold shadow-sm">Schedule</button>
                                <label className="btn btn-outline-danger shadow-sm mb-0 px-3" title="Import CSV">
                                    <i className="bi bi-filetype-csv"></i>
                                    <input type="file" accept=".csv" hidden onChange={(e) => handleImportCSV(e, 'matches')} />
                                </label>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
            `}} />
        </div>
    );
}