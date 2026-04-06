import React, { useState, useEffect } from 'react';

const API_URL = "https://localhost:44306/api";

export default function DataManagement({ leagues, teams, loadData }) {
    // Стейтове за формите
    const [newLeague, setNewLeague] = useState({ name: '', country: '' });
    const [newTeam, setNewTeam] = useState({ name: '', city: '', stadium: '', leagueId: '' });
    const [newPlayer, setNewPlayer] = useState({ firstName: '', lastName: '', dateOfBirth: '', positionId: '', teamId: '' });
    const [newPosition, setNewPosition] = useState({ name: '', abbreviation: '', category: '' });

    // Стейтове за локалните списъци (които не идват от AdminPage)
    const [positions, setPositions] = useState([]);
    const [recentPlayers, setRecentPlayers] = useState([]);

    useEffect(() => {
        loadLocalData();
    }, []);

    const loadLocalData = async () => {
        const token = localStorage.getItem('jwtToken');
        
        // Дърпаме реалните позиции от базата
        fetch(`${API_URL}/Positions`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => setPositions(data))
            .catch(err => console.log(err));

        // Дърпаме вече одобрените играчи, за да ги покажем в списъка
        fetch(`${API_URL}/Players`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => setRecentPlayers(data))
            .catch(err => console.log(err));
    };

    // ==========================================
    // ФУНКЦИИ ЗА ДОБАВЯНЕ
    // ==========================================
    const handleAddLeague = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('jwtToken');
        try {
            const res = await fetch(`${API_URL}/Leagues`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newLeague)
            });
            if (res.ok) {
                setNewLeague({ name: '', country: '' });
                loadData(); // Презарежда глобалните лиги
            } else alert(await res.text());
        } catch(err) { alert("Error adding league."); }
    };

    const handleAddTeam = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('jwtToken');
        try {
            const res = await fetch(`${API_URL}/Teams`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ ...newTeam, leagueId: parseInt(newTeam.leagueId) })
            });
            if (res.ok) {
                setNewTeam({ name: '', city: '', stadium: '', leagueId: '' });
                loadData(); // Презарежда глобалните отбори
            } else alert(await res.text());
        } catch(err) { alert("Error adding team."); }
    };

    const handleAddPosition = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('jwtToken');
        try {
            const res = await fetch(`${API_URL}/Positions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newPosition)
            });
            if (res.ok) {
                setNewPosition({ name: '', abbreviation: '', category: '' });
                loadLocalData(); // Презареждаме локалните позиции
            } else alert(await res.text());
        } catch(err) { alert("Error adding position."); }
    };

    const handleAddPlayer = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('jwtToken');
        try {
            const res = await fetch(`${API_URL}/Players`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ 
                    ...newPlayer, 
                    positionId: parseInt(newPlayer.positionId),
                    teamId: newPlayer.teamId ? parseInt(newPlayer.teamId) : null 
                })
            });
            if (res.ok) {
                setNewPlayer({ firstName: '', lastName: '', dateOfBirth: '', positionId: '', teamId: '' });
                loadLocalData(); // Презареждаме играчите
                loadData(); // Ако има pending, да се ъпдейтнат и те
            } else alert(await res.text());
        } catch(err) { alert("Error adding player."); }
    };

    // ==========================================
    // ВИЗУАЛИЗАЦИЯ НА ФОРМИТЕ (СЪС СПИСЪЦИ)
    // ==========================================
    return (
        <div className="row g-4">
            
            {/* 1. ДОБАВЯНЕ НА ЛИГА */}
            <div className="col-md-6 col-xl-3">
                <div className="card shadow-sm border-0 rounded-4 h-100 d-flex flex-column">
                    <div className="card-header bg-primary text-white fw-bold py-3">➕ Add League</div>
                    <div className="card-body">
                        <form onSubmit={handleAddLeague}>
                            <input className="form-control mb-3" placeholder="League Name" required 
                                value={newLeague.name} onChange={e => setNewLeague({...newLeague, name: e.target.value})} />
                            <input className="form-control mb-3" placeholder="Country" required 
                                value={newLeague.country} onChange={e => setNewLeague({...newLeague, country: e.target.value})} />
                            <button type="submit" className="btn btn-primary w-100 fw-bold shadow-sm mb-3">Save League</button>
                        </form>
                    </div>
                    {/* Списък със скрол */}
                    <div className="card-footer bg-white border-top-0 pt-0 mt-auto">
                        <h6 className="text-muted small fw-bold mb-2 border-bottom pb-1">Recently Added</h6>
                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            <ul className="list-group list-group-flush small">
                                {leagues.slice().reverse().slice(0, 10).map(l => (
                                    <li key={l.id} className="list-group-item px-1 py-1 border-0">
                                        <i className="bi bi-caret-right-fill text-primary"></i> {l.name} <span className="text-muted">({l.country})</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. ДОБАВЯНЕ НА ОТБОР */}
            <div className="col-md-6 col-xl-3">
                <div className="card shadow-sm border-0 rounded-4 h-100 d-flex flex-column">
                    <div className="card-header bg-success text-white fw-bold py-3">➕ Add Team</div>
                    <div className="card-body">
                        <form onSubmit={handleAddTeam}>
                            <select className="form-select mb-3 border-success" required value={newTeam.leagueId} onChange={e => setNewTeam({...newTeam, leagueId: e.target.value})}>
                                <option value="">-- Select League --</option>
                                {leagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                            <input className="form-control mb-3" placeholder="Team Name" required 
                                value={newTeam.name} onChange={e => setNewTeam({...newTeam, name: e.target.value})} />
                            <input className="form-control mb-3" placeholder="City" 
                                value={newTeam.city} onChange={e => setNewTeam({...newTeam, city: e.target.value})} />
                            <input className="form-control mb-3" placeholder="Stadium" 
                                value={newTeam.stadium} onChange={e => setNewTeam({...newTeam, stadium: e.target.value})} />
                            <button type="submit" className="btn btn-success w-100 fw-bold shadow-sm mb-3">Save Team</button>
                        </form>
                    </div>
                    {/* Списък със скрол */}
                    <div className="card-footer bg-white border-top-0 pt-0 mt-auto">
                        <h6 className="text-muted small fw-bold mb-2 border-bottom pb-1">Recently Added</h6>
                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            <ul className="list-group list-group-flush small">
                                {teams.slice().reverse().slice(0, 10).map(t => (
                                    <li key={t.id} className="list-group-item px-1 py-1 border-0">
                                        <i className="bi bi-caret-right-fill text-success"></i> {t.name} <span className="text-muted">({t.leagueName})</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. ДОБАВЯНЕ НА ПОЗИЦИЯ */}
            <div className="col-md-6 col-xl-3">
                <div className="card shadow-sm border-0 rounded-4 h-100 d-flex flex-column">
                    <div className="card-header bg-info text-white fw-bold py-3">➕ Add Position</div>
                    <div className="card-body">
                        <form onSubmit={handleAddPosition}>
                            <input className="form-control mb-3" placeholder="Position Name (e.g. Winger)" required 
                                value={newPosition.name} onChange={e => setNewPosition({...newPosition, name: e.target.value})} />
                            <input className="form-control mb-3" placeholder="Abbreviation (e.g. LW)" required maxLength="4"
                                value={newPosition.abbreviation} onChange={e => setNewPosition({...newPosition, abbreviation: e.target.value})} />
                            <select className="form-select mb-3" required value={newPosition.category} onChange={e => setNewPosition({...newPosition, category: e.target.value})}>
                                <option value="">-- Select Category --</option>
                                <option value="Goalkeeper">Goalkeeper</option>
                                <option value="Defender">Defender</option>
                                <option value="Midfielder">Midfielder</option>
                                <option value="Forward">Forward</option>
                            </select>
                            <button type="submit" className="btn btn-info text-white w-100 fw-bold shadow-sm mb-3">Save Position</button>
                        </form>
                    </div>
                    {/* Списък със скрол */}
                    <div className="card-footer bg-white border-top-0 pt-0 mt-auto">
                        <h6 className="text-muted small fw-bold mb-2 border-bottom pb-1">Recently Added</h6>
                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            <ul className="list-group list-group-flush small">
                                {positions.slice().reverse().slice(0, 10).map(p => (
                                    <li key={p.id} className="list-group-item px-1 py-1 border-0">
                                        <span className="badge bg-info text-dark me-2">{p.abbreviation}</span> {p.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. ДОБАВЯНЕ НА ИГРАЧ */}
            <div className="col-md-6 col-xl-3">
                <div className="card shadow-sm border-0 rounded-4 h-100 d-flex flex-column">
                    <div className="card-header bg-warning text-dark fw-bold py-3">➕ Add Player</div>
                    <div className="card-body">
                        <form onSubmit={handleAddPlayer}>
                            <div className="d-flex gap-2 mb-2">
                                <input className="form-control form-control-sm" placeholder="First Name" required 
                                    value={newPlayer.firstName} onChange={e => setNewPlayer({...newPlayer, firstName: e.target.value})} />
                                <input className="form-control form-control-sm" placeholder="Last Name" required 
                                    value={newPlayer.lastName} onChange={e => setNewPlayer({...newPlayer, lastName: e.target.value})} />
                            </div>
                            <div className="mb-2">
                                <label className="form-label small text-muted mb-0">Date of Birth</label>
                                <input type="date" className="form-control form-control-sm" required 
                                    value={newPlayer.dateOfBirth} onChange={e => setNewPlayer({...newPlayer, dateOfBirth: e.target.value})} />
                            </div>
                            <select className="form-select form-select-sm mb-2 border-warning" required value={newPlayer.positionId} onChange={e => setNewPlayer({...newPlayer, positionId: e.target.value})}>
                                <option value="">-- Position --</option>
                                {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <select className="form-select form-select-sm mb-3" value={newPlayer.teamId} onChange={e => setNewPlayer({...newPlayer, teamId: e.target.value})}>
                                <option value="">Free Agent (No Team)</option>
                                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <button type="submit" className="btn btn-warning w-100 fw-bold shadow-sm mb-3">Save Player</button>
                        </form>
                    </div>
                    {/* Списък със скрол */}
                    <div className="card-footer bg-white border-top-0 pt-0 mt-auto">
                        <h6 className="text-muted small fw-bold mb-2 border-bottom pb-1">Recently Added</h6>
                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            <ul className="list-group list-group-flush small">
                                {recentPlayers.slice().reverse().slice(0, 10).map(p => (
                                    <li key={p.id} className="list-group-item px-1 py-1 border-0">
                                        <i className="bi bi-person-fill text-warning me-1"></i> {p.fullName} <span className="text-muted small">({p.position})</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}