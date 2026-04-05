export default function TeamsTab({ leagues, teams, selectedLeague, setSelectedLeague, goToPlayersForTeam }) {
    const filteredTeams = selectedLeague === 'all' 
        ? teams 
        : teams.filter(t => t.leagueId === parseInt(selectedLeague));

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
                    <button key={t.id} onClick={() => goToPlayersForTeam(t.id)} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3">
                        <div>
                            <h5 className="mb-1 fw-bold">{t.name}</h5>
                            <small className="text-muted">🏟️ {t.stadium} | 📍 {t.city} | 🏆 {t.leagueName}</small>
                        </div>
                        <span className="badge bg-secondary rounded-pill">View Roster ➔</span>
                    </button>
                ))}
            </div>
        </div>
    );
}