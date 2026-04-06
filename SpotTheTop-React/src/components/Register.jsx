import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../index.css';

const API_URL = "https://localhost:44306/api"; 

export default function Register() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('User');
    
    const [teams, setTeams] = useState([]);
    const [selectedTeamId, setSelectedTeamId] = useState('');

    // НОВО: Стейтове за свободните играчи
    const [unclaimedPlayers, setUnclaimedPlayers] = useState([]);
    const [selectedPlayerId, setSelectedPlayerId] = useState('');

    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const loadDropdownData = async () => {
            try {
                // Дърпаме отборите
                const resTeams = await fetch(`${API_URL}/Teams`);
                if (resTeams.ok) setTeams(await resTeams.json());

                // Дърпаме свободните играчи
                const resPlayers = await fetch(`${API_URL}/Players/unclaimed`);
                if (resPlayers.ok) setUnclaimedPlayers(await resPlayers.json());
            } catch (err) {
                console.log("Error loading data:", err);
            }
        };
        loadDropdownData();
    }, []);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const payload = { 
                firstName, 
                lastName, 
                email, 
                password, 
                role,
                teamId: selectedTeamId ? parseInt(selectedTeamId) : null,
                claimedPlayerId: selectedPlayerId ? parseInt(selectedPlayerId) : null // НОВО
            };
            
            const response = await fetch(`${API_URL}/Auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload) 
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('jwtToken', data.token);
                localStorage.setItem('userRoles', JSON.stringify(data.roles));
                navigate('/home');
            } else {
                setError(await response.text() || 'Registration failed.');
            }
        } catch (err) {
            setError('Cannot connect to the server.');
        }
    };

    return (
        <div className="auth-bg py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8 col-lg-6 col-xl-5">
                        <div className="card glass-card p-4 p-md-5">
                            <h3 className="text-center auth-title mb-2">Join the Network</h3>
                            <p className="text-center text-muted mb-4">Create your professional profile</p>
                            
                            {error && <div className="alert alert-danger py-2 rounded-3">{error}</div>}
                            
                            <form onSubmit={handleRegister}>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold text-secondary small text-uppercase">First Name</label>
                                        <input type="text" className="form-control" required
                                               value={firstName} onChange={e => setFirstName(e.target.value)} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold text-secondary small text-uppercase">Last Name</label>
                                        <input type="text" className="form-control" required
                                               value={lastName} onChange={e => setLastName(e.target.value)} />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold text-secondary small text-uppercase">Email Address</label>
                                    <input type="email" className="form-control" required
                                           value={email} onChange={e => setEmail(e.target.value)} />
                                </div>
                                
                                <div className="mb-3">
                                    <label className="form-label fw-bold text-secondary small text-uppercase">Password (Min. 2 chars)</label>
                                    <input type="password" className="form-control" required
                                           value={password} onChange={e => setPassword(e.target.value)} />
                                </div>

                                <div className="mb-4">
                                    <label className="form-label fw-bold text-secondary small text-uppercase">I am a...</label>
                                    <select className="form-select bg-light" value={role} onChange={e => {
                                        setRole(e.target.value);
                                        setSelectedTeamId('');
                                        setSelectedPlayerId('');
                                    }}>
                                        <option value="User">Fan / Observer</option>
                                        <option value="Scout">Professional Scout</option>
                                        <option value="Player">Player</option>
                                        <option value="Team">Team Representative</option>
                                    </select>
                                </div>

                                {/* ДИНАМИЧНО: Ако е Team */}
                                {role === 'Team' && (
                                    <div className="mb-4 p-3 border rounded-3 bg-light border-primary">
                                        <label className="form-label fw-bold text-primary small text-uppercase">Select club affiliation</label>
                                        <select className="form-select border-primary" value={selectedTeamId} onChange={e => setSelectedTeamId(e.target.value)}>
                                            <option value="">-- Choose your team --</option>
                                            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                {/* ДИНАМИЧНО: Ако е Player */}
                                {role === 'Player' && (
                                    <div className="mb-4 p-3 border rounded-3 bg-warning bg-opacity-10 border-warning">
                                        <label className="form-label fw-bold text-dark small text-uppercase">Claim Your Player Profile</label>
                                        <select className="form-select border-warning mb-2" value={selectedPlayerId} onChange={e => setSelectedPlayerId(e.target.value)}>
                                            <option value="">-- Select your profile (Optional) --</option>
                                            {unclaimedPlayers.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                                        </select>
                                        <div className="form-text small text-dark">If your profile is not in the list, leave this blank. You can be added later.</div>
                                    </div>
                                )}

                                <button type="submit" className="btn btn-success w-100 py-2 mb-3 shadow-sm fw-bold">Create Account</button>
                                
                                <div className="text-center">
                                    <span className="text-muted small">Already registered? </span>
                                    <Link to="/" className="text-success fw-bold text-decoration-none small">Sign in here</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}