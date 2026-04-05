export default function LeaguesTab({ leagues, goToTeamsForLeague }) {
    return (
        <div className="card shadow border-0 rounded-4">
            <div className="card-header bg-primary text-white fw-bold d-flex justify-content-between align-items-center">
                <span>Active Leagues</span>
                <span className="badge bg-light text-dark">{leagues.length} Leagues</span>
            </div>
            <div className="list-group list-group-flush">
                {leagues.length === 0 && <div className="p-4 text-center text-muted">Loading leagues...</div>}
                {leagues.map(l => (
                    <button key={l.id} onClick={() => goToTeamsForLeague(l.id)} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3">
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
}