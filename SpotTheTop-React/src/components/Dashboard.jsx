import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = "https://localhost:44306/api"; 

export default function Dashboard() {
    // --- State за реални данни от API ---
    const [approvedPlayers, setApprovedPlayers] = useState([]);
    const [pendingPlayers, setPendingPlayers] = useState([]);
    const [pendingRoles, setPendingRoles] = useState([]);
    const [roles, setRoles] = useState([]);
    
    // --- State за UI и Навигация ---
    const [activeTab, setActiveTab] = useState('players');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLeague, setSelectedLeague] = useState('all'); // Филтър за отбори
    
    // --- State за временно хардкоднати данни (докато направим бекенд контролерите) ---
    const [leagues, setLeagues] = useState([
        { id: 1, name: "Efbet Лига", country: "Bulgaria" }
    ]);
    const [teams, setTeams] = useState([
        { id: 1, name: "ПФК Левски", city: "София", leagueId: 1 },
        { id: 2, name: "ПФК ЦСКА", city: "София", leagueId: 1 }
    ]);

    // --- State за Admin форми ---
    const [promoteEmail, setPromoteEmail] = useState('');
    const [promoteMessage, setPromoteMessage] = useState('');
    const [promoteError, setPromoteError] = useState('');
    
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            navigate('/'); 
            return;
        }

        const userRoles = JSON.parse(localStorage.getItem('userRoles') || "[]");
        setRoles(userRoles);

        fetchApprovedPlayers(token);
        if (userRoles.includes('Admin')) {
            fetchPendingPlayers(token);
            fetchPendingRoles(token);
        }
    }, [navigate]);

    const fetchApprovedPlayers = async (token) => {
        const res = await fetch(`${API_URL}/Players`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setApprovedPlayers(await res.json());
    };

    const fetchPendingPlayers = async (token) => {
        const res = await fetch(`${API_URL}/Players/pending`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setPendingPlayers(await res.json());
    };

    const fetchPendingRoles = async (token) => {
        const res = await fetch(`${API_URL}/Auth/pending-roles`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setPendingRoles(await res.json());
    };

    const handleApprovePlayer = async (id) => {
        const token = localStorage.getItem('jwtToken');
        const res = await fetch(`${API_URL}/Players/${id}/approve`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            fetchApprovedPlayers(token);
            fetchPendingPlayers(token);
        }
    };

    const handleApproveRole = async (email) => {
        const token = localStorage.getItem('jwtToken');
        const res = await fetch(`${API_URL}/Auth/approve-role`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ email })
        });
        if (res.ok) fetchPendingRoles(token); 
    };

    const handlePromote = async (e) => {
        e.preventDefault();
        setPromoteMessage('');
        setPromoteError('');
        const token = localStorage.getItem('jwtToken');

        try {
            const res = await fetch(`${API_URL}/Auth/promote-to-admin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ email: promoteEmail })
            });

            if (res.ok) {
                const text = await res.text();
                setPromoteMessage(text);
                setPromoteEmail(''); 
            } else {
                const text = await res.text();
                setPromoteError(text || "Failed to promote user.");
            }
        } catch (err) {
            setPromoteError("Cannot connect to the server.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userRoles');
        navigate('/');
    };

    // Филтрираме отборите спрямо избраната лига
    const filteredTeams = selectedLeague === 'all' 
        ? teams 
        : teams.filter(t => t.leagueId === parseInt(selectedLeague));

    const renderContent = () => {
        switch (activeTab) {
            case 'leagues':
                return (
                    <div className="card shadow border-0 rounded-4">
                        <div className="card-header bg-primary text-white fw-bold">Active Leagues</div>
                        <div className="list-group list-group-flush">
                            {leagues.map(l => (
                                <button key={l.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3">
                                    <div>
                                        <h5 className="mb-1 fw-bold">{l.name}</h5>
                                        <small className="text-muted">📍 {l.country}</small>
                                    </div>
                                    <span className="badge bg-primary rounded-pill">View Teams ➔</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'teams':
                return (
                    <div className="card shadow border-0 rounded-4">
                        <div className="card-header bg-primary text-white fw-bold d-flex justify-content-between align-items-center">
                            <span>Teams Directory</span>
                            <select 
                                className="form-select form-select-sm w-auto" 
                                value={selectedLeague} 
                                onChange={(e) => setSelectedLeague(e.target.value)}
                            >
                                <option value="all">All Leagues</option>
                                {leagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                        </div>
                        <div className="list-group list-group-flush">
                            {filteredTeams.length === 0 && <div className="p-4 text-center text-muted">No teams found in this league.</div>}
                            {filteredTeams.map(t => (
                                <button key={t.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3">
                                    <div>
                                        <h5 className="mb-1 fw-bold">{t.name}</h5>
                                        <small className="text-muted">🏟️ {t.stadium} | 📍 {t.city}</small>
                                    </div>
                                    <span className="badge bg-secondary rounded-pill">View Roster ➔</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'players':
                return (
                    <div className="card shadow border-0 rounded-4">
                        <div className="card-header bg-success text-white fw-bold d-flex justify-content-between align-items-center">
                            <span>Verified Players Database</span>
                            <span className="badge bg-light text-dark">{approvedPlayers.length} Players</span>
                        </div>
                        <div className="list-group list-group-flush">
                            {approvedPlayers.length === 0 && <div className="p-4 text-center text-muted">No approved players yet.</div>}
                            {approvedPlayers.map(p => (
                                <button key={p.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3">
                                    <div>
                                        <span className="fw-bold fs-5">{p.fullName}</span> 
                                        <span className="badge bg-secondary ms-2">{p.position}</span>
                                    </div>
                                    <span className="badge bg-success rounded-pill">View Profile ➔</span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'scouts': 
                return <div className="text-center py-5 text-muted"><h3>📋 Scouts Network</h3><p>Scout profiles and reports will appear here.</p></div>;
            case 'admin':
                return (
                    <div className="row">
                        {/* Лява колона */}
                        <div className="col-lg-7 mb-4">
                            <div className="card shadow border-0 rounded-4 mb-4">
                                <div className="card-header bg-info text-white fw-bold">Pending Account Roles</div>
                                <ul className="list-group list-group-flush">
                                    {pendingRoles.length === 0 && <li className="list-group-item text-muted">No pending role requests.</li>}
                                    {pendingRoles.map((pr, idx) => (
                                        <li key={idx} className="list-group-item d-flex justify-content-between align-items-center bg-light">
                                            <div>
                                                <span className="fw-bold">{pr.email}</span> 
                                                <span className="badge bg-primary ms-2 text-uppercase">Wants to be: {pr.requestedRole}</span>
                                            </div>
                                            <button onClick={() => handleApproveRole(pr.email)} className="btn btn-sm btn-info fw-bold text-white">Approve</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="card shadow border-0 rounded-4">
                                <div className="card-header bg-warning fw-bold text-dark">Pending Player Profiles</div>
                                <ul className="list-group list-group-flush">
                                    {pendingPlayers.length === 0 && <li className="list-group-item text-muted">No pending requests.</li>}
                                    {pendingPlayers.map(p => (
                                        <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
                                            <span><strong>{p.fullName}</strong> ({p.position})</span>
                                            <button onClick={() => handleApprovePlayer(p.id)} className="btn btn-sm btn-success fw-bold">Approve</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Дясна колона */}
                        <div className="col-lg-5 mb-4">
                            <div className="card shadow border-0 rounded-4">
                                <div className="card-header bg-danger text-white fw-bold">System Administration</div>
                                <div className="card-body">
                                    <h6 className="card-title fw-bold">Promote User to Admin</h6>
                                    {promoteMessage && <div className="alert alert-success py-2">{promoteMessage}</div>}
                                    {promoteError && <div className="alert alert-danger py-2">{promoteError}</div>}
                                    <form onSubmit={handlePromote}>
                                        <div className="input-group mb-3">
                                            <input type="email" className="form-control" placeholder="user@email.com" required
                                                   value={promoteEmail} onChange={e => setPromoteEmail(e.target.value)} />
                                            <button className="btn btn-outline-danger fw-bold" type="submit">Promote</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="bg-light min-vh-100">
            {/* --- ГОРА НАВИГАЦИЯ --- */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-3">
                <div className="container d-flex justify-content-between align-items-center">
                    
                    {/* Ляво: Лого и Табове */}
                    <div className="d-flex align-items-center">
                        <span className="navbar-brand fw-bold text-primary fs-4 me-4">SpotTheTop</span>
                        <div className="navbar-nav flex-row gap-2">
                            <button className={`nav-link btn btn-link text-decoration-none ${activeTab === 'leagues' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('leagues')}>Leagues</button>
                            <button className={`nav-link btn btn-link text-decoration-none ${activeTab === 'teams' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('teams')}>Teams</button>
                            <button className={`nav-link btn btn-link text-decoration-none ${activeTab === 'players' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('players')}>Players</button>
                            <button className={`nav-link btn btn-link text-decoration-none ${activeTab === 'scouts' ? 'active fw-bold' : ''}`} onClick={() => setActiveTab('scouts')}>Scouts</button>
                            
                            {roles.includes('Admin') && (
                                <button className={`nav-link btn btn-link text-decoration-none text-warning ${activeTab === 'admin' ? 'active fw-bold' : ''}`} 
                                        onClick={() => setActiveTab('admin')}>Admin Panel</button>
                            )}
                        </div>
                    </div>

                    {/* Дясно: Търсачка и Профил */}
                    <div className="d-flex align-items-center gap-4">
                        {/* Неактивна търсачка */}
                        <div className="input-group input-group-sm" style={{ maxWidth: '250px' }}>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Search players, teams..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="btn btn-primary" type="button">🔍</button>
                        </div>

                        <div className="d-flex align-items-center gap-3 border-start border-secondary ps-3">
                            <span className="text-light small">Role: <strong className="text-info">{roles.join(', ')}</strong></span>
                            <button onClick={handleLogout} className="btn btn-sm btn-outline-light rounded-pill px-3">Sign Out</button>
                        </div>
                    </div>

                </div>
            </nav>

            {/* --- СЪДЪРЖАНИЕ --- */}
            <div className="container mt-5">
                {renderContent()}
            </div>
        </div>
    );
}