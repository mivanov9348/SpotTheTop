import React, { useEffect, useState } from 'react';
import DataManagement from './DataManagement';
import AccessControl from './AccessControl';

const API_URL = "https://localhost:44306/api";

export default function AdminPage() {
    // 1. Глобални стейтове за данните в Админ панела
    const [allUsers, setAllUsers] = useState([]);
    const [pendingPlayers, setPendingPlayers] = useState([]);
    const [pendingRoles, setPendingRoles] = useState([]);
    const [leagues, setLeagues] = useState([]);
    const [teams, setTeams] = useState([]);

    // UI Стейт: Кой таб е отворен
    const [adminTab, setAdminTab] = useState('access'); 

    const userRoles = JSON.parse(localStorage.getItem('userRoles') || "[]");
    const canManageUsers = userRoles.includes('SuperAdmin') || userRoles.includes('Admin');

    useEffect(() => {
        loadData();
    }, []);

    // 2. Функция, която тегли ВСИЧКИ нужни данни
    const loadData = () => {
        const token = localStorage.getItem('jwtToken');
        
        if (canManageUsers) {
            fetch(`${API_URL}/Auth/all-users`, { headers: { 'Authorization': `Bearer ${token}` } })
                .then(res => res.json())
                .then(data => setAllUsers(data))
                .catch(err => console.error(err));
        }

        fetch(`${API_URL}/Players/pending`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json()).then(data => setPendingPlayers(data));

        fetch(`${API_URL}/Auth/pending-roles`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json()).then(data => setPendingRoles(data));

        fetch(`${API_URL}/Leagues`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json()).then(data => setLeagues(data));

        fetch(`${API_URL}/Teams`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json()).then(data => setTeams(data));
    };

    return (
        <div>
            {/* ТАБОВЕ ЗА НАВИГАЦИЯ В АДМИН ПАНЕЛА */}
            <ul className="nav nav-pills mb-4 pb-3 border-bottom">
                <li className="nav-item">
                    <button 
                        className={`nav-link fw-bold px-4 rounded-pill me-2 ${adminTab === 'access' ? 'active shadow-sm' : 'text-dark'}`} 
                        onClick={() => setAdminTab('access')}
                    >
                        <i className="bi bi-shield-lock me-2"></i> Access Control
                    </button>
                </li>
                {canManageUsers && (
                    <li className="nav-item">
                        <button 
                            className={`nav-link fw-bold px-4 rounded-pill ${adminTab === 'catalog' ? 'active bg-success shadow-sm' : 'text-success'}`} 
                            onClick={() => setAdminTab('catalog')}
                        >
                            <i className="bi bi-database-add me-2"></i> Catalog (Data Entry)
                        </button>
                    </li>
                )}
            </ul>

            {/* РЕНДИРАНЕ НА ИЗБРАНИЯ КОМПОНЕНТ */}
            {adminTab === 'access' ? (
                <AccessControl 
                    allUsers={allUsers}
                    pendingRoles={pendingRoles}
                    pendingPlayers={pendingPlayers}
                    currentUserRoles={userRoles}
                    canManageUsers={canManageUsers}
                    loadData={loadData} 
                />
            ) : (
                <DataManagement 
                    leagues={leagues}
                    teams={teams}
                    loadData={loadData}
                />
            )}
        </div>
    );
}