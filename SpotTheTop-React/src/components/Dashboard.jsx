import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = "https://localhost:44306/api"; // СМЕНИ С ТВОЯ ПОРТ!

export default function Dashboard() {
    const [approvedPlayers, setApprovedPlayers] = useState([]);
    const [pendingPlayers, setPendingPlayers] = useState([]);
    const [roles, setRoles] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            navigate('/'); // Ако няма токен, гоним го на логин екрана
            return;
        }

        const userRoles = JSON.parse(localStorage.getItem('userRoles') || "[]");
        setRoles(userRoles);

        fetchApprovedPlayers(token);
        if (userRoles.includes('Admin')) {
            fetchPendingPlayers(token);
        }
    }, [navigate]);

    const fetchApprovedPlayers = async (token) => {
        const res = await fetch(`${API_URL}/Players`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setApprovedPlayers(await res.json());
    };

    const fetchPendingPlayers = async (token) => {
        const res = await fetch(`${API_URL}/Players/pending`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setPendingPlayers(await res.json());
    };

    const handleApprove = async (id) => {
        const token = localStorage.getItem('jwtToken');
        const res = await fetch(`${API_URL}/Players/${id}/approve`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            // Презареждаме таблиците
            fetchApprovedPlayers(token);
            fetchPendingPlayers(token);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('userRoles');
        navigate('/');
    };

    return (
        <div>
            <nav className="navbar navbar-dark bg-dark mb-4 px-3">
                <span className="navbar-brand">SpotTheTop Скаутска Мрежа</span>
                <button onClick={handleLogout} className="btn btn-outline-light btn-sm">Изход</button>
            </nav>

            <div className="container">
                <h4 className="mb-4">Добре дошли! Вашата роля: {roles.join(', ')}</h4>

                <div className="row">
                    <div className="col-md-6">
                        <div className="card shadow mb-4">
                            <div className="card-header bg-success text-white">Одобрени играчи</div>
                            <ul className="list-group list-group-flush">
                                {approvedPlayers.length === 0 && <li className="list-group-item">Няма играчи.</li>}
                                {approvedPlayers.map(p => (
                                    <li key={p.id} className="list-group-item">
                                        <strong>{p.fullName}</strong> ({p.position}) - Добавен от: {p.addedBy}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {roles.includes('Admin') && (
                        <div className="col-md-6">
                            <div className="card shadow mb-4">
                                <div className="card-header bg-warning">Чакащи одобрение</div>
                                <ul className="list-group list-group-flush">
                                    {pendingPlayers.length === 0 && <li className="list-group-item">Няма чакащи.</li>}
                                    {pendingPlayers.map(p => (
                                        <li key={p.id} className="list-group-item d-flex justify-content-between align-items-center">
                                            <span><strong>{p.fullName}</strong> ({p.position})</span>
                                            <button onClick={() => handleApprove(p.id)} className="btn btn-success btn-sm">Одобри</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}