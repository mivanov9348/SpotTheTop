import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PlayerProfileModal from '../PlayerProfileModal';
import TeamInfoCard from './TeamInfoCard';
import TeamRosterTable from './TeamRosterTable';

const API_URL = "https://localhost:44306/api";

export default function TeamDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [team, setTeam] = useState(null);
    const [players, setPlayers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        const headers = { 'Authorization': `Bearer ${token}` };

        const fetchTeam = fetch(`${API_URL}/Teams/${id}`, { headers }).then(res => {
            if (!res.ok) throw new Error("Team not found");
            return res.json();
        });

        // Взимаме играчите за този отбор (включва и базови статистики от бекенда)
        const fetchPlayers = fetch(`${API_URL}/Players?teamId=${id}`, { headers }).then(res => res.json());

        Promise.all([fetchTeam, fetchPlayers])
            .then(([teamData, playersData]) => {
                setTeam(teamData);
                setPlayers(playersData);
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                alert("Team not found.");
                navigate('/leagues');
            });
    }, [id, navigate]);

    const viewProfile = async (playerId) => {
        const token = localStorage.getItem('jwtToken');
        const res = await fetch(`${API_URL}/Players/${playerId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) setSelectedPlayer(await res.json());
    };

    if (isLoading) return <div className="text-center p-5 text-light opacity-50">Loading club data...</div>;

    return (
        <div className="container-fluid px-0 pb-5">
            
            <button onClick={() => navigate(-1)} className="btn btn-link text-decoration-none text-light opacity-75 mb-3 ps-0 hover-opacity-100 shadow-none">
                <i className="bi bi-arrow-left me-1"></i> Back
            </button>

            <div className="row g-4">
                
                {/* ЛЯВА КОЛОНА (70%) - Списък с играчи */}
                <div className="col-lg-8 col-xl-9">
                    <TeamRosterTable players={players} onViewProfile={viewProfile} />
                </div>

                {/* ДЯСНА КОЛОНА (30%) - Инфо за Клуба */}
                <div className="col-lg-4 col-xl-3">
                    <TeamInfoCard team={team} />
                </div>

            </div>

            {selectedPlayer && <PlayerProfileModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}
        </div>
    );
}