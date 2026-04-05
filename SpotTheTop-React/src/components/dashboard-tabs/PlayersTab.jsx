export default function PlayersTab({ teams, approvedPlayers, selectedTeam, setSelectedTeam }) {
    const filteredPlayers = selectedTeam === 'all'
        ? approvedPlayers
        : approvedPlayers.filter(p => p.teamId === parseInt(selectedTeam));

    return (
        <div className="card shadow border-0 rounded-4">
            <div className="card-header bg-success text-white fw-bold d-flex justify-content-between align-items-center">
                <span>Verified Players Database</span>
                <select 
                    className="form-select form-select-sm w-auto" 
                    value={selectedTeam} 
                    onChange={(e) => setSelectedTeam(e.target.value)}
                >
                    <option value="all">All Teams</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
            </div>
            <div className="list-group list-group-flush">
                {filteredPlayers.length === 0 && <div className="p-4 text-center text-muted">No approved players found for this team.</div>}
                {filteredPlayers.map(p => (
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
}