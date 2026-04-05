import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Импортираме новите под-компоненти
import LeaguesTab from './dashboard-tabs/LeaguesTab';
import TeamsTab from './dashboard-tabs/TeamsTab';
import PlayersTab from './dashboard-tabs/PlayersTab';
import AdminPanel from './dashboard-tabs/AdminPanel';

const API_URL = "https://localhost:44306/api";

export default function Dashboard() {
    const [approvedPlayers, setApprovedPlayers] = useState([]);
    const [pendingPlayers, setPendingPlayers] = useState([]);
    const [pendingRoles, setPendingRoles] = useState([]);
    const [leagues, setLeagues] = useState([]);
    const [teams, setTeams] = useState([]);
    const [roles, setRoles] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    const [activeTab, setActiveTab] = useState('leagues');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLeague, setSelectedLeague] = useState('all');
    const [selectedTeam, setSelectedTeam] = useState('all');

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

        fetchLeagues(token);
        fetchTeams(token);
        fetchApprovedPlayers(token);

        if (userRoles.includes('Admin')) {
            fetchPendingPlayers(token);
            fetchPendingRoles(token);
            fetchAllUsers(token); // Извикваме го тук
        }
    }, [navigate]);

    const fetchAllUsers = async (token) => {
        const res = await fetch(`${API_URL}/Auth/all-users`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setAllUsers(await res.json());
    };

    const fetchLeagues = async (token) => {
        const res = await fetch(`${API_URL}/Leagues`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setLeagues(await res.json());
    };

    const fetchTeams = async (token) => {
        const res = await fetch(`${API_URL}/Teams`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setTeams(await res.json());
    };

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
        if (res.ok) fetchAllUsers(token);
    };

    const handlePromote = async (emailToPromote) => {
        const token = localStorage.getItem('jwtToken');
        try {
            const res = await fetch(`${API_URL}/Auth/promote-to-admin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ email: emailToPromote })
            });

            if (res.ok) {
                alert(`Successfully promoted ${emailToPromote}`);
                fetchAllUsers(token); // Презареждаме таблицата
            } else {
                alert(await res.text() || "Failed to promote user.");
            }
        } catch (err) {
            alert("Cannot connect to the server.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userRoles');
        navigate('/');
    };

    const goToTeamsForLeague = (leagueId) => {
        setSelectedLeague(leagueId.toString());
        setActiveTab('teams');
    };

    const goToPlayersForTeam = (teamId) => {
        setSelectedTeam(teamId.toString());
        setActiveTab('players');
    };

    // Много по-чист рендър блок!
    const renderContent = () => {
        switch (activeTab) {
            case 'leagues':
                return <LeaguesTab leagues={leagues} goToTeamsForLeague={goToTeamsForLeague} />;
            case 'teams':
                return <TeamsTab leagues={leagues} teams={teams} selectedLeague={selectedLeague} setSelectedLeague={setSelectedLeague} goToPlayersForTeam={goToPlayersForTeam} />;
            case 'players':
                return <PlayersTab teams={teams} approvedPlayers={approvedPlayers} selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} />;
            case 'scouts':
                return <div className="text-center py-5 text-muted"><h3>📋 Scouts Network</h3><p>Scout profiles and reports will appear here.</p></div>;
            case 'admin':
                return <AdminPanel
                    pendingRoles={pendingRoles}
                    pendingPlayers={pendingPlayers}
                    handleApproveRole={handleApproveRole}
                    handleApprovePlayer={handleApprovePlayer}
                    promoteEmail={promoteEmail}
                    setPromoteEmail={setPromoteEmail}
                    handlePromote={handlePromote}
                    promoteMessage={promoteMessage}
                    promoteError={promoteError}
                    allUsers={allUsers} // НОВО
                />;
            default: return null;
        }
    };

    return (
        <div className="bg-light min-vh-100">
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-3">
                <div className="container d-flex justify-content-between align-items-center">
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

                    <div className="d-flex align-items-center gap-4">
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

            <div className="container mt-5">
                {renderContent()}
            </div>
        </div>
    );
}